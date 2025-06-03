package main

import (
	"backend/api"
	"backend/config"
	"backend/db"
	"backend/discovery"
	"backend/mockserver"
	"backend/spotifyapi"
	"backend/stripper"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"io"
	"log"
	"os"
	"time"
)

func main() {
	log.Println("starting application")
	cfg := config.LoadConfig("config.yaml")

	var logger *zap.Logger
	zapEnvironment := *cfg.Logging.Zap
	if zapEnvironment == "production" {
		logger, _ = zap.NewProduction()
	} else {
		gin.ForceConsoleColor()
		logger, _ = zap.NewDevelopment()
	}

	var logFile *os.File
	var jsonLogFile *os.File
	var err error
	var jsonLogErr error
	if cfg.Logging.File != nil {
		logFile, err = os.OpenFile(*cfg.Logging.File, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		jsonLogFile, jsonLogErr = os.OpenFile(fmt.Sprintf("%s.json", *cfg.Logging.File), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			logger.Warn("error creating file", zap.String("file", *cfg.Logging.File), zap.Error(err))
		} else if jsonLogErr != nil {
			logger.Warn("error creating json log file", zap.String("file", *cfg.Logging.File), zap.Error(err))
		} else {
			consoleEncoder := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())
			fileEncoderConfig := zap.NewProductionEncoderConfig()
			fileEncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
			fileEncoder := zapcore.NewConsoleEncoder(fileEncoderConfig)
			jsonFileEncoder := zapcore.NewJSONEncoder(fileEncoderConfig)
			consoleWriter := zapcore.Lock(os.Stdout)
			fileWriter := zapcore.AddSync(logFile)
			jsonWriter := zapcore.AddSync(jsonLogFile)

			core := zapcore.NewTee(
				zapcore.NewCore(consoleEncoder, consoleWriter, zapcore.DebugLevel),
				zapcore.NewCore(fileEncoder, fileWriter, zapcore.DebugLevel),
				zapcore.NewCore(jsonFileEncoder, jsonWriter, zapcore.DebugLevel),
			)

			logger = zap.New(core, zap.AddCaller(), zap.AddStacktrace(zap.ErrorLevel))
		}
	}

	var apiLogFile *os.File
	if cfg.Logging.ApiFile != nil {
		apiLogFile, err = os.OpenFile(*cfg.Logging.ApiFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			logger.Warn("error creating api log file", zap.String("file", *cfg.Logging.ApiFile), zap.Error(err))
		} else {
			stripWriter := stripper.StripColorWriter{W: apiLogFile}
			gin.DefaultWriter = io.MultiWriter(&stripWriter)
		}
	}

	zap.ReplaceGlobals(logger)
	logger.Info("config loaded and loggers initialized")

	if cfg.Server == nil {
		logger.Fatal("no server configuration present")
	}

	if cfg.DatabaseConfig == nil {
		logger.Fatal("no database configuration present")
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=disable",
		cfg.DatabaseConfig.Host,
		cfg.DatabaseConfig.Username,
		cfg.DatabaseConfig.Password,
		cfg.DatabaseConfig.Database,
		cfg.DatabaseConfig.Port,
	)

	dbConn, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	otherDsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=disable",
		cfg.DatabaseConfig.Username,
		cfg.DatabaseConfig.Password,
		cfg.DatabaseConfig.Host,
		cfg.DatabaseConfig.Port,
		cfg.DatabaseConfig.Database,
	)

	listener := pq.NewListener(otherDsn, 10*time.Second, time.Minute, func(event pq.ListenerEventType, err error) {
		if err != nil {
			logger.Error("Listener error", zap.Error(err))
		}
	})

	if err != nil {
		logger.Fatal("failed to connect to database", zap.Error(err))
	} else {
		err = dbConn.AutoMigrate(&db.Track{}, &db.Artist{}, &db.ArtistDiscovery{})
		if err != nil {
			logger.Fatal("failed to migrate database", zap.Error(err))
		}
	}

	var spotifyClient spotifyapi.SpotifyClient
	if cfg.SpotifyConfig == nil {
		logger.Warn("no spotify configuration present, operating in data collection mode")
		spotifyClient = &spotifyapi.NoopClient{Logger: logger}
	} else {
		spotifyClient = spotifyapi.NewSpotifyClient(
			*cfg.SpotifyConfig,
			logger,
		)
	}

	go func() {
		listenErr := listener.Listen("discovery")
		if listenErr != nil {
			logger.Error("Listener init error", zap.Error(err))
		}

		worker := discovery.NewDiscoverWorker(
			cfg.DiscoverConfig.BatchSize,
			spotifyClient,
			dbConn,
			logger,
		)

		worker.Run()

		interval := 5 * time.Minute
		if cfg.DiscoverConfig.RetryInterval != nil {
			interval = *cfg.DiscoverConfig.RetryInterval
		}
		timer := time.NewTicker(interval)

		for {
			select {
			case notification := <-listener.Notify:
				logger.Info("Got new notification", zap.Any("notification", notification))
				worker.Run()
			case <-time.After(90 * time.Second):
				go listener.Ping()
			case <-timer.C:
				timer.Stop()
				worker.Run()
				timer = time.NewTicker(interval)
			}
		}
	}()

	go func() {
		apiServer := api.NewServer(logger, spotifyClient, *cfg.Server, dbConn)
		err := apiServer.Run()
		if err != nil {
			logger.Fatal("failed to start server: %v", zap.Error(err))
		}
	}()

	if cfg.MockServerConfig != nil {
		go func() {
			logger.Info("Starting Mock Server")
			mckSrv := &mockserver.Server{
				Logger: logger,
				Port:   cfg.MockServerConfig.Port,
			}

			err := mckSrv.RunSpotifyMockServer()
			if err != nil {
				logger.Fatal("failed to start mock server: %v", zap.Error(err))
			}
		}()
	}

	select {}
}

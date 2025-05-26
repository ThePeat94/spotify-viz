package stripper

import (
	"io"
	"regexp"
)

type StripColorWriter struct {
	W io.Writer
}

func (s *StripColorWriter) Write(p []byte) (n int, err error) {
	re := regexp.MustCompile(`\x1b\[[0-9;]*m`)
	clean := re.ReplaceAll(p, []byte(""))
	return s.W.Write(clean)
}

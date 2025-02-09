import React, { useState } from 'react';
import { Button, ButtonGroup, Grid2, styled, Typography } from '@mui/material';

type DataImportProps = {

}

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

type ImportInfo = {
    fileCount: number;
    currentFileCount: number;
}

const DataImport: React.FC<DataImportProps> = (props) => {
    const { } = props;

    const [importInfo, setImportInfo] = useState<ImportInfo>();

    const handleParseFiles = async (files?: FileList | null): Promise<void> => {
        if (!files) {
            return;
        }

        setImportInfo({
            fileCount: files.length,
            currentFileCount: 0,
        });

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = (event) => {
                const data = event.target?.result;
                console.log(data);

                setImportInfo((prevState) => {
                    if (!prevState) {
                        return prevState;
                    }

                    return {
                        ...prevState,
                        currentFileCount: prevState.currentFileCount + 1,
                    };
                });
            };

            reader.readAsText(file);
        }
    };

    return (
        <Grid2 container={true} alignItems={'center'}>
            <Grid2 size={12}>
                <h1>Data Import</h1>
            </Grid2>
            <Grid2 size={2}>
                <ButtonGroup variant={'contained'}>
                    <Button component={'label'} >
                        Select Files
                        <VisuallyHiddenInput
                            type={'file'}
                            onChange={(event) => handleParseFiles(event.target.files)}
                            multiple={true}
                        />
                    </Button>
                </ButtonGroup>
            </Grid2>
            {importInfo && (
                <Grid2 size={12}>
                    <Typography>Importing {importInfo.currentFileCount} of {importInfo.fileCount}</Typography>
                </Grid2>
            )}
        </Grid2>
    );
};

export default DataImport;

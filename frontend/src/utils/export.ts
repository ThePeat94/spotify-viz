import { toPng } from 'html-to-image';

type Dimensions = {
    width: number;
    height: number;
}

export const DEFAULT_INSTAGRAM_DIMENSIONS : Dimensions = {
    width: 660,
    height: 660,
};

export const exportNode = async (node: HTMLElement, fileName: string, dimensionOptions: Dimensions = DEFAULT_INSTAGRAM_DIMENSIONS) : Promise<void>  => {
    try {
        const dataUrl = await toPng(node, {
            cacheBust: true,
            quality: 1,
            ...dimensionOptions,
        });

        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        link.remove();
    } catch (error) {
        console.error('Failed to export image:', error);
    }
};

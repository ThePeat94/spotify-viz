import { toPng } from 'html-to-image';
import { Options } from 'html-to-image/lib/types';

export const exportNode = async (node: any, fileName: string, dimensionOptions?: Pick<Options, 'height' | 'width'>) : Promise<void>  => {
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

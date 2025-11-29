import { TransformationDefinition } from '../../types';

export const smartCrop: TransformationDefinition = {
    id: 'geometry-smart-crop',
    name: 'Smart Crop',
    description: 'Auto-center crop to a specific aspect ratio.',
    params: [
        {
            name: 'aspectRatio',
            label: 'Aspect Ratio (W:H)',
            type: 'text',
            defaultValue: '1:1'
        },
        {
            name: 'scale',
            label: 'Scale (%)',
            type: 'range',
            min: 10,
            max: 200,
            defaultValue: 100
        }
    ],
    apply: (ctx, params) => {
        const arStr = params.aspectRatio || '1:1';
        const [w, h] = arStr.split(':').map(Number);
        const targetAr = w / h;

        const scale = (params.scale || 100) / 100;

        const srcWidth = ctx.canvas.width;
        const srcHeight = ctx.canvas.height;
        const srcAr = srcWidth / srcHeight;

        let cropWidth, cropHeight;

        if (srcAr > targetAr) {
            // Source is wider than target
            cropHeight = srcHeight * scale;
            cropWidth = cropHeight * targetAr;
        } else {
            // Source is taller than target
            cropWidth = srcWidth * scale;
            cropHeight = cropWidth / targetAr;
        }

        // Center crop
        const x = (srcWidth - cropWidth) / 2;
        const y = (srcHeight - cropHeight) / 2;

        // Create temp canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = srcWidth;
        tempCanvas.height = srcHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        tempCtx.drawImage(ctx.canvas, 0, 0);

        // Resize main canvas
        ctx.canvas.width = cropWidth;
        ctx.canvas.height = cropHeight;

        // Draw cropped portion
        ctx.drawImage(
            tempCanvas,
            x, y, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight
        );
    }
};

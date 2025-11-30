import QRCode from 'qrcode';
import { TransformationDefinition } from '../../types';

export const qrCodeStamp: TransformationDefinition = {
    id: 'creative-qrcode',
    name: 'QR Code Stamp',
    description: 'Generate and stamp a QR code',
    params: [
        { name: 'text', label: 'Content (URL/Text)', type: 'text', defaultValue: 'https://example.com' },
        { name: 'size', label: 'Size (px)', type: 'number', defaultValue: 150 },
        { name: 'x', label: 'X Position (%)', type: 'range', min: 0, max: 100, defaultValue: 90 },
        { name: 'y', label: 'Y Position (%)', type: 'range', min: 0, max: 100, defaultValue: 90 },
        { name: 'color', label: 'Color', type: 'color', defaultValue: '#000000' },
        { name: 'backgroundColor', label: 'Background', type: 'color', defaultValue: '#ffffff' },
        { name: 'margin', label: 'Margin', type: 'number', defaultValue: 1 },
        {
            name: 'errorCorrectionLevel', label: 'Error Correction', type: 'select', options: [
                { label: 'Low', value: 'L' },
                { label: 'Medium', value: 'M' },
                { label: 'Quartile', value: 'Q' },
                { label: 'High', value: 'H' }
            ], defaultValue: 'M'
        }
    ],
    apply: async (ctx, params, context) => {
        let { text, size, x, y, color, backgroundColor, margin, errorCorrectionLevel } = params;

        if (context.filename) {
            text = text.replace('{{filename}}', context.filename);
        }

        try {
            const url = await QRCode.toDataURL(text, {
                errorCorrectionLevel: errorCorrectionLevel,
                margin: margin,
                color: {
                    dark: color,
                    light: backgroundColor
                },
                width: size
            });

            const img = new Image();
            img.src = url;
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const canvasWidth = ctx.canvas.width;
            const canvasHeight = ctx.canvas.height;

            const posX = (x / 100) * canvasWidth;
            const posY = (y / 100) * canvasHeight;

            // Draw centered at position
            ctx.drawImage(img, posX - size / 2, posY - size / 2, size, size);

        } catch (err) {
            console.error('Failed to generate QR code', err);
        }
    }
};

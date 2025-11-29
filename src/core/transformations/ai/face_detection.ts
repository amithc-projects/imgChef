import { TransformationDefinition } from '../../types';
import * as faceapi from 'face-api.js';

let modelsLoaded = false;

const loadModels = async () => {
    if (modelsLoaded) return;
    // Assuming models are served from /models in public directory
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    // await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    // await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    modelsLoaded = true;
};

export const facePrivacy: TransformationDefinition = {
    id: 'ai-face-privacy',
    name: 'Face Privacy',
    description: 'Detect and blur faces.',
    params: [
        { name: 'blurAmount', label: 'Blur Amount', type: 'range', min: 1, max: 20, defaultValue: 10 },
        { name: 'confidence', label: 'Confidence Threshold', type: 'range', min: 0.1, max: 1.0, step: 0.1, defaultValue: 0.5 }
    ],
    apply: async (ctx, params) => {
        await loadModels();

        const blurAmount = params.blurAmount || 10;
        const confidence = params.confidence || 0.5;

        // face-api.js works with HTMLImageElement, HTMLVideoElement, or HTMLCanvasElement
        const detections = await faceapi.detectAllFaces(
            ctx.canvas,
            new faceapi.SsdMobilenetv1Options({ minConfidence: confidence })
        );

        if (detections.length === 0) return;

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // Create blurred version of the whole image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.filter = `blur(${blurAmount}px)`;
        tempCtx.drawImage(ctx.canvas, 0, 0);
        tempCtx.filter = 'none';

        // For each face, clip the blurred image to the face box and draw over original
        ctx.save();
        ctx.beginPath();
        detections.forEach(detection => {
            const box = detection.box;
            // Ellipse for face? or Rect? Rect is safer for full coverage.
            // Let's do a rounded rect or ellipse.
            ctx.rect(box.x, box.y, box.width, box.height);
        });
        ctx.clip();
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    }
};

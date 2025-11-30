import { TransformationDefinition } from '../../types';

export const zoom: TransformationDefinition = {
    id: 'geo-zoom',
    name: 'Zoom',
    description: 'Zoom into a specific area while maintaining image size.',
    params: [
        { name: 'level', label: 'Zoom Level (x)', type: 'range', min: 1, max: 10, step: 0.1, defaultValue: 1.5 },
        { name: 'x', label: 'Focus X (%)', type: 'range', min: 0, max: 100, defaultValue: 50 },
        { name: 'y', label: 'Focus Y (%)', type: 'range', min: 0, max: 100, defaultValue: 50 },
        { name: 'smooth', label: 'Smooth Interpolation', type: 'boolean', defaultValue: true }
    ],
    apply: (ctx, params) => {
        const zoomLevel = Math.max(1, params.level || 1.5);
        const focusXPct = (params.x !== undefined ? params.x : 50) / 100;
        const focusYPct = (params.y !== undefined ? params.y : 50) / 100;
        const smooth = params.smooth !== false;

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // 1. Calculate the size of the "Viewfinder" (the cropped area)
        // Example: 2x zoom means we see 50% of the width/height
        const viewWidth = width / zoomLevel;
        const viewHeight = height / zoomLevel;

        // 2. Calculate the Top-Left position of the viewfinder
        // We want 'focusX' to be the CENTER of our view.
        // center = left + (viewWidth / 2)  =>  left = center - (viewWidth / 2)
        let left = (focusXPct * width) - (viewWidth / 2);
        let top = (focusYPct * height) - (viewHeight / 2);

        // 3. Clamp to edges (Optional: standard zoom usually doesn't show black bars)
        // Prevent going off the left/top
        left = Math.max(0, left);
        top = Math.max(0, top);

        // Prevent going off the right/bottom
        if (left + viewWidth > width) left = width - viewWidth;
        if (top + viewHeight > height) top = height - viewHeight;

        // 4. Create temp copy of original image
        // We need this because we are about to overwrite the main canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        tempCtx.drawImage(ctx.canvas, 0, 0);

        // 5. Draw the Zoomed View
        ctx.imageSmoothingEnabled = smooth;
        ctx.imageSmoothingQuality = 'high';

        // Clear main canvas
        ctx.clearRect(0, 0, width, height);

        // Draw: Take the small 'view' from temp, draw it FULL SIZE on main ctx
        ctx.drawImage(
            tempCanvas,
            left, top, viewWidth, viewHeight, // Source (The Viewfinder)
            0, 0, width, height               // Dest   (The Full Canvas)
        );
    }
};
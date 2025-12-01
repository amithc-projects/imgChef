import { TransformationDefinition } from '../../types';
import { resolveVariables } from '../../utils/variable_substitution';
import { createBackgroundStyle, drawText } from '../../utils/drawing_utils';

export const ribbon: TransformationDefinition = {
    id: 'creative-ribbon',
    name: 'Ribbon',
    description: 'Add a corner ribbon with text',
    params: [
        { name: 'text', label: 'Text', type: 'text', defaultValue: 'Draft' },
        {
            name: 'corner', label: 'Corner', type: 'select', options: [
                { label: 'Top Left', value: 'top-left' },
                { label: 'Top Right', value: 'top-right' },
                { label: 'Bottom Left', value: 'bottom-left' },
                { label: 'Bottom Right', value: 'bottom-right' }
            ], defaultValue: 'top-right'
        },
        {
            name: 'fontFamily', label: 'Font Family', type: 'select', options: [
                { label: 'Inter', value: 'Inter' },
                { label: 'Arial', value: 'Arial' },
                { label: 'Times New Roman', value: 'Times New Roman' },
                { label: 'Courier New', value: 'Courier New' },
                { label: 'Georgia', value: 'Georgia' },
                { label: 'Verdana', value: 'Verdana' }
            ], defaultValue: 'Inter'
        },
        { name: 'fontSize', label: 'Font Size', type: 'number', defaultValue: 24 },
        { name: 'textColor', label: 'Text Color', type: 'color', defaultValue: '#ffffff' },
        { name: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#ef4444' },
        {
            name: 'gradientType', label: 'Gradient', type: 'select', options: [
                { label: 'None', value: 'none' },
                { label: 'Linear', value: 'linear' }
            ], defaultValue: 'none'
        },
        { name: 'gradientColor2', label: 'Gradient Color 2', type: 'color', defaultValue: '#b91c1c' },
        { name: 'padding', label: 'Padding', type: 'number', defaultValue: 10 },
        { name: 'offset', label: 'Offset', type: 'number', defaultValue: 50 }, // Distance from corner
    ],
    apply: (ctx, params, context) => {
        let {
            text, corner, fontFamily, fontSize, textColor,
            backgroundColor, gradientType, gradientColor2,
            padding, offset
        } = params;

        text = resolveVariables(text, context);

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        ctx.save();

        // Calculate rotation and translation based on corner
        let rotation = 0;
        let tx = 0;
        let ty = 0;

        // The logic: Translate to the corner, then rotate 45 degrees (or -45), then translate by offset
        // Actually, easiest is:
        // 1. Translate to corner
        // 2. Rotate
        // 3. Draw rectangle at (offset - width/2, -height/2) ? No.
        // Let's visualize: Top-Right corner.
        // We want the ribbon to cut across the corner.
        // Center of ribbon should be at distance 'offset' from corner along the diagonal.
        // Diagonal angle is 45 degrees.

        const ribbonHeight = fontSize + padding * 2;
        // Ribbon needs to be long enough to cover the corner.
        // Length needed = hypotenuse at the cut points.
        // Let's just make it very long, it will be clipped by canvas (or not, doesn't matter if it extends outside)
        const ribbonLength = (width + height); // Safe large number

        if (corner === 'top-right') {
            tx = width;
            ty = 0;
            rotation = 45;
        } else if (corner === 'top-left') {
            tx = 0;
            ty = 0;
            rotation = -45;
        } else if (corner === 'bottom-left') {
            tx = 0;
            ty = height;
            rotation = 45;
        } else if (corner === 'bottom-right') {
            tx = width;
            ty = height;
            rotation = -45;
        }

        ctx.translate(tx, ty);
        ctx.rotate((rotation * Math.PI) / 180);

        // Now we are aligned with the diagonal.
        // We want to move 'down' (relative to rotation) by 'offset' pixels?
        // No, 'offset' is usually the distance from the corner point to the center of the ribbon along the normal.
        // So we translate Y by offset.

        // Wait, for Top-Right (rotation 45):
        // X axis points along the diagonal towards bottom-right? No.
        // Standard rotation is clockwise.
        // 0 deg = Right.
        // 45 deg = Down-Right.
        // So X axis is pointing Down-Right.
        // Y axis is pointing Down-Left.

        // If we want the ribbon to be perpendicular to the diagonal from the corner.
        // Top-Right corner: Diagonal goes inwards at 135 degrees (or -225).
        // Let's stick to a simpler model.
        // Draw a horizontal bar, then rotate and place it.

        // Let's try: Translate to corner. Rotate 45 deg.
        // Then the ribbon is horizontal relative to the new axes? No.

        // Let's use the standard "CSS Ribbon" approach logic.
        // Top-Right: Rotate 45deg. Translate Y by offset.

        // Adjusting for canvas coordinate system:
        // Top-Right (width, 0).
        // We want the ribbon to look like this: /
        //                                     /
        //                                    /
        // Wait, Top-Right ribbon usually looks like \ (backslash) cutting off the corner.
        // That is 45 degrees.

        // Let's assume offset is the distance from the corner to the top edge of the ribbon?
        // Or center? Let's say center.

        // If we rotate 45 deg at Top-Right (width, 0):
        // X axis points South-East.
        // Y axis points South-West.
        // We want the ribbon to run along the Y axis? No, perpendicular to the diagonal.
        // The diagonal is South-West.
        // So the ribbon runs South-East? No.

        // Let's try this:
        // Top-Right:
        // Translate to (width, 0).
        // Rotate 45 degrees.
        // Now X points SE, Y points SW.
        // We want the ribbon to be parallel to Y axis? No.
        // A ribbon cutting the corner is perpendicular to the diagonal.
        // The diagonal from (width, 0) to center is roughly SW.
        // So the ribbon should be perpendicular to SW, i.e., SE-NW line?
        // That is the X axis (rotated 45 deg).
        // So we draw a rectangle along the X axis.
        // And we shift it down (Y axis) by some amount to move it away from the corner.

        const yPos = offset;

        // Background
        const bgStyle = createBackgroundStyle(ctx, ribbonLength, ribbonHeight, backgroundColor, gradientType, gradientColor2);
        ctx.fillStyle = bgStyle;

        // Draw rectangle centered on X, at yPos
        ctx.fillRect(-ribbonLength / 2, yPos - ribbonHeight / 2, ribbonLength, ribbonHeight);

        // Text
        drawText(
            ctx,
            text,
            0,
            yPos,
            fontFamily,
            fontSize,
            textColor,
            'center',
            'middle',
            'bold' // Default to bold for ribbons usually
        );

        ctx.restore();
    },
};

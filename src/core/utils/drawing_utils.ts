
/**
 * Helper to create a background fill style (solid or gradient)
 */
export function createBackgroundStyle(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: string,
    gradientType: 'none' | 'linear' = 'none',
    gradientColor2?: string,
    angle: number = 0
): string | CanvasGradient {
    if (gradientType === 'none' || !gradientColor2) {
        return color;
    }

    // Simple linear gradient based on angle
    // For simplicity in this utility, we'll do a standard top-down or left-right or angled
    // This is a basic implementation.

    // Convert angle to radians
    const rad = (angle * Math.PI) / 180;

    // Calculate start and end points for the gradient based on the box
    // Center of the box
    const cx = width / 2;
    const cy = height / 2;

    // Length of the diagonal
    const diag = Math.sqrt(width * width + height * height) / 2;

    const x1 = cx - Math.cos(rad) * diag;
    const y1 = cy - Math.sin(rad) * diag;
    const x2 = cx + Math.cos(rad) * diag;
    const y2 = cy + Math.sin(rad) * diag;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, gradientColor2);

    return gradient;
}

/**
 * Helper to draw text with support for multiline (future proofing) and alignment
 */
export function drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontFamily: string,
    fontSize: number,
    color: string,
    align: CanvasTextAlign = 'center',
    baseline: CanvasTextBaseline = 'middle',
    fontWeight: string = 'normal',
    fontStyle: string = 'normal'
) {
    ctx.save();
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
    ctx.restore();
}

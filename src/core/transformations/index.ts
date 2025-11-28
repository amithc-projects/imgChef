import { transformationRegistry } from '../Registry';
import { grayscale, sepia, brightness, blur, noise } from './filters';
import { resize, crop, flip, rotate, roundCorners, border } from './geometry';
import { caption, watermark } from './text';
import { exportStep } from './workflow';

export function registerAllTransformations() {
    transformationRegistry.register(grayscale);
    transformationRegistry.register(sepia);
    transformationRegistry.register(brightness);
    transformationRegistry.register(blur);
    transformationRegistry.register(noise);
    transformationRegistry.register(resize);
    transformationRegistry.register(crop);
    transformationRegistry.register(flip);
    transformationRegistry.register(rotate);
    transformationRegistry.register(roundCorners);
    transformationRegistry.register(border);
    transformationRegistry.register(caption);
    transformationRegistry.register(watermark);
    transformationRegistry.register(exportStep);
}

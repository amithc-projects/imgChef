import { TransformationDefinition } from '../../types';
import ExifReader from 'exifreader';

export const extractExif: TransformationDefinition = {
    id: 'meta-exif',
    name: 'Extract EXIF Data',
    description: 'Extract camera and shooting info into variables',
    params: [],
    apply: async (ctx, params, context) => {
        try {
            const res = await fetch(context.originalImage.src);
            const blob = await res.blob();
            const buffer = await blob.arrayBuffer();
            const tags = ExifReader.load(buffer);

            if (!context.metadata) context.metadata = {};

            // Helper to get string value safely
            const getTag = (name: string) => {
                const tag = tags[name];
                if (!tag) return null;
                if (tag.description) return tag.description;
                if (tag.value && tag.value.length > 0) return String(tag.value[0]);
                return null;
            };

            // Common Tags
            const mapping: Record<string, string> = {
                'DateTimeOriginal': 'Date_Time_Original',
                'Make': 'Make',
                'Model': 'Model',
                'LensModel': 'Lens',
                'ISOSpeedRatings': 'ISO',
                'FNumber': 'FNumber',
                'ExposureTime': 'ExposureTime',
                'FocalLength': 'FocalLength'
            };

            Object.entries(mapping).forEach(([tagName, varName]) => {
                const val = getTag(tagName);
                if (val) {
                    context.metadata![varName] = val;
                }
            });

            console.log('Extracted EXIF:', context.metadata);

        } catch (e) {
            console.warn('Failed to extract EXIF', e);
        }
    }
};

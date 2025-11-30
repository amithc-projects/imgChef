import { TransformationDefinition } from '../../types';
import ExifReader from 'exifreader';

// Helper to parse GPS from ExifReader tags (reused logic)
const getGpsFromTags = (tags: any) => {
    const calculateCoordinate = (tags: any, type: 'Lat' | 'Long') => {
        const tagName = `GPS${type}itude`;
        const tagRefName = `GPS${type}itudeRef`;
        const tagVal = tags[tagName];
        const tagRef = tags[tagRefName];

        if (!tagVal) return null;

        let decimal: number | null = null;

        if (tagVal.value && Array.isArray(tagVal.value) && tagVal.value.length === 3) {
            try {
                const degrees = tagVal.value[0][0] / tagVal.value[0][1];
                const minutes = tagVal.value[1][0] / tagVal.value[1][1];
                const seconds = tagVal.value[2][0] / tagVal.value[2][1];
                decimal = degrees + (minutes / 60) + (seconds / 3600);
            } catch (e) { }
        }

        if (decimal === null && typeof tagVal.description === 'number') {
            decimal = tagVal.description;
        }

        if (decimal === null && typeof tagVal.description === 'string') {
            const val = parseFloat(tagVal.description);
            if (!isNaN(val)) decimal = val;
        }

        if (decimal === null) return null;

        if (tagRef) {
            const refText = (tagRef.value && tagRef.value[0]) ? tagRef.value[0] : tagRef.description;
            if (typeof refText === 'string') {
                const upperRef = refText.trim().toUpperCase();
                if (upperRef.startsWith('S') || upperRef.startsWith('W')) {
                    decimal = decimal * -1;
                }
            }
        }
        return decimal;
    };

    const lat = calculateCoordinate(tags, 'Lat');
    const lng = calculateCoordinate(tags, 'Long');

    if (lat !== null && lng !== null) return { lat, lng };
    return null;
};

export const geocodeLocation: TransformationDefinition = {
    id: 'meta-geocode',
    name: 'Fetch Location Info',
    description: 'Fetch City/Country from GPS to use as variables',
    params: [
        {
            name: 'language', label: 'Language', type: 'select', options: [
                { label: 'English', value: 'en' },
                { label: 'Spanish', value: 'es' },
                { label: 'French', value: 'fr' },
                { label: 'German', value: 'de' }
            ], defaultValue: 'en'
        }
    ],
    apply: async (ctx, params, context) => {
        // 1. Extract GPS from original image if not already present
        // Note: TransformationContext doesn't guarantee we have the tags parsed yet, 
        // so we might need to parse them again or rely on a previous step.
        // For robustness, let's parse if we can.

        // Optimization: Check if we already have location data? 
        // But we need to fetch it.

        try {
            // We need to read the file to get tags. 
            // context.originalImage is an HTMLImageElement. 
            // We can fetch its src.
            const res = await fetch(context.originalImage.src);
            const blob = await res.blob();
            const buffer = await blob.arrayBuffer();
            const tags = ExifReader.load(buffer);

            const gps = getGpsFromTags(tags);

            if (gps) {
                // 2. Call Nominatim API
                // User-Agent is required by Nominatim
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${gps.lat}&lon=${gps.lng}&accept-language=${params.language}`;

                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'BatchImg/1.0'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const address = data.address || {};

                    // 3. Store in context.metadata
                    if (!context.metadata) context.metadata = {};

                    context.metadata['city'] = address.city || address.town || address.village || address.hamlet || 'Unknown City';
                    context.metadata['country'] = address.country || 'Unknown Country';
                    context.metadata['state'] = address.state || '';
                    context.metadata['formatted_address'] = data.display_name || '';

                    console.log('Geocoded:', context.metadata);
                }
            } else {
                console.warn('No GPS data found for geocoding');
            }
        } catch (e) {
            console.error('Geocoding failed', e);
        }
    }
};

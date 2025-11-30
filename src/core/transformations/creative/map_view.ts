import { TransformationDefinition } from '../../types';
import ExifReader from 'exifreader';

// Helper to parse GPS (reused)
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
        if (decimal === null && typeof tagVal.description === 'number') decimal = tagVal.description;
        if (decimal === null && typeof tagVal.description === 'string') {
            const val = parseFloat(tagVal.description);
            if (!isNaN(val)) decimal = val;
        }
        if (decimal === null) return null;
        if (tagRef) {
            const refText = (tagRef.value && tagRef.value[0]) ? tagRef.value[0] : tagRef.description;
            if (typeof refText === 'string') {
                const upperRef = refText.trim().toUpperCase();
                if (upperRef.startsWith('S') || upperRef.startsWith('W')) decimal = decimal * -1;
            }
        }
        return decimal;
    };
    const lat = calculateCoordinate(tags, 'Lat');
    const lng = calculateCoordinate(tags, 'Long');
    if (lat !== null && lng !== null) return { lat, lng };
    return null;
};

// Helper to get tile coordinates
const lon2tile = (lon: number, zoom: number) => {
    return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
}
const lat2tile = (lat: number, zoom: number) => {
    return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
}

export const mapSideBySide: TransformationDefinition = {
    id: 'geo-side-by-side',
    name: 'Side-by-Side Map',
    description: 'Display a map tile next to the image',
    params: [
        { name: 'zoom', label: 'Zoom Level', type: 'number', min: 1, max: 19, defaultValue: 15 },
        {
            name: 'position', label: 'Map Position', type: 'select', options: [
                { label: 'Right', value: 'right' },
                { label: 'Left', value: 'left' },
                { label: 'Bottom', value: 'bottom' },
                { label: 'Top', value: 'top' }
            ], defaultValue: 'right'
        },
        { name: 'ratio', label: 'Map Size (%)', type: 'range', min: 10, max: 90, defaultValue: 50 }
    ],
    apply: async (ctx, params, context) => {
        const { zoom, position, ratio } = params;

        let gps = null;
        try {
            const res = await fetch(context.originalImage.src);
            const blob = await res.blob();
            const buffer = await blob.arrayBuffer();
            const tags = ExifReader.load(buffer);
            gps = getGpsFromTags(tags);
        } catch (e) {
            console.warn('Failed to extract GPS for map', e);
            return; // Can't draw map without GPS
        }

        if (!gps) return;

        // Calculate tile
        const xTile = lon2tile(gps.lng, zoom);
        const yTile = lat2tile(gps.lat, zoom);

        // Fetch tile (OSM Standard)
        const tileUrl = `https://tile.openstreetmap.org/${zoom}/${xTile}/${yTile}.png`;

        // We might need adjacent tiles to fill the area properly if the point is near the edge,
        // but for a simple implementation, let's just fetch the center tile and scale/crop it.
        // Actually, a single 256x256 tile might be too low res for a large image.
        // Better approach: Fetch a 3x3 grid centered on the tile.

        // For this iteration, let's try fetching the center tile and drawing it.
        // Note: Cross-origin issues might occur with canvas `toDataURL` if we draw an external image.
        // OSM tiles usually allow CORS.

        const mapImg = new Image();
        mapImg.crossOrigin = "Anonymous";
        mapImg.src = tileUrl;

        await new Promise((resolve, reject) => {
            mapImg.onload = resolve;
            mapImg.onerror = reject;
        });

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // Create a new canvas to hold the combined result
        const newCanvas = document.createElement('canvas');
        const newCtx = newCanvas.getContext('2d');
        if (!newCtx) return;

        let newWidth = width;
        let newHeight = height;
        let imgX = 0, imgY = 0, imgW = width, imgH = height;
        let mapX = 0, mapY = 0, mapW = 0, mapH = 0;

        if (position === 'right') {
            const mapWidth = width * (ratio / 100);
            newWidth = width + mapWidth;
            imgW = width;
            mapX = width;
            mapW = mapWidth;
            mapH = height;
        } else if (position === 'left') {
            const mapWidth = width * (ratio / 100);
            newWidth = width + mapWidth;
            imgX = mapWidth;
            imgW = width;
            mapX = 0;
            mapW = mapWidth;
            mapH = height;
        } else if (position === 'bottom') {
            const mapHeight = height * (ratio / 100);
            newHeight = height + mapHeight;
            imgH = height;
            mapY = height;
            mapH = mapHeight;
            mapW = width;
        } else if (position === 'top') {
            const mapHeight = height * (ratio / 100);
            newHeight = height + mapHeight;
            imgY = mapHeight;
            imgH = height;
            mapY = 0;
            mapH = mapHeight;
            mapW = width;
        }

        newCanvas.width = newWidth;
        newCanvas.height = newHeight;

        // Draw original image
        newCtx.drawImage(ctx.canvas, imgX, imgY, imgW, imgH);

        // Draw Map
        // We want to cover the map area with the tile(s).
        // Since we only fetched one tile (256x256), we might need to scale it up significantly, which looks pixelated.
        // A better way is to fetch a static map image from a service, but we want to avoid keys.
        // Let's just draw the single tile tiled or scaled for now.
        // To make it look better, we'll draw it centered and cover.

        // Draw background for map area
        newCtx.fillStyle = '#e5e5e5';
        newCtx.fillRect(mapX, mapY, mapW, mapH);

        // Draw the tile centered in the map area
        // We'll scale it to cover at least the smaller dimension
        const scale = Math.max(mapW / mapImg.width, mapH / mapImg.height);
        const drawW = mapImg.width * scale;
        const drawH = mapImg.height * scale;
        const drawX = mapX + (mapW - drawW) / 2;
        const drawY = mapY + (mapH - drawH) / 2;

        newCtx.drawImage(mapImg, drawX, drawY, drawW, drawH);

        // Add a marker at the center
        newCtx.fillStyle = 'red';
        newCtx.beginPath();
        newCtx.arc(mapX + mapW / 2, mapY + mapH / 2, 10, 0, 2 * Math.PI);
        newCtx.fill();
        newCtx.strokeStyle = 'white';
        newCtx.lineWidth = 2;
        newCtx.stroke();

        // Replace original canvas content
        ctx.canvas.width = newWidth;
        ctx.canvas.height = newHeight;
        ctx.drawImage(newCanvas, 0, 0);
    }
};

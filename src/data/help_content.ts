export interface HelpSection {
    title: string;
    content: string;
}

export interface TransformationHelp {
    id: string;
    title: string;
    shortDescription: string;
    fullDescription: string;
    usage: string;
    controls: HelpSection[];
    tips?: string[];
}

export const helpContent: Record<string, TransformationHelp> = {
    // Geometry
    resize: {
        id: 'resize',
        title: 'Resize Image',
        shortDescription: 'Change the dimensions of your image.',
        fullDescription: 'The Resize transformation allows you to change the width and height of your images. This is useful for standardizing image sizes for web use, thumbnails, or specific display requirements.',
        usage: 'Use this when you need your images to fit into a specific layout or to reduce file size by making dimensions smaller.',
        controls: [
            { title: 'Width', content: 'Target width in pixels. If Height is left empty, the aspect ratio will be maintained.' },
            { title: 'Height', content: 'Target height in pixels. If Width is left empty, the aspect ratio will be maintained.' },
            { title: 'Mode', content: 'How the image should fit into the new dimensions (Cover, Contain, Fill, or Exact).' }
        ],
        tips: ['To maintain aspect ratio, only set one dimension (Width OR Height).']
    },
    crop: {
        id: 'crop',
        title: 'Manual Crop',
        shortDescription: 'Crop specific areas of an image.',
        fullDescription: 'Remove unwanted outer areas from your image. You can specify the exact coordinates and dimensions to keep.',
        usage: 'Best for removing borders or focusing on a specific part of an image when the location is consistent across all images.',
        controls: [
            { title: 'X & Y', content: 'The starting coordinates for the crop (top-left corner).' },
            { title: 'Width & Height', content: 'The dimensions of the area to keep.' }
        ]
    },
    smartCrop: {
        id: 'smartCrop',
        title: 'Smart Crop',
        shortDescription: 'Content-aware cropping.',
        fullDescription: 'Automatically analyzes the image to find the most interesting area and crops to your desired aspect ratio or dimensions, keeping the subject in frame.',
        usage: 'Perfect for creating thumbnails from a batch of varied images where the subject might be in different positions.',
        controls: [
            { title: 'Width & Height', content: 'The target dimensions for the smart crop.' }
        ]
    },
    // Filters
    grayscale: {
        id: 'grayscale',
        title: 'Grayscale',
        shortDescription: 'Convert to black and white.',
        fullDescription: 'Removes all color information from the image, leaving only shades of gray.',
        usage: 'Use for artistic black and white photography or to reduce file size by removing color channels.',
        controls: []
    },
    blur: {
        id: 'blur',
        title: 'Blur',
        shortDescription: 'Apply Gaussian blur.',
        fullDescription: 'Softens the image details. Useful for creating background images or obscuring details.',
        usage: 'Increase the radius to create a stronger blur effect.',
        controls: [
            { title: 'Radius', content: 'The strength of the blur effect in pixels.' }
        ]
    },
    // AI
    backgroundRemoval: {
        id: 'backgroundRemoval',
        title: 'Background Removal',
        shortDescription: 'Remove image background using AI.',
        fullDescription: 'Uses advanced AI models to detect the main subject of the image and make the background transparent.',
        usage: 'Ideal for product photography or creating stickers and avatars.',
        controls: [],
        tips: ['This process can be resource-intensive. It runs entirely in your browser.']
    },
    facePrivacy: {
        id: 'facePrivacy',
        title: 'Face Privacy',
        shortDescription: 'Automatically blur or pixelate faces.',
        fullDescription: 'Detects faces in the image and applies a privacy filter (blur or pixelate) to them.',
        usage: 'Essential for anonymizing photos in public datasets or for privacy compliance.',
        controls: [
            { title: 'Mode', content: 'Choose between Blur or Pixelate.' },
            { title: 'Strength', content: 'How strong the obscuring effect should be.' }
        ]
    },
    // Watermark
    watermark: {
        id: 'watermark',
        title: 'Watermark',
        shortDescription: 'Add an image overlay.',
        fullDescription: 'Overlay another image (like a logo) onto your main image.',
        usage: 'Protect your intellectual property or brand your images.',
        controls: [
            { title: 'Image', content: 'Upload the watermark image file.' },
            { title: 'Position', content: 'Where to place the watermark (e.g., Bottom Right, Center).' },
            { title: 'Opacity', content: 'Transparency of the watermark.' },
            { title: 'Scale', content: 'Size of the watermark relative to the main image.' }
        ]
    },
    textFill: {
        id: 'textFill',
        title: 'Text Fill',
        shortDescription: 'Fill text with the image content.',
        fullDescription: 'Creates a typography effect where the image is only visible inside the letters of your text.',
        usage: 'Great for posters, album art, or creative social media posts.',
        controls: [
            { title: 'Text', content: 'The text to display.' },
            { title: 'Font', content: 'Font family to use.' },
            { title: 'Font Size', content: 'Size of the text.' }
        ]
    }
};

export const getHelpContent = (id: string): TransformationHelp | null => {
    return helpContent[id] || null;
};

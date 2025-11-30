import React, { useEffect, useState, useRef } from 'react';
import { Recipe } from '../core/types';
import { imageProcessor } from '../core/Processor';
import { Loader2, MapPin, X, Columns, MoveHorizontal, Eye } from 'lucide-react';
import ExifReader from 'exifreader';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PreviewCanvasProps {
    originalImage: HTMLImageElement | null;
    filename?: string;
    recipe: Recipe;
    stopAfterStepIndex?: number;
}

type ComparisonMode = 'none' | 'split' | 'slider';

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
    originalImage,
    filename = 'preview.jpg',
    recipe,
    stopAfterStepIndex,
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('none');
    const [sliderPosition, setSliderPosition] = useState(50);
    const sliderRef = useRef<HTMLDivElement>(null);

    // ... (GPS Helper)

    // ... (Extract GPS)

    // Debounce processing
    useEffect(() => {
        if (!originalImage) {
            setPreviewUrl(null);
            return;
        }

        const process = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = await imageProcessor.processToDataUrl(
                    originalImage,
                    recipe,
                    {
                        originalImage,
                        filename: filename,
                        variables: new Map(),
                    },
                    stopAfterStepIndex
                );
                setPreviewUrl(url);
            } catch (err) {
                console.error(err);
                setError('Failed to process image');
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(process, 500);
        return () => clearTimeout(timer);
    }, [originalImage, recipe, stopAfterStepIndex]);

    // Cleanup URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSliderPosition(Number(e.target.value));
    };

    if (!originalImage) {
        return (
            <div className="preview-empty">
                <p>Select an image to preview the recipe</p>
            </div>
        );
    }

    return (
        <div className="preview-canvas">
            {loading && (
                <div className="preview-loading">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            )}
            {error && <div className="preview-error">{error}</div>}

            <div className="canvas-toolbar">
                <div className="comparison-controls">
                    <button
                        className={`btn-icon ${comparisonMode === 'none' ? 'active' : ''}`}
                        onClick={() => setComparisonMode('none')}
                        title="Single View"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        className={`btn-icon ${comparisonMode === 'split' ? 'active' : ''}`}
                        onClick={() => setComparisonMode('split')}
                        title="Split View"
                    >
                        <Columns size={16} />
                    </button>
                    <button
                        className={`btn-icon ${comparisonMode === 'slider' ? 'active' : ''}`}
                        onClick={() => setComparisonMode('slider')}
                        title="Slider View"
                    >
                        <MoveHorizontal size={16} />
                    </button>
                </div>
                {gps && (
                    <button
                        className={`btn-icon ${showMap ? 'active' : ''}`}
                        onClick={() => setShowMap(!showMap)}
                        title="Toggle Map"
                    >
                        <MapPin size={16} />
                    </button>
                )}
            </div>

            <div className="canvas-content" style={{
                display: 'flex',
                width: '100%',
                height: 'calc(100% - 40px)', // Subtract toolbar height
                gap: '1rem'
            }}>
                {/* Left Side: Image Area */}
                <div className="image-wrapper" style={{
                    flex: showMap ? '1' : 'auto',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: showMap ? '50%' : '100%',
                    overflow: 'hidden',
                    backgroundColor: '#1e1e1e', // Dark background for contrast
                    borderRadius: '8px'
                }}>
                    {/* Standard View */}
                    {comparisonMode === 'none' && previewUrl && (
                        <img src={previewUrl} alt="Preview" className="preview-image" />
                    )}

                    {/* Split View */}
                    {comparisonMode === 'split' && previewUrl && (
                        <div className="split-view">
                            <div className="split-pane">
                                <span className="label">Original</span>
                                <img src={originalImage.src} alt="Original" />
                            </div>
                            <div className="split-pane">
                                <span className="label">Processed</span>
                                <img src={previewUrl} alt="Processed" />
                            </div>
                        </div>
                    )}

                    {/* Slider View */}
                    {comparisonMode === 'slider' && previewUrl && (
                        <div className="slider-view" ref={sliderRef}>
                            <div className="slider-image-container">
                                <img src={originalImage.src} alt="Original" className="slider-bg" />
                                <div
                                    className="slider-fg"
                                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                                >
                                    <img src={previewUrl} alt="Processed" />
                                </div>
                                <div
                                    className="slider-handle-line"
                                    style={{ left: `${sliderPosition}%` }}
                                >
                                    <div className="slider-handle-button">
                                        <MoveHorizontal size={12} color="black" />
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sliderPosition}
                                    onChange={handleSliderChange}
                                    className="slider-input"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Map (Only if toggled) */}
                {showMap && gps && (
                    <div className="map-wrapper" style={{
                        flex: '1',
                        width: '50%',
                        position: 'relative',
                        borderLeft: '1px solid var(--color-border)'
                    }}>
                        <MapContainer center={[gps.lat, gps.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={[gps.lat, gps.lng]}>
                                <Popup>
                                    Image Location
                                </Popup>
                            </Marker>
                        </MapContainer>
                        <button className="close-map-btn" onClick={() => setShowMap(false)}>
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            <style>{`
        .preview-canvas {
          flex: 1;
          background: var(--color-bg-tertiary);
          padding: var(--spacing-md);
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        .canvas-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px;
            background: var(--color-bg-secondary);
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border);
        }
        .comparison-controls {
            display: flex;
            gap: 4px;
        }
        .preview-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          background: var(--color-bg-tertiary);
        }
        .preview-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .preview-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--color-primary);
          background: rgba(0, 0, 0, 0.5);
          padding: var(--spacing-md);
          border-radius: var(--radius-full);
          z-index: 20;
        }
        .preview-error {
          position: absolute;
          bottom: var(--spacing-md);
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-error);
          color: white;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          z-index: 20;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .btn-icon {
            padding: 6px;
            border-radius: 4px;
            background: transparent;
            border: none;
            color: var(--color-text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .btn-icon:hover {
            background: var(--color-bg-tertiary);
            color: var(--color-text-primary);
        }
        .btn-icon.active {
            background: var(--color-bg-tertiary);
            color: var(--color-primary);
        }
        .close-map-btn {
            position: absolute;
            top: var(--spacing-sm);
            right: var(--spacing-sm);
            z-index: 1000;
            padding: var(--spacing-xs);
            background: var(--color-bg-primary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-full);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text-primary);
        }
        
        /* Split View Styles */
        .split-view {
            display: flex;
            width: 100%;
            height: 100%;
            gap: 4px;
        }
        .split-pane {
            flex: 1;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #000;
            overflow: hidden;
        }
        .split-pane img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        .split-pane .label {
            position: absolute;
            top: 8px;
            left: 8px;
            background: rgba(0,0,0,0.6);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.75rem;
            pointer-events: none;
        }

        /* Slider View Styles */
        .slider-view {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .slider-image-container {
            position: relative;
            max-width: 100%;
            max-height: 100%;
            line-height: 0; /* Remove extra space */
        }
        .slider-bg {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            display: block;
        }
        .slider-fg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        .slider-fg img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .slider-handle-line {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            background: white;
            cursor: ew-resize;
            pointer-events: none; /* Let input handle events */
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
        }
        .slider-handle-button {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 24px;
            height: 24px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider-input {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: ew-resize;
            margin: 0;
        }
      `}</style>
        </div>
    );
};
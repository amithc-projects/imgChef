import React, { useEffect, useRef, useState } from 'react';
import { Recipe } from '../core/types';
import { imageProcessor } from '../core/Processor';
import { Loader2, MapPin } from 'lucide-react';
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
    recipe: Recipe;
    stopAfterStepIndex?: number;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
    originalImage,
    recipe,
    stopAfterStepIndex,
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
    const [showMap, setShowMap] = useState(false);

    // Extract GPS
    useEffect(() => {
        if (!originalImage) {
            setGps(null);
            return;
        }

        const loadGps = async () => {
            try {
                const res = await fetch(originalImage.src);
                const blob = await res.blob();
                const tags = await ExifReader.load(blob);

                if (tags['GPSLatitude'] && tags['GPSLongitude']) {
                    // @ts-ignore
                    const lat = tags['GPSLatitude'].description;
                    // @ts-ignore
                    const lng = tags['GPSLongitude'].description;
                    setGps({ lat: parseFloat(lat), lng: parseFloat(lng) });
                } else {
                    setGps(null);
                }
            } catch (e) {
                console.warn('Failed to load EXIF', e);
                setGps(null);
            }
        };
        loadGps();
    }, [originalImage]);

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
                        filename: 'preview.jpg',
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

            {showMap && gps ? (
                <div className="map-container">
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
                        Close Map
                    </button>
                </div>
            ) : (
                <>
                    {previewUrl && (
                        <img src={previewUrl} alt="Preview" className="preview-image" />
                    )}
                    {gps && (
                        <button className="map-toggle-btn" onClick={() => setShowMap(true)}>
                            <MapPin size={16} />
                            View on Map
                        </button>
                    )}
                </>
            )}

            <style>{`
        .preview-canvas {
          flex: 1;
          background: var(--color-bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          padding: var(--spacing-md);
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
          z-index: 10;
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
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .map-toggle-btn {
            position: absolute;
            top: var(--spacing-md);
            right: var(--spacing-md);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) var(--spacing-md);
            background: var(--color-bg-primary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .map-container {
            width: 100%;
            height: 100%;
            position: relative;
        }
        .close-map-btn {
            position: absolute;
            top: var(--spacing-md);
            right: var(--spacing-md);
            z-index: 1000;
            padding: var(--spacing-sm) var(--spacing-md);
            background: var(--color-bg-primary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            cursor: pointer;
        }
      `}</style>
        </div>
    );
};

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { FolderOpen, Grid, List as ListIcon, ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight, Maximize, Info } from 'lucide-react';

interface LogEntry {
    filename: string;
    date: string;
    gps?: string;
    people?: string;
    width: number;
    height: number;
    [key: string]: any;
}

interface ViewerFile {
    entry: LogEntry;
    handle: FileSystemFileHandle;
    url?: string;
}

export const ViewerPage: React.FC = () => {
    const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [files, setFiles] = useState<ViewerFile[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
    const [showingDetailsFor, setShowingDetailsFor] = useState<ViewerFile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        if (location.state?.handle) {
            setDirectoryHandle(location.state.handle);
            loadDirectory(location.state.handle);
        }
    }, [location.state]);

    const handleOpenDirectory = async () => {
        try {
            // @ts-ignore
            const handle = await window.showDirectoryPicker();
            setDirectoryHandle(handle);
            loadDirectory(handle);
        } catch (e) {
            console.error('Failed to open directory', e);
        }
    };

    const loadDirectory = async (handle: FileSystemDirectoryHandle) => {
        setLoading(true);
        setError(null);
        setFiles([]);

        try {
            // Try to find batch_log.csv
            let logFileHandle: FileSystemFileHandle | undefined;
            try {
                // @ts-ignore
                logFileHandle = await handle.getFileHandle('batch_log.csv');
            } catch (e) {
                console.warn('batch_log.csv not found');
            }

            let entries: LogEntry[] = [];

            if (logFileHandle) {
                // @ts-ignore
                const file = await logFileHandle.getFile();
                const text = await file.text();
                entries = parseCSV(text);
            } else {
                // Fallback: List all images if no log file
                // This part is a bit harder without the log to know what's what, 
                // but we can just iterate the directory.
                // For now, let's just rely on the log file or show a message.
                // Actually, let's iterate and show all images if no log.
                setError('No batch_log.csv found. Showing all images in folder.');
            }

            const loadedFiles: ViewerFile[] = [];

            // If we have entries, try to match them to files
            if (entries.length > 0) {
                for (const entry of entries) {
                    try {
                        // @ts-ignore
                        const fileHandle = await handle.getFileHandle(entry.filename);
                        loadedFiles.push({ entry, handle: fileHandle });
                    } catch (e) {
                        console.warn(`File ${entry.filename} not found in directory`);
                    }
                }
            } else {
                // Scan directory for images
                // @ts-ignore
                for await (const entry of handle.values()) {
                    if (entry.kind === 'file') {
                        const name = entry.name.toLowerCase();
                        if (name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.webp') || name.endsWith('.avif') || name.endsWith('.gif')) {
                            loadedFiles.push({
                                entry: { filename: entry.name, date: '', width: 0, height: 0 },
                                handle: entry as FileSystemFileHandle
                            });
                        }
                    }
                }
            }

            setFiles(loadedFiles);

        } catch (e) {
            console.error('Error loading directory', e);
            setError('Failed to load directory contents.');
        } finally {
            setLoading(false);
        }
    };

    const parseCSV = (csv: string): LogEntry[] => {
        const lines = csv.split('\n');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const entries: LogEntry[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV split, handling quotes is better but let's stick to simple for now 
            // or use a regex if needed. The Logger escapes quotes, so we should be careful.
            // Quick regex for CSV splitting:
            const values: string[] = [];
            let inQuote = false;
            let currentVal = '';
            for (let char of line) {
                if (char === '"') {
                    inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                    values.push(currentVal);
                    currentVal = '';
                } else {
                    currentVal += char;
                }
            }
            values.push(currentVal);

            const entry: any = {};
            headers.forEach((h, index) => {
                let val = values[index] || '';
                // Unescape double quotes
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.slice(1, -1).replace(/""/g, '"');
                }
                entry[h] = val;
            });
            entries.push(entry);
        }
        return entries;
    };

    const handleNext = () => {
        if (selectedFileIndex !== null && selectedFileIndex < files.length - 1) {
            setSelectedFileIndex(selectedFileIndex + 1);
        }
    };

    const handlePrev = () => {
        if (selectedFileIndex !== null && selectedFileIndex > 0) {
            setSelectedFileIndex(selectedFileIndex - 1);
        }
    };

    return (
        <Layout>
            <div className="viewer-page">
                <div className="viewer-header">
                    <div className="header-left">
                        <h2>Result Viewer</h2>
                        <button className="btn btn-primary" onClick={handleOpenDirectory}>
                            <FolderOpen size={16} />
                            Open Output Folder
                        </button>
                        {directoryHandle && <span className="folder-name">{directoryHandle.name}</span>}
                    </div>
                    <div className="header-right">
                        <div className="view-toggle">
                            <button
                                className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <ListIcon size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <div className={`content-area ${viewMode}`}>
                        {files.length === 0 && !error && (
                            <div className="empty-state">
                                <p>No images found. Open a folder containing processed images.</p>
                            </div>
                        )}
                        {files.map((file, index) => (
                            <FileItem
                                key={file.entry.filename}
                                file={file}
                                viewMode={viewMode}
                                onClick={() => setSelectedFileIndex(index)}
                                onInfoClick={(e) => {
                                    e.stopPropagation();
                                    setShowingDetailsFor(file);
                                }}
                            />
                        ))}
                    </div>
                )}

                {selectedFileIndex !== null && (
                    <Lightbox
                        file={files[selectedFileIndex]}
                        onClose={() => setSelectedFileIndex(null)}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        hasNext={selectedFileIndex < files.length - 1}
                        hasPrev={selectedFileIndex > 0}
                    />
                )}

                {showingDetailsFor && (
                    <DetailsModal
                        file={showingDetailsFor}
                        onClose={() => setShowingDetailsFor(null)}
                    />
                )}
            </div>
            <style>{`
                .viewer-page {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: var(--color-bg-primary);
                }
                .viewer-header {
                    padding: var(--spacing-md);
                    border-bottom: 1px solid var(--color-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--color-bg-secondary);
                }
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                }
                .header-left h2 {
                    margin: 0;
                    font-size: 1.2rem;
                }
                .folder-name {
                    color: var(--color-text-secondary);
                    font-size: 0.9rem;
                }
                .view-toggle {
                    display: flex;
                    background: var(--color-bg-tertiary);
                    border-radius: var(--radius-md);
                    padding: 2px;
                }
                .btn-icon {
                    background: none;
                    border: none;
                    color: var(--color-text-secondary);
                    padding: 6px;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    display: flex;
                }
                .btn-icon.active {
                    background: var(--color-bg-primary);
                    color: var(--color-text-primary);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
                .content-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: var(--spacing-md);
                }
                .content-area.grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    grid-auto-rows: min-content;
                    align-content: start;
                    gap: var(--spacing-md);
                }
                .content-area.list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-sm);
                }
                .error-banner {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    padding: var(--spacing-md);
                    text-align: center;
                }
                .empty-state {
                    text-align: center;
                    color: var(--color-text-secondary);
                    margin-top: var(--spacing-xl);
                }
            `}</style>
        </Layout>
    );
};

const FileItem: React.FC<{
    file: ViewerFile,
    viewMode: 'grid' | 'list',
    onClick: () => void,
    onInfoClick: (e: React.MouseEvent) => void
}> = ({ file, viewMode, onClick, onInfoClick }) => {
    const [url, setUrl] = useState<string>('');

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                // @ts-ignore
                const fileData = await file.handle.getFile();
                const objUrl = URL.createObjectURL(fileData);
                if (active) setUrl(objUrl);
            } catch (e) {
                console.error('Failed to load image', e);
            }
        };
        load();
        return () => {
            active = false;
            if (url) URL.revokeObjectURL(url);
        };
    }, [file.handle]);

    if (viewMode === 'list') {
        return (
            <div className="list-item" onClick={onClick}>
                <div className="list-thumb">
                    {url && <img src={url} alt={file.entry.filename} />}
                </div>
                <div className="list-info">
                    <div className="list-name">{file.entry.filename}</div>
                    <div className="list-meta">
                        {file.entry.width}x{file.entry.height} • {file.entry.date}
                    </div>
                </div>
                <style>{`
                    .list-item {
                        display: flex;
                        align-items: center;
                        gap: var(--spacing-md);
                        padding: var(--spacing-sm);
                        background: var(--color-bg-secondary);
                        border-radius: var(--radius-md);
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    .list-item:hover {
                        background: var(--color-bg-tertiary);
                    }
                    .list-thumb {
                        width: 48px;
                        height: 48px;
                        border-radius: var(--radius-sm);
                        overflow: hidden;
                        background: var(--color-bg-tertiary);
                    }
                    .list-thumb img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .list-name {
                        font-weight: 500;
                    }
                    .list-meta {
                        font-size: 0.8rem;
                        color: var(--color-text-secondary);
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="grid-item" onClick={onClick}>
            <div className="grid-thumb">
                {url && <img src={url} alt={file.entry.filename} />}
            </div>
            <div className="grid-info">
                <div className="grid-name" title={file.entry.filename}>{file.entry.filename}</div>
                <button className="info-btn" onClick={onInfoClick} title="View Details">
                    <Info size={14} />
                </button>
            </div>
            <style>{`
                .grid-item {
                    background: var(--color-bg-secondary);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.2s;
                    border: 1px solid var(--color-border);
                    position: relative;
                }
                .grid-item:hover {
                    transform: translateY(-2px);
                    border-color: var(--color-primary);
                }
                .grid-thumb {
                    aspect-ratio: 1;
                    background: var(--color-bg-tertiary);
                    overflow: hidden;
                }
                .grid-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .grid-info {
                    padding: var(--spacing-sm);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .grid-name {
                    font-size: 0.9rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    flex: 1;
                }
                .info-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    display: flex;
                    opacity: 0.5;
                    transition: opacity 0.2s;
                }
                .info-btn:hover {
                    opacity: 1;
                    background: var(--color-bg-tertiary);
                    color: var(--color-primary);
                }
            `}</style>
        </div>
    );
};

const Lightbox: React.FC<{
    file: ViewerFile,
    onClose: () => void,
    onNext: () => void,
    onPrev: () => void,
    hasNext: boolean,
    hasPrev: boolean
}> = ({ file, onClose, onNext, onPrev, hasNext, hasPrev }) => {
    const [url, setUrl] = useState<string>('');
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const load = async () => {
            try {
                // @ts-ignore
                const fileData = await file.handle.getFile();
                const objUrl = URL.createObjectURL(fileData);
                setUrl(objUrl);
            } catch (e) {
                console.error('Failed to load image', e);
            }
        };
        load();
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [file]);

    // Reset zoom on file change
    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [file]);

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const delta = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(0.1, scale + delta), 5);
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                <div className="lightbox-toolbar">
                    <div className="file-info">
                        <strong>{file.entry.filename}</strong>
                        <span>{file.entry.width}x{file.entry.height}</span>
                    </div>
                    <div className="controls">
                        <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))}><ZoomOut size={20} /></button>
                        <span className="zoom-level">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(5, s + 0.1))}><ZoomIn size={20} /></button>
                        <button onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}><Maximize size={20} /></button>
                        <button onClick={onClose} className="close-btn"><X size={20} /></button>
                    </div>
                </div>

                <div
                    className="image-container"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {url && (
                        <img
                            src={url}
                            alt={file.entry.filename}
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                cursor: isDragging ? 'grabbing' : 'grab'
                            }}
                            draggable={false}
                        />
                    )}
                </div>

                {hasPrev && (
                    <button className="nav-btn prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
                        <ChevronLeft size={32} />
                    </button>
                )}
                {hasNext && (
                    <button className="nav-btn next" onClick={(e) => { e.stopPropagation(); onNext(); }}>
                        <ChevronRight size={32} />
                    </button>
                )}
            </div>
            <style>{`
                .lightbox-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                }
                .lightbox-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }
                .lightbox-toolbar {
                    padding: var(--spacing-md);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.5);
                    color: white;
                    z-index: 10;
                }
                .file-info {
                    display: flex;
                    flex-direction: column;
                }
                .file-info span {
                    font-size: 0.8rem;
                    opacity: 0.8;
                }
                .controls {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                }
                .controls button {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                }
                .controls button:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                .image-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    user-select: none;
                }
                .image-container img {
                    max-width: 100%;
                    max-height: 100%;
                    transition: transform 0.1s ease-out;
                }
                .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.5);
                    border: none;
                    color: white;
                    padding: var(--spacing-md);
                    cursor: pointer;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                .nav-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .nav-btn.prev { left: var(--spacing-md); }
                .nav-btn.next { right: var(--spacing-md); }
            `}</style>
        </div>
    );
};

const DetailsModal: React.FC<{ file: ViewerFile, onClose: () => void }> = ({ file, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>File Details</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="detail-row">
                        <span className="label">Filename:</span>
                        <span className="value">{file.entry.filename}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Dimensions:</span>
                        <span className="value">{file.entry.width} x {file.entry.height}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Date:</span>
                        <span className="value">{file.entry.date || 'N/A'}</span>
                    </div>
                    {file.entry.gps && (
                        <div className="detail-row">
                            <span className="label">GPS:</span>
                            <span className="value">{file.entry.gps}</span>
                        </div>
                    )}
                    {file.entry.people && (
                        <div className="detail-row">
                            <span className="label">People:</span>
                            <span className="value">{file.entry.people}</span>
                        </div>
                    )}

                    <div className="divider" />
                    <h4>All Metadata (CSV)</h4>
                    <div className="raw-data">
                        {Object.entries(file.entry).map(([key, value]) => {
                            if (['filename', 'width', 'height', 'date', 'gps', 'people'].includes(key)) return null;
                            return (
                                <div className="detail-row" key={key}>
                                    <span className="label">{key}:</span>
                                    <span className="value">{String(value)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1100;
                }
                .modal-content {
                    background: var(--color-bg-secondary);
                    border-radius: var(--radius-lg);
                    width: 100%;
                    max-width: 500px;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    border: 1px solid var(--color-border);
                }
                .modal-header {
                    padding: var(--spacing-md);
                    border-bottom: 1px solid var(--color-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                }
                .close-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    padding: 4px;
                }
                .close-btn:hover {
                    color: var(--color-text-primary);
                }
                .modal-body {
                    padding: var(--spacing-md);
                    overflow-y: auto;
                }
                .detail-row {
                    display: flex;
                    margin-bottom: var(--spacing-sm);
                    font-size: 0.9rem;
                }
                .label {
                    width: 120px;
                    color: var(--color-text-secondary);
                    flex-shrink: 0;
                }
                .value {
                    color: var(--color-text-primary);
                    word-break: break-all;
                }
                .divider {
                    height: 1px;
                    background: var(--color-border);
                    margin: var(--spacing-md) 0;
                }
                h4 {
                    margin: 0 0 var(--spacing-sm) 0;
                    font-size: 0.9rem;
                    color: var(--color-text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .raw-data {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-xs);
                }
            `}</style>
        </div>
    );
};

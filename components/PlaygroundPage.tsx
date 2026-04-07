import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DdsLoader } from '../services/DdsLoader';
import { ZoomInIcon, ZoomOutIcon, DownloadIcon, UploadIcon } from './Icons';

// ─── Custom Background Upload Modal ────────────────────────────────────────────
// ─── Custom Background Upload Modal ────────────────────────────────────────────
const CustomBgModal = ({ 
    onClose, 
    onApply,
    loadedParts,
    visibleParts,
    animIndex
}: { 
    onClose: () => void, 
    onApply: (dataUrl: string) => void,
    loadedParts: Record<string, CropResult | null>,
    visibleParts: Record<string, boolean>,
    animIndex: number
}) => {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
    const [baseSize, setBaseSize] = useState({ w: 0, h: 0 });
    const [zoom, setZoom] = useState(1);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const posStart = useRef({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;
            const img = new Image();
            img.onload = () => {
                const minDim = Math.min(img.width, img.height);
                if (minDim < 256) {
                    alert('이미지의 짧은 쪽이 256px 이상이어야 합니다냥!');
                    return;
                }
                const initialZoom = 1.0;
                setBaseSize({ w: img.width, h: img.height });
                setZoom(initialZoom);
                setImgSize({ w: img.width, h: img.height });
                setImgSrc(result);
                setPos({ x: 0, y: 0 });
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        isDragging.current = true;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        dragStart.current = { x: clientX, y: clientY };
        posStart.current = { ...pos };
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging.current || !imgSrc) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        const dx = clientX - dragStart.current.x;
        const dy = clientY - dragStart.current.y;
        
        let nx = posStart.current.x + dx;
        let ny = posStart.current.y + dy;
        
        nx = Math.min(0, Math.max(nx, 256 - imgSize.w));
        ny = Math.min(0, Math.max(ny, 256 - imgSize.h));
        
        setPos({ x: nx, y: ny });
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const minZoom = baseSize.w > 0 ? Math.max(256 / baseSize.w, 256 / baseSize.h) : 1;

    const handleZoomChange = (sliderValue: number) => {
        let newZoom = 1;
        if (sliderValue < 0) {
            newZoom = 1 + sliderValue * (1 - minZoom);
        } else {
            newZoom = 1 + sliderValue * 4;
        }

        const oldZoom = zoom;
        const boundedZoom = Math.max(minZoom, Math.min(newZoom, 5));
        
        const centerX = -pos.x + 128;
        const centerY = -pos.y + 128;
        
        const scale = boundedZoom / oldZoom;
        
        let nx = 128 - (centerX * scale);
        let ny = 128 - (centerY * scale);
        
        const nw = baseSize.w * boundedZoom;
        const nh = baseSize.h * boundedZoom;
        
        nx = Math.min(0, Math.max(nx, 256 - nw));
        ny = Math.min(0, Math.max(ny, 256 - nh));
        
        setZoom(boundedZoom);
        setImgSize({ w: nw, h: nh });
        setPos({ x: nx, y: ny });
    };

    const getSliderValue = (z: number) => {
        if (z < 1) {
            return (z - 1) / (1 - minZoom);
        } else {
            return (z - 1) / 4;
        }
    };

    // Render character preview on overlay canvas냥
    useEffect(() => {
        const cvs = overlayCanvasRef.current;
        if (!cvs || !imgSrc) return;
        const ctx = cvs.getContext('2d')!;
        const W = 256, H = 256;
        ctx.clearRect(0, 0, W, H);

        const bodyPart = loadedParts['body'];
        const bodyFrameIdx = (bodyPart && bodyPart.frames.length > 1) ? (animIndex % 2) : 0;
        const bodyFrame = bodyPart?.frames[bodyFrameIdx] || { x: 0, y: 0, w: 256, h: 256 };
        const charBaseX = bodyPart ? 128 - Math.round(bodyFrame.w / 2) : 128 - 128;
        const charBaseY = 94;

        const drawPart = (id: string, hairHalf?: 'top' | 'bottom') => {
            if (id === 'bg') return; // Don't draw background here냥
            const def = PART_DEFS.find(d => d.id === id);
            if (!def) return;
            const part = loadedParts[id];
            if (!part || !visibleParts[id]) return;

            let frameIdx = 0;
            const fixedIds = ['hair', 'face', 'eye', 'helm', 'shield', 'cloak', 'weapon'];
            if (!fixedIds.includes(id) && part.frames.length > 1) {
                frameIdx = (animIndex % 2);
            }

            const frame = part.frames[frameIdx];
            const refBodyIdx = (bodyPart && frameIdx < bodyPart.frames.length) ? frameIdx : 0;
            const refBodyFrame = bodyPart?.frames[refBodyIdx] || { x: 0, y: 0, w: 256, h: 256 };
            const relativeX = frame.x - refBodyFrame.x;
            const relativeY = frame.y - refBodyFrame.y;

            const bobOffset = (animIndex % 2 === 1) ? 1 : 0;
            const weaponShake = (id === 'weapon' && animIndex % 2 === 0) ? -1 : 0;
            const px = Math.round(charBaseX + def.offsetX + relativeX) + weaponShake;
            const py = Math.round(charBaseY + def.offsetY + relativeY) + bobOffset;

            if (hairHalf === 'bottom') {
                const topH = Math.floor(frame.h / 2), botY = frame.y + topH, botH = frame.h - topH;
                ctx.drawImage(part.canvas, frame.x, botY, frame.w, botH, px, py + topH, frame.w, botH);
            } else if (hairHalf === 'top') {
                const topH = Math.floor(frame.h / 2);
                ctx.drawImage(part.canvas, frame.x, frame.y, frame.w, topH, px, py, frame.w, topH);
            } else {
                ctx.drawImage(part.canvas, frame.x, frame.y, frame.w, frame.h, px, py, frame.w, frame.h);
            }
        };

        RENDER_ORDER.sort((a, b) => a.order - b.order).forEach(entry => drawPart(entry.id, entry.hairHalf));
    }, [imgSrc, loadedParts, visibleParts, animIndex]);

    const handleApply = () => {
        if (!imgRef.current) return;
        const cvs = document.createElement('canvas');
        cvs.width = 256; cvs.height = 256;
        const ctx = cvs.getContext('2d')!;
        ctx.fillStyle = '#323232';
        ctx.fillRect(0, 0, 256, 256);
        ctx.drawImage(imgRef.current, pos.x, pos.y, imgSize.w, imgSize.h);
        onApply(cvs.toDataURL('image/png'));
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md flex flex-col gap-6">
                <h2 className="text-xl font-bold text-white neon-text">커스텀 배경 업로드 (bg000)</h2>
                
                {!imgSrc ? (
                    <div className="border-2 border-dashed border-white/20 hover:border-blue-400 group rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors relative">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="text-blue-400 mb-2 font-bold">📁 클릭하여 파일 업로드</div>
                        <p className="mt-2 text-xs text-gray-400 group-hover:text-gray-300">256x256 픽셀 이상 이미지만 가능합니다냥.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <p className="text-sm text-gray-400 mb-2">이미지를 드래그해서 256x256 크기로 맞추세요냥!</p>
                        <div 
                            className="relative w-[256px] h-[256px] border whitespace-nowrap border-blue-500 overflow-hidden cursor-move touch-none bg-black shrink-0"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleMouseDown}
                            onTouchMove={handleMouseMove}
                            onTouchEnd={handleMouseUp}
                        >
                            <img 
                                ref={imgRef}
                                src={imgSrc} 
                                alt="crop" 
                                draggable={false}
                                style={{ 
                                    position: 'absolute', 
                                    left: pos.x, 
                                    top: pos.y, 
                                    width: imgSize.w, 
                                    height: imgSize.h, 
                                    maxWidth: 'none', 
                                    maxHeight: 'none',
                                    pointerEvents: 'none' 
                                }} 
                            />
                            <canvas 
                                ref={overlayCanvasRef}
                                width={256}
                                height={256}
                                className="absolute inset-0 pointer-events-none"
                                style={{ imageRendering: 'pixelated', opacity: 0.8 }}
                            />
                        </div>
                        
                        <div className="flex items-center gap-3 w-full mt-4">
                            <button 
                                onClick={() => handleZoomChange(getSliderValue(zoom) - 0.1)}
                                className="p-2 rounded-lg bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <ZoomOutIcon className="w-5 h-5" />
                            </button>
                            <input 
                                type="range" 
                                min="-1" 
                                max="1" 
                                step="0.01" 
                                value={getSliderValue(zoom)} 
                                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                                className="flex-1 accent-blue-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <button 
                                onClick={() => handleZoomChange(getSliderValue(zoom) + 0.1)}
                                className="p-2 rounded-lg bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <ZoomInIcon className="w-5 h-5" />
                            </button>
                            <span className="text-xs font-mono text-gray-500 w-10 text-right">
                                {zoom.toFixed(1)}x
                            </span>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end gap-3 mt-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors">취소</button>
                    {imgSrc && (
                        <button onClick={handleApply} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.3)]">적용하기</button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Part definitions냥 ────────────────────────────────────────────────────────
interface PartDef {
    id: string;
    label: string;
    prefix: string;
    defaultFile: string;
    offsetX: number;
    offsetY: number;
    extractCount: number;
    gapThreshold: number; // min transparent px needed to count as frame boundary냥
    isBg?: boolean;
    hidden?: boolean;
}

const PART_DEFS: PartDef[] = [
    { id: 'bg', label: '배경', prefix: 'bg', defaultFile: 'bg001.png', offsetX: 0, offsetY: 0, extractCount: 1, gapThreshold: 3, isBg: true },
    { id: 'body', label: '몸통', prefix: 'body', defaultFile: 'body001_a1.hsc.dds', offsetX: 0, offsetY: 0, extractCount: 1, gapThreshold: 3 },
    { id: 'shoe', label: '신발', prefix: 'shoes', defaultFile: 'shoes001_a1.hsc.dds', offsetX: 0, offsetY: 60, extractCount: 2, gapThreshold: 1 },
    { id: 'pants', label: '하의', prefix: 'pant', defaultFile: 'pant001_a1.hsc.dds', offsetX: 0, offsetY: 44, extractCount: 1, gapThreshold: 3 },
    { id: 'shirt', label: '상의', prefix: 'shirt', defaultFile: 'shirt001_a1.hsc.dds', offsetX: 0, offsetY: 0, extractCount: 1, gapThreshold: 3 },
    { id: 'glove', label: '장갑', prefix: 'glove', defaultFile: 'glove007_a1.hsc.dds', offsetX: 0, offsetY: 30, extractCount: 2, gapThreshold: 1 },
    { id: 'weapon', label: '무기', prefix: 'weapon', defaultFile: 'weapon001_a1.hsc.dds', offsetX: -34, offsetY: 42, extractCount: 2, gapThreshold: 1 },
    { id: 'hair', label: '헤어', prefix: 'hair', defaultFile: 'hair001_a1.hsc.dds', offsetX: -43, offsetY: -35, extractCount: 1, gapThreshold: 3, hidden: true },
    { id: 'helm', label: '모자/헤어', prefix: 'helm', defaultFile: 'helm001_a1.hsc.dds', offsetX: -43, offsetY: -35, extractCount: 1, gapThreshold: 3 },
    { id: 'face', label: '얼굴장식', prefix: 'face', defaultFile: 'face001_a1.hsc.dds', offsetX: -43, offsetY: -35, extractCount: 1, gapThreshold: 3 },
    { id: 'eye', label: '눈장식', prefix: 'eye', defaultFile: 'eye001_a8.hsc.dds', offsetX: -43, offsetY: -35, extractCount: 1, gapThreshold: 3 },
    { id: 'shield', label: '방패', prefix: 'shield', defaultFile: 'shield001_a1.hsc.dds', offsetX: -8, offsetY: 44, extractCount: 1, gapThreshold: 3 },
    { id: 'cloak', label: '망토', prefix: 'cloak', defaultFile: 'cloak001_a1.hsc.dds', offsetX: -14, offsetY: 30, extractCount: 1, gapThreshold: 3 },
];

// Render order — hair split: bottom half behind body, top half on top냥
// face = order 8 (얼굴 장식), eye = order 9 (최상단)
const RENDER_ORDER: { id: string; order: number; hairHalf?: 'top' | 'bottom' }[] = [
    { id: 'bg', order: -1 },
    { id: 'cloak', order: -0.8 },
    { id: 'hair', order: -0.5, hairHalf: 'bottom' },
    { id: 'body', order: 0 },
    { id: 'shoe', order: 1 },
    { id: 'pants', order: 2 },
    { id: 'shirt', order: 3 },
    { id: 'glove', order: 4 },
    { id: 'shield', order: 4.5 },
    { id: 'weapon', order: 5 },
    { id: 'hair', order: 6, hairHalf: 'top' },
    { id: 'helm', order: 7 },
    { id: 'face', order: 8 },
    { id: 'eye', order: 9 },
];

// ─── Types냥 ───────────────────────────────────────────────────────────────────
interface Frame { x: number; y: number; w: number; h: number; }
interface CropResult {
    canvas: HTMLCanvasElement;
    frames: Frame[];
}

interface CharacterPreset {
    selectedFile: Record<string, string>;
    visible: Record<string, boolean>;
}

// ─── extract_first_frame — Hybrid version냥
function extractFrames(canvas: HTMLCanvasElement, extractCount: number, gapThreshold: number): Frame[] {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const w = canvas.width, h = canvas.height;
    const data = ctx.getImageData(0, 0, w, h).data;
    const alpha = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) alpha[i] = data[i * 4 + 3];

    let yStart = 0, yEnd = h;
    const rowSum = new Float64Array(h);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) rowSum[y] += alpha[y * w + x];
    }
    while (yStart < h && rowSum[yStart] === 0) yStart++;
    {
        let gs = -1, gl = 0;
        for (let y = yStart; y < h; y++) {
            if (rowSum[y] === 0) {
                if (gs < 0) gs = y; gl++;
                if (gl >= 3) { yEnd = gs; break; }
            } else { gs = -1; gl = 0; }
        }
    }

    // BFS for all blobs in this row strip
    const visited = new Uint8Array(w * h);
    const MIN_BLOB_PX = 4;
    interface Blob { minX: number; minY: number; maxX: number; maxY: number; count: number; }
    const blobs: Blob[] = [];

    for (let y = yStart; y < yEnd; y++) {
        for (let x = 0; x < w; x++) {
            const i = y * w + x;
            if (visited[i] || alpha[i] === 0) continue;
            const blob: Blob = { minX: w, minY: h, maxX: 0, maxY: 0, count: 0 };
            const queue: number[] = [i];
            visited[i] = 1;
            while (queue.length > 0) {
                const idx = queue.pop()!;
                const bx = idx % w, by = (idx - bx) / w;
                blob.count++;
                if (bx < blob.minX) blob.minX = bx;
                if (bx > blob.maxX) blob.maxX = bx;
                if (by < blob.minY) blob.minY = by;
                if (by > blob.maxY) blob.maxY = by;
                const neighbors = [
                    by > yStart ? idx - w : -1,
                    by < yEnd - 1 ? idx + w : -1,
                    bx > 0 ? idx - 1 : -1,
                    bx < w - 1 ? idx + 1 : -1,
                ];
                for (const ni of neighbors) {
                    if (ni >= 0 && !visited[ni] && alpha[ni] > 0) {
                        visited[ni] = 1;
                        queue.push(ni);
                    }
                }
            }
            if (blob.count >= MIN_BLOB_PX) blobs.push(blob);
        }
    }

    blobs.sort((a, b) => a.minX - b.minX);
    
    // Group blobs by extractCount to form animation frames
    const frames: Frame[] = [];
    for (let i = 0; i < Math.floor(blobs.length / extractCount); i++) {
        const group = blobs.slice(i * extractCount, (i + 1) * extractCount);
        frames.push({
            x: Math.min(...group.map(b => b.minX)),
            y: Math.min(...group.map(b => b.minY)),
            w: Math.max(...group.map(b => b.maxX)) - Math.min(...group.map(b => b.minX)) + 1,
            h: Math.max(...group.map(b => b.maxY)) - Math.min(...group.map(b => b.minY)) + 1,
        });
    }

    if (frames.length === 0) {
        return [{ x: 0, y: 0, w: 1, h: 1 }];
    }
    return frames;
}

// ─── Canvas decode냥 ──────────────────────────────────────────────────────────
async function decodeCanvas(url: string): Promise<HTMLCanvasElement> {
    if (url.endsWith('.dds')) return DdsLoader.loadToCanvas(url);
    const img = new Image();
    img.src = url;
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; });
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d')!.drawImage(img, 0, 0);
    return c;
}

// ─── Global caches — bump CACHE_VER when crop algorithm changes냥 ──────────────
const CACHE_VER = 10; // increment this to invalidate stale in-memory caches냥
const partCache = new Map<string, CropResult>(); // key = "file:ec:gap:ver"
const thumbCache = new Map<string, string>();     // key = "file:ec:gap:ver" → dataURL

async function loadPartCached(def: PartDef, fileName: string): Promise<CropResult | null> {
    let ec = def.extractCount;
    // Override for specific cloaks that need 2 chunks냥
    if (def.id === 'cloak' && ['cloak004', 'cloak005', 'cloak006', 'cloak008', 'cloak009', 'cloak012'].some(c => fileName.startsWith(c))) {
        ec = 2;
    }
    const key = `${fileName}:${ec}:${def.gapThreshold}:v${CACHE_VER}`;
    if (partCache.has(key)) return partCache.get(key)!;
    const url = `/coordinate/${fileName}`;
    try {
        const canvas = await decodeCanvas(url);
        let result: CropResult;
        if (def.isBg) {
            result = { canvas, frames: [{ x: 0, y: 0, w: canvas.width, h: canvas.height }] };
        } else {
            const frames = extractFrames(canvas, ec, def.gapThreshold);
            result = { canvas, frames };
        }
        partCache.set(key, result);
        return result;
    } catch (e) {
        console.warn(`[Playground] Failed to load ${fileName}:`, e);
        return null;
    }
}

// ─── Thumbnail maker냥 ────────────────────────────────────────────────────────
function makeThumbnail(part: CropResult, id: string): string {
    const SIZE = 76;
    const tc = document.createElement('canvas');
    tc.width = SIZE; tc.height = SIZE;
    const ctx = tc.getContext('2d')!;

    // Premium backgrounds냥
    if (id === 'weapon') {
        // Gold/Orange gradient for weapons냥
        const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
        grad.addColorStop(0, '#2c1e0f');
        grad.addColorStop(0.5, '#4a3518');
        grad.addColorStop(1, '#2c1e0f');
        ctx.fillStyle = grad;
    } else if (id === 'glove') {
        // Deep Purple/Indigo for gloves냥
        const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
        grad.addColorStop(0, '#1a102e');
        grad.addColorStop(0.5, '#2a1a4a');
        grad.addColorStop(1, '#1a102e');
        ctx.fillStyle = grad;
    } else {
        // Standard Slate냥
        ctx.fillStyle = '#1a2744';
    }
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Subtle border for premium feel냥
    if (id === 'weapon' || id === 'glove') {
        ctx.strokeStyle = id === 'weapon' ? 'rgba(234,179,8,0.3)' : 'rgba(168,85,247,0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, SIZE - 2, SIZE - 2);
    }

    const frame = part.frames[0];
    const scale = Math.min(1, SIZE / Math.max(frame.w, frame.h, 1));
    const sw = Math.round(frame.w * scale);
    const sh = Math.round(frame.h * scale);
    const dx = Math.round((SIZE - sw) / 2);
    const dy = Math.round((SIZE - sh) / 2);
    ctx.drawImage(part.canvas, frame.x, frame.y, frame.w, frame.h, dx, dy, sw, sh);
    return tc.toDataURL();
}

// ─── Thumbnail loading queue (max 4 concurrent)냥 ─────────────────────────────
interface ThumbTask { def: PartDef; file: string; cb: (url: string) => void; }
const thumbQueue: ThumbTask[] = [];
let activeWorkers = 0;

function drainThumbQueue() {
    while (activeWorkers < 4 && thumbQueue.length > 0) {
        const task = thumbQueue.shift()!;
        const key = `${task.file}:${task.def.extractCount}:${task.def.gapThreshold}:v${CACHE_VER}`;
        if (thumbCache.has(key)) { task.cb(thumbCache.get(key)!); continue; }
        activeWorkers++;
        loadPartCached(task.def, task.file)
            .then(part => {
                if (part) {
                    const dataUrl = makeThumbnail(part, task.def.id);
                    thumbCache.set(key, dataUrl);
                    task.cb(dataUrl);
                }
            })
            .finally(() => { activeWorkers--; drainThumbQueue(); });
    }
}

function enqueueThumb(def: PartDef, file: string, cb: (url: string) => void) {
    let ec = def.extractCount;
    if (def.id === 'cloak' && ['cloak004', 'cloak005', 'cloak006', 'cloak008', 'cloak009', 'cloak012'].some(c => file.startsWith(c))) {
        ec = 2;
    }
    const key = `${file}:${ec}:${def.gapThreshold}:v${CACHE_VER}`;
    if (thumbCache.has(key)) { cb(thumbCache.get(key)!); return; }
    thumbQueue.push({ def, file, cb });
    drainThumbQueue();
}

// ─── ThumbCell — pre-baked PNG 우선, fallback은 DDS decode냥 ─────────────────
const ThumbCell = React.memo(({ def, file, selected, onClick }: {
    def: PartDef; file: string; selected: boolean; onClick: () => void;
}) => {
    const prebakedUrl = `/coordinate-thumbs/${encodeURIComponent(file)}.thumb.png`;
    const cacheKey = `${file}:${def.extractCount}:${def.gapThreshold}`;
    const [src, setSrc] = useState<string | null>(() => thumbCache.get(cacheKey) ?? null);

    useEffect(() => {
        if (thumbCache.has(cacheKey)) { setSrc(thumbCache.get(cacheKey)!); return; }
        let active = true;
        // Try pre-baked PNG first (instant — just an <img> load)냥
        const img = new Image();
        img.onload = () => {
            if (!active) return;
            thumbCache.set(cacheKey, prebakedUrl);
            setSrc(prebakedUrl);
        };
        img.onerror = () => {
            if (!active) return;
            // Fallback: decode DDS in-browser냥
            enqueueThumb(def, file, url => { if (active) { thumbCache.set(cacheKey, url); setSrc(url); } });
        };
        img.src = prebakedUrl;
        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    const label = file.replace(/_a\d+\.hsc\.dds$/i, '').replace(/\.png$/i, '');

    return (
        <button
            title={file}
            onClick={onClick}
            style={{ width: 84, flexShrink: 0 }}
            className={`relative flex flex-col items-center rounded-xl border-2 overflow-hidden transition-all
        ${selected
                    ? 'border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                    : 'border-white/5 bg-slate-800/60 hover:border-blue-400/40'}`}
        >
            <div className="relative w-[76px] h-[76px] overflow-hidden flex items-center justify-center shrink-0">
                {src
                    ? <img src={src} alt={label}
                        style={{ 
                            imageRendering: 'pixelated', 
                            display: 'block', 
                            width: 76, 
                            height: 76,
                            transform: def.id === 'glove' ? 'scale(2)' : 'none'
                        }} />
                    : <div className="flex items-center justify-center bg-slate-800/80 w-full h-full">
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                }
            </div>
            <span className={`w-full text-center text-[9px] font-mono leading-tight py-0.5 truncate px-0.5 z-10
        ${selected ? 'bg-blue-600 text-white' : 'bg-black/70 text-gray-500'}`}>
                {label}
            </span>
            {selected && <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-400 rounded-full z-10" />}
        </button>
    );
});

// ─── Main Component냥 ──────────────────────────────────────────────────────────
const PlaygroundPage: React.FC = () => {
    const [allFiles, setAllFiles] = useState<string[]>([]);
    const [filesReady, setFilesReady] = useState(false);
    
    // State for Custom BG냥
    const [customBgModalOpen, setCustomBgModalOpen] = useState(false);
    const customBgRef = useRef<string | null>(null);

    useEffect(() => {
        fetch('/coordinate-files.json')
            .then(r => r.json())
            .then((f: string[]) => { setAllFiles(f); setFilesReady(true); })
            .catch(() => setFilesReady(true));
    }, []);

    const fileLists = useMemo<Record<string, string[]>>(() => {
        if (!filesReady) return {};
        return Object.fromEntries(
            PART_DEFS.map(d => [d.id, allFiles.filter(f => f.startsWith(d.prefix) && (f.endsWith('.dds') || f.endsWith('.png'))).sort()])
        );
    }, [allFiles, filesReady]);

    const [activeTab, setActiveTab] = useState('body');

    // ─── Only load thumbnails for the active tab to save bandwidth냥 ───────────────────
    useEffect(() => {
        if (!filesReady || !activeTab) return;
        
        const activeDef = PART_DEFS.find(d => d.id === activeTab);
        if (!activeDef) return;

        const files = allFiles.filter(f => f.startsWith(activeDef.prefix) && (f.endsWith('.dds') || f.endsWith('.png')));
        files.forEach(file => {
            const prebakedUrl = `/coordinate-thumbs/${encodeURIComponent(file)}.thumb.png`;
            const cacheKey = `${file}:${activeDef.extractCount}:${activeDef.gapThreshold}`;
            if (thumbCache.has(cacheKey)) return;
            
            const img = new Image();
            img.onload = () => { thumbCache.set(cacheKey, prebakedUrl); };
            img.src = prebakedUrl;
        });
    }, [filesReady, allFiles, activeTab]);
    const [selectedFile, setSelectedFile] = useState<Record<string, string>>(
        () => Object.fromEntries(PART_DEFS.map(d => [d.id, d.defaultFile]))
    );
    const [visible, setVisible] = useState<Record<string, boolean>>(
        () => Object.fromEntries(PART_DEFS.map(d => [d.id, d.id !== 'weapon' && d.id !== 'face' && d.id !== 'eye' && d.id !== 'shield']))
    );
    const [loaded, setLoaded] = useState<Record<string, CropResult | null>>({});
    const [animIndex, setAnimIndex] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const saveCharacterToFile = () => {
        // Exclude background냥
        const filteredFiles = { ...selectedFile };
        const filteredVisible = { ...visible };
        delete filteredFiles['bg'];
        delete filteredVisible['bg'];

        const preset: CharacterPreset = {
            selectedFile: filteredFiles,
            visible: filteredVisible
        };

        const data = JSON.stringify(preset, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `character_${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const loadCharacterFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const imported = JSON.parse(ev.target?.result as string);
                if (!imported.selectedFile || !imported.visible) {
                    throw new Error('유효하지 않은 캐릭터 파일입니다냥!');
                }
                
                // Update equipment parts only냥
                setSelectedFile(prev => ({ ...prev, ...imported.selectedFile }));
                setVisible(prev => ({ ...prev, ...imported.visible }));

                // Reload necessary parts냥
                Object.keys(imported.selectedFile).forEach(id => {
                    const def = PART_DEFS.find(d => d.id === id);
                    if (def) loadAndSet(def, imported.selectedFile[id]);
                });
                
                alert('캐릭터 설정을 불러왔습니다냥!');
            } catch (err) {
                alert('파일을 불러오는 중 오류가 발생했습니다냥: ' + (err as Error).message);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; 
    };

    // Global animation timer synchronized across all parts냥
    useEffect(() => {
        const timer = setInterval(() => {
            setAnimIndex(i => i + 1);
        }, 1000); // 1-second interval냥
        return () => clearInterval(timer);
    }, []);

    const loadAndSet = useCallback(async (def: PartDef, file: string) => {
        if (def.id === 'bg' && file === 'bg000.png') {
            if (customBgRef.current) {
                const canvas = await decodeCanvas(customBgRef.current);
                setLoaded(p => ({ ...p, [def.id]: { canvas, frames: [{ x: 0, y: 0, w: 256, h: 256 }] } }));
            }
            return;
        }
        const part = await loadPartCached(def, file);
        setLoaded(p => ({ ...p, [def.id]: part }));
    }, []);

    useEffect(() => {
        PART_DEFS.forEach(def => loadAndSet(def, def.defaultFile));
    }, [loadAndSet]);

    // ─── Canvas render — mirrors coordinator.py update_image()냥 ─────────────────
    useEffect(() => {
        const cvs = canvasRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d')!;
        const W = 256, H = 256;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#323232';
        ctx.fillRect(0, 0, W, H);

        const bodyPart = loaded['body'];
        const bodyFrameIdx = (bodyPart && bodyPart.frames.length > 1) ? (animIndex % 2) : 0;
        const bodyFrame = bodyPart?.frames[bodyFrameIdx] || { x: 0, y: 0, w: 256, h: 256 };
        // Base X now centers the body without adding bodyFrame.x, since relative logic adds it back냥
        const charBaseX = bodyPart ? 128 - Math.round(bodyFrame.w / 2) : 128 - 128;
        // Base Y aligns the body's native top (as crop strips transparent space). 
        const charBaseY = 94;

        const drawPart = (id: string, hairHalf?: 'top' | 'bottom') => {
            const def = PART_DEFS.find(d => d.id === id);
            if (!def) return;
            const part = loaded[id];
            if (!part || !visible[id]) return;

            // Custom animation logic냥
            let frameIdx = 0;
            const fixedIds = ['hair', 'face', 'eye', 'helm', 'shield', 'cloak', 'weapon'];
            if (!fixedIds.includes(id) && part.frames.length > 1) {
                frameIdx = (animIndex % 2);
            }

            const frame = part.frames[frameIdx];

            // Intrinsic Offset relative to the matching Body frame냥
            const refBodyIdx = (bodyPart && frameIdx < bodyPart.frames.length) ? frameIdx : 0;
            const refBodyFrame = bodyPart?.frames[refBodyIdx] || { x: 0, y: 0, w: 256, h: 256 };
            const relativeX = frame.x - refBodyFrame.x;
            const relativeY = frame.y - refBodyFrame.y;

            const bobOffset = (animIndex % 2 === 1) ? 1 : 0;
            const weaponShake = (id === 'weapon' && animIndex % 2 === 0) ? -1 : 0;
            const px = Math.round(charBaseX + def.offsetX + relativeX) + weaponShake;
            const py = Math.round(charBaseY + def.offsetY + relativeY) + bobOffset;

            if (id === 'bg') {
                const bx = Math.round((W - frame.w) / 2);
                const by = Math.round((H - frame.h) / 2);
                ctx.drawImage(part.canvas, frame.x, frame.y, frame.w, frame.h, bx, by, frame.w, frame.h);
                return;
            }

            if (hairHalf === 'bottom') {
                const topH = Math.floor(frame.h / 2);
                const botY = frame.y + topH;
                const botH = frame.h - topH;
                ctx.drawImage(part.canvas, frame.x, botY, frame.w, botH, px, py + topH, frame.w, botH);
            } else if (hairHalf === 'top') {
                const topH = Math.floor(frame.h / 2);
                ctx.drawImage(part.canvas, frame.x, frame.y, frame.w, topH, px, py, frame.w, topH);
            } else {
                ctx.drawImage(part.canvas, frame.x, frame.y, frame.w, frame.h, px, py, frame.w, frame.h);
            }
        };

        RENDER_ORDER.sort((a, b) => a.order - b.order).forEach(entry => drawPart(entry.id, entry.hairHalf));
    }, [loaded, visible, animIndex]);

    const handleRandom = useCallback(() => {
        const nextFiles: Record<string, string> = { ...selectedFile };
        const nextVisible: Record<string, boolean> = { ...visible };

        PART_DEFS.forEach(def => {
            const files = fileLists[def.id];
            if (files && files.length > 0) {
                const randomFile = files[Math.floor(Math.random() * files.length)];
                nextFiles[def.id] = randomFile;
                // nextVisible[def.id] = true; // Always make it visible on random냥 -> Removed to preserve visibility
                loadAndSet(def, randomFile);

                // Helm/Hair special sync냥
                if (def.id === 'helm') {
                    const m = randomFile.match(/helm(\d+)/);
                    if (m) {
                        const hairFile = `hair${m[1]}_a1.hsc.dds`;
                        if (fileLists['hair']?.includes(hairFile)) {
                            nextFiles['hair'] = hairFile;
                            // nextVisible['hair'] = true; -> Removed to preserve visibility
                            loadAndSet(PART_DEFS.find(d => d.id === 'hair')!, hairFile);
                        }
                    }
                }
            }
        });

        setSelectedFile(nextFiles);
        setVisible(nextVisible);
    }, [fileLists, loadAndSet, selectedFile, visible]);

    const handleSelect = useCallback((partId: string, file: string) => {
        setSelectedFile(p => ({ ...p, [partId]: file }));
        const def = PART_DEFS.find(d => d.id === partId)!;
        loadAndSet(def, file);
        if (partId === 'helm') {
            const m = file.match(/helm(\d+)/);
            if (m) {
                const hairFile = `hair${m[1]}_a1.hsc.dds`;
                if (fileLists['hair']?.includes(hairFile)) {
                    setSelectedFile(p => ({ ...p, hair: hairFile }));
                    setVisible(p => ({ ...p, hair: true }));
                    loadAndSet(PART_DEFS.find(d => d.id === 'hair')!, hairFile);
                }
            }
        }
    }, [loadAndSet, fileLists]);

    // Save-as dialog — 배경 체크 해제 시 투명 PNG, 체크 시 배경 포함냥
    const handleSave = async () => {
        // Render scene to an offscreen canvas for saving냥
        const offscreen = document.createElement('canvas');
        offscreen.width = 256; offscreen.height = 256;
        const ctx2 = offscreen.getContext('2d')!;

        // If bg is UNCHECKED → transparent. If CHECKED → draw bg image (canvasRef already has it)냥
        if (visible['bg']) {
            // Copy main canvas as-is (has grey fill + bg image)냥
            const main = canvasRef.current;
            if (main) ctx2.drawImage(main, 0, 0);
        } else {
            // Transparent base, re-draw only non-bg parts냥
            ctx2.clearRect(0, 0, 256, 256);
            const bodyPart = loaded['body'];
            const bodyFrameIdx = (bodyPart && bodyPart.frames.length > 1) ? (animIndex % 2) : 0;
            const bodyFrame = bodyPart?.frames[bodyFrameIdx] || { x: 0, y: 0, w: 256, h: 256 };
            const charBaseX = bodyPart ? 128 - Math.round(bodyFrame.w / 2) : 128 - 128;
            const charBaseY = 94;
            
            RENDER_ORDER.sort((a, b) => a.order - b.order).forEach(({ id, hairHalf }) => {
                if (id === 'bg') return;
                const def = PART_DEFS.find(d => d.id === id);
                if (!def) return;
                const part = loaded[id];
                if (!part || !visible[id]) return;

                let frameIdx = 0;
                const fixedIds = ['hair', 'face', 'eye', 'helm', 'shield', 'cloak', 'weapon'];
                if (!fixedIds.includes(id) && part.frames.length > 1) {
                    frameIdx = (animIndex % 2);
                }

                const frame = part.frames[frameIdx];
                
                // Intrinsic Offset relative to the matching Body frame냥
                const refBodyIdx = (bodyPart && frameIdx < bodyPart.frames.length) ? frameIdx : 0;
                const refBodyFrame = bodyPart?.frames[refBodyIdx] || { x: 0, y: 0, w: 256, h: 256 };
                const relativeX = frame.x - refBodyFrame.x;
                const relativeY = frame.y - refBodyFrame.y;

                const bobOffset = (animIndex % 2 === 1) ? 1 : 0;
                const weaponShake = (id === 'weapon' && animIndex % 2 === 0) ? -1 : 0;
                const px = Math.round(charBaseX + def.offsetX + relativeX) + weaponShake;
                const py = Math.round(charBaseY + def.offsetY + relativeY) + bobOffset;
                if (hairHalf === 'bottom') {
                    const topH = Math.floor(frame.h / 2), botH = frame.h - topH;
                    ctx2.drawImage(part.canvas, frame.x, frame.y + topH, frame.w, botH, px, py + topH, frame.w, botH);
                } else if (hairHalf === 'top') {
                    ctx2.drawImage(part.canvas, frame.x, frame.y, frame.w, Math.floor(frame.h / 2), px, py, frame.w, Math.floor(frame.h / 2));
                } else {
                    ctx2.drawImage(part.canvas, frame.x, frame.y, frame.w, frame.h, px, py, frame.w, frame.h);
                }
            });
        }

        const blob = await new Promise<Blob | null>(res => offscreen.toBlob(res, 'image/png'));
        if (!blob) return;
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as unknown as {
                    showSaveFilePicker(opts: object): Promise<{ createWritable(): Promise<{ write(b: Blob): Promise<void>; close(): Promise<void> }> }>;
                }).showSaveFilePicker({
                    suggestedName: 'winchinka-coord.png',
                    types: [{ description: 'PNG 이미지', accept: { 'image/png': ['.png'] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } catch (e: unknown) {
                if (e instanceof Error && e.name === 'AbortError') return;
            }
        }
        const a = document.createElement('a');
        a.download = 'winchinka-coord.png';
        a.href = URL.createObjectURL(blob);
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };

    const tabs = PART_DEFS.filter(d => !d.isBg && !d.hidden);
    const activeDef = PART_DEFS.find(d => d.id === activeTab)!;

    return (
        <div className="animate-fade-in max-w-6xl mx-auto pb-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 neon-text tracking-widest">PLAYGROUND</h1>
                <p className="text-gray-400 text-lg">캐릭터 코디네이터 — 파츠를 클릭해서 조합해보세요!</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* ── Left: Canvas + toggles ── */}
                <div className="flex flex-col gap-5 lg:sticky lg:top-24 w-full lg:w-[344px] shrink-0 lg:h-[750px]">
                    <div className="relative p-3 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.15)] max-w-[344px] w-full box-border mx-auto">
                        <canvas ref={canvasRef} width={256} height={256} className="rounded-xl block w-full h-full"
                            style={{ imageRendering: 'pixelated' }} />
                        <div className="absolute inset-3 rounded-xl border border-blue-500/20 pointer-events-none" />
                    </div>

                    <div className="w-full bg-slate-900/80 rounded-2xl border border-white/5 p-5 box-border flex flex-col flex-1 min-h-0 overflow-hidden">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">파츠 표시</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {
                                [
                                    'body', 'shirt',
                                    'pants', 'shield',
                                    'face', 'eye',
                                    'shoe', 'glove',
                                    'weapon', 'helm',
                                    'cloak'
                                ].map(id => {
                                    const def = PART_DEFS.find(d => d.id === id);
                                    if (!def) return null;
                                    const isEssential = ['body', 'shirt', 'pants'].includes(def.id);
                                    return (
                                        <label key={def.id} className={`flex items-center gap-2 group ${isEssential ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                            <input type="checkbox" checked={!!visible[def.id]}
                                                disabled={isEssential}
                                                onChange={e => setVisible(p => ({ ...p, [def.id]: e.target.checked }))}
                                                className={`w-4 h-4 ${isEssential ? 'accent-gray-500' : 'accent-blue-500'}`} />
                                            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                                                {def.label} {isEssential && <span className="text-[8px] text-gray-600">(고정)</span>}
                                            </span>
                                        </label>
                                    );
                                })
                            }
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={!!visible['bg']}
                                    onChange={e => setVisible(p => ({ ...p, bg: e.target.checked }))}
                                    className="w-4 h-4 accent-blue-500" />
                                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">배경</span>
                            </label>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={handleSave}
                                className="flex-[2.5] py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all active:scale-95">
                                💾 이미지 저장
                            </button>
                            <button onClick={handleRandom}
                                className="flex-1 py-2.5 bg-slate-800 text-gray-300 text-sm font-bold rounded-xl border border-white/10 hover:bg-slate-700 hover:text-white transition-all active:scale-95">
                                🎲 랜덤
                            </button>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest pl-1">캐릭터 설정 (파일)</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={saveCharacterToFile}
                                    className="flex-1 py-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-xs"
                                >
                                    <DownloadIcon className="w-4 h-4" />
                                    캐릭터 저장
                                </button>
                                <label className="flex-1 py-2.5 bg-slate-800 text-gray-400 border border-white/10 rounded-xl hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-xs cursor-pointer">
                                    <UploadIcon className="w-4 h-4" />
                                    캐릭터 불러오기
                                    <input type="file" accept=".json" onChange={loadCharacterFromFile} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Part selector ── */}
                <div className="relative h-[550px] sm:h-[650px] lg:h-[750px] flex-1 min-w-0 w-full mb-10 lg:mb-0">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col overflow-hidden">
                        {/* Tab bar냥 */}
                        <div className="flex overflow-x-auto bg-black/30 p-2 gap-1 shrink-0">
                        {tabs.map(def => (
                            <button key={def.id} onClick={() => setActiveTab(def.id)}
                                className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all
                  ${activeTab === def.id ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                                {def.label}
                            </button>
                        ))}
                        <button onClick={() => setActiveTab('bg')}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all
                ${activeTab === 'bg' ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                            배경
                        </button>
                    </div>

                    {/* Thumbnail grid — scrollable냥 */}
                    <div className="flex-1 overflow-y-auto p-3 min-h-0">
                        {!filesReady ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : fileLists[activeTab]?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {activeTab === 'bg' && (
                                    <>
                                        <button
                                            title="커스텀 배경 업로드"
                                            onClick={() => setCustomBgModalOpen(true)}
                                            style={{ width: 84, flexShrink: 0 }}
                                            className="relative flex flex-col items-center justify-center rounded-xl border-2 transition-all border-dashed border-blue-400/50 bg-slate-800/60 hover:bg-slate-700/60 overflow-hidden h-[96px]"
                                        >
                                            <div className="text-blue-400 text-3xl font-light mb-2">+</div>
                                            <span className="w-full text-center text-[9px] font-mono py-1 px-1 bg-black/70 text-gray-400 absolute bottom-0">
                                                업로드 (bg000)
                                            </span>
                                        </button>
                                        {customBgRef.current && (
                                            <button
                                                title="bg000.png"
                                                onClick={() => handleSelect('bg', 'bg000.png')}
                                                style={{ width: 84, flexShrink: 0 }}
                                                className={`relative flex flex-col justify-between items-center rounded-xl border-2 transition-all overflow-hidden h-[96px] ${selectedFile['bg'] === 'bg000.png' ? 'border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'border-white/5 bg-slate-800/60 hover:border-blue-400/40'}`}
                                            >
                                                <div className="flex-1 flex items-center justify-center w-full">
                                                    <img src={customBgRef.current} alt="bg000" style={{ width: 76, height: 76, display: 'block', objectFit: 'contain' }} />
                                                </div>
                                                <span className={`w-full text-center text-[9px] font-mono py-1 mt-auto shrink-0 ${selectedFile['bg'] === 'bg000.png' ? 'bg-blue-600 text-white' : 'bg-black/70 text-gray-500'}`}>
                                                    bg000.png
                                                </span>
                                                {selectedFile['bg'] === 'bg000.png' && <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full" />}
                                            </button>
                                        )}
                                    </>
                                )}
                                {fileLists[activeTab].map(file => (
                                    <ThumbCell
                                        key={file}
                                        def={activeDef}
                                        file={file}
                                        selected={selectedFile[activeTab] === file}
                                        onClick={() => handleSelect(activeTab, file)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-600 text-sm">파일을 찾을 수 없습니다...</div>
                        )}
                    </div>
                    </div>
                </div>
            </div>
            {customBgModalOpen && (
                <CustomBgModal 
                    onClose={() => setCustomBgModalOpen(false)} 
                    onApply={(dataUrl) => {
                        customBgRef.current = dataUrl;
                        setCustomBgModalOpen(false);
                        handleSelect('bg', 'bg000.png');
                    }} 
                    loadedParts={loaded}
                    visibleParts={visible}
                    animIndex={animIndex}
                />
            )}
        </div>
    );
};

export default PlaygroundPage;

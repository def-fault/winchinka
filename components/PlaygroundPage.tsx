import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DdsLoader } from '../services/DdsLoader';

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
    { id: 'face', label: '얼굴 장식', prefix: 'face', defaultFile: 'face001_a1.hsc.dds', offsetX: -43, offsetY: -35, extractCount: 1, gapThreshold: 3 },
    { id: 'eye', label: '눈 장식', prefix: 'eye', defaultFile: 'eye001_a8.hsc.dds', offsetX: -43, offsetY: -35, extractCount: 1, gapThreshold: 3 },
];

// Render order — hair split: bottom half behind body, top half on top냥
// face = order 8 (얼굴 장식), eye = order 9 (최상단)
const RENDER_ORDER: { id: string; order: number; hairHalf?: 'top' | 'bottom' }[] = [
    { id: 'bg', order: -1 },
    { id: 'hair', order: -0.5, hairHalf: 'bottom' },
    { id: 'body', order: 0 },
    { id: 'shoe', order: 1 },
    { id: 'pants', order: 2 },
    { id: 'shirt', order: 3 },
    { id: 'glove', order: 4 },
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
    const key = `${fileName}:${def.extractCount}:${def.gapThreshold}:v${CACHE_VER}`;
    if (partCache.has(key)) return partCache.get(key)!;
    const url = `/coordinate/${fileName}`;
    try {
        const canvas = await decodeCanvas(url);
        let result: CropResult;
        if (def.isBg) {
            result = { canvas, frames: [{ x: 0, y: 0, w: canvas.width, h: canvas.height }] };
        } else {
            const frames = extractFrames(canvas, def.extractCount, def.gapThreshold);
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
    const key = `${file}:${def.extractCount}:${def.gapThreshold}:v${CACHE_VER}`;
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
            {src
                ? <img src={src} alt={label} width={76} height={76}
                    style={{ 
                        imageRendering: 'pixelated', 
                        display: 'block', 
                        width: 76, 
                        height: 76,
                        transform: def.id === 'glove' ? 'scale(2)' : 'none'
                    }} />
                : <div style={{ width: 76, height: 76 }}
                    className="flex items-center justify-center bg-slate-800/80">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
            }
            <span className={`w-full text-center text-[9px] font-mono leading-tight py-0.5 truncate px-0.5
        ${selected ? 'bg-blue-600 text-white' : 'bg-black/70 text-gray-500'}`}>
                {label}
            </span>
            {selected && <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-400 rounded-full" />}
        </button>
    );
});

// ─── Main Component냥 ──────────────────────────────────────────────────────────
const PlaygroundPage: React.FC = () => {
    const [allFiles, setAllFiles] = useState<string[]>([]);
    const [filesReady, setFilesReady] = useState(false);

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

    // Eagerly preload ALL thumbnail images as soon as fileLists is ready냥
    // Active tab files go first, then remaining tabs in background냥
    useEffect(() => {
        if (!filesReady) return;
        // Active tab first냥
        const activeDef = PART_DEFS.find(d => d.id === 'body')!; // default first tab냥
        const allDefs = PART_DEFS;
        // Enqueue in order: current (body) first, then others냥
        allDefs.forEach(def => {
            const files = allFiles.filter(f => f.startsWith(def.prefix) && (f.endsWith('.dds') || f.endsWith('.png')));
            files.forEach(file => {
                // Fire-and-forget: just try the pre-baked PNG img load냥
                const prebakedUrl = `/coordinate-thumbs/${encodeURIComponent(file)}.thumb.png`;
                const cacheKey = `${file}:${def.extractCount}:${def.gapThreshold}`;
                if (thumbCache.has(cacheKey)) return;
                const img = new Image();
                img.onload = () => { thumbCache.set(cacheKey, prebakedUrl); };
                img.onerror = () => {
                    // Only do DDS decode fallback if truly no prebaked thumb냥
                    enqueueThumb(def, file, url => { thumbCache.set(cacheKey, url); });
                };
                img.src = prebakedUrl;
            });
        });
        void activeDef; // suppress unused warning냥
    }, [filesReady, allFiles]);

    const [activeTab, setActiveTab] = useState('body');
    const [selectedFile, setSelectedFile] = useState<Record<string, string>>(
        () => Object.fromEntries(PART_DEFS.map(d => [d.id, d.defaultFile]))
    );
    const [visible, setVisible] = useState<Record<string, boolean>>(
        () => Object.fromEntries(PART_DEFS.map(d => [d.id, d.id !== 'weapon' && d.id !== 'face' && d.id !== 'eye']))
    );
    const [loaded, setLoaded] = useState<Record<string, CropResult | null>>({});
    const [animIndex, setAnimIndex] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Global animation timer synchronized across all parts냥
    useEffect(() => {
        const timer = setInterval(() => {
            setAnimIndex(i => i + 1);
        }, 1000); // 1-second interval냥
        return () => clearInterval(timer);
    }, []);

    const loadAndSet = useCallback(async (def: PartDef, file: string) => {
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
        const charBaseY = 100;

        const drawPart = (id: string, hairHalf?: 'top' | 'bottom') => {
            const def = PART_DEFS.find(d => d.id === id);
            if (!def) return;
            const part = loaded[id];
            if (!part || !visible[id]) return;

            // Custom animation logic냥
            let frameIdx = 0;
            const fixedIds = ['hair', 'face', 'eye', 'helm'];
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
            const px = Math.round(charBaseX + def.offsetX + relativeX);
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
            const charBaseY = 100;
            
            RENDER_ORDER.sort((a, b) => a.order - b.order).forEach(({ id, hairHalf }) => {
                if (id === 'bg') return;
                const def = PART_DEFS.find(d => d.id === id);
                if (!def) return;
                const part = loaded[id];
                if (!part || !visible[id]) return;

                let frameIdx = 0;
                const fixedIds = ['hair', 'face', 'eye', 'helm'];
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
                const px = Math.round(charBaseX + def.offsetX + relativeX);
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

            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-stretch">
                {/* ── Left: Canvas + toggles ── */}
                <div className="flex flex-col items-center gap-5 lg:sticky lg:top-24 h-max">
                    <div className="relative p-3 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.15)] w-[344px] box-border">
                        <canvas ref={canvasRef} width={256} height={256} className="rounded-xl block w-full h-full"
                            style={{ imageRendering: 'pixelated' }} />
                        <div className="absolute inset-3 rounded-xl border border-blue-500/20 pointer-events-none" />
                    </div>

                    <div className="w-[344px] bg-slate-900/80 rounded-2xl border border-white/5 p-4 box-border">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">파츠 표시</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {PART_DEFS.filter(d => !d.isBg).map(def => {
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
                            })}
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={!!visible['bg']}
                                    onChange={e => setVisible(p => ({ ...p, bg: e.target.checked }))}
                                    className="w-4 h-4 accent-blue-500" />
                                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">배경</span>
                            </label>
                        </div>
                        <button onClick={handleSave}
                            className="w-full mt-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all active:scale-95">
                            💾 이미지 저장
                        </button>
                    </div>
                </div>

                {/* ── Right: Part selector ── */}
                <div className="relative h-[650px] lg:h-auto min-w-0">
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
        </div>
    );
};

export default PlaygroundPage;

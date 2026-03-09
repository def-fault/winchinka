/**
 * DDS Loader — supports DXT1, DXT3, DXT5, and RGBA (32-bit) formats냥.
 * DXT3/DXT5 handles the _a8 files (eyes, some face decorations)냥.
 */

export interface DdsHeader {
    width: number;
    height: number;
    format: 'DXT1' | 'DXT3' | 'DXT5' | 'RGBA';
    dataOffset: number;
}

export class DdsLoader {
    static parseHeader(buffer: ArrayBuffer): DdsHeader {
        const v = new DataView(buffer);
        if (v.getUint32(0, true) !== 0x20534444) throw new Error('Not a DDS file냥');

        const height = v.getUint32(12, true);
        const width = v.getUint32(16, true);
        const pfFlags = v.getUint32(80, true);
        const fourCC = String.fromCharCode(v.getUint8(84), v.getUint8(85), v.getUint8(86), v.getUint8(87));
        const bitCount = v.getUint32(88, true);

        let format: DdsHeader['format'] = 'RGBA';
        if (pfFlags & 0x4) {
            if (fourCC === 'DXT1') format = 'DXT1';
            else if (fourCC === 'DXT3') format = 'DXT3';
            else if (fourCC === 'DXT5') format = 'DXT5';
            else throw new Error(`Unsupported FourCC: ${fourCC}냥`);
        } else if ((pfFlags & 0x41) && bitCount !== 32) {
            throw new Error(`Unsupported RGBA bitCount: ${bitCount}냥`);
        }

        return { width, height, format, dataOffset: 128 };
    }

    static async loadToCanvas(url: string): Promise<HTMLCanvasElement> {
        const resp = await fetch(url);
        const buffer = await resp.arrayBuffer();
        const header = this.parseHeader(buffer);
        const dv = new DataView(buffer, header.dataOffset);

        const canvas = document.createElement('canvas');
        canvas.width = header.width; canvas.height = header.height;
        const ctx = canvas.getContext('2d')!;
        const img = ctx.createImageData(header.width, header.height);
        const data = img.data;

        switch (header.format) {
            case 'DXT1': this.decodeDXT1(dv, header.width, header.height, data); break;
            case 'DXT3': this.decodeDXT3(dv, header.width, header.height, data); break;
            case 'DXT5': this.decodeDXT5(dv, header.width, header.height, data); break;
            default: // RGBA 32-bit BGRA냥
                for (let i = 0; i < data.length; i += 4) {
                    data[i + 2] = dv.getUint8(i);
                    data[i + 1] = dv.getUint8(i + 1);
                    data[i] = dv.getUint8(i + 2);
                    data[i + 3] = dv.getUint8(i + 3);
                }
        }

        ctx.putImageData(img, 0, 0);
        return canvas;
    }

    // ─── DXT1 냥 ────────────────────────────────────────────────────────────────
    private static decodeDXT1(dv: DataView, w: number, h: number, out: Uint8ClampedArray) {
        let offset = 0;
        for (let y = 0; y < h; y += 4) {
            for (let x = 0; x < w; x += 4) {
                const c0 = dv.getUint16(offset, true);
                const c1 = dv.getUint16(offset + 2, true);
                offset += 4;

                const r0 = ((c0 >> 11) & 0x1f) << 3, g0 = ((c0 >> 5) & 0x3f) << 2, b0 = (c0 & 0x1f) << 3;
                const r1 = ((c1 >> 11) & 0x1f) << 3, g1 = ((c1 >> 5) & 0x3f) << 2, b1 = (c1 & 0x1f) << 3;

                const colors: [number, number, number, number][] = [
                    [r0, g0, b0, 255],
                    [r1, g1, b1, 255],
                    c0 > c1
                        ? [Math.round((2 * r0 + r1) / 3), Math.round((2 * g0 + g1) / 3), Math.round((2 * b0 + b1) / 3), 255]
                        : [Math.round((r0 + r1) / 2), Math.round((g0 + g1) / 2), Math.round((b0 + b1) / 2), 255],
                    c0 > c1
                        ? [Math.round((r0 + 2 * r1) / 3), Math.round((g0 + 2 * g1) / 3), Math.round((b0 + 2 * b1) / 3), 255]
                        : [0, 0, 0, 0],
                ];

                const bits = dv.getUint32(offset, true); offset += 4;
                this.writeBlock(out, w, h, x, y, bits, colors);
            }
        }
    }

    // ─── DXT3 冷 ──────────────────────────────────────────────────────────────────
    private static decodeDXT3(dv: DataView, w: number, h: number, out: Uint8ClampedArray) {
        let offset = 0;
        for (let y = 0; y < h; y += 4) {
            for (let x = 0; x < w; x += 4) {
                // 8 bytes explicit alpha (4 bits per pixel)냥
                const alphas: number[] = [];
                for (let row = 0; row < 4; row++) {
                    const word = dv.getUint16(offset + row * 2, true);
                    for (let col = 0; col < 4; col++) {
                        // expand 4-bit (0-15) → 8-bit (0-255)냥
                        const a4 = (word >> (col * 4)) & 0xf;
                        alphas.push(a4 * 17);
                    }
                }
                offset += 8;

                const colors = this.readColorBlock(dv, offset);
                offset += 4;
                const bits = dv.getUint32(offset, true); offset += 4;

                for (let j = 0; j < 4; j++) {
                    for (let i = 0; i < 4; i++) {
                        const px = x + i, py = y + j;
                        if (px >= w || py >= h) continue;
                        const idx = (bits >> ((j * 4 + i) * 2)) & 0x3;
                        const pIdx = (py * w + px) * 4;
                        const c = colors[idx];
                        out[pIdx] = c[0]; out[pIdx + 1] = c[1]; out[pIdx + 2] = c[2];
                        out[pIdx + 3] = alphas[j * 4 + i];
                    }
                }
            }
        }
    }

    // ─── DXT5 냥 ──────────────────────────────────────────────────────────────────
    private static decodeDXT5(dv: DataView, w: number, h: number, out: Uint8ClampedArray) {
        let offset = 0;
        for (let y = 0; y < h; y += 4) {
            for (let x = 0; x < w; x += 4) {
                const a0 = dv.getUint8(offset);
                const a1 = dv.getUint8(offset + 1);

                // Build 8-entry alpha palette냥
                const pal: number[] = [a0, a1];
                if (a0 > a1) {
                    for (let k = 2; k <= 7; k++) pal.push(Math.round(((8 - k) * a0 + (k - 1) * a1) / 7));
                } else {
                    for (let k = 2; k <= 5; k++) pal.push(Math.round(((6 - k) * a0 + (k - 1) * a1) / 5));
                    pal.push(0); pal.push(255);
                }

                // 6-byte packed 3-bit indices (48 bits for 16 pixels)냥
                const ab = [
                    dv.getUint8(offset + 2), dv.getUint8(offset + 3),
                    dv.getUint8(offset + 4), dv.getUint8(offset + 5),
                    dv.getUint8(offset + 6), dv.getUint8(offset + 7),
                ];
                const alphas: number[] = [];
                for (let pi = 0; pi < 16; pi++) {
                    const bit = pi * 3;
                    const byteIdx = Math.floor(bit / 8);
                    const bitOff = bit % 8;
                    let idx = (ab[byteIdx] >> bitOff) & 0x7;
                    if (bitOff > 5 && byteIdx + 1 < 6) {
                        idx |= ((ab[byteIdx + 1] & ((1 << (3 - (8 - bitOff))) - 1)) << (8 - bitOff));
                        idx &= 0x7;
                    }
                    alphas.push(pal[idx]);
                }
                offset += 8;

                const colors = this.readColorBlock(dv, offset);
                offset += 4;
                const bits = dv.getUint32(offset, true); offset += 4;

                for (let j = 0; j < 4; j++) {
                    for (let i = 0; i < 4; i++) {
                        const px = x + i, py = y + j;
                        if (px >= w || py >= h) continue;
                        const idx = (bits >> ((j * 4 + i) * 2)) & 0x3;
                        const pIdx = (py * w + px) * 4;
                        const c = colors[idx];
                        out[pIdx] = c[0]; out[pIdx + 1] = c[1]; out[pIdx + 2] = c[2];
                        out[pIdx + 3] = alphas[j * 4 + i];
                    }
                }
            }
        }
    }

    // ─── Helpers냥 ────────────────────────────────────────────────────────────────
    private static readColorBlock(dv: DataView, offset: number): [number, number, number][] {
        const c0 = dv.getUint16(offset, true);
        const c1 = dv.getUint16(offset + 2, true);
        const r0 = ((c0 >> 11) & 0x1f) << 3, g0 = ((c0 >> 5) & 0x3f) << 2, b0 = (c0 & 0x1f) << 3;
        const r1 = ((c1 >> 11) & 0x1f) << 3, g1 = ((c1 >> 5) & 0x3f) << 2, b1 = (c1 & 0x1f) << 3;
        return [
            [r0, g0, b0],
            [r1, g1, b1],
            [Math.round((2 * r0 + r1) / 3), Math.round((2 * g0 + g1) / 3), Math.round((2 * b0 + b1) / 3)],
            [Math.round((r0 + 2 * r1) / 3), Math.round((g0 + 2 * g1) / 3), Math.round((b0 + 2 * b1) / 3)],
        ];
    }

    private static writeBlock(
        out: Uint8ClampedArray, w: number, h: number, x: number, y: number,
        bits: number, colors: [number, number, number, number][]
    ) {
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 4; i++) {
                const px = x + i, py = y + j;
                if (px >= w || py >= h) continue;
                const idx = (bits >> ((j * 4 + i) * 2)) & 0x3;
                const pIdx = (py * w + px) * 4;
                const c = colors[idx];
                out[pIdx] = c[0]; out[pIdx + 1] = c[1]; out[pIdx + 2] = c[2]; out[pIdx + 3] = c[3];
            }
        }
    }
}

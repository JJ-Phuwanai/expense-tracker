if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    console.warn = (...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('Parameter not found')) {
            return;
        }
        originalWarn(...args);
    };
}

import { createWorker, PSM, type Worker } from 'tesseract.js';

type SlipScanResult = {
    amount: number | null;
    itemName: string;
    formattedDate: string;
    rawDateText: string;
    debug?: {
        dateText: string;
        amountText: string;
        noteText: string;
    };
};

type CropBox = {
    x: number; // ratio 0..1
    y: number; // ratio 0..1
    w: number; // ratio 0..1
    h: number; // ratio 0..1
};

const MONTHS: Record<string, string> = {
    'ม.ค.': '01',
    'ก.พ.': '02',
    'มี.ค.': '03',
    'เม.ย.': '04',
    'พ.ค.': '05',
    'มิ.ย.': '06',
    'ก.ค.': '07',
    'ส.ค.': '08',
    'ก.ย.': '09',
    'ต.ค.': '10',
    'พ.ย.': '11',
    'ธ.ค.': '12',
};

const TEMPLATE = {
    // ปรับ ratio เพิ่มเติมได้ตามภาพจริง
    dateBox: { x: 0.03, y: 0.09, w: 0.46, h: 0.09 },
    amountBox: { x: 0.03, y: 0.55, w: 0.42, h: 0.14 },
    noteBox: { x: 0.03, y: 0.88, w: 0.72, h: 0.08 },
};

function normalizeText(text: string) {
    return text.replace(/\s+/g, ' ').trim();
}

function fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };

        img.src = url;
    });
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    return canvas;
}

function cropImage(img: HTMLImageElement, box: CropBox): HTMLCanvasElement {
    const sx = Math.round(img.width * box.x);
    const sy = Math.round(img.height * box.y);
    const sw = Math.round(img.width * box.w);
    const sh = Math.round(img.height * box.h);

    // ขยายภาพ 2.5x เพื่อให้ OCR อ่านง่ายขึ้น
    const scale = 2.5;
    const canvas = createCanvas(sw * scale, sh * scale);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas context not available');
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return canvas;
}

function preprocessCanvas(
    source: HTMLCanvasElement,
    options?: {
        grayscale?: boolean;
        threshold?: boolean;
        contrast?: number; // 1 = เดิม
        brightness?: number; // 0 = เดิม
        sharpen?: boolean;
    },
): HTMLCanvasElement {
    const { grayscale = true, threshold = false, contrast = 1.25, brightness = 0, sharpen = false } = options || {};

    const canvas = createCanvas(source.width, source.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas context not available');
    }

    ctx.drawImage(source, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        if (grayscale) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = gray;
            g = gray;
            b = gray;
        }

        // ปรับ contrast/brightness
        r = (r - 128) * contrast + 128 + brightness;
        g = (g - 128) * contrast + 128 + brightness;
        b = (b - 128) * contrast + 128 + brightness;

        if (threshold) {
            const avg = (r + g + b) / 3;
            const value = avg > 170 ? 255 : 0;
            r = value;
            g = value;
            b = value;
        }

        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
    }

    ctx.putImageData(imageData, 0, 0);

    if (sharpen) {
        // sharpen แบบง่ายด้วย convolution 3x3
        const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const dst = ctx.createImageData(canvas.width, canvas.height);
        const s = src.data;
        const d = dst.data;
        const w = canvas.width;
        const h = canvas.height;

        const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    let ki = 0;

                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const px = x + kx;
                            const py = y + ky;
                            const idx = (py * w + px) * 4 + c;
                            sum += s[idx] * kernel[ki++];
                        }
                    }

                    const outIdx = (y * w + x) * 4 + c;
                    d[outIdx] = Math.max(0, Math.min(255, sum));
                }

                const aIdx = (y * w + x) * 4 + 3;
                d[aIdx] = 255;
            }
        }

        ctx.putImageData(dst, 0, 0);
    }

    return canvas;
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Failed to convert canvas to blob'));
                return;
            }
            resolve(blob);
        }, 'image/png');
    });
}

async function recognizeCanvas(
    worker: Worker,
    canvas: HTMLCanvasElement,
    config?: {
        psm?: PSM;
        whitelist?: string;
    },
) {
    if (config?.psm !== undefined) {
        await worker.setParameters({
            tessedit_pageseg_mode: config.psm,
        });
    }

    if (config?.whitelist) {
        await worker.setParameters({
            tessedit_char_whitelist: config.whitelist,
        });
    } else {
        await worker.setParameters({
            tessedit_char_whitelist: '',
        });
    }

    const blob = await canvasToBlob(canvas);
    const {
        data: { text },
    } = await worker.recognize(blob);

    return normalizeText(text);
}

function parseAmount(text: string): number | null {
    const cleaned = text.replace(/[฿\s]/g, '').replace(/[Oo]/g, '0').replace(/[,]/g, ',');

    const match = cleaned.match(/([0-9,]+\.[0-9]{2})/);
    if (!match) return null;

    const value = Number(match[1].replace(/,/g, ''));
    return Number.isFinite(value) ? value : null;
}

function parseThaiDate(text: string) {
    const normalized = normalizeText(text);

    const match = normalized.match(/(\d{1,2})\s+([ก-ฮ]{2,4}\.?)\s+(\d{4})(?:\s+(\d{1,2}:\d{2}))?/);

    if (!match) {
        return {
            rawDateText: normalized,
            formattedDate: '',
        };
    }

    const day = match[1].padStart(2, '0');
    const monthThai = match[2];
    const yearBE = Number(match[3]);
    const time = match[4] ?? '00:00';
    const month = MONTHS[monthThai] ?? '01';
    const yearAD = yearBE - 543;

    return {
        rawDateText: normalized,
        formattedDate: `${day}/${month}/${yearAD}`,
    };
}

function parseNote(text: string) {
    return normalizeText(text)
        .replace(/^บันทึก\s*/g, '')
        .replace(/^หมายเหตุ\s*/g, '')
        .trim();
}

export async function scanSlip(imageFile: File): Promise<SlipScanResult | null> {
    let worker: Worker | null = null;

    try {
        const img = await fileToImage(imageFile);

        const rawDateCanvas = cropImage(img, TEMPLATE.dateBox);
        const rawAmountCanvas = cropImage(img, TEMPLATE.amountBox);
        const rawNoteCanvas = cropImage(img, TEMPLATE.noteBox);

        const dateCanvas = preprocessCanvas(rawDateCanvas, {
            grayscale: true,
            threshold: false,
            contrast: 1.2,
            brightness: 4,
            sharpen: true,
        });

        const amountCanvas = preprocessCanvas(rawAmountCanvas, {
            grayscale: true,
            threshold: true,
            contrast: 1.45,
            brightness: 8,
            sharpen: true,
        });

        const noteCanvas = preprocessCanvas(rawNoteCanvas, {
            grayscale: true,
            threshold: false,
            contrast: 1.2,
            brightness: 2,
            sharpen: true,
        });

        worker = await createWorker('tha+eng');

        const [dateText, amountText, noteText] = await Promise.all([
            recognizeCanvas(worker, dateCanvas, {
                psm: PSM.SINGLE_BLOCK,
            }),
            recognizeCanvas(worker, amountCanvas, {
                psm: PSM.SINGLE_LINE,
                whitelist: '0123456789.,',
            }),
            recognizeCanvas(worker, noteCanvas, {
                psm: PSM.SINGLE_LINE,
            }),
        ]);

        const { rawDateText, formattedDate } = parseThaiDate(dateText);
        const amount = parseAmount(amountText);
        const itemName = parseNote(noteText) || 'รายการจากสลิป';

        return {
            amount,
            itemName,
            formattedDate,
            rawDateText,
            debug: {
                dateText,
                amountText,
                noteText,
            },
        };
    } catch (error) {
        console.error('scanSlip error:', error);
        return null;
    } finally {
        if (worker) {
            await worker.terminate();
        }
    }
}

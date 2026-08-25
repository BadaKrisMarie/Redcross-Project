import Tesseract from 'tesseract.js';

// Layer 1: filename heuristic (instant, no cost)
const FILENAME_PATTERNS = {
    nbi:      [/nbi/i, /clearance.*nbi/i],
    medical:  [/medical/i, /med.*cert/i, /fit.*to.*work/i],
    training: [/training/i, /seminar/i, /cert.*train/i],
    barangay: [/barangay/i, /brgy/i],
};

// Layer 2: OCR keyword matching (fallback, images only)
const OCR_PATTERNS = {
    nbi:      ['NBI CLEARANCE', 'NATIONAL BUREAU OF INVESTIGATION'],
    medical:  ['MEDICAL CERTIFICATE', 'FIT TO WORK', 'PHYSICIAN'],
    training: ['CERTIFICATE OF TRAINING', 'TRAINING COMPLETION', 'SEMINAR'],
    barangay: ['BARANGAY CLEARANCE', 'BARANGAY CERTIFICATION'],
};

function detectFromFilename(filename) {
    for (const [type, patterns] of Object.entries(FILENAME_PATTERNS)) {
        if (patterns.some(p => p.test(filename))) {
            return { type, confidence: 'medium', source: 'filename' };
        }
    }
    return null;
}

async function detectFromOCR(file) {
    // OCR reliably works on images; skip for PDF unless a pdf->image
    // conversion step is added later (e.g. pdf.js render to canvas).
    if (!file.type.startsWith('image/')) return null;

    try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng');
        const upperText = text.toUpperCase();

        for (const [type, keywords] of Object.entries(OCR_PATTERNS)) {
            if (keywords.some(kw => upperText.includes(kw))) {
                return { type, confidence: 'high', source: 'ocr' };
            }
        }
    } catch (e) {
        console.warn('OCR detection failed:', e);
    }
    return null;
}

/**
 * Detects the document type of an uploaded file.
 * Tries OCR first (higher confidence for images), falls back to
 * filename pattern matching, and finally returns a "no match" result
 * so the UI can fall back to manual selection.
 *
 * @param {File} file
 * @returns {Promise<{ type: string|null, confidence: 'high'|'medium'|'low', source: 'ocr'|'filename'|'none' }>}
 */
export async function detectDocumentType(file) {
    const fromOCR = await detectFromOCR(file);
    if (fromOCR) return fromOCR;

    const fromFilename = detectFromFilename(file.name);
    if (fromFilename) return fromFilename;

    return { type: null, confidence: 'low', source: 'none' };
}
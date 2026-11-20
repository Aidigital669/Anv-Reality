import fs from 'fs';
import path from 'path';

const PRIMARY_TARGET_DIR = path.join(process.cwd(), 'public', 'uploads', 'properties');
const SIBLING_TARGET_DIR = path.resolve('d:/AiDigitals_Projects/RealityTruedeal/public/uploads/properties');

function ensureDirSync(dirPath: string) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err: any) {
    console.warn(`[image-storage] Could not create directory ${dirPath}:`, err.message);
  }
}

/**
 * Automatically converts any base64 data URI to a static image file on disk.
 * Returns the clean relative web path (e.g. `/uploads/properties/prop_123_img_1699999_1.jpg`).
 * If the input is already a normal URL or relative path, it returns it unchanged.
 */
export function saveBase64Image(
  dataUriOrUrl: string,
  propertyId: string | number = 'general',
  index: number = 0
): string {
  if (!dataUriOrUrl || typeof dataUriOrUrl !== 'string') return '';
  const trimmed = dataUriOrUrl.trim();

  // If already a web URL or static path, keep it
  if (!trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  const match = trimmed.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!match) {
    return trimmed;
  }

  let ext = match[1].toLowerCase();
  if (ext === 'jpeg') ext = 'jpg';
  if (ext === 'svg+xml') ext = 'svg';

  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const filename = `prop_${propertyId}_img_${Date.now()}_${index + 1}.${ext}`;

  // 1. Write to this application's public/uploads/properties/
  ensureDirSync(PRIMARY_TARGET_DIR);
  const primaryPath = path.join(PRIMARY_TARGET_DIR, filename);
  try {
    fs.writeFileSync(primaryPath, buffer);
  } catch (err: any) {
    console.error(`[image-storage] Failed writing image to ${primaryPath}:`, err.message);
    return trimmed;
  }

  // 2. Also write to sibling project RealityTruedeal if it exists, keeping them synchronized
  try {
    const siblingRoot = path.resolve('d:/AiDigitals_Projects/RealityTruedeal');
    if (fs.existsSync(siblingRoot)) {
      ensureDirSync(SIBLING_TARGET_DIR);
      fs.writeFileSync(path.join(SIBLING_TARGET_DIR, filename), buffer);
    }
  } catch (err: any) {
    console.warn(`[image-storage] Failed syncing image to sibling repo:`, err.message);
  }

  return `/uploads/properties/${filename}`;
}

export const saveImageIfBase64 = saveBase64Image;

/**
 * Maps an array of image strings through saveBase64Image
 */
export function processImageList(
  images: string[],
  propertyId: string | number = 'general'
): string[] {
  if (!Array.isArray(images)) return [];
  return images.map((u, idx) => saveBase64Image(u, propertyId, idx));
}

/**
 * Saves a direct file upload Buffer to public/uploads/properties/ and returns relative URL.
 */
export function saveUploadedBuffer(
  buffer: Buffer,
  originalName: string,
  propertyId: string | number = 'general'
): string {
  let ext = path.extname(originalName || '').toLowerCase().replace('.', '');
  if (!ext || ext === 'jpeg') ext = 'jpg';

  const filename = `prop_${propertyId}_upload_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;

  ensureDirSync(PRIMARY_TARGET_DIR);
  const primaryPath = path.join(PRIMARY_TARGET_DIR, filename);
  fs.writeFileSync(primaryPath, buffer);

  try {
    const siblingRoot = path.resolve('d:/AiDigitals_Projects/RealityTruedeal');
    if (fs.existsSync(siblingRoot)) {
      ensureDirSync(SIBLING_TARGET_DIR);
      fs.writeFileSync(path.join(SIBLING_TARGET_DIR, filename), buffer);
    }
  } catch (err: any) {
    console.warn(`[image-storage] Failed syncing uploaded buffer to sibling:`, err.message);
  }

  return `/uploads/properties/${filename}`;
}

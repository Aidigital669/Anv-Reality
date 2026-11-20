import { NextRequest, NextResponse } from 'next/server';
import { saveImageIfBase64, saveUploadedBuffer } from '@/lib/image-storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle JSON payload with base64 data URL
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const base64Str = body.image || body.dataUrl || body.file;
      const propertyId = body.propertyId || 'admin';
      const index = body.index || 1;

      if (!base64Str) {
        return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
      }

      const fileUrl = saveImageIfBase64(base64Str, propertyId, index);
      return NextResponse.json({ success: true, url: fileUrl });
    }

    // Handle Multipart FormData
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const propertyId = (formData.get('propertyId') as string) || 'admin';

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileUrl = saveUploadedBuffer(buffer, file.name || 'image.jpg', propertyId);
      return NextResponse.json({ success: true, url: fileUrl });
    }

    return NextResponse.json({ success: false, error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (err: any) {
    console.error('Upload image error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Image upload failed' }, { status: 500 });
  }
}

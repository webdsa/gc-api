import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../config/aws';
import { FormData } from '../../types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { language, data } = body as { language: string; data: FormData };

    const command = new PutObjectCommand({
      Bucket: 'gc.adventistas.org',
      Key: `live/${language}-2025.json`,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
      ACL: 'public-read',
      CacheControl: 'no-cache, no-store, must-revalidate',
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 
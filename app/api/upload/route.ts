import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    const { language, data } = await request.json();
    
    if (!language || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['pt_BR', 'es_ES'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language' },
        { status: 400 }
      );
    }
    
    const params = {
      Bucket: 'gc.adventistas.org',
      Key: `live/${language}-2025.json`,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
      ACL: 'public-read' as const,
      CacheControl: 'no-cache, no-store, must-revalidate',
      Expires: new Date(0),
      Metadata: {
        'x-amz-meta-cache-control': 'no-cache, no-store, must-revalidate',
        'x-amz-meta-pragma': 'no-cache',
        'x-amz-meta-expires': '0'
      }
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return NextResponse.json(
      { error: 'Failed to upload file to S3' },
      { status: 500 }
    );
  }
} 
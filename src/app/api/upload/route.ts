import { NextResponse } from 'next/server';
import { PutObjectCommand, ObjectCannedACL, S3ServiceException } from '@aws-sdk/client-s3';
import { s3Client } from '../../config/aws';

type AllowedLanguage = 'pt_BR' | 'es_ES';
const ALLOWED_LANGUAGES: readonly AllowedLanguage[] = ['pt_BR', 'es_ES'] as const;
const MAX_FILE_SIZE = 1024 * 50; // 50KB

function isValidLanguage(language: string): language is AllowedLanguage {
  return ALLOWED_LANGUAGES.includes(language as AllowedLanguage);
}

interface LiveData {
  enabled: boolean;
  title: string;
  videoID: string;
  description: string;
}

interface RequestData {
  acf: {
    live: LiveData;
  };
}

function validateData(data: unknown): { isValid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Data must be an object' };
  }
  
  const formData = data as RequestData;
  
  if (!formData.acf || typeof formData.acf !== 'object') {
    return { isValid: false, error: 'Missing or invalid acf object' };
  }
  
  if (!formData.acf.live || typeof formData.acf.live !== 'object') {
    return { isValid: false, error: 'Missing or invalid live object' };
  }
  
  if (typeof formData.acf.live.enabled !== 'boolean') {
    return { isValid: false, error: 'Invalid enabled value (must be boolean)' };
  }
  
  if (typeof formData.acf.live.title !== 'string' || formData.acf.live.title.length > 200) {
    return { isValid: false, error: 'Invalid title (must be string, max 200 characters)' };
  }
  
  if (typeof formData.acf.live.videoID !== 'string' || formData.acf.live.videoID.length > 50) {
    return { isValid: false, error: 'Invalid videoID (must be string, max 50 characters)' };
  }
  
  if (typeof formData.acf.live.description !== 'string' || formData.acf.live.description.length > 450) {
    return { isValid: false, error: 'Invalid description (must be string, max 450 characters)' };
  }

  return { isValid: true };
}

export async function POST(request: Request) {
  try {
    // Verificar se as variáveis de ambiente necessárias estão configuradas
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
      console.error('AWS credentials or region not configured');
      return NextResponse.json(
        { error: 'Server configuration error: AWS credentials missing' },
        { status: 500 }
      );
    }

    // Verificar se o bucket está configurado
    const bucketName = process.env.AWS_BUCKET_NAME;
    if (!bucketName) {
      console.error('AWS bucket name not configured');
      return NextResponse.json(
        { error: 'Server configuration error: AWS bucket not configured' },
        { status: 500 }
      );
    }

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { language, data } = body;

    // Validar idioma
    if (!language || !isValidLanguage(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be pt_BR or es_ES' },
        { status: 400 }
      );
    }

    // Validar dados
    const validation = validateData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `Invalid data format: ${validation.error}` },
        { status: 400 }
      );
    }

    // Verificar tamanho do arquivo
    const jsonString = JSON.stringify(data);
    if (jsonString.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds limit of ${MAX_FILE_SIZE} bytes` },
        { status: 400 }
      );
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `live/${language}-2025.json`,
      Body: jsonString,
      ContentType: 'application/json',
      ACL: (process.env.AWS_BUCKET_ACL || 'private') as ObjectCannedACL,
      CacheControl: 'no-cache, no-store, must-revalidate',
    });

    try {
      await s3Client.send(command);
      return NextResponse.json({ 
        success: true,
        message: `File ${language}-2025.json uploaded successfully`
      });
    } catch (s3Error) {
      if (s3Error instanceof S3ServiceException) {
        console.error('S3 Service Error:', {
          code: s3Error.name,
          message: s3Error.message,
          bucket: bucketName,
          key: `live/${language}-2025.json`
        });
        return NextResponse.json(
          { error: `S3 Error: ${s3Error.message}` },
          { status: 500 }
        );
      }
      throw s3Error; // Re-throw if it's not an S3 error
    }
  } catch (error) {
    console.error('Error uploading to S3:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
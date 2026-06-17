import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
)

const BUCKET = env.SUPABASE_STORAGE_BUCKET

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  organizationId: string
): Promise<{ path: string; publicUrl: string | null }> {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.\-_\u0600-\u06FF]/g, '_')
  const filePath = `${organizationId}/${Date.now()}-${sanitizedName}`

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) {
    throw new Error(`فشل رفع الملف: ${error.message}`)
  }

  return { path: filePath, publicUrl: null }
}

export async function getSignedUrl(
  path: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds)

  if (error || !data) {
    throw new Error('فشل إنشاء رابط التحميل')
  }

  return data.signedUrl
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path])
  if (error) {
    console.error('فشل حذف الملف من Storage:', error.message)
  }
}

export function validateFile(
  mimeType: string,
  size: number
): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: 'نوع الملف غير مدعوم. المسموح: PDF, Word, JPG, PNG, WEBP',
    }
  }
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'حجم الملف أكبر من 10 ميجابايت',
    }
  }
  return { valid: true }
}

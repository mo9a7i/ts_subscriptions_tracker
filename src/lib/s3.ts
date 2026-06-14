import 'server-only'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

const MAX_ICON_BYTES = 200 * 1024

function getS3Client(): S3Client {
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? 'eu-central',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  })
}

function getPublicUrl(key: string): string {
  const base = process.env.S3_PUBLIC_URL_BASE
  if (base) {
    return `${base.replace(/\/$/, '')}/${key}`
  }

  const endpoint = (process.env.S3_ENDPOINT ?? '').replace(/\/$/, '')
  const bucket = process.env.S3_BUCKET
  return `${endpoint}/${bucket}/${key}`
}

export async function uploadIcon(
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (buffer.byteLength > MAX_ICON_BYTES) {
    throw new Error('Icon file must be smaller than 200KB')
  }

  const extension = contentType.includes('png')
    ? 'png'
    : contentType.includes('jpeg') || contentType.includes('jpg')
      ? 'jpg'
      : contentType.includes('webp')
        ? 'webp'
        : contentType.includes('gif')
          ? 'gif'
          : 'bin'

  const key = `icons/${randomUUID()}.${extension}`
  const bucket = process.env.S3_BUCKET!

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    })
  )

  return getPublicUrl(key)
}

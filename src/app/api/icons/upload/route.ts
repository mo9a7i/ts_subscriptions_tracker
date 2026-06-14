import { NextResponse } from 'next/server'
import { uploadIcon } from '@/lib/s3'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadIcon(buffer, file.type || 'application/octet-stream')

    return NextResponse.json({ url })
  } catch (error) {
    console.error('POST /api/icons/upload:', error)
    const message = error instanceof Error ? error.message : 'Failed to upload icon'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

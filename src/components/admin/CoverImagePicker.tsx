'use client'

import { ImagePlus, LoaderCircle, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { journalCardImage } from '@/lib/cloudinary'
import { isCloudinaryConfigured, publicEnv } from '@/lib/env'

async function uploadToCloudinary(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', publicEnv.cloudinaryUploadPreset)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${publicEnv.cloudinaryCloudName}/image/upload`,
    { method: 'POST', body }
  )

  if (!response.ok) throw new Error('Upload rejected by Cloudinary')

  const result = (await response.json()) as { secure_url?: string }
  if (!result.secure_url) throw new Error('Cloudinary returned no URL')
  return result.secure_url
}

export function CoverImagePicker({ name, initialImage }: { name: string; initialImage: string }) {
  const [image, setImage] = useState(initialImage)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setErrorMessage('')

    if (!isCloudinaryConfigured) {
      setErrorMessage('Cloudinary is not configured. Set the upload preset in .env.local.')
      return
    }

    setIsUploading(true)
    try {
      setImage(await uploadToCloudinary(file))
    } catch {
      setErrorMessage(`${file.name} could not be uploaded.`)
    }
    setIsUploading(false)
  }

  return (
    <div>
      <input type="hidden" name={name} value={image} />

      <p className="text-ink text-[14px] font-semibold">Cover image</p>

      {image ? (
        <div className="border-hairline relative mt-1.5 overflow-hidden rounded-lg border">
          <span className="bg-surface relative block aspect-[3/2]">
            <Image
              src={journalCardImage(image)}
              alt="Article cover"
              fill
              sizes="(min-width: 768px) 420px, 90vw"
              className="object-cover"
            />
          </span>
          <button
            type="button"
            onClick={() => setImage('')}
            aria-label="Remove cover image"
            className="text-ink absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={event => event.preventDefault()}
          onDrop={event => {
            event.preventDefault()
            void handleFile(event.dataTransfer.files[0])
          }}
          className="border-hairline hover:border-brand mt-1.5 rounded-lg border-2 border-dashed p-6 text-center transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={event => {
              void handleFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-brand inline-flex min-h-11 items-center gap-2 px-3 text-[15px] font-semibold disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                Uploading…
              </>
            ) : (
              <>
                <ImagePlus size={17} aria-hidden="true" />
                Add a cover image
              </>
            )}
          </button>
          <p className="text-muted mt-1.5 text-[13px]">
            Landscape works best. It leads the article card and the article itself.
          </p>
        </div>
      )}

      {errorMessage ? (
        <p role="alert" className="text-danger mt-2 text-[13px]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}

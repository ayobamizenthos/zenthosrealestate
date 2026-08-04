'use client'

import clsx from 'clsx'
import { ChevronLeft, ChevronRight, ImageOff, LoaderCircle, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { propertyCardImage } from '@/lib/cloudinary'
import { MAX_IMAGES_PER_PROPERTY } from '@/lib/constants'
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

export function ImageUploader({ initialImages }: { initialImages: string[] }) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [pendingCount, setPendingCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const remainingSlots = MAX_IMAGES_PER_PROPERTY - images.length

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return
    setErrorMessage('')

    if (!isCloudinaryConfigured) {
      setErrorMessage('Cloudinary is not configured. Set the upload preset in .env.local.')
      return
    }

    const accepted = Array.from(fileList)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, remainingSlots)

    if (!accepted.length) return

    setPendingCount(accepted.length)

    const uploaded: string[] = []
    for (const file of accepted) {
      try {
        uploaded.push(await uploadToCloudinary(file))
      } catch {
        setErrorMessage(`${file.name} could not be uploaded.`)
      }
      setPendingCount(count => count - 1)
    }

    setImages(previous => [...previous, ...uploaded])
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return
    setImages(previous => {
      const next = [...previous]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const removeImage = (index: number) => {
    setImages(previous => previous.filter((_, position) => position !== index))
  }

  return (
    <div>
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="flex items-center justify-between">
        <p className="text-ink text-[14px] font-semibold">Photos</p>
        <p className="text-muted text-[13px]">
          {images.length}/{MAX_IMAGES_PER_PROPERTY}
        </p>
      </div>

      {images.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={image}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={event => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) moveImage(dragIndex, index)
                setDragIndex(null)
              }}
              className={clsx(
                'border-hairline group relative overflow-hidden rounded-lg border bg-white',
                dragIndex === index && 'opacity-50'
              )}
            >
              <span className="bg-surface relative block aspect-[4/5]">
                <Image
                  src={propertyCardImage(image)}
                  alt={`Photo ${index + 1}`}
                  fill
                  sizes="(min-width: 768px) 200px, 45vw"
                  className="object-cover"
                />
              </span>

              {index === 0 ? (
                <span className="bg-brand absolute top-1.5 left-1.5 rounded-pill px-2 py-0.5 text-[10px] font-bold text-white">
                  Cover
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label={`Remove photo ${index + 1}`}
                className="text-ink absolute top-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
              >
                <X size={14} aria-hidden="true" />
              </button>

              <div className="flex border-t border-hairline">
                <button
                  type="button"
                  onClick={() => moveImage(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move photo ${index + 1} earlier`}
                  className="text-muted hover:text-brand flex h-9 flex-1 items-center justify-center disabled:opacity-30"
                >
                  <ChevronLeft size={15} aria-hidden="true" />
                </button>
                <span className="bg-hairline w-px" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => moveImage(index, index + 1)}
                  disabled={index === images.length - 1}
                  aria-label={`Move photo ${index + 1} later`}
                  className="text-muted hover:text-brand flex h-9 flex-1 items-center justify-center disabled:opacity-30"
                >
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {remainingSlots > 0 ? (
        <div
          onDragOver={event => event.preventDefault()}
          onDrop={event => {
            event.preventDefault()
            void handleFiles(event.dataTransfer.files)
          }}
          className="border-hairline hover:border-brand mt-3 rounded-card border-2 border-dashed p-6 text-center transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={event => {
              void handleFiles(event.target.files)
              event.target.value = ''
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={pendingCount > 0}
            className="text-brand inline-flex items-center gap-2 text-[15px] font-semibold disabled:opacity-60"
          >
            {pendingCount > 0 ? (
              <>
                <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                Uploading {pendingCount}…
              </>
            ) : (
              <>
                <Plus size={17} aria-hidden="true" />
                Add photos
              </>
            )}
          </button>

          <p className="text-muted mt-1.5 text-[13px]">
            Drag and drop, or click to choose. First photo becomes the cover.
          </p>
        </div>
      ) : null}

      {images.length === 0 && remainingSlots === MAX_IMAGES_PER_PROPERTY ? (
        <p className="text-muted mt-3 flex items-center gap-1.5 text-[13px]">
          <ImageOff size={14} aria-hidden="true" />A listing with no photos will not appear well in
          search results.
        </p>
      ) : null}

      {errorMessage ? (
        <p role="alert" className="text-danger mt-2 text-[13px]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}

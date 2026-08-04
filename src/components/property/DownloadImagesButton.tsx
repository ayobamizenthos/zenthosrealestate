'use client'

import { Download, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { propertyOriginalImage } from '@/lib/cloudinary'
import { toSlug } from '@/lib/format'

type DownloadState = 'idle' | 'working' | 'failed'

export function DownloadImagesButton({ images, title }: { images: string[]; title: string }) {
  const [state, setState] = useState<DownloadState>('idle')
  const [progress, setProgress] = useState(0)

  if (!images.length) return null

  const downloadAll = async () => {
    setState('working')
    setProgress(0)

    const slug = toSlug(title)

    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const folder = zip.folder(slug) ?? zip

      for (const [index, image] of images.entries()) {
        const response = await fetch(propertyOriginalImage(image))
        if (!response.ok) throw new Error(`Photo ${index + 1} could not be fetched`)

        const blob = await response.blob()
        const extension = blob.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
        folder.file(`${slug}-${String(index + 1).padStart(2, '0')}.${extension}`, blob)
        setProgress(Math.round(((index + 1) / images.length) * 100))
      }

      const archive = await zip.generateAsync({ type: 'blob' })
      const objectUrl = URL.createObjectURL(archive)

      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${slug}.zip`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)

      setState('idle')
    } catch {
      setState('failed')
      window.setTimeout(() => setState('idle'), 3000)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void downloadAll()}
      disabled={state === 'working'}
      className="text-ink hover:border-brand rounded-control flex h-12 items-center justify-center gap-2 border px-4 text-[15px] font-semibold transition-colors disabled:opacity-60"
    >
      {state === 'working' ? (
        <>
          <LoaderCircle size={17} aria-hidden="true" className="animate-spin" />
          Preparing {progress}%
        </>
      ) : state === 'failed' ? (
        'Download failed'
      ) : (
        <>
          <Download size={17} aria-hidden="true" />
          Download all photos
        </>
      )}
    </button>
  )
}

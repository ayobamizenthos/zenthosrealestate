'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Expand, Images, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import {
  IMAGE_PRESETS,
  propertyBlurPlaceholder,
  propertyGalleryImage,
  transformCloudinary,
} from '@/lib/cloudinary'

/**
 * Photographs are 4:5 portrait. One main frame beside a 2×2 thumbnail grid fills
 * exactly the same height, so the block squares off without letterboxing —
 * a landscape-first gallery would crop through every ceiling and floor.
 */
export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!images.length) {
    return <div className="bg-surface aspect-[4/5] w-full md:aspect-[16/10]" />
  }

  const [cover, ...rest] = images
  const thumbnails = rest.slice(0, 4)
  const hiddenCount = images.length - 1 - thumbnails.length

  return (
    <>
      {/* Mobile: a single swipeable frame. */}
      <div className="md:hidden">
        <MobileCarousel images={images} title={title} onOpen={setLightboxIndex} />
      </div>

      {/* Desktop: main frame plus thumbnail grid. */}
      <div className="hidden gap-2 md:grid md:grid-cols-[1.15fr_1fr]">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          aria-label={`View ${title} photo 1 full screen`}
          className="group bg-surface relative aspect-[4/5] overflow-hidden"
        >
          <Image
            src={propertyGalleryImage(cover)}
            alt={`${title} — Photo 1`}
            fill
            sizes="(min-width: 1280px) 42vw, 50vw"
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL={propertyBlurPlaceholder(cover)}
            className="ease-out-soft object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </button>

        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          {thumbnails.map((image, index) => {
            const isLastTile = index === thumbnails.length - 1 && hiddenCount > 0
            return (
              <button
                key={image}
                type="button"
                onClick={() => setLightboxIndex(index + 1)}
                aria-label={
                  isLastTile
                    ? `View all ${images.length} photos`
                    : `View ${title} photo ${index + 2} full screen`
                }
                className="group bg-surface relative overflow-hidden"
              >
                <Image
                  src={propertyGalleryImage(image)}
                  alt={`${title} — Photo ${index + 2}`}
                  fill
                  sizes="21vw"
                  placeholder="blur"
                  blurDataURL={propertyBlurPlaceholder(image)}
                  className="ease-out-soft object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                {isLastTile ? (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55 text-white backdrop-blur-[2px]">
                    <Images size={20} aria-hidden="true" />
                    <span className="text-[15px] font-bold">+{hiddenCount} more</span>
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setLightboxIndex(0)}
        className="border-hairline text-ink hover:border-ink mt-3 hidden h-11 items-center gap-2 border px-4 text-[14px] font-semibold transition-colors md:inline-flex"
      >
        <Expand size={15} aria-hidden="true" />
        View all {images.length} photos
      </button>

      {lightboxIndex !== null ? (
        <GalleryLightbox
          images={images}
          title={title}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  )
}

function MobileCarousel({
  images,
  title,
  onOpen,
}: {
  images: string[]
  title: string
  onOpen: (index: number) => void
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 })
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const syncIndex = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    syncIndex()
    emblaApi.on('select', syncIndex)
    return () => {
      emblaApi.off('select', syncIndex)
    }
  }, [emblaApi])

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {images.map((image, index) => (
            <div key={image} className="relative min-w-0 flex-[0_0_100%]">
              <button
                type="button"
                onClick={() => onOpen(index)}
                aria-label={`View ${title} photo ${index + 1} full screen`}
                className="bg-surface relative block aspect-[4/5] w-full"
              >
                <Image
                  src={propertyGalleryImage(image)}
                  alt={`${title} — Photo ${index + 1}`}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  fetchPriority={index === 0 ? 'high' : undefined}
                  placeholder="blur"
                  blurDataURL={propertyBlurPlaceholder(image)}
                  className="object-cover"
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <span className="absolute right-3 bottom-3 flex items-center gap-1.5 bg-black/70 px-2.5 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm">
        <Images size={13} aria-hidden="true" />
        {selectedIndex + 1}/{images.length}
      </span>
    </div>
  )
}

function GalleryLightbox({
  images,
  title,
  startIndex,
  onClose,
}: {
  images: string[]
  title: string
  startIndex: number
  onClose: () => void
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1, startIndex })
  const [index, setIndex] = useState(startIndex)

  useLockBodyScroll(true)

  useEffect(() => {
    if (!emblaApi) return
    const syncIndex = () => setIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', syncIndex)
    return () => {
      emblaApi.off('select', syncIndex)
    }
  }, [emblaApi])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') emblaApi?.scrollPrev()
      if (event.key === 'ArrowRight') emblaApi?.scrollNext()
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [emblaApi, onClose])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <div
      className="fixed inset-0 z-[70] bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
        <p className="text-[13px] font-medium text-white/80 tabular-nums">
          {index + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {images.map((image, imageIndex) => (
            <div key={image} className="relative h-full min-w-0 flex-[0_0_100%]">
              <Image
                src={transformCloudinary(image, IMAGE_PRESETS.lightbox)}
                alt={`${title} — Photo ${imageIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous photo"
            className="absolute top-1/2 left-4 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 md:flex"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next photo"
            className="absolute top-1/2 right-4 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 md:flex"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  )
}

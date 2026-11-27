import { useState } from 'react'
import { ImageOff } from 'lucide-react'

/**
 * @param {{ src?: string | null, alt: string }} props
 */
export function ImageWithFallback({ src, alt }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = Boolean(src) && failedSrc !== src

  return (
    <div className="admin-thumb">
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailedSrc(src)}
          className="size-full object-cover"
        />
      ) : (
        <div className="admin-thumb-fallback" aria-hidden="true">
          <ImageOff className="size-4" />
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { ImageOff, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Displays dispute evidence images with an accessible lightbox preview.
 * @param {{ urls: string[] }} props
 */
export function DisputeEvidenceGallery({ urls }) {
  const { t } = useTranslation()
  const [lightboxUrl, setLightboxUrl] = useState(null)

  useEffect(() => {
    if (!lightboxUrl) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxUrl(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxUrl])

  return (
    <section className="admin-card">
      <div className="flex items-center justify-between gap-2">
        <h2 className="admin-card-title">{t('disputes.detail.evidenceTitle')}</h2>
        <span className="text-xs text-muted-foreground">
          {t('disputes.detail.evidenceCount', { count: urls.length })}
        </span>
      </div>

      {urls.length === 0 ? (
        <div className="admin-feedback-box admin-feedback-empty mt-4 py-8">
          <ImageOff aria-hidden="true" className="size-6 text-muted-foreground" />
          <p className="mt-2 text-xs text-muted-foreground">{t('disputes.detail.noEvidence')}</p>
        </div>
      ) : (
        <div className="admin-evidence-grid">
          {urls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setLightboxUrl(url)}
              className="admin-evidence-thumb"
              aria-label={t('disputes.detail.openEvidence', { index: index + 1 })}
            >
              <img
                src={url}
                alt={t('disputes.detail.evidenceAlt', { index: index + 1 })}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('disputes.detail.evidencePreview')}
          className="admin-lightbox-backdrop"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            aria-label={t('actions.close')}
            onClick={() => setLightboxUrl(null)}
            className="admin-lightbox-close"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
          <img
            src={lightboxUrl}
            alt={t('disputes.detail.evidencePreview')}
            onClick={(event) => event.stopPropagation()}
            className="admin-lightbox-img"
          />
        </div>
      )}
    </section>
  )
}

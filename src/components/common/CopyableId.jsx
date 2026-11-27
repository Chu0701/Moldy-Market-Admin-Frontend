import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Displays a compact or full monospace identifier with one-click copy.
 * @param {{ value?: string | number | null, truncate?: boolean }} props
 */
export function CopyableId({ value, truncate = true }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  if (value === null || value === undefined || value === '') return <span>—</span>

  const text = String(value)
  const display = truncate && text.length > 12 ? `${text.slice(0, 8)}…` : text

  async function handleCopy() {
    try {
      await navigator.clipboard?.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable in restricted contexts.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={text}
      aria-label={copied ? t('actions.copied') : t('actions.copyValue', { value: text })}
      className="admin-copy-id"
    >
      <span>{display}</span>
      {copied ? (
        <Check aria-hidden="true" className="size-3.5 text-success" />
      ) : (
        <Copy aria-hidden="true" className="size-3.5 text-muted-foreground" />
      )}
    </button>
  )
}

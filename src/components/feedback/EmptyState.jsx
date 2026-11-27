import { Inbox } from 'lucide-react'

/**
 * @param {{ title: string, description: string, action?: import('react').ReactNode }} props
 */
export function EmptyState({ title, description, action }) {
  return (
    <div className="admin-feedback-box admin-feedback-empty">
      <span aria-hidden="true" className="admin-feedback-icon">
        <Inbox className="size-5" />
      </span>
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/**
 * @param {{
 *   title: string,
 *   description?: string,
 *   actions?: import('react').ReactNode,
 *   headingId?: string
 * }} props
 */
export function PageHeader({ title, description, actions, headingId }) {
  return (
    <header className="admin-page-header">
      <div>
        <h1 id={headingId}>{title}</h1>
        {description && <p className="admin-page-subtitle">{description}</p>}
      </div>
      {actions && <div className="admin-page-actions">{actions}</div>}
    </header>
  )
}

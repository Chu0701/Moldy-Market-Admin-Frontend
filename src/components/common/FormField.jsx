/**
 * @param {{
 *   id: string,
 *   label: string,
 *   hint?: string,
 *   meta?: import('react').ReactNode,
 *   error?: string,
 *   children: import('react').ReactNode
 * }} props
 */
export function FormField({ id, label, hint, meta, error, children }) {
  return (
    <div className="admin-field">
      <div className="admin-field-label-row">
        <label htmlFor={id}>{label}</label>
        {meta && <span className="admin-field-hint">{meta}</span>}
      </div>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="admin-field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="admin-field-error">
          {error}
        </p>
      )}
    </div>
  )
}

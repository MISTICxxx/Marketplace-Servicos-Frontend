import { cloneElement } from 'react'

function FormField({ children, error, hint, id, label, required = true, suffix }) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const controlProps = {
    'aria-describedby': describedBy,
    'aria-invalid': error ? 'true' : undefined,
    id,
    required,
  }
  const control = cloneElement(children, controlProps)

  return (
    <div className={`form-field${error ? ' has-error' : ''}`}>
      <label className={`form-label${required ? ' is-required' : ''}`} htmlFor={id}>
        {label}
      </label>
      <div className={suffix ? 'form-input-with-action' : undefined}>
        {control}
        {suffix}
      </div>
      {hint && <p className="form-hint" id={hintId}>{hint}</p>}
      {error && <p className="field-error" id={errorId} role="alert">{error}</p>}
    </div>
  )
}

export default FormField

import { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Input.css';

const Input = forwardRef(function Input(
  { label, error, hint, icon, type = 'text', className = '', id, ...rest },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || rest.name;
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={`field ${error ? 'field-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <div className="field-control">
        {icon && <span className="field-icon">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          className={`field-input ${icon ? 'has-icon' : ''} ${isPassword ? 'has-toggle' : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="field-toggle"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
      {error && (
        <p className="field-message field-message-error" id={`${inputId}-error`}>
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="field-message" id={`${inputId}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;

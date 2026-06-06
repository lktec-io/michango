import { forwardRef } from 'react';
import { FiLoader } from 'react-icons/fi';
import './Button.css';

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon, loading = false, fullWidth = false, className = '', children, ...rest },
  ref
) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    loading ? 'btn-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button ref={ref} className={classes} disabled={loading || rest.disabled} {...rest}>
      {loading && <FiLoader className="btn-spinner" aria-hidden="true" />}
      {!loading && icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-label">{children}</span>
    </button>
  );
});

export default Button;

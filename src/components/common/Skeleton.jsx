import './Skeleton.css';

export default function Skeleton({ width, height = '1rem', radius = 'var(--radius-sm)', className = '' }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width: width ?? '100%', height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`skeleton-card glass-panel ${className}`}>
      <Skeleton height="2.6rem" width="2.6rem" radius="var(--radius-md)" />
      <Skeleton height="1.1rem" width="60%" />
      <Skeleton height="1.6rem" width="45%" />
    </div>
  );
}

export function SkeletonRow({ columns = 4 }) {
  return (
    <div className="skeleton-row">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} height="1rem" />
      ))}
    </div>
  );
}

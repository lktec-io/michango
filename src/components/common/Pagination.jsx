import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Pagination.css';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);

  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <FiChevronLeft />
      </button>
      {start > 1 && (
        <>
          <button type="button" onClick={() => onChange(1)}>1</button>
          {start > 2 && <span className="pagination-ellipsis">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button key={p} type="button" className={p === page ? 'active' : ''} onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="pagination-ellipsis">…</span>}
          <button type="button" onClick={() => onChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        <FiChevronRight />
      </button>
    </nav>
  );
}

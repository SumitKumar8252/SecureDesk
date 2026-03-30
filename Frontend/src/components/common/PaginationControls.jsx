export default function PaginationControls({ page, pagination, onPageChange }) {
  if (!pagination) {
    return null;
  }

  return (
    <div className="pagination">
      <button
        type="button"
        className="button secondary"
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page <= 1}
      >
        Previous
      </button>
      <span>
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <button
        type="button"
        className="button secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pagination.totalPages}
      >
        Next
      </button>
    </div>
  );
}

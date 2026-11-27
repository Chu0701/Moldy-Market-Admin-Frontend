/**
 * @param {{ rows?: number, columns?: number }} props
 */
export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="kn-table-card" aria-busy="true">
      <div className="kn-table-scroll">
        <table className="kn-table">
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((__, colIndex) => (
                  <td key={colIndex}>
                    <div className="skeleton-shimmer h-4 w-full max-w-40 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

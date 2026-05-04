export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2 px-2">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr 
                key={i} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`group glass-panel rounded-2xl transition-all duration-300 hover:scale-[1.005] hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, j) => (
                  <td key={j} className={`px-6 py-5 text-sm text-gray-300 first:rounded-l-2xl last:rounded-r-2xl border-y border-white/5 first:border-l last:border-r group-hover:border-white/10`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center text-gray-600 italic">
                  No data found in the current intelligence pool.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

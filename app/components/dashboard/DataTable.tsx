import type { ReactNode } from 'react';

interface DataTableProps {
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => ReactNode;
  }[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export function DataTable({ columns, data, onRowClick }: DataTableProps) {
  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800/50 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800/50">
              {columns.map((col) => (
                <th key={col.key} className="text-left text-gray-500 font-semibold text-sm uppercase tracking-wider px-6 py-4">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr 
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-gray-800/30 transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-white/5' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    {col.render ? col.render(row[col.key], row) : (
                      <span className="text-gray-300">{row[col.key]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

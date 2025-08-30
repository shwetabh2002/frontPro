import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

function Table<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  className = '',
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gradient-to-r from-slate-200 to-blue-200 h-10 rounded-xl mb-4 shadow-sm"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gradient-to-r from-slate-100 to-blue-100 h-14 rounded-xl shadow-sm"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-200 to-blue-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-slate-600 mb-2">No Data Available</p>
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 shadow-lg ${className}`}>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200">
              {columns.map((column) => (
                <td key={column.key} className="px-5 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                  {column.render
                    ? column.render(item[column.key], item)
                    : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;

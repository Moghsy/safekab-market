import * as React from "react";

export interface ColumnDef<T> {
  accessorKey: string;
  header: string;
  cell?: (props: { row: T }) => React.ReactNode;
}

interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
}

export function Table<T extends { [key: string]: any }>({
  columns,
  data,
}: TableProps<T>) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((col) => (
            <th
              key={col.accessorKey || col.header}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td
                key={col.accessorKey}
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
              >
                {col.cell ? col.cell({ row }) : row[col.accessorKey]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

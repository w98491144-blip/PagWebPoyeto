"use client";

import type { ReactNode } from "react";

const AdminTable = ({
  columns,
  children,
  emptyLabel
}: {
  columns: string[];
  children: ReactNode;
  emptyLabel?: string;
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
          {emptyLabel && (
            <tr>
              <td className="px-4 py-6 text-stone-500" colSpan={columns.length}>
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;

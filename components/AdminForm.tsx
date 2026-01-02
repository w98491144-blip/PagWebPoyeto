"use client";

import type { ReactNode } from "react";

const AdminForm = ({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => {
  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
        {description && <p className="text-sm text-stone-500">{description}</p>}
      </div>
      {children}
    </div>
  );
};

export default AdminForm;

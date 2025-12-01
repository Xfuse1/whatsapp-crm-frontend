'use client';

import { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
  title?: string;
}

export default function AuthCard({ children, title }: AuthCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
      {title && <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{title}</h2>}
      {children}
    </div>
  );
}

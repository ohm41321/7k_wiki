"use client";
import { useEffect } from 'react';

export default function Toast({ message, onClose }: { message: string; onClose?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-black px-4 py-3 rounded-md shadow-xl border border-yellow-600">
        <div className="font-semibold">{message}</div>
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useRef, useEffect, useCallback } from 'react';

type Props = {
  children: React.ReactNode;
};

export function Modal({ children }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const closeModal = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog 
      ref={dialogRef} 
      onClose={closeModal}
      className="bg-black text-textLight p-0 rounded-lg shadow-2xl w-full max-w-4xl backdrop:bg-black backdrop:opacity-50 m-auto"
    >
      <div className="relative p-6">
        {children}
        <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}

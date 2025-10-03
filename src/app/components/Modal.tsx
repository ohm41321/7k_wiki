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
      className="bg-black text-textLight p-2 sm:p-4 rounded-lg shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl backdrop:bg-black backdrop:opacity-50 m-auto max-h-[90vh] overflow-hidden"
    >
      <div className="relative p-3 sm:p-6 max-h-full overflow-auto">
        {children}
        <button onClick={closeModal} className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-secondary p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}

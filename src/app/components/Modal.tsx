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
      className="bg-black text-textLight p-2 sm:p-4 rounded-lg shadow-2xl w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl backdrop:bg-black backdrop:opacity-50 m-auto max-h-[95vh] overflow-hidden"
    >
      <div className="relative p-2 sm:p-4 lg:p-6 max-h-full overflow-auto">
        {children}
        <button onClick={closeModal} className="absolute top-1 right-1 sm:top-2 sm:right-2 lg:top-3 lg:right-3 text-gray-400 hover:text-secondary p-1 sm:p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}

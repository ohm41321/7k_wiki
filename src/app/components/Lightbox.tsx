'use client';

import { useState, useEffect } from 'react';
// use native <img> in the lightbox to avoid width/height requirements

interface LightboxProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export default function Lightbox({ images, startIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={onClose}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl z-50"
      >
        &times;
      </button>

      {/* Image container */}
      <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
        {/* Previous button */}
        {images.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 z-50"
          >
            &#10094;
          </button>
        )}

        <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="object-contain w-auto h-auto max-w-full max-h-full"
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 z-50"
          >
            &#10095;
          </button>
        )}
      </div>
    </div>
  );
}
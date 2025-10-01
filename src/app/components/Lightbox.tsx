'use client';

import { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface LightboxProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export default function Lightbox({ images, startIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goToPrevious = (e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = (e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious(e);
      } else if (e.key === 'ArrowRight') {
        goToNext(e);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images.length, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl z-[60]"
      >
        &times;
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={goToPrevious}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full p-3 z-[60] text-2xl"
        >
          &#10094;
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full p-3 z-[60] text-2xl"
        >
          &#10095;
        </button>
      )}

      <div className="w-full h-full" onClick={e => e.stopPropagation()}>
        <TransformWrapper
          key={currentIndex} // This resets zoom/pan on image change
          initialScale={1}
          doubleClick={{ mode: 'zoomIn' }}
          wheel={{ step: 0.2 }}
        >
          {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
            <>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[60] bg-black bg-opacity-30 rounded-full text-white flex items-center gap-2 p-2">
                  <button onClick={() => zoomOut()} className="w-10 h-10 text-xl">-</button>
                  <button onClick={() => resetTransform()} className="w-10 h-10 text-sm">Reset</button>
                  <button onClick={() => zoomIn()} className="w-10 h-10 text-xl">+</button>
              </div>
              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <img
                  src={images[currentIndex]}
                  alt={`Image ${currentIndex + 1}`}
                  className="object-contain max-w-[95vw] max-h-[95vh] shadow-2xl"
                />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}
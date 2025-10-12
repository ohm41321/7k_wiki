'use client';

import { useState, useEffect } from 'react';
import { hasCookie, setCookie } from 'cookies-next';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite } from '@fortawesome/free-solid-svg-icons';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Use a timeout to delay the banner appearance for a better user experience
    const timer = setTimeout(() => {
      if (!hasCookie('local_cookie_consent')) {
        setShowBanner(true);
      }
    }, 2000); // 2-second delay

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setCookie('local_cookie_consent', 'true', { maxAge: 60 * 60 * 24 * 365 });
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: 0.3, type: 'spring', stiffness: 200, damping: 20 } }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-900/30 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center mx-4"
          >
            <FontAwesomeIcon icon={faCookieBite} className="text-yellow-400 text-5xl mb-4" />
            <h3 className="text-2xl font-bold text-secondary mb-4">นโยบายคุกกี้</h3>
            <p className="text-textLight mb-6">
              เราใช้คุกกี้เพื่อให้แน่ใจว่าคุณจะได้รับประสบการณ์ที่ดีที่สุดบนเว็บไซต์ของเรา โปรดดู{' '}
              <a href="/cookie-policy" className="underline hover:text-yellow-300 transition-colors">
                นโยบายคุกกี้
              </a>{' '}
              ของเราสำหรับรายละเอียดเพิ่มเติม
            </p>
            <button
              onClick={handleAccept}
              className="bg-gradient-to-r from-secondary to-accent hover:from-accent hover:to-secondary text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ยอมรับ
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
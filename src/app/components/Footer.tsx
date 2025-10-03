'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-[#061018] border-t border-yellow-900/10 text-textLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="font-bold text-yellow-300">Fonzu Wiki</h4>
        </div>
        <div className="text-sm flex items-center gap-4">
          <a href="mailto:athitfkm@gmail.com" className="text-yellow-300 hover:text-yellow-400 flex items-center gap-2">
            <FontAwesomeIcon icon={faEnvelope} size="lg" />
            athitfkm@gmail.com
          </a>
          <a href="https://github.com/ohm41321" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:text-yellow-400">| &nbsp;
            <FontAwesomeIcon icon={faGithub} size="lg" /> ohm41321
          </a>
        </div>
        <div className="text-sm text-gray-400">© {new Date().getFullYear()} Fonzu Wiki. All rights reserved.</div>
      </div>
    </footer>
  );
}

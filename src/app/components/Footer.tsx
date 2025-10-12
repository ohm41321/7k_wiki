'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faHeart } from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-[#061018] border-t border-yellow-900/10 text-textLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div>
          <h4 className="font-bold text-yellow-300 text-lg">Fonzu Wiki</h4>
        </div>
        <div className="group text-sm flex flex-col sm:flex-row items-center gap-4">
          <a href="mailto:athitfkm@gmail.com" className="text-yellow-300 hover:text-yellow-400 flex items-center gap-2 transition-all duration-300 group-hover:blur-sm group-hover:opacity-50 hover:!blur-none hover:!opacity-100 hover:scale-110">
            <FontAwesomeIcon icon={faEnvelope} />
            athitfkm@gmail.com
          </a>
          <a href="https://github.com/ohm41321" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:text-yellow-400 flex items-center gap-2 transition-all duration-300 group-hover:blur-sm group-hover:opacity-50 hover:!blur-none hover:!opacity-100 hover:scale-110">
            <FontAwesomeIcon icon={faGithub} />
            ohm41321
          </a>
          <a href="https://tipme.in.th/athitfkm" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:text-yellow-400 flex items-center gap-2 transition-all duration-300 group-hover:blur-sm group-hover:opacity-50 hover:!blur-none hover:!opacity-100 hover:scale-110">
            <FontAwesomeIcon icon={faHeart} />
            Donate
          </a>
        </div>
        <div className="text-sm text-gray-400 mt-4 md:mt-0">© {new Date().getFullYear()} Fonzu Wiki. All rights reserved.</div>
      </div>
    </footer>
  );
}

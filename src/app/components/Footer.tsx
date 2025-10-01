'use client';

export default function Footer() {
  return (
    <footer className="bg-[#061018] border-t border-yellow-900/10 text-textLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="font-bold text-yellow-300">Fonzu:Hub</h4>
          <p className="text-sm">by Fonzu</p>
        </div>
        <div className="text-sm">
          <p>Contact: <a className="text-yellow-300" href="mailto:athitfkm@gmail.com">athitfkm@gmail.com</a></p>
        </div>
        <div className="text-sm text-gray-400">© {new Date().getFullYear()} Fonzu:Hub. All rights reserved.</div>
      </div>
    </footer>
  );
}

import React from 'react';
import Link from 'next/link';

const ProposalFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="text-center mb-12">
      <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
        <a
          href="mailto:admin@xma.ae"
          className="flex items-center text-zinc-400 hover:text-white transition-colors group"
        >
          <div className="bg-zinc-800 p-2 rounded-full mr-3 group-hover:bg-red-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          admin@xma.ae
        </a>
        <a
          href="tel:+971503636856"
          className="flex items-center text-zinc-400 hover:text-white transition-colors group"
        >
          <div className="bg-zinc-800 p-2 rounded-full mr-3 group-hover:bg-red-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          +971 50 363 6856
        </a>
        <a
          href="https://xma.ae"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-zinc-400 hover:text-white transition-colors group"
        >
          <div className="bg-zinc-800 p-2 rounded-full mr-3 group-hover:bg-red-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
              />
            </svg>
          </div>
          xma.ae
        </a>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <Link 
          href="/privacy-policy"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Privacy Policy
        </Link>
        <Link 
          href="/terms-conditions"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Terms & Conditions
        </Link>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <img
          src="/XMA-White.svg"
          alt="XMA Agency Logo"
          className="h-8"
        />
      </div>
      
      <p className="text-zinc-500 text-sm">
        © {currentYear} XMA Agency. All rights reserved.
      </p>
    </div>
  );
};

export default ProposalFooter;

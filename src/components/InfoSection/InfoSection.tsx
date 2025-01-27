import React from 'react';
import { Github } from 'lucide-react';

export default function InfoSection() {
  return (
    <div className="mt-8 text-center">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Secure swaps</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        Trade NFTs directly with other users in a secure, decentralized environment.
      </p>
      
      <div className="flex justify-center space-x-6">
        <a
          href="https://x.com/_swapNFT"
          className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-xl leading-none"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (formerly Twitter)"
        >
          𝕏
        </a>
        <a
          href="https://github.com/denigen/NFTswap"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <Github className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
}
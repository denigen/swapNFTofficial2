import React from 'react';

interface EmptyNFTSelectionProps {
  onClick: () => void;
}

const EmptyNFTSelection: React.FC<EmptyNFTSelectionProps> = ({ onClick }) => {
  return (
    <button 
      className="w-full h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
      onClick={onClick}
    >
      <span className="text-gray-500 dark:text-gray-400">Select NFTs</span>
    </button>
  );
};

export default EmptyNFTSelection;
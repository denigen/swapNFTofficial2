import React from 'react';

interface NFTCardImageProps {
  src: string;
  alt: string;
}

export default function NFTCardImage({ src, alt }: NFTCardImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full aspect-square object-cover"
    />
  );
}
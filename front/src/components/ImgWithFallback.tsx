import React, { useState } from 'react';

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="#e8e0f0">' +
  '<rect width="200" height="200" fill="#f3f0f8" rx="12"/>' +
  '<text x="100" y="105" text-anchor="middle" fill="#c4b5d4" font-size="14" font-family="sans-serif">暂无图片</text>' +
  '</svg>'
);

export default function ImgWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [src, setSrc] = useState(props.src || PLACEHOLDER);
  return (
    <img
      {...props}
      src={src}
      onError={(e) => {
        if (src !== PLACEHOLDER) {
          setSrc(PLACEHOLDER);
          props.onError?.(e);
        }
      }}
    />
  );
}

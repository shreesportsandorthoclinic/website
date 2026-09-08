"use client";

import { useState, type CSSProperties } from "react";
import type { Photo as PhotoData } from "@/lib/content";

type Props = {
  photo: PhotoData;
  ratio: string;
  radius?: string;
  style?: CSSProperties;
  priority?: boolean;
};

/* Photographs are plain <img> rather than next/image: the clinic supplies
   already-optimised AVIF. Until a file is in place the figure falls back to a
   branded panel carrying the alt text, so a missing photograph reads as a
   pending asset rather than a broken page. */
export default function Photo({ photo, ratio, radius = "20px", style, priority }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="photo" style={{ aspectRatio: ratio, borderRadius: radius, ...style }}>
      {failed || !photo.src ? (
        <span className="photo-pending">
          <span>{photo.alt}</span>
        </span>
      ) : (
        <img
          src={photo.src}
          alt={photo.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </figure>
  );
}

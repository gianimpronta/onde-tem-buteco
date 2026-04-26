"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
};

export function ButecoDetailImage({ src, alt }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className="mb-6 aspect-[4/2.6] w-full rounded-[14px] bg-terracota-100" />;
  }

  return (
    <div className="relative mb-6 aspect-[4/2.6] w-full overflow-hidden rounded-[14px]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 672px) 100vw, 672px"
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

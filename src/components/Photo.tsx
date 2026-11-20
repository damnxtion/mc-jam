import { useState, type ImgHTMLAttributes } from "react";

/** Shown when a photo file is missing, e.g. in a fresh clone before you add your own photos. */
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 190"><rect width="200" height="190" fill="#F6EDE7"/><path d="M60 92 100 58l40 34" fill="none" stroke="#D0542C" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M72 90v42h56V90" fill="none" stroke="#D0542C" stroke-width="7" stroke-linejoin="round"/><rect x="93" y="108" width="14" height="24" fill="#D0542C"/></svg>`,
  );

export const photoUrl = (k: string) => `${import.meta.env.BASE_URL}img/${k}.jpg`;

export function Photo({ name, alt = "", ...rest }: { name: string } & Omit<ImgHTMLAttributes<HTMLImageElement>, "src">) {
  const [failed, setFailed] = useState(false);
  return <img {...rest} src={failed ? PLACEHOLDER : photoUrl(name)} alt={alt} onError={() => setFailed(true)} />;
}

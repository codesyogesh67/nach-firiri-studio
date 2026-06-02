import { useState } from "react";
import { Play } from "lucide-react";

export function YouTubeEmbed({
  id,
  title,
  cover,
}: {
  id: string;
  title?: string;
  cover?: string;
}) {
  const [play, setPlay] = useState(false);
  const thumb = cover ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  if (play) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
          title={title ?? "Video"}
          allow="accelerated-display; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlay(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl"
      aria-label={`Play ${title ?? "video"}`}
    >
      <img
        src={thumb}
        alt={title ?? "Video thumbnail"}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-transparent" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--gold-bright)] text-[var(--ink)] shadow-[var(--shadow-gold)] transition-transform duration-300 group-hover:scale-110">
        <Play className="ml-1 h-7 w-7 fill-current" />
      </span>
    </button>
  );
}

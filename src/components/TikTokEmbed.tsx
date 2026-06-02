import { useEffect } from "react";

export function TikTokEmbed({ url }: { url: string }) {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.tiktok.com/embed.js"]',
    );
    if (existing) {
      // @ts-expect-error tiktok global
      window.tiktokEmbed?.lib?.render?.();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://www.tiktok.com/embed.js";
    s.async = true;
    document.body.appendChild(s);
  }, [url]);

  return (
    <blockquote
      className="tiktok-embed mx-auto w-full"
      cite={url}
      data-embed-type="video"
      style={{ maxWidth: 605, minWidth: 280, margin: 0 }}
    >
      <section>
        <a href={url} target="_blank" rel="noreferrer">
          Watch on TikTok
        </a>
      </section>
    </blockquote>
  );
}

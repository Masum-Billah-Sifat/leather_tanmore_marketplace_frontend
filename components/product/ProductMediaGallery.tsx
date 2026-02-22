"use client";

export default function ProductMediaGallery({
  title,
  images,
  imgIdx,
  onSelectImage,
}: {
  title: string;
  images: string[];
  imgIdx: number;
  onSelectImage: (idx: number) => void;
}) {
  const heroSrc = images?.[imgIdx] ?? "";

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-black/10 bg-white overflow-hidden shadow-sm">
        <div className="relative aspect-[4/3] bg-black/5">
          {heroSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroSrc} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-[rgb(var(--muted))]">
              No image
            </div>
          )}
        </div>

        {images.length > 1 ? (
          <div className="border-t border-black/10 bg-[rgb(var(--surface))] p-4">
            <div className="no-scrollbar flex gap-3 overflow-x-auto">
              {images.map((src, i) => {
                const active = i === imgIdx;
                return (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => onSelectImage(i)}
                    className={[
                      "relative h-16 w-20 flex-none overflow-hidden rounded-2xl border transition",
                      active
                        ? "border-[rgb(var(--brand))]/40 ring-2 ring-[rgb(var(--brand))]/20"
                        : "border-black/10 hover:border-black/20",
                    ].join(" ")}
                    aria-label={`Select image ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${title} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

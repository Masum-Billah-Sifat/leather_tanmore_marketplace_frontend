"use client";

export type ProductTabKey = "description" | "delivery" | "reviews" | "video";

function TabBtn({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative px-1 pb-3 text-sm font-semibold transition",
        active
          ? "text-[rgb(var(--text))]"
          : "text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]",
      ].join(" ")}
    >
      {label}
      <span
        className={[
          "absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full transition",
          active ? "bg-[rgb(var(--brand-strong))]" : "bg-transparent",
        ].join(" ")}
      />
    </button>
  );
}

export default function ProductTabs({
  tab,
  onChangeTab,
  description,
  promoVideoUrl,
}: {
  tab: ProductTabKey;
  onChangeTab: (t: ProductTabKey) => void;
  description?: string | null;
  promoVideoUrl?: string | null;
}) {
  return (
    <div className="mt-8 rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 shadow-sm">
      <div className="border-b border-black/10">
        <div className="flex flex-wrap gap-6">
          <TabBtn active={tab === "description"} label="Description" onClick={() => onChangeTab("description")} />
          <TabBtn active={tab === "delivery"} label="Delivery" onClick={() => onChangeTab("delivery")} />
          <TabBtn active={tab === "reviews"} label="Reviews" onClick={() => onChangeTab("reviews")} />
          <TabBtn active={tab === "video"} label="Video" onClick={() => onChangeTab("video")} />
        </div>
      </div>

      <div className="pt-5">
        {tab === "description" ? (
          <div>
            <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
              About this product
            </div>
            {description ? (
              <p className="mt-3 text-sm leading-6 text-[rgb(var(--muted))]">{description}</p>
            ) : (
              <div className="mt-3 text-sm text-[rgb(var(--muted))]">No description provided.</div>
            )}
          </div>
        ) : null}

        {tab === "delivery" ? (
          <div className="space-y-3">
            <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
              Delivery & returns
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-[rgb(var(--muted))]">
              <ul className="list-disc pl-5 space-y-2">
                <li>Estimated delivery: 2–5 business days (inside Bangladesh).</li>
                <li>Cash on delivery may be available depending on area.</li>
                <li>Easy returns within 7 days if item is unused and in original condition.</li>
                <li>Quality checked before shipping.</li>
              </ul>
            </div>
          </div>
        ) : null}

        {tab === "reviews" ? (
          <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-[rgb(var(--muted))]">
            Reviews will be implemented soon.
          </div>
        ) : null}

        {tab === "video" ? (
          promoVideoUrl ? (
            <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-[rgb(var(--muted))]">
              Promo video is available for this product. We’ll implement video playback soon.
            </div>
          ) : (
            <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-[rgb(var(--muted))]">
              No promo video available for this product.
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

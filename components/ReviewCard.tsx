import { stars, type GoogleReview } from "@/lib/reviews";

/* One Google review, shown exactly as Google returned it. The author name and
   the link back to Google are required attribution — do not strip them.

   `clamp` caps the quote at that many lines, for grids where cards must stay
   the same height. Pass 0 (as /reviews does) to show the review in full —
   truncating a patient's words is only acceptable as a teaser that links
   somewhere they can be read whole. */
export default function ReviewCard({ review, clamp }: { review: GoogleReview; clamp?: number }) {
  const clamped = clamp !== 0;
  return (
    <figure
      style={{
        margin: 0,
        border: "1px solid var(--color-divider)",
        borderRadius: 20,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 18,
        background: "#fff",
        minHeight: 190,
      }}
    >
      <div>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 15,
            letterSpacing: "0.18em",
            color: "var(--color-accent-600)",
          }}
          aria-label={`${review.rating} out of 5`}
        >
          {stars(review.rating)}
        </p>
        <blockquote
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--color-neutral-800)",
            whiteSpace: "pre-line",
            ...(clamped
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: clamp ?? 6,
                  WebkitBoxOrient: "vertical" as const,
                  overflow: "hidden",
                }
              : null),
          }}
        >
          {review.text}
        </blockquote>
      </div>
      <figcaption
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          color: "var(--color-neutral-700)",
        }}
      >
        {review.photoUri && (
          <img
            src={review.photoUri}
            alt=""
            width={28}
            height={28}
            style={{ width: 28, height: 28, borderRadius: 999, objectFit: "cover", flex: "none" }}
            referrerPolicy="no-referrer"
          />
        )}
        <span>
          <span style={{ display: "block", color: "var(--color-text)" }}>{review.author}</span>
          <span style={{ display: "block", fontSize: 12 }}>
            {review.when}
            {review.when ? " · " : ""}
            <a
              href={review.uri ?? review.authorUri ?? "https://maps.google.com"}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--color-accent-700)" }}
            >
              Google
            </a>
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

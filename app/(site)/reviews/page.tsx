import type { Metadata } from "next";
import ReviewCard from "@/components/ReviewCard";
import { profiles } from "@/lib/content";
import { getGoogleReviews } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Reviews — Shree Sports & Ortho Clinic",
  description:
    "Verified patient reviews read live from the clinic's Google Business profile, with links to Practo and JustDial.",
};

const platforms = [
  { label: "View all on Google", href: profiles.googleMaps },
  { label: "View all on Practo", href: profiles.practo },
  { label: "View all on JustDial", href: profiles.justdial },
];

export default async function ReviewsPage() {
  const data = await getGoogleReviews();
  const reviews = data.configured ? data.reviews : [];

  return (
    <main className="pad" style={{ padding: "56px 48px 90px" }}>
      <p className="eyebrow" style={{ margin: "0 0 16px" }}>
        Reviews
      </p>
      <div
        className="two"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 56,
          alignItems: "end",
          maxWidth: 1400,
          marginBottom: 52,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(38px,5.4vw,74px)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            margin: 0,
          }}
        >
          What patients say.
        </h1>
        <div>
          {data.configured && data.rating !== null && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 12 }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 64,
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  color: "var(--color-accent-700)",
                  lineHeight: 1,
                }}
              >
                {data.rating.toFixed(1)}
              </span>
              <span style={{ fontSize: 15, color: "var(--color-neutral-700)", lineHeight: 1.4 }}>
                average rating on Google
                {data.total ? (
                  <>
                    <br />
                    from {data.total} review{data.total === 1 ? "" : "s"}
                  </>
                ) : null}
              </span>
            </div>
          )}
          <p
            style={{
              fontSize: 14,
              color: "var(--color-neutral-700)",
              margin: 0,
              maxWidth: "44ch",
            }}
          >
            These reviews were written by members of the public who came to the clinic. They are
            shown here in full, word for word as they were posted. Nothing on this page is written,
            edited, selected or paid for by the clinic.
          </p>
        </div>
      </div>

      {reviews.length > 0 ? (
        /* Every review Google returns, each shown in full (clamp={0}).
           Columns rather than a row-aligned grid so a long review does not
           stretch every card beside it. */
        <div
          style={{
            columnWidth: 340,
            columnGap: 20,
            maxWidth: 1400,
            marginBottom: 28,
          }}
        >
          {reviews.map((review) => (
            <div key={review.id} style={{ breakInside: "avoid", marginBottom: 20 }}>
              <ReviewCard review={review} clamp={0} />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            border: "1px solid var(--color-divider)",
            borderRadius: 20,
            padding: 32,
            maxWidth: 1400,
            marginBottom: 36,
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 18 }}>
            Reviews are read straight from Google.
          </p>
          <p style={{ margin: 0, fontSize: 15, color: "var(--color-neutral-700)", maxWidth: "60ch" }}>
            They aren&rsquo;t loading here at the moment. You can read them in full on the
            clinic&rsquo;s Google, Practo and JustDial profiles using the links below.
          </p>
        </div>
      )}

      {/* Google's Places API hands back at most five reviews per place — a hard
          platform limit with no paid tier around it. When the profile has more
          than that, say so plainly rather than letting the page imply these
          are all of them. */}
      {reviews.length > 0 && data.configured && data.total !== null && data.total > reviews.length && (
        <p
          style={{
            fontSize: 14,
            color: "var(--color-neutral-700)",
            margin: "0 0 24px",
            maxWidth: "62ch",
          }}
        >
          Google shares {reviews.length} review{reviews.length === 1 ? "" : "s"} at a time with
          outside websites, so {reviews.length} of the {data.total} are shown above. The rest are on
          the clinic&rsquo;s profiles.
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {platforms.map((platform) => (
          <a
            key={platform.label}
            className="btn btn-secondary"
            href={platform.href}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, padding: "14px 26px" }}
          >
            {platform.label}
          </a>
        ))}
      </div>
    </main>
  );
}

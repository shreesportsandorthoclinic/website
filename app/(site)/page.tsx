import Link from "next/link";
import Photo from "@/components/Photo";
import ReviewCard from "@/components/ReviewCard";
import {
  approach,
  clinic,
  complaints,
  conditionList,
  getDoctorFactsHome,
  photos,
  profiles,
  sportsList,
  treatmentHomeKeys,
  treatments,
  workTopics,
} from "@/lib/content";
import { listArticles } from "@/lib/library";
import { getGoogleReviews } from "@/lib/reviews";

const check = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--color-accent)"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 12.5 9.5 18 20 6.5" />
  </svg>
);

const visitRows = [
  { term: "Phone", value: clinic.phone, tbc: false, href: `tel:${clinic.phone}` },
  { term: "WhatsApp", value: clinic.whatsapp, tbc: false, href: `https://wa.me/91${clinic.whatsapp}` },
  { term: "Email", value: clinic.email, tbc: false, href: `mailto:${clinic.email}` },
  { term: "CLINIC", value: clinic.hours.clinic, tbc: false, href: undefined },
  { term: clinic.hours.manipalLabel, value: clinic.hours.manipal, tbc: false, href: undefined },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latestArticles = (await listArticles()).slice(0, 3);
  const reviewData = await getGoogleReviews();
  /* Only the strongest, most recent few fit the home page; /reviews shows all
     five Google returns. */
  const homeReviews = reviewData.configured ? reviewData.reviews.slice(0, 3) : [];
  const doctorFactsHome = getDoctorFactsHome();

  return (
    <main>
      {/* hero */}
      <section
        className="pad"
        style={{ padding: "56px 48px 64px", position: "relative", overflow: "hidden" }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -140,
            left: "34%",
            width: 820,
            height: 640,
            pointerEvents: "none",
            background:
              "radial-gradient(closest-side,rgba(46,135,120,0.16),rgba(46,135,120,0) 70%),radial-gradient(closest-side at 70% 40%,rgba(233,154,125,0.20),rgba(233,154,125,0) 70%)",
            filter: "blur(6px)",
          }}
        />
        <div
          className="hero"
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "0.92fr 1.08fr",
            gap: 56,
            alignItems: "center",
            maxWidth: 1400,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(40px,4.9vw,68px)",
                lineHeight: 1.06,
                letterSpacing: "-0.04em",
                margin: "0 0 26px",
                maxWidth: "13ch",
              }}
            >
              Move better.
              <br />
              <span style={{ color: "var(--color-accent)" }}>Recover stronger.</span>
            </h1>
            <p
              style={{
                fontSize: 19,
                lineHeight: 1.6,
                maxWidth: "38ch",
                margin: "0 0 32px",
                color: "var(--color-neutral-700)",
              }}
            >
              Orthopaedic and sports injury care in Electronic City — built around getting you back
              to work, movement and sport.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 36 }}>
              <Link className="btn btn-primary" href="/book" style={{ padding: "17px 34px" }}>
                Book appointment
              </Link>
              <Link className="btn btn-secondary" href="/conditions" style={{ padding: "17px 30px" }}>
                Explore conditions
              </Link>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}
            >
              <span className="chip">{check}Consultation, surgery &amp; rehab in one place</span>
              <span className="chip" style={{ marginLeft: 34 }}>
                {check}Open seven days, mornings &amp; evenings
              </span>
              <span className="chip" style={{ marginLeft: 68 }}>
                {check}Electronic City Phase-1, Bengaluru
              </span>
            </div>
          </div>

          <div>
            <div
              className="mosaic"
              style={{
                display: "grid",
                gridTemplateColumns: "0.8fr 1fr 1.25fr",
                gap: 14,
                alignItems: "end",
              }}
            >
              <Photo photo={photos.waiting1} ratio="3/4" radius="24px 24px 24px 60px" priority />
              <Photo photo={photos.consultRoom} ratio="3/4" radius="24px" priority />
              <Photo photo={photos.consultDesk} ratio="1/1" radius="24px 60px 24px 24px" priority />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                marginTop: 26,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  color: "var(--color-neutral-700)",
                  fontStyle: "italic",
                  maxWidth: "30ch",
                }}
              >
                — so you spend less time in pain and more time doing what you actually want to do.
              </p>
              <Link className="btn btn-primary" href="/book" style={{ padding: "17px 40px" }}>
                Find an appointment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* what are you dealing with */}
      <section className="pad" style={{ padding: "56px 48px 20px" }}>
        <div className="split" style={{ marginBottom: 38 }}>
          <h2 style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-0.025em", margin: 0 }}>
            What are you dealing with?
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "var(--color-neutral-700)",
              maxWidth: "34ch",
            }}
          >
            Start with what you feel. Each route leads to plain-language information and, if you
            want it, an appointment.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            maxWidth: 1400,
            borderTop: "1px solid var(--color-divider)",
          }}
        >
          {complaints.map((c) => (
            <Link
              key={c.key}
              href={`/conditions/${c.key}`}
              className="link-card hover-slide"
              style={{
                padding: "26px 28px 30px 0",
                borderBottom: "1px solid var(--color-divider)",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: "var(--color-accent-700)",
                  marginBottom: 12,
                }}
              >
                {c.num}
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-heading)",
                  fontSize: 25,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                {c.title}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 15,
                  color: "var(--color-neutral-700)",
                  maxWidth: "30ch",
                  lineHeight: 1.5,
                }}
              >
                {c.blurb}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* approach */}
      <section className="pad" style={{ padding: "80px 48px 60px" }}>
        <p className="eyebrow">The clinic approach</p>
        <h2
          style={{
            fontSize: "clamp(30px,3.6vw,46px)",
            letterSpacing: "-0.025em",
            margin: "0 0 48px",
            maxWidth: "20ch",
          }}
        >
          Rebuild. Recover. Return stronger.
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
            gap: 40,
            maxWidth: 1400,
          }}
        >
          {approach.map((a) => (
            <div key={a.num}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  background: "var(--color-accent-100)",
                  color: "var(--color-accent-700)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 18,
                  marginBottom: 20,
                }}
              >
                {a.num}
              </span>
              <h3 style={{ fontSize: 20, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
                {a.title}
              </h3>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--color-neutral-800)",
                  margin: 0,
                  maxWidth: "28ch",
                  lineHeight: 1.55,
                }}
              >
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* meet the doctor */}
      <section
        className="pad"
        style={{ padding: "60px 48px", background: "var(--color-neutral-100)" }}
      >
        <div
          className="two"
          style={{
            display: "grid",
            gridTemplateColumns: "0.9fr 1.1fr",
            gap: 56,
            alignItems: "center",
            maxWidth: 1400,
            margin: "0 auto",
          }}
        >
          <Photo
            photo={photos.doctor}
            ratio="4/5"
          />
          <div>
            <p className="eyebrow">Meet the doctor</p>
            <h2
              style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-0.025em", margin: "0 0 8px" }}
            >
              {clinic.doctor.name}
            </h2>
            <p style={{ fontSize: 16, color: "var(--color-neutral-700)", margin: "0 0 30px" }}>
              {clinic.doctor.fullName} · {clinic.doctor.title}
            </p>
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                gap: "22px 32px",
                margin: "0 0 32px",
              }}
            >
              {doctorFactsHome.map((fact) => (
                <div key={fact.term}>
                  <dt
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--color-neutral-700)",
                      marginBottom: 6,
                    }}
                  >
                    {fact.term}
                  </dt>
                  <dd
                    style={{
                      margin: 0,
                      fontSize: 16,
                      display: "inline-block",
                      color: fact.tbc ? "var(--color-accent-2-700)" : undefined,
                      borderBottom: fact.tbc ? "1px dotted var(--color-accent-2-400)" : undefined,
                    }}
                  >
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
            <Link className="btn btn-secondary" href="/about" style={{ fontSize: 12, padding: "14px 26px" }}>
              View full profile
            </Link>
          </div>
        </div>
      </section>

      {/* conditions */}
      <section className="pad" style={{ padding: "80px 48px 40px" }}>
        <div className="split" style={{ marginBottom: 34 }}>
          <h2 style={{ fontSize: "clamp(30px,3.6vw,46px)", letterSpacing: "-0.025em", margin: 0 }}>
            Conditions
          </h2>
          <Link href="/conditions" style={{ fontSize: 14 }}>
            All conditions →
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 12,
            maxWidth: 1400,
          }}
        >
          {conditionList.map((c) => (
            <Link
              key={c.name}
              href={`/conditions/${c.key}`}
              className="link-card"
              style={{
                background: "var(--color-neutral-100)",
                border: "1px solid var(--color-divider)",
                borderRadius: 18,
                padding: "20px 22px",
                fontSize: 18,
                letterSpacing: "-0.02em",
              }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* treatments */}
      <section className="pad" style={{ padding: "60px 48px 40px" }}>
        <div className="split" style={{ marginBottom: 34 }}>
          <h2 style={{ fontSize: "clamp(30px,3.6vw,46px)", letterSpacing: "-0.025em", margin: 0 }}>
            Treatments
          </h2>
          <Link href="/treatments" style={{ fontSize: 14 }}>
            All treatments →
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: 34,
            maxWidth: 1400,
          }}
        >
          {treatmentHomeKeys.map((key) => {
            const t = treatments[key];
            return (
              <Link
                key={key}
                href={`/treatments/${key}`}
                className="link-card"
                style={{
                  padding: 24,
                  background: "var(--color-neutral-100)",
                  border: "1px solid var(--color-divider)",
                  borderRadius: 22,
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-heading)",
                    fontSize: 22,
                    letterSpacing: "-0.015em",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  {t.name}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 15,
                    color: "var(--color-neutral-700)",
                    lineHeight: 1.55,
                    maxWidth: "34ch",
                  }}
                >
                  {t.blurb}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* sports medicine */}
      <section
        className="pad"
        style={{
          padding: "70px 48px",
          marginTop: 40,
          background: "var(--color-accent-800)",
          color: "#ffffff",
        }}
      >
        <div
          className="two"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            maxWidth: 1400,
            margin: "0 auto",
            alignItems: "center",
          }}
        >
          <div>
            <p className="eyebrow" style={{ color: "var(--color-accent-300)", margin: "0 0 16px" }}>
              Sports medicine
            </p>
            <h2
              style={{
                fontSize: "clamp(34px,4.4vw,58px)",
                letterSpacing: "-0.03em",
                margin: "0 0 20px",
                lineHeight: 1,
                color: "var(--color-neutral-100)",
              }}
            >
              Get back to what you love.
            </h2>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.55,
                maxWidth: "38ch",
                color: "var(--color-accent-100)",
                margin: "0 0 30px",
              }}
            >
              Assessment, treatment and a return-to-activity plan for gym, running and field sport
              injuries — built around the sport you actually play.
            </p>
            <Link
              className="btn"
              href="/sports"
              style={{
                border: "1px solid var(--color-neutral-600)",
                color: "var(--color-neutral-100)",
                fontSize: 12,
                padding: "14px 26px",
              }}
            >
              Sports medicine
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
              gap: 1,
              background: "rgba(255,255,255,0.18)",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {sportsList.map((s) => (
              <div
                key={s.name}
                style={{
                  background: "var(--color-accent-800)",
                  padding: "20px 16px",
                  fontSize: 16,
                  letterSpacing: "-0.01em",
                }}
              >
                {s.name}
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "var(--color-accent-200)",
                    marginTop: 4,
                  }}
                >
                  {s.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* work & everyday life */}
      <section className="pad" style={{ padding: "80px 48px 60px" }}>
        <div
          className="two"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 56,
            maxWidth: 1400,
            alignItems: "start",
          }}
        >
          <div>
            <p className="eyebrow">Work &amp; everyday life</p>
            <h2
              style={{
                fontSize: "clamp(32px,4vw,52px)",
                letterSpacing: "-0.025em",
                margin: "0 0 22px",
                maxWidth: "18ch",
              }}
            >
              Your body has to deal with your workday too.
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "var(--color-neutral-800)",
                maxWidth: "44ch",
                lineHeight: 1.55,
                margin: "0 0 28px",
              }}
            >
              Long commutes on Hosur Road, nine hours at a laptop, a chair that was never set up for
              you. Most of the neck, back and wrist pain we see in Electronic City starts here.
            </p>
            <Link className="btn btn-secondary" href="/work" style={{ fontSize: 12, padding: "14px 26px" }}>
              Read more
            </Link>
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              borderTop: "1px solid var(--color-divider)",
            }}
          >
            {workTopics.map((w) => (
              <li
                key={w.name}
                style={{
                  padding: "15px 0",
                  borderBottom: "1px solid var(--color-divider)",
                  fontSize: 17,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <span>{w.name}</span>
                <span style={{ color: "var(--color-neutral-600)", fontSize: 14 }}>{w.tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* health library */}
      <section className="pad" style={{ padding: "60px 48px" }}>
        <div className="split" style={{ marginBottom: 34 }}>
          <h2 style={{ fontSize: "clamp(30px,3.6vw,46px)", letterSpacing: "-0.025em", margin: 0 }}>
            Health library
          </h2>
          <Link href="/library" style={{ fontSize: 14 }}>
            All articles →
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 36,
            maxWidth: 1400,
          }}
        >
          {latestArticles.map((a) => {
            return (
              <Link key={a.key} href={`/library?a=${a.key}`} className="link-card title-link">
                <Photo photo={a.image} ratio="16/10" style={{ marginBottom: 16 }} />
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-accent-700)",
                    marginBottom: 8,
                  }}
                >
                  {a.category} · {a.read}
                </span>
                <span
                  className="title-link-t"
                  style={{
                    display: "block",
                    fontFamily: "var(--font-heading)",
                    fontSize: 22,
                    letterSpacing: "-0.015em",
                    lineHeight: 1.2,
                    fontWeight: 600,
                  }}
                >
                  {a.title}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* reviews */}
      <section className="pad" style={{ padding: "60px 48px" }}>
        <div
          className="two"
          style={{
            display: "grid",
            gridTemplateColumns: "0.8fr 1.2fr",
            gap: 56,
            maxWidth: 1400,
            alignItems: "start",
          }}
        >
          <div>
            <p className="eyebrow">Reviews</p>
            <h2
              style={{ fontSize: "clamp(30px,3.6vw,44px)", letterSpacing: "-0.025em", margin: "0 0 18px" }}
            >
              What patients say
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--color-neutral-700)",
                maxWidth: "32ch",
                margin: "0 0 22px",
              }}
            >
              Written by members of the public on Google, and shown here as posted. Nothing here is
              written, edited or selected by the clinic.
            </p>
            {reviewData.configured && reviewData.rating !== null && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 24 }}>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 44,
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    color: "var(--color-accent-700)",
                  }}
                >
                  {reviewData.rating.toFixed(1)}
                </span>
                <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
                  average on Google
                  {reviewData.total ? (
                    <>
                      <br />
                      from {reviewData.total} review{reviewData.total === 1 ? "" : "s"}
                    </>
                  ) : null}
                </span>
              </div>
            )}
            <Link className="btn btn-secondary" href="/reviews" style={{ fontSize: 12, padding: "14px 26px" }}>
              View all reviews
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
              gap: 20,
            }}
          >
            {homeReviews.length > 0 ? (
              homeReviews.map((review) => (
                <ReviewCard key={review.id} review={review} clamp={5} />
              ))
            ) : (
              <div
                style={{
                  border: "1px solid var(--color-divider)",
                  padding: 24,
                  borderRadius: 20,
                  minHeight: 170,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 14,
                  gridColumn: "1 / -1",
                }}
              >
                <p style={{ margin: 0, fontSize: 16, color: "var(--color-neutral-800)" }}>
                  Reviews are read straight from Google.
                </p>
                <a
                  className="btn btn-secondary"
                  href={profiles.googleMaps}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12, padding: "13px 22px", alignSelf: "flex-start" }}
                >
                  Read them on Google
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* visit the clinic */}
      <section className="pad" style={{ padding: "70px 48px 90px" }}>
        <h2
          style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-0.025em", margin: "0 0 36px" }}
        >
          Visit the clinic
        </h2>
        <div
          className="two"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: 48,
            maxWidth: 1400,
            alignItems: "start",
          }}
        >
          <div>
            <address
              style={{ fontStyle: "normal", fontSize: 19, lineHeight: 1.6, marginBottom: 26 }}
            >
              {clinic.name}
              {clinic.addressLines.map((line) => (
                <span key={line}>
                  <br />
                  {line}
                </span>
              ))}
            </address>
            <dl style={{ margin: "0 0 28px", display: "grid", gap: 14 }}>
              {visitRows.map((row) => (
                <div
                  key={row.term}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 20,
                    borderBottom: "1px solid var(--color-divider)",
                    paddingBottom: 10,
                  }}
                >
                  <dt
                    style={{
                      fontSize: 13,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-neutral-700)",
                    }}
                  >
                    {row.term}
                  </dt>
                  <dd style={{ margin: 0, textAlign: "right" }}>
                    {row.href ? (
                      <a href={row.href} style={{ color: "var(--color-accent-700)" }}>
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Link className="btn btn-primary" href="/contact" style={{ padding: "13px 20px" }}>
                Get directions
              </Link>
              <a className="btn btn-secondary" href={`tel:${clinic.phone}`} style={{ padding: "13px 20px" }}>
                Call clinic
              </a>
              <a
                className="btn btn-secondary"
                href={`https://wa.me/91${clinic.whatsapp}`}
                style={{ padding: "13px 20px" }}
              >
                WhatsApp
              </a>
            </div>
          </div>
          <div>
            <Photo photo={photos.waiting1} ratio="16/10" style={{ marginBottom: 14 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Photo photo={photos.reception} ratio="4/3" />
              <Photo photo={photos.imagingRoom} ratio="4/3" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

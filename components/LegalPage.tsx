export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
};

/* Shared renderer for the policy pages so /privacy, /terms, /cookies and
   /refund-policy stay visually consistent with the rest of the site and
   with each other, and so a wording fix only has to be made in one place. */
export default function LegalPage({ eyebrow, title, intro, sections }: Props) {
  return (
    <main className="pad" style={{ padding: "56px 48px 100px" }}>
      <p className="eyebrow" style={{ margin: "0 0 16px" }}>
        {eyebrow}
      </p>
      <h1
        style={{
          fontSize: "clamp(34px,4.6vw,58px)",
          letterSpacing: "-0.03em",
          lineHeight: 1.02,
          margin: "0 0 20px",
          maxWidth: "22ch",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 18,
          color: "var(--color-neutral-800)",
          lineHeight: 1.6,
          maxWidth: "70ch",
          margin: "0 0 48px",
        }}
      >
        {intro}
      </p>

      <div style={{ maxWidth: "72ch", display: "grid", gap: 40 }}>
        {sections.map((section) => (
          <section key={section.heading}>
            <h2
              style={{
                fontSize: 21,
                letterSpacing: "-0.015em",
                margin: "0 0 12px",
              }}
            >
              {section.heading}
            </h2>
            {section.paragraphs?.map((p, i) => (
              <p
                key={i}
                style={{
                  fontSize: 16,
                  lineHeight: 1.65,
                  color: "var(--color-neutral-800)",
                  margin: "0 0 12px",
                }}
              >
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="dotlist" style={{ marginTop: 8 }}>
                {section.bullets.map((b) => (
                  <li key={b} style={{ fontSize: 16 }}>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

    </main>
  );
}

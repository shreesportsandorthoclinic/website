import { clinic, profiles } from "@/lib/content";

/* The map loads with the page. Google's embed may set cookies on the
   visitor's device, so /cookies discloses it as a third-party embed — keep
   the two in step if this ever goes back behind a click. "Open in Google
   Maps" stays offered as the route that leaves this site entirely. */

const query = encodeURIComponent(`${clinic.name}, ${clinic.addressLines.join(", ")}`);
const EMBED_SRC = `https://www.google.com/maps?q=${query}&output=embed`;

export default function MapEmbed() {
  return (
    <div style={{ marginBottom: 16 }}>
      <iframe
        src={EMBED_SRC}
        title={`Map showing ${clinic.name}, ${clinic.addressLines.join(", ")}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{
          display: "block",
          width: "100%",
          aspectRatio: "16/11",
          border: 0,
          borderRadius: 20,
          background: "var(--color-neutral-100)",
        }}
      />
      <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--color-neutral-600)" }}>
        Map provided by Google, which may set cookies on your device.{" "}
        <a
          href={profiles.googleMaps}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--color-accent-700)" }}
        >
          Open in Google Maps
        </a>
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { legal } from "@/lib/content";

export const metadata: Metadata = {
  title: "Cookie Policy — Shree Sports & Ortho Clinic",
  description: "What cookies and similar storage this site uses, and why.",
};

export default function CookiePolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cookie policy."
      intro={`Effective ${legal.effectiveDate}. This page lists everything this website currently stores in your browser. It is short because the site currently uses no advertising or analytics cookies.`}
      sections={[
        {
          heading: "Current state: no tracking cookies",
          paragraphs: [
            "As published, this site sets no analytics or advertising cookies, and does no tracking of its own. Fonts are self-hosted at build time rather than fetched from Google's servers at runtime, so no font-related request or cookie is sent to a third party either.",
            "The one third-party embed is the Google map on the Contact page, described below. Apart from that, nothing on this site profiles you, follows you between sites, or is shared with an advertiser — so a plain notice is shown rather than a consent banner, linking here.",
          ],
        },
        {
          heading: "The map on the Contact page",
          paragraphs: [
            "The Contact page shows an interactive Google map so you can find the clinic without an extra step. It is embedded from Google, and it loads with the page. Google may therefore set cookies on your device and will receive your IP address, as described in Google's own privacy policy. This is the only third-party embed on the site, and it is labelled as such directly beneath the map.",
            "The map is not used to track you or to build a profile, and the clinic receives nothing from it. If you would rather not load it, the same page offers a plain link that opens the clinic's listing in the Google Maps website or app instead, and browser settings or extensions that block third-party frames will stop it loading without affecting the rest of the page.",
          ],
        },
        {
          heading: "Strictly necessary storage",
          paragraphs: [
            "The site may use your browser's local storage (not a cookie) for small, non-tracking conveniences — for example, remembering that you dismissed the cookie notice. This stays on your device and is never sent to a server or shared with anyone.",
          ],
        },
        {
          heading: "If this changes",
          paragraphs: [
            "If the clinic later adds features that do set cookies — analytics to understand site usage, or online payment — this policy and the consent banner will be updated first, and a consent mechanism will be added before any non-essential cookie is set. Likely future additions and what they would involve:",
          ],
          bullets: [
            "Website analytics (e.g. to see which pages are useful) — would require opt-in consent before loading.",
            "Payment gateway for consultation fees — would set cookies required to process payment securely.",
          ],
        },
        {
          heading: "Managing cookies in your browser",
          paragraphs: [
            "Even though this site does not currently set tracking cookies, you can always view, block or delete cookies for any site through your browser's settings.",
          ],
        },
      ]}
    />
  );
}

import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { clinic, legal } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy — Shree Sports & Ortho Clinic",
  description: "How Shree Sports & Ortho Clinic collects, uses and protects personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy."
      intro={`Effective ${legal.effectiveDate}. This policy explains what personal data ${clinic.name} collects through this website and the booking system, why, and what rights you have over it.`}
      sections={[
        {
          heading: "Who this policy covers",
          paragraphs: [
            `This policy applies to visitors to this website and to patients who submit an appointment request through it. It is issued by ${legal.legalEntityName}, operating as ${clinic.name}, at ${clinic.addressLines.join(", ")}.`,
          ],
        },
        {
          heading: "What we collect",
          paragraphs: [
            "We only ask for what is needed to hold and confirm an appointment. Through the booking form this is:",
          ],
          bullets: [
            "Full name (required)",
            "Phone number (required, used to confirm and remind you of the appointment)",
            "Email address (required, verified by a one-time code, used to confirm the appointment and prevent automated bookings)",
            "Age (optional)",
            "A short reason for visit, in your own words (optional)",
          ],
        },
        {
          heading: "Health information is sensitive personal data",
          paragraphs: [
            "Anything you tell us about your condition — including the reason for your visit, and anything discussed during a consultation — is health data. Under India's Digital Personal Data Protection Act, 2023 and applicable medical-record rules, this is handled with additional care: it is used only to provide your care, is not sold, and is not used for marketing without your separate, explicit consent.",
          ],
        },
        {
          heading: "How we use it",
          bullets: [
            "To hold your requested appointment slot and contact you to confirm, reschedule or cancel it",
            "To prepare for your consultation",
            "To maintain the clinical and administrative records the clinic is required to keep",
          ],
        },
        {
          heading: "What we do not do",
          bullets: [
            "We do not sell or rent patient data to third parties",
            "We do not use analytics or advertising trackers on this site at present (see the Cookie Policy)",
            "We do not publish anything you submit through the booking form publicly",
          ],
        },
        {
          heading: "Who we share it with",
          paragraphs: [
            "Payment is taken directly at the clinic, not through this website, so no online payment processor sees your details.",
          ],
        },
        {
          heading: "How long we keep it",
          paragraphs: [
            `Appointment and clinical records are retained for ${legal.dataRetentionPeriod}. Records are kept only as long as required for patient care, legal compliance, or a legitimate administrative purpose.`,
          ],
        },
        {
          heading: "Your rights",
          paragraphs: [
            `You can ask to see the personal data we hold about you, ask us to correct it, or raise a concern about how it has been handled. To do this, contact the clinic at ${clinic.email} or ${clinic.phone}.`,
          ],
        },
        {
          heading: "Security",
          paragraphs: [
            "Appointment requests are transmitted and stored using reasonable technical safeguards. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
          ],
        },
        {
          heading: "Changes to this policy",
          paragraphs: [
            "We may update this policy as the clinic's systems change. The effective date above will be updated when we do.",
          ],
        },
      ]}
    />
  );
}

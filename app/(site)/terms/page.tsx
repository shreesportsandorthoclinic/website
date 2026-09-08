import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { clinic, legal } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms & Conditions — Shree Sports & Ortho Clinic",
  description: "Terms of use for the Shree Sports & Ortho Clinic website and booking system.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & conditions."
      intro={`Effective ${legal.effectiveDate}. These terms govern use of this website and the appointment-request system operated by ${legal.legalEntityName}, trading as ${clinic.name}.`}
      sections={[
        {
          heading: "This site is informational, not a diagnosis",
          paragraphs: [
            "Content on this website — including the health library, condition and treatment pages — is general information about orthopaedic and sports-injury care. It is not a diagnosis, a treatment plan, or a substitute for an in-person consultation. Do not rely on it to make a decision about your own care; talk to Dr. Neel or another qualified clinician instead.",
          ],
        },
        {
          heading: "Emergencies",
          paragraphs: [
            "This website is not monitored for emergencies. If you have a medical emergency, call your local emergency number or go to the nearest emergency department immediately — do not use this site or the booking form.",
          ],
        },
        {
          heading: "Booking requests, not confirmed appointments",
          paragraphs: [
            "Submitting the booking form sends an appointment request; it is not itself a guaranteed booking. A slot is confirmed only when the clinic confirms it. The clinic may contact you to change, decline or reschedule a request, including where a slot was taken by someone else in the meantime. Booked appointments are given priority over walk-ins; arriving more than 5 minutes after your slot may mean the next patient is seen first and your appointment is marked as a no-show.",
          ],
        },
        {
          heading: "Accuracy of information you provide",
          paragraphs: [
            "You agree to provide accurate contact details and a truthful reason for visit. Incorrect contact details may mean we cannot confirm or remind you of your appointment.",
          ],
        },
        {
          heading: "Payment",
          paragraphs: [
            "This website does not process payment. Consultation and procedure fees are payable directly at the clinic.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            `The text, layout and design of this site belong to ${clinic.name} unless stated otherwise. Photographs are used under the terms described in the site's image-rights records; see the note on that below. Do not reproduce content from this site without permission.`,
          ],
        },
        {
          heading: "No warranty",
          paragraphs: [
            "This website is provided as-is. While we try to keep it accurate and available, we do not guarantee it will be error-free, uninterrupted, or that outcomes described (such as recovery timelines) will apply to any individual case — outcomes depend on diagnosis and vary by patient.",
          ],
        },
        {
          heading: "Governing law",
          paragraphs: [
            "These terms are governed by the laws of India, and disputes are subject to the jurisdiction of the courts in Bengaluru, Karnataka.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [`For questions about these terms, contact ${clinic.email}.`],
        },
      ]}
    />
  );
}

import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { appointmentPolicy, clinic, legal } from "@/lib/content";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — Shree Sports & Ortho Clinic",
  description: "How appointment cancellations, no-shows and fee refunds are handled.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund & cancellation policy."
      intro={`Effective ${legal.effectiveDate}. This page covers cancelling an appointment and how payment works, since this site does not process any payment itself.`}
      sections={[
        {
          heading: "Cancelling or rescheduling an appointment",
          paragraphs: [
            "You can cancel or reschedule a booked appointment from the confirmation screen shown after booking, or by calling the clinic. There is no cancellation fee, because no fee is ever collected in advance through this website.",
          ],
        },
        {
          heading: "Payment is taken at the clinic, not online",
          paragraphs: [
            "This website does not take payment of any kind. Consultation and procedure fees are paid directly at the clinic, at the time of your visit, in whatever way the clinic normally accepts payment. Because no fee is ever paid through this site in advance, there is nothing here to refund online — any billing question is handled directly with the clinic at the time of payment.",
          ],
        },
        {
          heading: "Arriving late and no-shows",
          paragraphs: [
            appointmentPolicy.note,
            `A standard consultation is scheduled for around ${appointmentPolicy.consultationMinutes} minutes. If you know you will be late, call the clinic — arriving within the ${appointmentPolicy.graceMinutes}-minute grace period still holds your place, but after that the next patient may be seen ahead of you.`,
          ],
        },
        {
          heading: "Questions",
          paragraphs: [`Contact the clinic at ${clinic.phone} or ${clinic.email} with your appointment reference.`],
        },
      ]}
    />
  );
}

import type { Metadata } from "next";
import { DM_Sans, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Shree Sports & Ortho Clinic — Orthopaedic & Sports Injury Care, Electronic City, Bengaluru",
  description:
    "Orthopaedic and sports injury care in Electronic City Phase-1, Bengaluru. Consultation, joint replacement surgery, ACL and PCL reconstruction, rehabilitation.",
  icons: {
    icon: "/images/logo.jpeg",
    apple: "/images/logo.jpeg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}

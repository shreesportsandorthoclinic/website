import CookieNotice from "@/components/CookieNotice";
import MobileActionBar from "@/components/MobileActionBar";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        paddingBottom: 90,
      }}
    >
      <SiteHeader />
      {children}
      <SiteFooter />
      <MobileActionBar />
      <CookieNotice />
    </div>
  );
}

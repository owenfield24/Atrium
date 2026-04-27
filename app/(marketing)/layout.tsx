import MarketingNav from "@/components/marketing/Nav";
import MarketingFooter from "@/components/marketing/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}

import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-soft">
      <Sidebar />
      <main className="md:pl-28 lg:pl-32 px-6 md:px-12 lg:px-16">{children}</main>
    </div>
  );
}

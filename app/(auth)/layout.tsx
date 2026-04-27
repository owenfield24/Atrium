import Link from "next/link";
import AtriumLogo from "@/components/AtriumLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-soft flex flex-col">
      <header className="px-6 md:px-10 py-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <AtriumLogo />
        </Link>
      </header>
      <main className="flex-1 flex items-start justify-center px-6 md:px-10 pb-20 pt-4">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}

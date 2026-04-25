import Header from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <div className="pb-20 md:pb-0">{children}</div>
      <BottomNav />
    </>
  );
}

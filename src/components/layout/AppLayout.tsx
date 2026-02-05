import { ReactNode } from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";
import Footer from "./Footer";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showNav?: boolean;
  showFooter?: boolean;
}

const AppLayout = ({
  children,
  title,
  showHeader = true,
  showNav = true,
  showFooter = true,
}: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && <Header title={title} />}
      <main className="flex-1 pb-24 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4">
          {children}
        </div>
        {showFooter && <Footer />}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;

import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="studio-layout flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  );
}

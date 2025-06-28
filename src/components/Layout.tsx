import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps): JSX.Element => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground w-full max-w-full overflow-x-hidden transition-colors duration-300">
      {/* Desktop Sidebar - Hidden on mobile/tablet */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:w-60">
        <Sidebar />
      </div>

      {/* Mobile/Tablet Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile/Tablet Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] transform transition-transform duration-300 ease-in-out lg:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={closeMobileMenu} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full">
        {/* Header - Scrolls with content */}
        <Header onMenuToggle={toggleMobileMenu} />

        {/* Page Content - No special positioning needed */}
        <main className="flex-1 w-full max-w-full overflow-x-hidden bg-background">
          <div className="w-full max-w-full p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="w-full max-w-full mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
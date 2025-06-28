import {
  FaCalendarAlt,
  FaChevronRight,
  FaDumbbell,
  FaTachometerAlt,
  FaChartLine,
  FaSignOutAlt,
  FaBullseye,
  FaTimes,
  FaBell,
  FaCog,
} from "react-icons/fa";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface SidebarProps {
  onClose?: () => void;
}

// Navigation items data for mapping
const navigationItems = [
  {
    icon: <FaTachometerAlt className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
    label: "Overview",
    path: "/",
  },
  {
    icon: <FaDumbbell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
    label: "Workout",
    path: "/workout",
  },
  { 
    icon: <FaBullseye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />, 
    label: "Goals", 
    path: "/goals" 
  },
  {
    icon: <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
    label: "My Schedule",
    path: "/schedule",
  },
  {
    icon: <FaChartLine className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
    label: "Progress",
    path: "/progress",
    hasDropdown: true,
  },
];

// Mobile-only navigation items
const mobileOnlyItems = [
  {
    icon: <FaBell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
    label: "Notifications",
    path: "/notifications",
  },
  {
    icon: <FaCog className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
    label: "Settings",
    path: "/settings",
  },
];

export const Sidebar = ({ onClose }: SidebarProps): JSX.Element => {
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onClose?.();
  };

  const handleLinkClick = () => {
    onClose?.();
  };

  // Combine navigation items with mobile-only items for mobile view
  const allNavigationItems = onClose 
    ? [...navigationItems, ...mobileOnlyItems] 
    : navigationItems;

  return (
    <div className="flex flex-col w-full h-screen max-h-screen items-start gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6 bg-card border-r border-border shadow-[0px_5px_22px_4px_rgba(0,0,0,0.1),0px_12px_17px_2px_rgba(0,0,0,0.08)] overflow-y-auto transition-colors duration-300">
      {/* Mobile Close Button */}
      {onClose && (
        <div className="flex items-center justify-between w-full lg:hidden mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="font-extrabold text-orange-500 text-base sm:text-lg">
              Fitness Buddy
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-accent flex-shrink-0"
          >
            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
          </Button>
        </div>
      )}

      <div className="flex flex-col items-start relative flex-1 self-stretch w-full min-h-0">
        <div className="flex flex-col items-start gap-3 sm:gap-4 lg:gap-6 relative flex-1 self-stretch w-full min-h-0">
          {/* Logo and Brand - Hidden on mobile when onClose exists */}
          {!onClose && (
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-2.5 pt-2 pb-3 sm:pb-4 lg:pb-6 px-2 relative self-stretch w-full flex-[0_0_auto] bg-card border-b border-border">
              <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 relative self-stretch w-full flex-[0_0_auto]">
                <div className="relative w-fit font-extrabold text-orange-500 text-base sm:text-lg tracking-[0] leading-[22px] whitespace-nowrap">
                  Fitness Buddy
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex flex-col items-start gap-2 sm:gap-3 lg:gap-4 relative flex-1 self-stretch w-full overflow-y-auto">
            {allNavigationItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={index} 
                  to={item.path} 
                  className="w-full"
                  onClick={handleLinkClick}
                >
                  <Button
                    variant="ghost"
                    className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 flex items-center gap-2 sm:gap-3 lg:gap-4 relative self-stretch w-full justify-start h-auto text-sm sm:text-base transition-colors duration-300 ${
                      isActive
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-transparent text-foreground hover:bg-accent"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                    <span
                      className={`relative flex-1 font-semibold text-sm sm:text-base truncate ${isActive ? "text-white" : "text-foreground"}`}
                    >
                      {item.label}
                    </span>
                    {item.hasDropdown && (
                      <div className="flex-shrink-0">
                        <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6" />
                      </div>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Separator className="w-full" />

      {/* Logout Button */}
      <Button
        onClick={handleSignOut}
        variant="ghost"
        className="flex items-center gap-2 sm:gap-3 lg:gap-4 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 relative self-stretch w-full justify-start h-auto bg-transparent text-foreground hover:bg-accent text-sm sm:text-base transition-colors duration-300"
      >
        <div className="flex-shrink-0">
          <FaSignOutAlt className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </div>
        <span className="text-foreground relative flex-1 font-semibold text-sm sm:text-base truncate">
          Logout
        </span>
      </Button>
    </div>
  );
};
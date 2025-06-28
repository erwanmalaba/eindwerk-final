import { FaBell, FaCog, FaSignOutAlt, FaBars } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { getTimeBasedGreeting } from "../utils/timeGreeting";

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps): JSX.Element => {
  const { user, profile, signOut } = useAuth();
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());

  // Update greeting every minute to ensure it stays current
  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting());
    };

    // Update immediately
    updateGreeting();

    // Set up interval to update every minute
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="flex w-full items-center gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 bg-card border-b border-border flex-shrink-0 shadow-sm sticky top-0 z-30 transition-colors duration-300">
      {/* Mobile Menu Button - Only visible on mobile/tablet */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuToggle}
        className="lg:hidden p-2 hover:bg-accent flex-shrink-0"
      >
        <FaBars className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      </Button>

      <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
        <span className="text-muted-foreground text-[10px] sm:text-xs font-normal font-['Manrope',Helvetica]">
          {greeting}
        </span>
        <h1 className="text-foreground text-sm sm:text-base font-semibold font-['Manrope',Helvetica] truncate">
          Welcome Back{profile?.first_name ? `, ${profile.first_name}` : ''}!
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
        <Link to="/notifications" className="hidden sm:block">
          <FaBell className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
        </Link>
        <Link to="/settings" className="hidden sm:block">
          <FaCog className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
        </Link>
        <Link to="/profile">
          <Avatar className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 border border-border cursor-pointer hover:border-muted-foreground transition-colors flex-shrink-0">
            <AvatarImage 
              src={profile?.avatar_url || "..//avatar-w--photo.png"} 
              alt="User avatar" 
            />
          </Avatar>
        </Link>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground p-1 sm:p-2 flex-shrink-0"
        >
          <FaSignOutAlt className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </header>
  );
};
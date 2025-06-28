import { FaBell, FaSearch, FaCog } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage } from "../../../../components/ui/avatar";
import { Input } from "../../../../components/ui/input";
import { getTimeBasedGreeting } from "../../../../utils/timeGreeting";

export const FrameByAnima = (): JSX.Element => {
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

  return (
    <header className="flex w-full items-center gap-4 px-8 py-6 bg-white border-b border-slate-300 flex-shrink-0">
      <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
        <span className="text-slate-500 text-[10px] font-normal font-['Manrope',Helvetica]">
          {greeting}
        </span>
        <h1 className="text-slate-600 text-base font-semibold font-['Manrope',Helvetica]">
          Welcome Back!
        </h1>
      </div>

      <div className="flex items-center gap-2 p-2 flex-1 max-w-md bg-[#f8fafb] rounded-lg border border-slate-100">
        <FaSearch className="w-6 h-6 text-slate-500 flex-shrink-0" />
        <Input
          className="border-0 bg-transparent h-auto p-0 text-sm text-slate-500 font-['Manrope',Helvetica] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-500"
          type="text"
          placeholder="Search"
        />
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <FaBell className="w-6 h-6 text-slate-600 cursor-pointer hover:text-slate-800 transition-colors" />
        <FaCog className="w-6 h-6 text-slate-600 cursor-pointer hover:text-slate-800 transition-colors" />
        <Avatar className="w-10 h-10 border border-[#0000001a]">
          <AvatarImage src="..//avatar-w--photo.png" alt="User avatar" />
        </Avatar>
      </div>
    </header>
  );
};
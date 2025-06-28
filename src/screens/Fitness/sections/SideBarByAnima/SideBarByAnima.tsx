import {
  FaAppleAlt,
  FaCalendarAlt,
  FaChevronRight,
  FaDumbbell,
  FaQuestionCircle,
  FaTachometerAlt,
  FaChartLine,
  FaSignOutAlt,
  FaBullseye,
} from "react-icons/fa";
import React from "react";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";

// Navigation items data for mapping
const navigationItems = [
  {
    icon: <FaTachometerAlt className="w-6 h-6" />,
    label: "Overview",
    active: true,
  },
  {
    icon: <FaDumbbell className="w-6 h-6" />,
    label: "Workout",
    active: false,
  },
  {
    icon: <FaAppleAlt className="w-6 h-6" />,
    label: "Diet Plan",
    active: false,
  },
  { icon: <FaBullseye className="w-6 h-6" />, label: "Goals", active: false },
  {
    icon: <FaCalendarAlt className="w-6 h-6" />,
    label: "My Schedule",
    active: false,
  },
  {
    icon: <FaChartLine className="w-6 h-6" />,
    label: "Progress",
    active: false,
    hasDropdown: true,
  },
];

export const SideBarByAnima = (): JSX.Element => {
  return (
    <div className="flex flex-col w-60 h-full items-start gap-4 p-6 bg-white border-r border-slate-200 shadow-[0px_5px_22px_4px_#00000005,0px_12px_17px_2px_#00000008]">
      <div className="flex flex-col items-start relative flex-1 self-stretch w-full grow">
        <div className="flex flex-col items-start gap-6 relative flex-1 self-stretch w-full grow">
          {/* Logo and Brand */}
          <div className="flex flex-col items-center justify-center gap-2.5 pt-2 pb-6 px-2 relative self-stretch w-full flex-[0_0_auto] bg-monochromewhite border-b border-slate-300">
            <div className="flex items-center justify-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative w-fit font-extrabold text-orange-500 text-lg tracking-[0] leading-[22px] whitespace-nowrap">
                Fitness
              </div>
              <img
                className="relative w-8 h-8"
                alt="Workout bold"
                src="/workout-bold.svg"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col items-start gap-4 relative flex-1 self-stretch w-full grow">
            {navigationItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`px-4 py-3 flex items-center gap-4 relative self-stretch w-full justify-start h-auto ${
                  item.active
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.icon}
                <span
                  className={`relative flex-1 font-semibold text-sm ${item.active ? "text-white" : "text-slate-600"}`}
                >
                  {item.label}
                </span>
                {item.hasDropdown && <FaChevronRight className="w-6 h-6" />}
              </Button>
            ))}
            <div className="relative flex-1 w-full" />
          </div>
        </div>
      </div>

      <Separator className="w-full" />

      {/* Help Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-4 px-4 py-3 relative self-stretch w-full justify-start h-auto bg-white text-slate-600 hover:bg-slate-100"
      >
        <FaQuestionCircle className="w-6 h-6" />
        <span className="text-slate-600 relative flex-1 font-semibold text-sm">
          Help
        </span>
      </Button>

      {/* Logout Button */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-4 relative self-stretch w-full">
        <FaSignOutAlt className="relative w-6 h-6" />
        <div className="text-slate-600 relative flex-1 font-semibold text-sm">
          Logout
        </div>
      </div>
    </div>
  );
};
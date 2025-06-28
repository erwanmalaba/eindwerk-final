import { FaChevronRight } from "react-icons/fa";
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../../../components/ui/card";

export const DivWrapperByAnima = (): JSX.Element => {
  const scheduleItems = [
    {
      day: "Monday",
      activity: "Stretch",
      time: "At 08:00",
      metric: "20 Pieces",
      image: "/group-107-1.png",
      imageWidth: "43.11px",
    },
    {
      day: "Tuesday",
      activity: "Back Stretch",
      time: "At 08:00",
      metric: "10 Round",
      image: "/image-97.png",
      imageWidth: "32.59px",
    },
    {
      day: "Wednesday",
      activity: "Yoga",
      time: "At 08:00",
      metric: "20 min",
      image: "/image-98.png",
      imageWidth: "34.57px",
    },
  ] || []; // Fallback to empty array

  return (
    <div className="flex flex-col items-start gap-4 sm:gap-6 w-full">
      <div className="flex items-center justify-between gap-4 sm:gap-6 w-full">
        <h2 className="font-bold text-slate-600 text-lg sm:text-xl font-['Manrope',Helvetica]">
          My Schedule
        </h2>

        <Link to="/schedule" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
          <span className="font-medium text-orange-500 text-sm font-['Manrope',Helvetica]">
            View All
          </span>
          <FaChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500 ml-1" />
        </Link>
      </div>

      <div className="flex flex-col items-start gap-3 sm:gap-4 w-full">
        {Array.isArray(scheduleItems) && scheduleItems.length > 0 ? (
          scheduleItems.map((item, index) => (
            <Card
              key={index}
              className="w-full shadow-[0px_4px_22px_#9f9f9f26] rounded-lg"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col items-start gap-3 sm:gap-4 w-full">
                  <h3 className="font-medium text-slate-600 text-base sm:text-lg tracking-[-0.11px] leading-[18px] font-['Manrope',Helvetica]">
                    {item.day}
                  </h3>

                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 flex items-center justify-center">
                        <img
                          className="h-6 sm:h-8 max-w-[32px] sm:max-w-[43px] object-contain"
                          alt={item.activity}
                          src={item.image}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>

                      <div className="flex flex-col items-start gap-1 sm:gap-2 flex-1 min-w-0">
                        <div className="font-medium text-slate-800 text-sm tracking-[-0.08px] leading-[14px] font-['Manrope',Helvetica] truncate w-full">
                          {item.activity}
                        </div>

                        <div className="font-normal text-slate-600 text-xs tracking-[-0.07px] leading-3 font-['Manrope',Helvetica]">
                          {item.time}
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex items-start px-2 py-1 bg-orange-50 rounded-[30px] flex-shrink-0 ml-2">
                      <div className="font-medium text-orange-500 text-xs font-['Manrope',Helvetica] whitespace-nowrap">
                        {item.metric}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-6 sm:py-8 w-full">
            <p className="text-slate-500">No schedule items available</p>
          </div>
        )}
      </div>
    </div>
  );
};
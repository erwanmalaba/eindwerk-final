import { FaChevronRight } from "react-icons/fa";
import React from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { DivWrapperByAnima } from "./sections/DivWrapperByAnima";
import { FrameByAnima } from "./sections/FrameByAnima/FrameByAnima";
import { FrameWrapperByAnima } from "./sections/FrameWrapperByAnima/FrameWrapperByAnima";
import { SideBarByAnima } from "./sections/SideBarByAnima";

export const Fitness = (): JSX.Element => {
  // Data for goals cards
  const goals = [
    {
      title: "Running on Track",
      date: "Saturday, April 14 | 08:00 AM",
      badge: "04 Rounds",
    },
    {
      title: "Push Up",
      date: "Sunday, April 15 | 08:00 AM",
      badge: "50 Pieces",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <SideBarByAnima />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <FrameByAnima />

        {/* Content Grid */}
        <div className="flex-1 p-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content - Left Side (2/3 width on xl screens) */}
          <div className="xl:col-span-2">
            <FrameWrapperByAnima />
          </div>

          {/* Right Sidebar Content (1/3 width on xl screens) */}
          <div className="xl:col-span-1 space-y-8">
            {/* My Schedule Section */}
            <div className="w-full">
              <DivWrapperByAnima />
            </div>

            {/* Goals Section */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-600 text-xl font-['Manrope',Helvetica]">
                  Goals
                </h2>
                <div className="flex items-center cursor-pointer">
                  <span className="font-medium text-orange-500 text-sm font-['Manrope',Helvetica]">
                    View All
                  </span>
                  <FaChevronRight className="w-6 h-6 text-orange-500" />
                </div>
              </div>

              <div className="space-y-4">
                {goals.map((goal, index) => (
                  <Card
                    key={index}
                    className="w-full bg-white rounded-lg shadow-[0px_4px_22px_#9f9f9f26]"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-start gap-2 flex-1">
                          <div className="font-medium text-slate-800 text-sm tracking-[-0.08px] leading-[14px] font-['Manrope',Helvetica]">
                            {goal.title}
                          </div>
                          <div className="font-normal text-slate-600 text-xs tracking-[-0.07px] leading-3 font-['Manrope',Helvetica]">
                            {goal.date}
                          </div>
                        </div>
                        <Badge className="bg-orange-50 text-orange-500 px-2 py-1 rounded-[30px] font-medium text-xs font-['Manrope',Helvetica] flex-shrink-0">
                          {goal.badge}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Premium Membership Card */}
            <Card className="w-full h-48 rounded-lg overflow-hidden p-0 shadow-none">
              <CardContent className="p-0">
                <div className="relative w-full h-full">
                  <div className="flex flex-col w-full items-start gap-10 px-4 py-6 [background:linear-gradient(137deg,rgba(124,109,215,1)_0%,rgba(196,186,255,1)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                    <div className="flex flex-col w-full items-start gap-4 pr-16">
                      <div className="w-fit mt-[-1.00px] font-semibold text-white text-sm leading-5 whitespace-nowrap font-['Manrope',Helvetica]">
                        50% off on Premium Membership
                      </div>

                      <div className="font-normal text-white text-xs tracking-[0.10px] leading-4 font-['Manrope',Helvetica]">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                        do eiusmod
                      </div>
                    </div>

                    <Button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white">
                      Upgrade
                    </Button>
                  </div>

                  <div className="absolute w-[134px] h-[134px] top-20 right-4 rotate-[-64.49deg]">
                    <div className="relative h-[134px] rounded-[67px]">
                      <div className="absolute w-[67px] h-[67px] top-[66px] left-[3px] bg-[#7c6dd766] rounded-[33.5px]" />
                      <div className="absolute w-[134px] h-[134px] top-0 left-0 bg-[#7c6dd766] rounded-[67px]" />
                    </div>
                  </div>

                  <img
                    className="absolute w-[87px] h-[119px] top-[73px] right-6"
                    alt="Pic"
                    src="/pic.png"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
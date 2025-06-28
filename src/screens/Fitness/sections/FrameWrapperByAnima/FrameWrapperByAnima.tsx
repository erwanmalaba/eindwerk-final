import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";

export const FrameWrapperByAnima = (): JSX.Element => {
  // Activity card data
  const activityCards = [
    {
      type: "Workout",
      value: "4 hrs",
      bgColor: "bg-cyan-500",
      iconBgColor: "bg-cyan-600",
      iconSrc: "/workout.svg",
      chartSrc: "/group-6.png",
    },
    {
      type: "Calories",
      value: "1800 kcl",
      bgColor: "bg-orange-500",
      iconBgColor: "bg-orange-600",
      iconSrc: "/iconsax-linear-huobitoken.svg",
      chartSrc: "/group-5.png",
    },
    {
      type: "Steps",
      value: "2200 steps",
      bgColor: "bg-violet-500",
      iconBgColor: "bg-violet-700",
      iconSrc: "/frame.svg",
      chartSrc: "/group-7.png",
    },
  ] || []; // Fallback to empty array

  // Chart data for days of the week
  const chartDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] || [];

  // Food tracking data
  const foodItems = [
    {
      name: "Burrito",
      image: "/buritto-1.png",
      meal: "Pizza Burger",
      calories: "Receiving",
      priorities: "01:00 AM",
      carbs: "20 gm",
      fontWeight: "font-bold",
    },
    {
      name: "Burger",
      image: "/burger-1.png",
      meal: "Pizza Burger",
      calories: "Receiving",
      priorities: "01:00 AM",
      carbs: "20 gm",
      fontWeight: "font-semibold",
    },
    {
      name: "Pizza Burger",
      image: "/meat--2.png",
      meal: "Pizza Burger",
      calories: "Receiving",
      priorities: "01:00 AM",
      carbs: "20 gm",
      fontWeight: "font-semibold",
    },
  ] || []; // Fallback to empty array

  // Percentage labels for chart
  const percentages = ["100%", "80%", "60%", "40%", "20%", "0%"] || [];

  // Chart legend items
  const chartLegend = [
    { color: "bg-cyan-500", label: "Workout" },
    { color: "bg-orange-500", label: "Calories" },
    { color: "bg-violet-500", label: "Steps" },
  ] || [];

  return (
    <div className="flex flex-col w-full items-start gap-6 lg:gap-8">
      {/* Banner section */}
      <section className="relative w-full h-32 sm:h-36 lg:h-40 rounded-xl overflow-hidden">
        <div className="relative w-full h-full">
          <img
            className="absolute w-full h-full top-0 right-0 object-cover"
            alt="Fitness background"
            src="/anastasia-hisel-tpivpdqgc20-unsplash-2.png"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />

          <div className="absolute w-full h-full top-0 left-0 rounded-xl [background:linear-gradient(90deg,rgba(252,98,18,1)_42%,rgba(234,88,12,0)_100%)]" />

          <div className="absolute w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] lg:w-[134px] lg:h-[134px] top-[20px] sm:top-[25px] lg:top-[35px] left-0">
            <div className="relative h-[100px] sm:h-[120px] lg:h-[134px] rounded-[50px] sm:rounded-[60px] lg:rounded-[67px]">
              <div className="absolute w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] lg:w-[67px] lg:h-[67px] top-[49px] sm:top-[59px] lg:top-[66px] left-[2px] sm:left-[2.5px] lg:left-[3px] bg-[#ffa67833] rounded-[25px] sm:rounded-[30px] lg:rounded-[33.5px]" />
              <div className="absolute w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] lg:w-[134px] lg:h-[134px] top-0 left-0 bg-[#ffa67833] rounded-[50px] sm:rounded-[60px] lg:rounded-[67px]" />
            </div>
          </div>

          <div className="absolute top-4 sm:top-6 lg:top-8 left-[50px] sm:left-[60px] lg:left-[69px] right-4 sm:right-6 lg:right-8 flex flex-col gap-1 sm:gap-2">
            <h2 className="font-['Manrope',Helvetica] font-extrabold text-white text-lg sm:text-xl lg:text-2xl tracking-[0] leading-[normal]">
              Track Your Daily Activities
            </h2>

            <p className="font-['Manrope',Helvetica] font-normal text-white text-xs tracking-[0.10px] leading-[16px] sm:leading-[18px] max-w-md">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod Lorem ipsum dolor sit amet, consectetur adipisicing elit,
              sed do eiusmod
            </p>
          </div>
        </div>
      </section>

      {/* Activity cards section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
        {Array.isArray(activityCards) && activityCards.length > 0 ? (
          activityCards.map((card, index) => (
            <Card
              key={index}
              className={`${card.bgColor} h-[140px] sm:h-[160px] lg:h-[168px] rounded-lg overflow-hidden`}
            >
              <CardContent className="p-0">
                <div className="relative w-full h-full p-3 sm:p-4">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div
                      className={`relative w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] lg:w-[45px] lg:h-[45px] ${card.iconBgColor} rounded flex items-center justify-center`}
                    >
                      {card.type === "Steps" ? (
                        <img
                          className="w-5 h-5 sm:w-6 sm:h-6"
                          alt={card.type}
                          src={card.iconSrc}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className={`${card.type === "Workout" ? "w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" : "w-5 h-5 sm:w-6 sm:h-6"} bg-[url(${card.iconSrc})] bg-[100%_100%]`}
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="font-['Manrope',Helvetica] font-bold text-white text-sm sm:text-base">
                        {card.type}
                      </div>

                      <div className="font-normal text-white text-xs font-['Manrope',Helvetica]">
                        {card.value}
                      </div>
                    </div>
                  </div>

                  <img
                    className="absolute bottom-0 left-0 w-full h-auto"
                    alt="Activity chart"
                    src={card.chartSrc}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-6 sm:py-8">
            <p className="text-slate-500">No activity data available</p>
          </div>
        )}
      </section>

      {/* Goal progress chart */}
      <Card className="w-full shadow-[0px_4px_22px_#9f9f9f26] rounded-xl">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
              <h3 className="font-['Manrope',Helvetica] font-bold text-slate-600 text-base">
                Goal Progress
              </h3>

              <Select defaultValue="weekly">
                <SelectTrigger className="w-auto h-auto px-2.5 py-[5px] text-xs font-medium text-slate-500 border-slate-300 rounded-lg">
                  <SelectValue placeholder="Weekly" />
                  <img
                    className="ml-1 w-6 h-6"
                    alt="Arrow"
                    src="/arrow-dark-2.svg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </SelectTrigger>
              </Select>
            </div>

            <div className="flex gap-4 sm:gap-6">
              {/* Percentage labels */}
              <div className="flex flex-col justify-between h-[120px] sm:h-[140px] lg:h-[154px]">
                {Array.isArray(percentages) && percentages.length > 0 ? (
                  percentages.map((percentage, index) => (
                    <div
                      key={index}
                      className="font-['Manrope',Helvetica] font-normal text-slate-500 text-xs"
                    >
                      {percentage}
                    </div>
                  ))
                ) : null}
              </div>

              {/* Chart bars */}
              <div className="flex-1 relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div
                      key={index}
                      className={`absolute w-full h-px bg-slate-200 ${
                        index === 0 ? "top-0" : 
                        index === 1 ? "top-[24px] sm:top-[28px] lg:top-[31px]" : 
                        index === 2 ? "top-[48px] sm:top-[56px] lg:top-[62px]" : 
                        index === 3 ? "top-[72px] sm:top-[84px] lg:top-[93px]" : 
                        index === 4 ? "top-[96px] sm:top-[112px] lg:top-[124px]" : 
                        "top-[120px] sm:top-[140px] lg:top-[154px]"
                      }`}
                    />
                  ))}
                </div>

                {/* Bar chart groups */}
                <div className="flex justify-between items-end h-[120px] sm:h-[140px] lg:h-[154px] relative z-10">
                  {Array.isArray(chartDays) && chartDays.length > 0 ? (
                    chartDays.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="flex items-end gap-1">
                          {/* Dynamic heights for each day's bars */}
                          <div
                            className={`w-[5px] sm:w-[6px] lg:w-[7px] ${
                              dayIndex === 0
                                ? "h-[40px] sm:h-[48px] lg:h-[53px]"
                                : dayIndex === 1
                                  ? "h-[55px] sm:h-[66px] lg:h-[73px]"
                                  : dayIndex === 2
                                    ? "h-[93px] sm:h-[111px] lg:h-[123px]"
                                    : dayIndex === 3
                                      ? "h-[78px] sm:h-[93px] lg:h-[103px]"
                                      : "h-[40px] sm:h-[48px] lg:h-[53px]"
                            } bg-cyan-400 rounded`}
                          />

                          <div
                            className={`w-[5px] sm:w-[6px] lg:w-[7px] ${
                              dayIndex === 0
                                ? "h-[70px] sm:h-[84px] lg:h-[93px]"
                                : dayIndex === 1
                                  ? "h-[40px] sm:h-[48px] lg:h-[53px]"
                                  : dayIndex === 2
                                    ? "h-[63px] sm:h-[75px] lg:h-[83px]"
                                    : dayIndex === 3
                                      ? "h-[93px] sm:h-[111px] lg:h-[123px]"
                                      : "h-[70px] sm:h-[84px] lg:h-[93px]"
                            } bg-orange-400 rounded`}
                          />

                          <div
                            className={`w-[5px] sm:w-[6px] lg:w-[7px] ${
                              dayIndex === 0
                                ? "h-[93px] sm:h-[111px] lg:h-[123px]"
                                : dayIndex === 1
                                  ? "h-[63px] sm:h-[75px] lg:h-[83px]"
                                  : dayIndex === 2
                                    ? "h-[70px] sm:h-[84px] lg:h-[93px]"
                                    : dayIndex === 3
                                      ? "h-[55px] sm:h-[66px] lg:h-[73px]"
                                      : "h-[78px] sm:h-[93px] lg:h-[103px]"
                            } bg-violet-400 rounded`}
                          />
                        </div>

                        <div className="font-['Manrope',Helvetica] font-normal text-slate-500 text-xs">
                          {day}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center w-full">
                      <p className="text-slate-500">No chart data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chart legend */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
              {Array.isArray(chartLegend) && chartLegend.length > 0 ? (
                chartLegend.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${item.color} rounded`} />
                    <div className="font-['Manrope',Helvetica] font-normal text-slate-600 text-xs">
                      {item.label}
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Food tracking table */}
      <section className="w-full">
        <div className="bg-white rounded-lg shadow-[0px_4px_22px_#9f9f9f26] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200">
                  <TableHead className="px-3 sm:px-4 py-3 sm:py-4">
                    <span className="font-['Manrope',Helvetica] font-bold text-slate-600 text-sm">
                      Food
                    </span>
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-3 sm:py-4">
                    <span className="font-['Manrope',Helvetica] font-bold text-slate-600 text-sm">
                      Meal
                    </span>
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                    <span className="font-['Manrope',Helvetica] font-bold text-slate-600 text-sm">
                      Calories
                    </span>
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                    <span className="font-['Manrope',Helvetica] font-bold text-slate-600 text-sm">
                      Priorities
                    </span>
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-3 sm:py-4">
                    <span className="font-['Manrope',Helvetica] font-bold text-slate-600 text-sm">
                      Carbs
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(foodItems) && foodItems.length > 0 ? (
                  foodItems.map((item, index) => (
                    <TableRow
                      key={index}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="px-3 sm:px-4 py-3 sm:py-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="relative w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full overflow-hidden border-[0.5px] border-solid border-[#fdba74] flex-shrink-0">
                            <img
                              className="w-full h-full object-cover"
                              alt={item.name}
                              src={item.image}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <div
                            className={`font-['Manrope',Helvetica] ${item.fontWeight} text-slate-600 text-sm truncate`}
                          >
                            {item.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-3 sm:py-4">
                        <div className="font-['Manrope',Helvetica] font-medium text-slate-600 text-sm truncate">
                          {item.meal}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                        <div className="font-['Manrope',Helvetica] font-medium text-slate-600 text-sm">
                          {item.calories}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                        <div className="font-['Manrope',Helvetica] font-medium text-slate-600 text-sm">
                          {item.priorities}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-3 sm:py-4">
                        <div className="font-['Manrope',Helvetica] font-medium text-slate-600 text-sm">
                          {item.carbs}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 sm:py-8">
                      <p className="text-slate-500">No food data available</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
};
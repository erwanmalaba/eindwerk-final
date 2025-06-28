import {
  FaChevronRight,
  FaDumbbell,
  FaCheckCircle,
  FaPlus,
} from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Link } from "react-router-dom";

interface WorkoutData {
  date: string;
  added: number;
  completed: number;
  dayLabel: string;
}

interface WorkoutStats {
  totalWorkouts: number;
  completedWorkouts: number;
  completionRate: number;
  thisWeekAdded: number;
  thisWeekCompleted: number;
  weeklyCompletionRate: number;
}

interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string;
  category: string;
  deadline: string;
  completed: boolean;
}

export const Overview = (): JSX.Element => {
  const { user } = useAuth();
  const [workoutData, setWorkoutData] = useState<WorkoutData[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    completedWorkouts: 0,
    completionRate: 0,
    thisWeekAdded: 0,
    thisWeekCompleted: 0,
    weeklyCompletionRate: 0,
  });
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchWorkoutData(),
        fetchScheduleItems(),
        fetchGoals(),
      ]);
    } catch (error) {
      console.error("❌ Overview: Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutData = async () => {
    try {
      // Get all workouts for the user
      const { data: allWorkouts, error: allWorkoutsError } = await supabase
        .from("workouts")
        .select("id, name, date, completed, created_at")
        .eq("user_id", user?.id)
        .order("date", { ascending: true });

      if (allWorkoutsError) {
        console.error(
          "❌ Overview: Workouts fetch error:",
          allWorkoutsError.message
        );
        return;
      }

      const workouts = allWorkouts || [];

      // Calculate overall workout statistics
      const totalWorkouts = workouts.length;
      const completedWorkouts = workouts.filter((w) => w.completed).length;
      const completionRate =
        totalWorkouts > 0
          ? Math.round((completedWorkouts / totalWorkouts) * 100)
          : 0;

      // Get workouts from the last 7 days for weekly stats
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

      const weeklyWorkouts = workouts.filter((w) => w.date >= sevenDaysAgoStr);
      const thisWeekAdded = weeklyWorkouts.length;
      const thisWeekCompleted = weeklyWorkouts.filter((w) => w.completed)
        .length;
      const weeklyCompletionRate =
        thisWeekAdded > 0
          ? Math.round((thisWeekCompleted / thisWeekAdded) * 100)
          : 0;

      // Process data for the last 7 days chart
      const processedData: WorkoutData[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        // Get workouts for this specific date
        const dayWorkouts = workouts.filter((w) => w.date === dateStr);
        const added = dayWorkouts.length;
        const completed = dayWorkouts.filter((w) => w.completed).length;

        // Generate day label
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dayLabel: string;
        if (date.toDateString() === today.toDateString()) {
          dayLabel = "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
          dayLabel = "Yesterday";
        } else {
          dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
        }

        processedData.push({
          date: dateStr,
          added,
          completed,
          dayLabel,
        });
      }

      setWorkoutData(processedData);
      setWorkoutStats({
        totalWorkouts,
        completedWorkouts,
        completionRate,
        thisWeekAdded,
        thisWeekCompleted,
        weeklyCompletionRate,
      });
    } catch (error) {
      console.error("❌ Overview: Workout data processing error:", error);
    }
  };

  const fetchScheduleItems = async () => {
    try {
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      const { data, error } = await supabase
        .from("schedule_items")
        .select("*")
        .eq("user_id", user?.id)
        .gte("date", today.toISOString().split("T")[0])
        .lte("date", threeDaysFromNow.toISOString().split("T")[0])
        .order("date", { ascending: true })
        .order("time", { ascending: true })
        .limit(3);

      if (error) {
        console.error("❌ Overview: Schedule fetch error:", error.message);
        return;
      }

      setScheduleItems(data || []);
    } catch (error) {
      console.error("❌ Overview: Schedule error:", error);
    }
  };

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user?.id)
        .eq("completed", false)
        .order("deadline", { ascending: true })
        .limit(3);

      if (error) {
        console.error("❌ Overview: Goals fetch error:", error.message);
        return;
      }

      setGoals(data || []);
    } catch (error) {
      console.error("❌ Overview: Goals error:", error);
    }
  };

  const getMaxValue = () => {
    const allValues = workoutData.flatMap((d) => [d.added, d.completed]);
    const maxValue = Math.max(...allValues, 1); // Minimum scale of 1
    return maxValue;
  };

  const formatScheduleTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const formatScheduleDate = (date: string) => {
    try {
      const scheduleDate = new Date(date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (scheduleDate.toDateString() === today.toDateString()) {
        return "Today";
      } else if (scheduleDate.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
      } else {
        return scheduleDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        });
      }
    } catch {
      return date;
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "weight loss":
        return "bg-red-100 text-red-800";
      case "weight gain":
        return "bg-green-100 text-green-800";
      case "strength":
      case "strength training":
        return "bg-orange-100 text-orange-800";
      case "cardio":
      case "cardiovascular":
        return "bg-cyan-100 text-cyan-800";
      case "endurance":
        return "bg-blue-100 text-blue-800";
      case "flexibility":
        return "bg-violet-100 text-violet-800";
      case "muscle building":
        return "bg-emerald-100 text-emerald-800";
      case "body fat":
        return "bg-yellow-100 text-yellow-800";
      case "performance":
        return "bg-purple-100 text-purple-800";
      case "consistency":
        return "bg-indigo-100 text-indigo-800";
      case "nutrition":
        return "bg-lime-100 text-lime-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "strength":
        return "bg-orange-100 text-orange-800";
      case "cardio":
        return "bg-cyan-100 text-cyan-800";
      case "yoga":
        return "bg-violet-100 text-violet-800";
      case "flexibility":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="w-full max-w-none overflow-x-hidden">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Content - Left Side (2/3 width on xl screens) */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8 min-w-0">
          {/* Banner section */}
          <section className="relative w-full h-28 sm:h-32 md:h-36 lg:h-40 rounded-xl overflow-hidden">
            <div className="relative w-full h-full">
              <img
                className="absolute w-full h-full top-0 right-0 object-cover"
                alt="Fitness background"
                src="/anastasia-hisel-tpivpdqgc20-unsplash-2.png"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <div className="absolute w-full h-full top-0 left-0 rounded-xl [background:linear-gradient(90deg,rgba(252,98,18,1)_42%,rgba(234,88,12,0)_100%)]" />

              <div className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-[134px] lg:h-[134px] top-3 sm:top-4 md:top-6 lg:top-[35px] left-0">
                <div className="relative h-full rounded-full">
                  <div className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-[67px] lg:h-[67px] bottom-0 left-1 bg-[#ffa67833] rounded-full" />
                  <div className="absolute w-full h-full top-0 left-0 bg-[#ffa67833] rounded-full" />
                </div>
              </div>

              <div className="absolute top-2 sm:top-3 md:top-4 lg:top-8 left-12 sm:left-16 md:left-20 lg:left-[69px] right-2 sm:right-4 md:right-6 lg:right-8 flex flex-col gap-1">
                <h2 className="font-['Manrope',Helvetica] font-extrabold text-white text-sm sm:text-base md:text-lg lg:text-2xl tracking-[0] leading-tight">
                  Track Your Daily Activities
                </h2>

                <p className="font-['Manrope',Helvetica] font-normal text-white text-xs sm:text-sm leading-tight max-w-xs sm:max-w-sm md:max-w-md">
                  Monitor your workout progress and stay motivated with your
                  fitness journey
                </p>
              </div>
            </div>
          </section>

          {/* Workout Statistics Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Total Workouts */}
            <Card className="bg-cyan-500 rounded-lg overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
                    <FaDumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-base sm:text-lg">
                      {workoutStats.totalWorkouts}
                    </div>
                    <div className="text-cyan-100 text-xs">Total</div>
                  </div>
                </div>
                <div className="text-cyan-100 text-xs sm:text-sm">
                  All Workouts
                </div>
              </CardContent>
            </Card>

            {/* Completed Workouts */}
            <Card className="bg-green-500 rounded-lg overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-base sm:text-lg">
                      {workoutStats.completedWorkouts}
                    </div>
                    <div className="text-green-100 text-xs">Completed</div>
                  </div>
                </div>
                <div className="text-green-100 text-xs sm:text-sm">
                  Finished Workouts
                </div>
              </CardContent>
            </Card>

            {/* Overall Completion Rate */}
            <Card className="bg-orange-500 rounded-lg overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">
                      %
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-white text-base sm:text-lg">
                      {workoutStats.completionRate}%
                    </div>
                    <div className="text-orange-100 text-xs">Success</div>
                  </div>
                </div>
                <div className="text-orange-100 text-xs sm:text-sm">
                  Completion Rate
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Workout Progress Chart */}
          <Card className="w-full">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-slate-800 font-['Manrope',Helvetica] flex items-center gap-2">
                <FaDumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                Weekly Workout Progress
              </CardTitle>
              <p className="text-xs sm:text-sm text-slate-600">
                Real-time data from your workout page showing added vs completed
                workouts
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="flex items-center justify-center h-32 sm:h-48">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* Chart */}
                  <div className="flex gap-2 sm:gap-4">
                    {/* Y-axis labels */}
                    <div className="flex flex-col justify-between h-32 sm:h-48 text-xs text-slate-500 w-6 sm:w-8">
                      {Array.from({ length: 6 }, (_, i) => {
                        const maxVal = getMaxValue();
                        const value = Math.ceil((maxVal * (5 - i)) / 5);
                        return (
                          <div key={i} className="text-right">
                            {value}
                          </div>
                        );
                      })}
                    </div>

                    {/* Chart area with proper containment */}
                    <div className="flex-1 relative overflow-hidden">
                      {/* Grid lines - properly contained within chart area */}
                      <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 6 }, (_, i) => (
                          <div
                            key={i}
                            className="absolute w-full h-px bg-slate-200"
                            style={{ top: `${(i * 100) / 5}%` }}
                          />
                        ))}
                      </div>

                      {/* Bars */}
                      <div className="flex justify-between items-end h-32 sm:h-48 relative z-10 px-1 sm:px-2">
                        {workoutData.map((data, index) => {
                          const maxVal = getMaxValue();

                          // Calculate heights as percentages of the chart height
                          const chartHeight =
                            window.innerWidth < 640 ? 120 : 180; // 32*4 or 48*4 (h-32 or h-48 in pixels)
                          const addedHeight =
                            maxVal > 0
                              ? Math.max(
                                  (data.added / maxVal) * chartHeight * 0.9,
                                  data.added > 0 ? 6 : 0
                                )
                              : 0;
                          const completedHeight =
                            maxVal > 0
                              ? Math.max(
                                  (data.completed / maxVal) * chartHeight * 0.9,
                                  data.completed > 0 ? 6 : 0
                                )
                              : 0;

                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center gap-2 sm:gap-3"
                            >
                              {/* Bars container */}
                              <div className="flex items-end gap-0.5 sm:gap-1 h-28 sm:h-44">
                                {/* Added workouts bar (cyan) */}
                                <div
                                  className="w-3 sm:w-6 bg-cyan-400 rounded-t transition-all duration-300 hover:bg-cyan-500"
                                  style={{ height: `${addedHeight}px` }}
                                  title={`Added: ${data.added} workout${
                                    data.added !== 1 ? "s" : ""
                                  } on ${data.dayLabel}`}
                                />
                                {/* Completed workouts bar (green) */}
                                <div
                                  className="w-3 sm:w-6 bg-green-400 rounded-t transition-all duration-300 hover:bg-green-500"
                                  style={{ height: `${completedHeight}px` }}
                                  title={`Completed: ${data.completed} workout${
                                    data.completed !== 1 ? "s" : ""
                                  } on ${data.dayLabel}`}
                                />
                              </div>

                              {/* Day label */}
                              <div className="text-xs text-slate-500 text-center font-medium">
                                {data.dayLabel}
                              </div>

                              {/* Data values for debugging */}
                              {(data.added > 0 || data.completed > 0) && (
                                <div className="text-xs text-slate-400 text-center">
                                  {data.added}/{data.completed}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-cyan-400 rounded"></div>
                      <span className="text-xs sm:text-sm text-slate-600 font-medium">
                        Added Workouts
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded"></div>
                      <span className="text-xs sm:text-sm text-slate-600 font-medium">
                        Completed Workouts
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
                      <div>
                        <div className="text-base sm:text-lg font-bold text-slate-800">
                          {workoutStats.thisWeekAdded}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">
                          This Week Added
                        </div>
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-bold text-slate-800">
                          {workoutStats.thisWeekCompleted}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">
                          This Week Done
                        </div>
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-bold text-slate-800">
                          {workoutStats.totalWorkouts}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">
                          Total Ever
                        </div>
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-bold text-slate-800">
                          {workoutStats.weeklyCompletionRate}%
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">
                          Weekly Rate
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* No data message */}
                  {workoutStats.totalWorkouts === 0 && (
                    <div className="text-center py-6 sm:py-8 bg-orange-50 rounded-lg border border-orange-200">
                      <FaDumbbell className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400 mx-auto mb-3" />
                      <h3 className="text-base sm:text-lg font-medium text-orange-800 mb-2">
                        No workouts yet
                      </h3>
                      <p className="text-orange-600 text-sm mb-4">
                        Create your first workout to see progress data here
                      </p>
                      <Link
                        to="/workout"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        <FaPlus className="w-4 h-4" />
                        Create Workout
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Content (1/3 width on xl screens) */}
        <div className="xl:col-span-1 space-y-4 sm:space-y-6 lg:space-y-8 min-w-0">
          {/* My Schedule Section */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
              <h2 className="font-bold text-slate-600 text-base sm:text-lg md:text-xl font-['Manrope',Helvetica]">
                My Schedule
              </h2>
              <Link
                to="/schedule"
                className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="font-medium text-orange-500 text-sm font-['Manrope',Helvetica]">
                  View All
                </span>
                <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-orange-500 ml-1" />
              </Link>
            </div>

            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {loading ? (
                <div className="text-center py-4 sm:py-6 md:py-8">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-slate-500 mt-2 text-xs sm:text-sm">
                    Loading schedule...
                  </p>
                </div>
              ) : scheduleItems.length > 0 ? (
                scheduleItems.map((item) => (
                  <Card
                    key={item.id}
                    className={`w-full bg-white rounded-lg shadow-[0px_4px_22px_#9f9f9f26] ${
                      item.completed ? "bg-green-50 border-green-200" : ""
                    }`}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-start gap-1 sm:gap-2 flex-1 min-w-0">
                          <div
                            className={`font-medium text-slate-800 text-sm tracking-[-0.08px] leading-[14px] font-['Manrope',Helvetica] truncate w-full ${
                              item.completed
                                ? "line-through text-green-700"
                                : ""
                            }`}
                          >
                            {item.title}
                          </div>
                          <div className="font-normal text-slate-600 text-xs tracking-[-0.07px] leading-3 font-['Manrope',Helvetica] truncate w-full">
                            {formatScheduleDate(item.date)} |{" "}
                            {formatScheduleTime(item.time)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                          <Badge className={getTypeColor(item.type)}>
                            {item.type}
                          </Badge>
                          {item.completed && (
                            <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-4 sm:py-6 md:py-8">
                  <p className="text-slate-500 text-sm mb-3">
                    No upcoming activities
                  </p>
                  <Link
                    to="/schedule"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  >
                    <FaPlus className="w-3 h-3" />
                    Schedule Activity
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Goals Section */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
              <h2 className="font-bold text-slate-600 text-base sm:text-lg md:text-xl font-['Manrope',Helvetica]">
                Goals
              </h2>
              <Link
                to="/goals"
                className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="font-medium text-orange-500 text-sm font-['Manrope',Helvetica]">
                  View All
                </span>
                <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-orange-500 ml-1" />
              </Link>
            </div>

            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {loading ? (
                <div className="text-center py-4 sm:py-6 md:py-8">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-slate-500 mt-2 text-xs sm:text-sm">
                    Loading goals...
                  </p>
                </div>
              ) : goals.length > 0 ? (
                goals.map((goal) => {
                  const progress = getProgressPercentage(
                    goal.current_value,
                    goal.target_value
                  );
                  const isOverdue =
                    new Date(goal.deadline) < new Date() && !goal.completed;

                  return (
                    <Card
                      key={goal.id}
                      className={`w-full bg-white rounded-lg shadow-[0px_4px_22px_#9f9f9f26] ${
                        isOverdue ? "border-red-200 bg-red-50" : ""
                      }`}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between w-full mb-2 sm:mb-3">
                          <div className="flex flex-col items-start gap-1 sm:gap-2 flex-1 min-w-0">
                            <div className="font-medium text-slate-800 text-sm tracking-[-0.08px] leading-[14px] font-['Manrope',Helvetica] truncate w-full">
                              {goal.title}
                            </div>
                            <div className="font-normal text-slate-600 text-xs tracking-[-0.07px] leading-3 font-['Manrope',Helvetica] truncate w-full">
                              Due:{" "}
                              {new Date(goal.deadline).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge className={getCategoryColor(goal.category)}>
                            {goal.category}
                          </Badge>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-medium text-slate-800">
                              {goal.current_value} / {goal.target_value}{" "}
                              {goal.unit}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                progress >= 100
                                  ? "bg-green-500"
                                  : progress >= 75
                                  ? "bg-orange-500"
                                  : "bg-cyan-500"
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-slate-500 text-right">
                            {progress.toFixed(1)}% complete
                          </div>
                        </div>

                        {isOverdue && (
                          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800">
                            ⚠️ This goal is overdue
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-4 sm:py-6 md:py-8">
                  <p className="text-slate-500 text-sm mb-3">No active goals</p>
                  <Link
                    to="/goals"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  >
                    <FaPlus className="w-3 h-3" />
                    Set Goal
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

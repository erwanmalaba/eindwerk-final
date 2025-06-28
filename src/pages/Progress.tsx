import { FaChartBar, FaPlus, FaEdit } from "react-icons/fa";
import { TrendingUp, ArrowDown, Target, Award } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { 
  fetchProgressMetrics, 
  fetchWeeklyProgress, 
  createProgressMetric,
  clearError 
} from "../store/slices/progressSlice";
import { addNotification } from "../store/slices/uiSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface MetricFormData {
  metric_type: 'weight' | 'body_fat' | 'muscle_mass' | 'bench_press' | 'run_time' | 'weekly_workouts'
  current_value: number
  previous_value: number
  target_value: number
  unit: string
  recorded_date: string
}

export const Progress = (): JSX.Element => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { metrics, weeklyData, achievements, loading, error } = useAppSelector((state) => state.progress);
  const { workouts } = useAppSelector((state) => state.workouts);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MetricFormData>({
    metric_type: 'weight',
    current_value: 0,
    previous_value: 0,
    target_value: 0,
    unit: 'kg',
    recorded_date: new Date().toISOString().split('T')[0]
  });

  // Update unit when metric type changes
  useEffect(() => {
    const unitMap = {
      weight: 'kg',
      body_fat: '%',
      muscle_mass: 'kg',
      bench_press: 'kg',
      run_time: 'min',
      weekly_workouts: 'sessions'
    };
    
    setFormData(prev => ({
      ...prev,
      unit: unitMap[prev.metric_type]
    }));
  }, [formData.metric_type]);

  useEffect(() => {
    if (user) {
      dispatch(fetchProgressMetrics(user.id));
      dispatch(fetchWeeklyProgress(user.id));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(addNotification({
        type: 'error',
        message: error
      }));
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Calculate progress data from real metrics or use mock data
  const getProgressData = () => {
    const defaultMetrics = [
      {
        metric: "Weight",
        current: 72.5,
        previous: 75.0,
        unit: "kg",
        change: -2.5,
        trend: "down",
        target: 70,
      },
      {
        metric: "Body Fat",
        current: 18.2,
        previous: 20.1,
        unit: "%",
        change: -1.9,
        trend: "down",
        target: 15,
      },
      {
        metric: "Muscle Mass",
        current: 58.3,
        previous: 56.8,
        unit: "kg",
        change: 1.5,
        trend: "up",
        target: 60,
      },
      {
        metric: "Bench Press",
        current: 85,
        previous: 80,
        unit: "kg",
        change: 5,
        trend: "up",
        target: 100,
      },
      {
        metric: "5K Run Time",
        current: 28,
        previous: 30,
        unit: "min",
        change: -2,
        trend: "down",
        target: 25,
      },
      {
        metric: "Weekly Workouts",
        current: workouts.filter(w => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(w.date) >= weekAgo && w.completed;
        }).length,
        previous: 3,
        unit: "sessions",
        change: 1,
        trend: "up",
        target: 5,
      },
    ];

    // If we have real metrics, use them; otherwise use defaults
    if (metrics.length > 0) {
      return metrics.map(metric => ({
        metric: metric.metric_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        current: metric.current_value,
        previous: metric.previous_value,
        unit: metric.unit,
        change: metric.current_value - metric.previous_value,
        trend: metric.current_value > metric.previous_value ? "up" : "down",
        target: metric.target_value,
      }));
    }

    return defaultMetrics;
  };

  const progressData = getProgressData();

  const handleCreateMetric = async () => {
    if (!user) {
      dispatch(addNotification({
        type: 'error',
        message: 'You must be logged in to add metrics'
      }));
      return;
    }

    // Validate form data
    if (!formData.metric_type || formData.current_value <= 0 || formData.target_value <= 0) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please fill in all required fields with valid values'
      }));
      return;
    }

    if (!formData.unit.trim()) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please specify a unit for the metric'
      }));
      return;
    }

    try {
      console.log('Creating metric with data:', formData);
      
      await dispatch(createProgressMetric({
        userId: user.id,
        metricData: {
          ...formData,
          // Ensure numbers are properly formatted
          current_value: Number(formData.current_value),
          previous_value: Number(formData.previous_value),
          target_value: Number(formData.target_value),
        }
      })).unwrap();

      dispatch(addNotification({
        type: 'success',
        message: 'Progress metric added successfully!'
      }));

      // Reset form
      setFormData({
        metric_type: 'weight',
        current_value: 0,
        previous_value: 0,
        target_value: 0,
        unit: 'kg',
        recorded_date: new Date().toISOString().split('T')[0]
      });
      setIsDialogOpen(false);
      
      // Refresh metrics
      dispatch(fetchProgressMetrics(user.id));
    } catch (error: any) {
      console.error('Error creating metric:', error);
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to add progress metric'
      }));
    }
  };

  const getProgressPercentage = (current: number, target: number, metric: string) => {
    if (metric === "5K Run Time") {
      // For time-based metrics, lower is better
      return Math.max(0, Math.min(((current - target) / current) * 100 + 100, 100));
    }
    if (metric === "Weight" || metric === "Body Fat") {
      // For weight/body fat, we want to reach the target from above
      const start = metric === "Weight" ? 75 : 20.1;
      return Math.max(0, Math.min(((start - current) / (start - target)) * 100, 100));
    }
    return Math.min((current / target) * 100, 100);
  };

  const getDisplayWeeklyData = () => {
    if (weeklyData.length > 0) {
      return weeklyData;
    }
    
    // Fallback mock data
    return [
      { week: "Week 1", workouts: 3, calories: 1800, weight: 75.0, date_range: "Last week" },
      { week: "Week 2", workouts: 4, calories: 1750, weight: 74.5, date_range: "2 weeks ago" },
      { week: "Week 3", workouts: 4, calories: 1700, weight: 74.0, date_range: "3 weeks ago" },
      { week: "Week 4", workouts: 5, calories: 1650, weight: 73.2, date_range: "4 weeks ago" },
      { week: "Week 5", workouts: 4, calories: 1700, weight: 72.8, date_range: "5 weeks ago" },
      { week: "Week 6", workouts: 5, calories: 1650, weight: 72.5, date_range: "6 weeks ago" },
    ];
  };

  const displayWeeklyData = getDisplayWeeklyData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-slate-600">Loading progress data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-['Manrope',Helvetica]">
            Progress Tracking
          </h1>
          <p className="text-slate-600 mt-2">Monitor your fitness journey and achievements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <FaPlus className="w-4 h-4 mr-2" />
              Add Metric
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Progress Metric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="metric_type">Metric Type *</Label>
                <select
                  id="metric_type"
                  value={formData.metric_type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    metric_type: e.target.value as any,
                    unit: {
                      weight: 'kg',
                      body_fat: '%',
                      muscle_mass: 'kg',
                      bench_press: 'kg',
                      run_time: 'min',
                      weekly_workouts: 'sessions'
                    }[e.target.value as any] || 'kg'
                  })}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="weight">Weight</option>
                  <option value="body_fat">Body Fat</option>
                  <option value="muscle_mass">Muscle Mass</option>
                  <option value="bench_press">Bench Press</option>
                  <option value="run_time">5K Run Time</option>
                  <option value="weekly_workouts">Weekly Workouts</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_value">Current Value *</Label>
                  <Input
                    id="current_value"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.current_value || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      current_value: parseFloat(e.target.value) || 0 
                    })}
                    placeholder="Enter current value"
                    className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="target_value">Target Value *</Label>
                  <Input
                    id="target_value"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.target_value || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      target_value: parseFloat(e.target.value) || 0 
                    })}
                    placeholder="Enter target value"
                    className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="previous_value">Previous Value</Label>
                  <Input
                    id="previous_value"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.previous_value || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      previous_value: parseFloat(e.target.value) || 0 
                    })}
                    placeholder="Enter previous value"
                    className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="kg, %, min, etc."
                    className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="recorded_date">Date *</Label>
                <Input
                  id="recorded_date"
                  type="date"
                  value={formData.recorded_date}
                  onChange={(e) => setFormData({ ...formData, recorded_date: e.target.value })}
                  className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm text-slate-600">
                  <strong>Preview:</strong> {formData.metric_type.replace('_', ' ')} - 
                  Current: {formData.current_value} {formData.unit}, 
                  Target: {formData.target_value} {formData.unit}
                </p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateMetric}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  disabled={loading || !formData.current_value || !formData.target_value || !formData.unit.trim()}
                >
                  {loading ? 'Adding...' : 'Add Metric'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setFormData({
                      metric_type: 'weight',
                      current_value: 0,
                      previous_value: 0,
                      target_value: 0,
                      unit: 'kg',
                      recorded_date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Source Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-500 text-white">Data Source</Badge>
            <span className="text-sm text-blue-800">
              {metrics.length > 0 ? `${metrics.length} real metrics` : 'Mock data (add real metrics above)'}
            </span>
          </div>
          <p className="text-sm text-blue-700">
            {metrics.length > 0 
              ? 'Showing your actual progress metrics from the database'
              : 'Add your first progress metric to start tracking real data'
            }
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {progressData.map((item, index) => {
          const progress = getProgressPercentage(item.current, item.target, item.metric);
          const isImproving = (item.trend === "up" && item.metric !== "Weight" && item.metric !== "Body Fat" && item.metric !== "5K Run Time") ||
                             (item.trend === "down" && (item.metric === "Weight" || item.metric === "Body Fat" || item.metric === "5K Run Time"));
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-800 font-['Manrope',Helvetica]">
                    {item.metric}
                  </CardTitle>
                  <div className={`flex items-center gap-1 ${isImproving ? 'text-green-600' : 'text-red-600'}`}>
                    {item.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {item.change > 0 ? '+' : ''}{item.change} {item.unit}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-slate-800">
                      {item.current} {item.unit}
                    </div>
                    <div className="text-sm text-slate-600">
                      Previous: {item.previous} {item.unit}
                    </div>
                  </div>
                  <Badge className={`${isImproving ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isImproving ? 'Improving' : 'Needs Work'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Progress to Goal</span>
                    <span className="font-medium text-slate-800">
                      <Target className="w-4 h-4 inline mr-1" />
                      {item.target} {item.unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-orange-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 text-right">
                    {progress.toFixed(1)}% to goal
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly Progress Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800 font-['Manrope',Helvetica] flex items-center gap-2">
            <FaChartBar className="w-5 h-5" />
            Weekly Progress Overview
          </CardTitle>
          <p className="text-sm text-slate-600">
            {weeklyData.length > 0 ? 'Real data from your workouts' : 'Sample data - complete workouts to see real progress'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Weight Progress */}
            <div>
              <h4 className="font-medium text-slate-700 mb-3">Weight Trend</h4>
              <div className="flex items-end gap-2 h-32">
                {displayWeeklyData.map((week, index) => {
                  const maxWeight = Math.max(...displayWeeklyData.map(w => w.weight));
                  const minWeight = Math.min(...displayWeeklyData.map(w => w.weight));
                  const height = ((week.weight - minWeight) / (maxWeight - minWeight)) * 100 + 20;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs text-slate-600 font-medium">
                        {week.weight}kg
                      </div>
                      <div
                        className="w-full bg-orange-400 rounded-t transition-all duration-300 hover:bg-orange-500"
                        style={{ height: `${height}px` }}
                        title={`${week.week}: ${week.weight}kg`}
                      />
                      <div className="text-xs text-slate-500 text-center">
                        {week.week}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workout Frequency */}
            <div>
              <h4 className="font-medium text-slate-700 mb-3">Weekly Workouts</h4>
              <div className="flex items-end gap-2 h-24">
                {displayWeeklyData.map((week, index) => {
                  const height = (week.workouts / 5) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs text-slate-600 font-medium">
                        {week.workouts}
                      </div>
                      <div
                        className="w-full bg-cyan-400 rounded-t transition-all duration-300 hover:bg-cyan-500"
                        style={{ height: `${height}px` }}
                        title={`${week.week}: ${week.workouts} workouts`}
                      />
                      <div className="text-xs text-slate-500 text-center">
                        {week.week}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800 font-['Manrope',Helvetica] flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🏆</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-green-800">Lost 2.5kg this month!</div>
                <div className="text-sm text-green-600">Great progress towards your weight goal</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💪</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-orange-800">Increased bench press by 5kg</div>
                <div className="text-sm text-orange-600">Strength gains are showing!</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🏃</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-cyan-800">Improved 5K time by 2 minutes</div>
                <div className="text-sm text-cyan-600">Your cardio endurance is improving</div>
              </div>
            </div>

            {workouts.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg border border-violet-200">
                <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📈</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-violet-800">
                    Completed {workouts.filter(w => w.completed).length} workouts
                  </div>
                  <div className="text-sm text-violet-600">Keep up the consistency!</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
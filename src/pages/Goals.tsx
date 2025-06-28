import { FaPlus, FaEdit, FaTrash, FaBullseye, FaCheckCircle } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";

interface Goal {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  category: string;
  deadline: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// Predefined options for units
const UNIT_OPTIONS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lbs", label: "Pounds (lbs)" },
  { value: "km", label: "Kilometers (km)" },
  { value: "miles", label: "Miles" },
  { value: "minutes", label: "Minutes" },
  { value: "seconds", label: "Seconds" },
  { value: "hours", label: "Hours" },
  { value: "reps", label: "Repetitions" },
  { value: "sets", label: "Sets" },
  { value: "calories", label: "Calories" },
  { value: "steps", label: "Steps" },
  { value: "cm", label: "Centimeters (cm)" },
  { value: "inches", label: "Inches" },
  { value: "%", label: "Percentage (%)" },
  { value: "sessions", label: "Sessions" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
];

// Predefined options for categories
const CATEGORY_OPTIONS = [
  { value: "Weight Loss", label: "Weight Loss" },
  { value: "Weight Gain", label: "Weight Gain" },
  { value: "Strength", label: "Strength Training" },
  { value: "Cardio", label: "Cardiovascular" },
  { value: "Endurance", label: "Endurance" },
  { value: "Flexibility", label: "Flexibility" },
  { value: "Muscle Building", label: "Muscle Building" },
  { value: "Body Fat", label: "Body Fat Reduction" },
  { value: "Performance", label: "Performance" },
  { value: "Consistency", label: "Consistency" },
  { value: "Nutrition", label: "Nutrition" },
  { value: "General", label: "General Fitness" },
];

export const Goals = (): JSX.Element => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: "",
    description: "",
    target_value: 0,
    current_value: 0,
    unit: "",
    category: "",
    deadline: "",
  });

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        return;
      }

      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.target_value || !newGoal.deadline || !newGoal.unit || !newGoal.category || !user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: newGoal.title,
          description: newGoal.description || "",
          target_value: newGoal.target_value,
          current_value: newGoal.current_value || 0,
          unit: newGoal.unit,
          category: newGoal.category,
          deadline: newGoal.deadline,
          completed: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating goal:', error);
        alert('Failed to create goal: ' + error.message);
        return;
      }

      setGoals([data, ...goals]);
      setNewGoal({ 
        title: "", 
        description: "", 
        target_value: 0, 
        current_value: 0, 
        unit: "", 
        category: "", 
        deadline: "" 
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal');
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal(goal);
    setIsDialogOpen(true);
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal || !newGoal.title || !newGoal.target_value || !newGoal.deadline || !newGoal.unit || !newGoal.category) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .update({
          title: newGoal.title,
          description: newGoal.description,
          target_value: newGoal.target_value,
          current_value: newGoal.current_value,
          unit: newGoal.unit,
          category: newGoal.category,
          deadline: newGoal.deadline,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingGoal.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating goal:', error);
        alert('Failed to update goal: ' + error.message);
        return;
      }

      setGoals(goals.map(g => g.id === editingGoal.id ? data : g));
      setEditingGoal(null);
      setNewGoal({ 
        title: "", 
        description: "", 
        target_value: 0, 
        current_value: 0, 
        unit: "", 
        category: "", 
        deadline: "" 
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal: ' + error.message);
        return;
      }

      setGoals(goals.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal');
    }
  };

  const handleToggleComplete = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .update({ 
          completed: !goal.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating goal completion:', error);
        alert('Failed to update goal: ' + error.message);
        return;
      }

      setGoals(goals.map(g => g.id === id ? data : g));
    } catch (error) {
      console.error('Error updating goal completion:', error);
      alert('Failed to update goal');
    }
  };

  const getProgressPercentage = (goal: Goal) => {
    if (goal.category === "Weight Loss") {
      return Math.min((goal.current_value / goal.target_value) * 100, 100);
    }
    if (goal.category === "Cardio" && goal.unit === "minutes") {
      // For time-based goals, lower is better
      return Math.max(0, Math.min(((goal.current_value - goal.target_value) / goal.current_value) * 100 + 100, 100));
    }
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
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

  const isOverdue = (deadline: string, completed: boolean) => {
    return new Date(deadline) < new Date() && !completed;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-slate-600">Loading goals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-['Manrope',Helvetica]">
            Fitness Goals
          </h1>
          <p className="text-slate-600 mt-2">Set and track your fitness objectives</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <FaPlus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? "Edit Goal" : "Create New Goal"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  value={newGoal.title || ""}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Enter goal title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description || ""}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Describe your goal"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetValue">Target Value *</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={newGoal.target_value || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: parseFloat(e.target.value) || 0 })}
                    placeholder="Target"
                  />
                </div>
                <div>
                  <Label htmlFor="currentValue">Current Value</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    value={newGoal.current_value || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, current_value: parseFloat(e.target.value) || 0 })}
                    placeholder="Current"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <select
                    id="unit"
                    value={newGoal.unit || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select unit</option>
                    {UNIT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={newGoal.category || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline || ""}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingGoal ? handleUpdateGoal : handleCreateGoal}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  disabled={!newGoal.title || !newGoal.target_value || !newGoal.deadline || !newGoal.unit || !newGoal.category}
                >
                  {editingGoal ? "Update" : "Create"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingGoal(null);
                    setNewGoal({ 
                      title: "", 
                      description: "", 
                      target_value: 0, 
                      current_value: 0, 
                      unit: "", 
                      category: "", 
                      deadline: "" 
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = getProgressPercentage(goal);
          const overdue = isOverdue(goal.deadline, goal.completed);
          
          return (
            <Card key={goal.id} className={`hover:shadow-lg transition-shadow ${
              goal.completed ? 'bg-green-50 border-green-200' : 
              overdue ? 'bg-red-50 border-red-200' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`text-lg font-semibold font-['Manrope',Helvetica] ${
                      goal.completed ? 'text-green-800 line-through' : 'text-slate-800'
                    }`}>
                      {goal.title}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(goal.category)}>
                      {goal.category}
                    </Badge>
                    {goal.completed && (
                      <FaCheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">{goal.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-medium text-slate-800">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        goal.completed ? 'bg-green-500' : 
                        progress >= 100 ? 'bg-green-500' : 
                        progress >= 75 ? 'bg-orange-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 text-right">
                    {progress.toFixed(1)}% complete
                  </div>
                </div>

                {overdue && !goal.completed && (
                  <div className="p-2 bg-red-100 border border-red-200 rounded text-sm text-red-800">
                    ⚠️ This goal is overdue
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleComplete(goal.id)}
                    className={`flex-1 ${
                      goal.completed ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <FaCheckCircle className="w-4 h-4 mr-1" />
                    {goal.completed ? 'Completed' : 'Mark Complete'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditGoal(goal)}
                    className="px-3"
                  >
                    <FaEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <FaTrash className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <FaBullseye className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No goals set yet</h3>
          <p className="text-slate-500 mb-4">Create your first fitness goal to start tracking progress</p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Set Your First Goal
          </Button>
        </div>
      )}
    </div>
  );
};
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaClock } from "react-icons/fa";
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

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  completed: boolean;
  reminder: boolean;
  created_at: string;
  updated_at: string;
}

export const Schedule = (): JSX.Element => {
  const { user } = useAuth();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [error, setError] = useState<string>("");
  const [newItem, setNewItem] = useState<Partial<ScheduleItem>>({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 30,
    type: "General",
    completed: false,
    reminder: true,
  });

  useEffect(() => {
    if (user) {
      fetchScheduleItems();
    }
  }, [user]);

  const fetchScheduleItems = async () => {
    if (!user) {
      console.log('No user found, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      console.log('Fetching schedule items for user:', user.id);
      
      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Supabase error fetching schedule items:', error);
        setError(`Failed to load schedule items: ${error.message}`);
        return;
      }

      console.log('Successfully fetched schedule items:', data);
      setScheduleItems(data || []);
    } catch (error) {
      console.error('Unexpected error fetching schedule items:', error);
      setError('An unexpected error occurred while loading schedule items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.title?.trim() || !newItem.date || !newItem.time || !user) {
      setError('Please fill in all required fields (title, date, and time)');
      return;
    }

    try {
      setError("");
      console.log('Creating schedule item with data:', {
        user_id: user.id,
        title: newItem.title.trim(),
        description: newItem.description?.trim() || "",
        date: newItem.date,
        time: newItem.time,
        duration: newItem.duration || 30,
        type: newItem.type || "General",
        completed: false,
        reminder: newItem.reminder || false,
      });

      const { data, error } = await supabase
        .from('schedule_items')
        .insert({
          user_id: user.id,
          title: newItem.title.trim(),
          description: newItem.description?.trim() || "",
          date: newItem.date,
          time: newItem.time,
          duration: newItem.duration || 30,
          type: newItem.type || "General",
          completed: false,
          reminder: newItem.reminder || false,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating schedule item:', error);
        setError(`Failed to create schedule item: ${error.message}`);
        return;
      }

      console.log('Successfully created schedule item:', data);
      setScheduleItems([...scheduleItems, data]);
      
      // Reset form
      setNewItem({ 
        title: "", 
        description: "", 
        date: "", 
        time: "", 
        duration: 30, 
        type: "General", 
        completed: false, 
        reminder: true 
      });
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Unexpected error creating schedule item:', error);
      setError('An unexpected error occurred while creating the schedule item');
    }
  };

  const handleEditItem = (item: ScheduleItem) => {
    setEditingItem(item);
    setNewItem({
      ...item,
      // Ensure we have default values
      duration: item.duration || 30,
      type: item.type || "General",
      reminder: item.reminder || false
    });
    setError("");
    setIsDialogOpen(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !newItem.title?.trim() || !newItem.date || !newItem.time) {
      setError('Please fill in all required fields (title, date, and time)');
      return;
    }

    try {
      setError("");
      console.log('Updating schedule item:', editingItem.id, 'with data:', newItem);

      const { data, error } = await supabase
        .from('schedule_items')
        .update({
          title: newItem.title.trim(),
          description: newItem.description?.trim() || "",
          date: newItem.date,
          time: newItem.time,
          duration: newItem.duration || 30,
          type: newItem.type || "General",
          reminder: newItem.reminder || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingItem.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating schedule item:', error);
        setError(`Failed to update schedule item: ${error.message}`);
        return;
      }

      console.log('Successfully updated schedule item:', data);
      setScheduleItems(scheduleItems.map(item => item.id === editingItem.id ? data : item));
      
      // Reset form
      setEditingItem(null);
      setNewItem({ 
        title: "", 
        description: "", 
        date: "", 
        time: "", 
        duration: 30, 
        type: "General", 
        completed: false, 
        reminder: true 
      });
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Unexpected error updating schedule item:', error);
      setError('An unexpected error occurred while updating the schedule item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule item?')) return;

    try {
      setError("");
      console.log('Deleting schedule item:', id);

      const { error } = await supabase
        .from('schedule_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting schedule item:', error);
        setError(`Failed to delete schedule item: ${error.message}`);
        return;
      }

      console.log('Successfully deleted schedule item:', id);
      setScheduleItems(scheduleItems.filter(item => item.id !== id));
      
    } catch (error) {
      console.error('Unexpected error deleting schedule item:', error);
      setError('An unexpected error occurred while deleting the schedule item');
    }
  };

  const handleToggleComplete = async (id: string) => {
    const item = scheduleItems.find(item => item.id === id);
    if (!item) return;

    try {
      setError("");
      console.log('Toggling completion for schedule item:', id, 'current status:', item.completed);

      const { data, error } = await supabase
        .from('schedule_items')
        .update({ 
          completed: !item.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating schedule item completion:', error);
        setError(`Failed to update schedule item: ${error.message}`);
        return;
      }

      console.log('Successfully updated schedule item completion:', data);
      setScheduleItems(scheduleItems.map(item => item.id === id ? data : item));
      
    } catch (error) {
      console.error('Unexpected error updating schedule item completion:', error);
      setError('An unexpected error occurred while updating the schedule item');
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

  const isToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const isPast = (date: string, time: string) => {
    const itemDateTime = new Date(`${date}T${time}`);
    return itemDateTime < new Date();
  };

  const sortedItems = [...scheduleItems].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-slate-600">Loading schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-['Manrope',Helvetica]">
            My Schedule
          </h1>
          <p className="text-slate-600 mt-2">Plan and track your fitness activities</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <FaPlus className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Activity" : "Add New Activity"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="title">Activity Title *</Label>
                <Input
                  id="title"
                  value={newItem.title || ""}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Enter activity title"
                  className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description || ""}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Describe the activity"
                  className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newItem.date || ""}
                    onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                    className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newItem.time || ""}
                    onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                    className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="480"
                    value={newItem.duration || ""}
                    onChange={(e) => setNewItem({ ...newItem, duration: parseInt(e.target.value) || 30 })}
                    placeholder="30"
                    className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={newItem.type || "General"}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="General">General</option>
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={newItem.reminder || false}
                  onChange={(e) => setNewItem({ ...newItem, reminder: e.target.checked })}
                  className="rounded focus:ring-2 focus:ring-orange-500"
                />
                <Label htmlFor="reminder">Set reminder notification</Label>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm text-slate-600">
                  <strong>Preview:</strong> {newItem.title || 'Activity'} on {newItem.date || 'date'} at {newItem.time || 'time'} 
                  {newItem.duration && ` for ${newItem.duration} minutes`}
                </p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingItem ? handleUpdateItem : handleCreateItem}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  disabled={!newItem.title?.trim() || !newItem.date || !newItem.time}
                >
                  {editingItem ? "Update Activity" : "Add Activity"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingItem(null);
                    setError("");
                    setNewItem({ 
                      title: "", 
                      description: "", 
                      date: "", 
                      time: "", 
                      duration: 30, 
                      type: "General", 
                      completed: false, 
                      reminder: true 
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

      {/* Error Display */}
      {error && !isDialogOpen && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <Button
            onClick={() => setError("")}
            variant="outline"
            size="sm"
            className="mt-2 text-red-600 hover:text-red-700"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Database Connection Status */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-500 text-white">Database Status</Badge>
            <span className="text-sm text-blue-800">
              {scheduleItems.length > 0 ? `${scheduleItems.length} activities loaded` : 'Ready to add activities'}
            </span>
          </div>
          <p className="text-sm text-blue-700">
            Connected to schedule_items table. {!user && 'Please log in to manage your schedule.'}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.map((item) => {
          const past = isPast(item.date, item.time);
          const today = isToday(item.date);
          
          return (
            <Card key={item.id} className={`hover:shadow-lg transition-shadow ${
              item.completed ? 'bg-green-50 border-green-200' : 
              today ? 'bg-blue-50 border-blue-200' : 
              past ? 'bg-slate-50 border-slate-200' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`text-lg font-semibold font-['Manrope',Helvetica] ${
                      item.completed ? 'text-green-800 line-through' : 
                      past && !item.completed ? 'text-slate-500' : 'text-slate-800'
                    }`}>
                      {item.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <FaClock className="w-4 h-4 ml-2" />
                      <span>{item.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getTypeColor(item.type)}>
                      {item.type}
                    </Badge>
                    {today && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        Today
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.description && (
                  <p className="text-sm text-slate-600">{item.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <FaClock className="w-4 h-4" />
                    <span>{item.duration} min</span>
                  </div>
                  {item.reminder && (
                    <div className="flex items-center gap-1">
                      <span className="text-orange-500">🔔</span>
                      <span>Reminder set</span>
                    </div>
                  )}
                </div>

                {past && !item.completed && (
                  <div className="p-2 bg-yellow-100 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ This activity was scheduled in the past
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleComplete(item.id)}
                    className={`flex-1 ${
                      item.completed ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {item.completed ? '✓ Completed' : 'Mark Complete'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditItem(item)}
                    className="px-3"
                  >
                    <FaEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
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

      {scheduleItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaCalendarAlt className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No activities scheduled</h3>
          <p className="text-slate-500 mb-4">Add your first activity to start planning your fitness routine</p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Schedule Your First Activity
          </Button>
        </div>
      )}
    </div>
  );
};
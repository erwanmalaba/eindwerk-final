import { FaBell, FaCheck, FaTimes, FaClock, FaExclamationCircle, FaTrash } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "reminder" | "achievement" | "alert" | "info";
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  relatedId?: string; // ID of related workout, goal, etc.
  relatedType?: string; // 'workout', 'goal', 'schedule'
}

export const Notifications = (): JSX.Element => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateNotificationsFromAppData();
    }
  }, [user]);

  const generateNotificationsFromAppData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const generatedNotifications: Notification[] = [];

      // Get existing notifications from localStorage
      const existingNotifications = getStoredNotifications();
      const existingIds = new Set(existingNotifications.map(n => n.id));

      // 1. Check for overdue goals
      const { data: overdueGoals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .lt('deadline', new Date().toISOString().split('T')[0]);

      overdueGoals?.forEach(goal => {
        const notificationId = `goal-overdue-${goal.id}`;
        if (!existingIds.has(notificationId)) {
          generatedNotifications.push({
            id: notificationId,
            title: "Goal Deadline Passed",
            message: `Your goal "${goal.title}" was due on ${new Date(goal.deadline).toLocaleDateString()}. Don't give up - you can still achieve it!`,
            type: "alert",
            timestamp: new Date().toISOString(),
            read: false,
            actionRequired: true,
            relatedId: goal.id,
            relatedType: 'goal'
          });
        }
      });

      // 2. Check for goals approaching deadline (within 3 days)
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const { data: approachingGoals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .gte('deadline', new Date().toISOString().split('T')[0])
        .lte('deadline', threeDaysFromNow.toISOString().split('T')[0]);

      approachingGoals?.forEach(goal => {
        const notificationId = `goal-approaching-${goal.id}`;
        if (!existingIds.has(notificationId)) {
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          generatedNotifications.push({
            id: notificationId,
            title: "Goal Deadline Approaching",
            message: `Your goal "${goal.title}" is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. You're ${((goal.current_value / goal.target_value) * 100).toFixed(1)}% complete!`,
            type: "reminder",
            timestamp: new Date().toISOString(),
            read: false,
            actionRequired: true,
            relatedId: goal.id,
            relatedType: 'goal'
          });
        }
      });

      // 3. Check for completed goals (achievements)
      const { data: recentCompletedGoals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

      recentCompletedGoals?.forEach(goal => {
        const notificationId = `goal-completed-${goal.id}`;
        if (!existingIds.has(notificationId)) {
          generatedNotifications.push({
            id: notificationId,
            title: "Goal Achievement! 🎉",
            message: `Congratulations! You've completed your goal "${goal.title}". Keep up the great work!`,
            type: "achievement",
            timestamp: goal.updated_at,
            read: false,
            relatedId: goal.id,
            relatedType: 'goal'
          });
        }
      });

      // 4. Check for upcoming scheduled activities (today and tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const { data: upcomingSchedule } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .gte('date', new Date().toISOString().split('T')[0])
        .lte('date', tomorrow.toISOString().split('T')[0]);

      upcomingSchedule?.forEach(item => {
        const notificationId = `schedule-reminder-${item.id}`;
        if (!existingIds.has(notificationId)) {
          const isToday = item.date === new Date().toISOString().split('T')[0];
          const timeStr = new Date(`2000-01-01T${item.time}`).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          });
          
          generatedNotifications.push({
            id: notificationId,
            title: `${isToday ? 'Today' : 'Tomorrow'}'s Activity Reminder`,
            message: `Don't forget: "${item.title}" scheduled for ${isToday ? 'today' : 'tomorrow'} at ${timeStr}`,
            type: "reminder",
            timestamp: new Date().toISOString(),
            read: false,
            actionRequired: true,
            relatedId: item.id,
            relatedType: 'schedule'
          });
        }
      });

      // 5. Check for workout streaks and achievements
      const { data: recentWorkouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (recentWorkouts && recentWorkouts.length >= 3) {
        const notificationId = `workout-streak-${recentWorkouts[0].id}`;
        if (!existingIds.has(notificationId)) {
          generatedNotifications.push({
            id: notificationId,
            title: "Workout Streak! 🔥",
            message: `Amazing! You've completed ${recentWorkouts.length} workouts this week. You're on fire!`,
            type: "achievement",
            timestamp: new Date().toISOString(),
            read: false,
            relatedType: 'workout'
          });
        }
      }

      // 6. Hydration reminder (if no workouts today)
      const today = new Date().toISOString().split('T')[0];
      const { data: todayWorkouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      if (!todayWorkouts || todayWorkouts.length === 0) {
        const notificationId = `hydration-reminder-${today}`;
        if (!existingIds.has(notificationId)) {
          generatedNotifications.push({
            id: notificationId,
            title: "Stay Hydrated! 💧",
            message: "Don't forget to drink water throughout the day. Proper hydration is key to your fitness goals!",
            type: "info",
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      }

      // Combine existing and new notifications, sort by timestamp
      const allNotifications = [...existingNotifications, ...generatedNotifications]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setNotifications(allNotifications);
      
      // Store updated notifications
      if (generatedNotifications.length > 0) {
        storeNotifications(allNotifications);
      }

    } catch (error) {
      console.error('Error generating notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStoredNotifications = (): Notification[] => {
    try {
      const stored = localStorage.getItem(`notifications_${user?.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const storeNotifications = (notifications: Notification[]) => {
    try {
      localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing notifications:', error);
    }
  };

  const handleMarkAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    storeNotifications(updatedNotifications);
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    storeNotifications(updatedNotifications);
  };

  const handleDeleteNotification = (id: string) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    setNotifications(updatedNotifications);
    storeNotifications(updatedNotifications);
  };

  const handleClearAllNotifications = () => {
    if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      setNotifications([]);
      storeNotifications([]);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <FaClock className="w-5 h-5 text-orange-500" />;
      case "achievement":
        return <span className="text-lg">🏆</span>;
      case "alert":
        return <FaExclamationCircle className="w-5 h-5 text-red-500" />;
      case "info":
        return <FaBell className="w-5 h-5 text-cyan-500" />;
      default:
        return <FaBell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "reminder":
        return "bg-orange-100 text-orange-800";
      case "achievement":
        return "bg-green-100 text-green-800";
      case "alert":
        return "bg-red-100 text-red-800";
      case "info":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-slate-600">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 font-['Manrope',Helvetica] flex items-center gap-2 sm:gap-3">
            <FaBell className="w-6 h-6 sm:w-8 sm:h-8" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">Stay updated with your fitness journey</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="text-slate-600 hover:text-slate-800 w-full sm:w-auto"
            >
              <FaCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              onClick={handleClearAllNotifications}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
            >
              <FaTrash className="w-4 h-4 mr-2" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Data Source Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-500 text-white">Live Data</Badge>
            <span className="text-sm text-blue-800">
              {notifications.length} notifications from your app activity
            </span>
          </div>
          <p className="text-sm text-blue-700">
            Notifications are generated from your goals, workouts, and schedule. They persist across sessions.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3 sm:space-y-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`hover:shadow-lg transition-shadow ${
              !notification.read ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className={`font-semibold text-slate-800 font-['Manrope',Helvetica] text-sm sm:text-base ${
                          !notification.read ? 'font-bold' : ''
                        }`}>
                          {notification.title}
                        </h3>
                        <Badge className={getNotificationColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        {notification.actionRequired && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Action Required
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-slate-600 text-sm mb-2 break-words">
                        {notification.message}
                      </p>
                      
                      <div className="text-xs text-slate-500">
                        {formatTimestamp(notification.timestamp)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs"
                        >
                          <FaCheck className="w-3 h-3 mr-1" />
                          Mark read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <FaTimes className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {notification.actionRequired && !notification.read && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaExclamationCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800 font-medium">
                          This notification requires your attention
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <FaBell className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No notifications</h3>
          <p className="text-slate-500 text-sm sm:text-base">You're all caught up! New notifications will appear here based on your app activity.</p>
        </div>
      )}
    </div>
  );
};
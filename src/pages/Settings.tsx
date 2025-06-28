import { FaCog, FaBell, FaUser, FaPalette, FaCamera, FaTrash, FaKey, FaUserTimes, FaSave, FaUndo } from "react-icons/fa";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { uploadProfilePicture, deleteProfilePicture } from "../lib/storage";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

interface AppSettings {
  // Notification Settings
  workoutReminders: boolean;
  goalDeadlines: boolean;
  achievementAlerts: boolean;
  weeklyReports: boolean;
  
  // App Preferences
  darkMode: boolean;
  units: "metric" | "imperial";
  language: string;
  
  // Privacy Settings
  profileVisibility: "public" | "private";
  dataSharing: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  workoutReminders: true,
  goalDeadlines: true,
  achievementAlerts: true,
  weeklyReports: false,
  darkMode: false,
  units: "metric",
  language: "en",
  profileVisibility: "private",
  dataSharing: false,
};

export const Settings = (): JSX.Element => {
  const { user, profile, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string>("");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    loadSettings();
  }, [user]);

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const loadSettings = () => {
    if (!user) return;
    
    try {
      const storedSettings = localStorage.getItem(`app_settings_${user.id}`);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Save to localStorage
      localStorage.setItem(`app_settings_${user.id}`, JSON.stringify(settings));
      
      // Apply dark mode immediately
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      setHasUnsavedChanges(false);
      
      // Show success message
      alert('Settings saved successfully!');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      setSettings(DEFAULT_SETTINGS);
      setHasUnsavedChanges(true);
    }
  };

  const handleSettingChange = <K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    setImageError("");

    try {
      const result = await uploadProfilePicture(user.id, file);
      
      if (result.error) {
        setImageError(result.error.message);
      } else if (result.data) {
        // Update profile with new avatar URL
        const { error } = await updateProfile({
          avatar_url: result.data.publicUrl
        });
        
        if (error) {
          setImageError("Failed to update profile picture");
        } else {
          alert('Profile picture updated successfully!');
        }
      }
    } catch (error) {
      setImageError("Failed to upload image");
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!user || !profile?.avatar_url) return;

    if (!confirm("Are you sure you want to remove your profile picture?")) return;

    setUploadingImage(true);
    setImageError("");

    try {
      const { error: deleteError } = await deleteProfilePicture(user.id);
      
      if (deleteError) {
        setImageError("Failed to delete image");
      } else {
        // Update profile to remove avatar URL
        const { error } = await updateProfile({
          avatar_url: null
        });
        
        if (error) {
          setImageError("Failed to update profile");
        } else {
          alert('Profile picture removed successfully!');
        }
      }
    } catch (error) {
      setImageError("Failed to remove image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    try {
      // This would integrate with Supabase auth to change password
      alert('Password change functionality would be implemented here with Supabase Auth');
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      alert('Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = 'DELETE';
    const userInput = prompt(
      `This action cannot be undone. All your data will be permanently deleted.\n\nType "${confirmText}" to confirm account deletion:`
    );

    if (userInput !== confirmText) {
      alert('Account deletion cancelled');
      return;
    }

    try {
      // This would integrate with Supabase to delete user account and all data
      alert('Account deletion functionality would be implemented here with proper data cleanup');
      setShowDeleteAccount(false);
    } catch (error) {
      alert('Failed to delete account');
    }
  };

  const getStorageInfo = () => {
    if (!user) return { used: 0, total: 0 };
    
    // Calculate approximate storage usage
    const settingsSize = JSON.stringify(settings).length;
    const profileSize = JSON.stringify(profile || {}).length;
    const notificationsSize = localStorage.getItem(`notifications_${user.id}`)?.length || 0;
    
    const totalUsed = settingsSize + profileSize + notificationsSize;
    const totalAvailable = 5 * 1024 * 1024; // 5MB localStorage limit
    
    return {
      used: Math.round(totalUsed / 1024), // KB
      total: Math.round(totalAvailable / 1024), // KB
      percentage: Math.round((totalUsed / totalAvailable) * 100)
    };
  };

  const storageInfo = getStorageInfo();

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 font-['Manrope',Helvetica] flex items-center gap-2 sm:gap-3">
            <FaCog className="w-6 h-6 sm:w-8 sm:h-8" />
            Settings
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">Customize your fitness app experience</p>
        </div>
        
        {hasUnsavedChanges && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <FaSave className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={loadSettings}
              variant="outline"
              className="text-slate-600"
            >
              <FaUndo className="w-4 h-4 mr-2" />
              Discard
            </Button>
          </div>
        )}
      </div>

      {/* Settings Status */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-500 text-white">Settings Status</Badge>
            <span className="text-sm text-blue-800">
              {hasUnsavedChanges ? 'Unsaved changes' : 'All settings saved'}
            </span>
          </div>
          <p className="text-sm text-blue-700">
            Settings are stored locally in your browser and persist across sessions. 
            Dark mode: {settings.darkMode ? 'Enabled' : 'Disabled'} • 
            Storage used: {storageInfo.used}KB / {storageInfo.total}KB ({storageInfo.percentage}%)
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Profile Picture Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 font-['Manrope',Helvetica] flex items-center gap-2">
              <FaUser className="w-5 h-5" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={profile?.avatar_url || "..//avatar-w--photo.png"} 
                    alt="Profile picture" 
                  />
                </Avatar>
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <FaCamera className="w-4 h-4 mr-2" />
                    {profile?.avatar_url ? 'Change Picture' : 'Upload Picture'}
                  </Button>
                  
                  {profile?.avatar_url && (
                    <Button
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <FaTrash className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                
                <p className="text-sm text-slate-600">
                  Upload a profile picture. Recommended size: 400x400px. Max file size: 5MB.
                  Supported formats: JPEG, PNG, WebP.
                </p>
                
                {imageError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{imageError}</p>
                  </div>
                )}
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 font-['Manrope',Helvetica] flex items-center gap-2">
              <FaBell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Workout Reminders</Label>
                <p className="text-xs text-slate-600">Get notified before scheduled workouts</p>
              </div>
              <Switch
                checked={settings.workoutReminders}
                onCheckedChange={(checked) => handleSettingChange('workoutReminders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Goal Deadlines</Label>
                <p className="text-xs text-slate-600">Alerts when goals are approaching deadline</p>
              </div>
              <Switch
                checked={settings.goalDeadlines}
                onCheckedChange={(checked) => handleSettingChange('goalDeadlines', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Achievement Alerts</Label>
                <p className="text-xs text-slate-600">Celebrate when you reach milestones</p>
              </div>
              <Switch
                checked={settings.achievementAlerts}
                onCheckedChange={(checked) => handleSettingChange('achievementAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Weekly Reports</Label>
                <p className="text-xs text-slate-600">Receive weekly progress summaries</p>
              </div>
              <Switch
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 font-['Manrope',Helvetica] flex items-center gap-2">
              <FaPalette className="w-5 h-5" />
              App Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Dark Mode</Label>
                <p className="text-xs text-slate-600">Use dark theme for the app</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Units</Label>
              <select
                value={settings.units}
                onChange={(e) => handleSettingChange('units', e.target.value as 'metric' | 'imperial')}
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="metric">Metric (kg, cm)</option>
                <option value="imperial">Imperial (lbs, ft)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Language</Label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Profile Visibility</Label>
              <select
                value={settings.profileVisibility}
                onChange={(e) => handleSettingChange('profileVisibility', e.target.value as 'public' | 'private')}
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Data Sharing</Label>
                <p className="text-xs text-slate-600">Share anonymous usage data to improve the app</p>
              </div>
              <Switch
                checked={settings.dataSharing}
                onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 font-['Manrope',Helvetica] flex items-center gap-2">
              <FaUser className="w-5 h-5" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Button
                onClick={saveSettings}
                disabled={!hasUnsavedChanges || saving}
                className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
              >
                <FaSave className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save All Settings'}
              </Button>
              
              <Button
                onClick={resetSettings}
                variant="outline"
                className="text-slate-600 hover:text-slate-800"
              >
                <FaUndo className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              
              <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                  >
                    <FaKey className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleChangePassword}
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                      >
                        Change Password
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowChangePassword(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <FaUserTimes className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">⚠️ Warning</h4>
                      <p className="text-sm text-red-700">
                        This action cannot be undone. All your data including:
                      </p>
                      <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                        <li>Profile information</li>
                        <li>Workout history</li>
                        <li>Goals and progress</li>
                        <li>Schedule items</li>
                        <li>Settings and preferences</li>
                      </ul>
                      <p className="text-sm text-red-700 mt-2">
                        will be permanently deleted.
                      </p>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleDeleteAccount}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                      >
                        I Understand, Delete Account
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteAccount(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Storage Information */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-700 mb-2">Data Storage</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Local Storage Used:</span>
                  <span>{storageInfo.used}KB / {storageInfo.total}KB</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  Settings, notifications, and preferences are stored locally in your browser.
                  Profile data and fitness records are stored securely in the cloud.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
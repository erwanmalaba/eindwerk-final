import { FaUser, FaEdit, FaCamera, FaSave } from "react-icons/fa";
import React, { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { uploadProfilePicture, deleteProfilePicture } from "../lib/storage";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";

export const Profile = (): JSX.Element => {
  const { user, profile, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string>("");
  const [editedProfile, setEditedProfile] = useState(profile || {
    id: "",
    email: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "male",
    height: 0,
    weight: 0,
    fitness_level: "beginner",
    bio: "",
    avatar_url: "",
    created_at: "",
    updated_at: "",
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile || editedProfile);
  };

  const handleSave = async () => {
    if (!editedProfile.first_name || !editedProfile.last_name) {
      alert("Please fill in required fields");
      return;
    }

    const { error } = await updateProfile({
      first_name: editedProfile.first_name,
      last_name: editedProfile.last_name,
      date_of_birth: editedProfile.date_of_birth,
      gender: editedProfile.gender as any,
      height: editedProfile.height,
      weight: editedProfile.weight,
      fitness_level: editedProfile.fitness_level as any,
      bio: editedProfile.bio,
    });

    if (error) {
      alert("Failed to update profile: " + error.message);
    } else {
      setIsEditing(false);
      alert("Profile updated successfully!");
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || editedProfile);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
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

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi === 0) return { category: "N/A", color: "bg-slate-100 text-slate-800" };
    if (bmi < 18.5) return { category: "Underweight", color: "bg-blue-100 text-blue-800" };
    if (bmi < 25) return { category: "Normal", color: "bg-green-100 text-green-800" };
    if (bmi < 30) return { category: "Overweight", color: "bg-yellow-100 text-yellow-800" };
    return { category: "Obese", color: "bg-red-100 text-red-800" };
  };

  const currentProfile = isEditing ? editedProfile : profile;
  if (!currentProfile) return <div>Loading...</div>;

  const age = calculateAge(currentProfile.date_of_birth || "");
  const bmi = calculateBMI(currentProfile.weight || 0, currentProfile.height || 0);
  const bmiInfo = getBMICategory(bmi);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-['Manrope',Helvetica] flex items-center gap-3">
            <FaUser className="w-8 h-8" />
            My Profile
          </h1>
          <p className="text-slate-600 mt-2">Manage your personal information and fitness details</p>
        </div>
        {!isEditing ? (
          <Button
            onClick={handleEdit}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <FaEdit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <FaSave className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg">
                <AvatarImage 
                  src={currentProfile.avatar_url || "..//avatar-w--photo.png"} 
                  alt="Profile picture" 
                />
              </Avatar>
              {uploadingImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-orange-500 hover:bg-orange-600"
              >
                <FaCamera className="w-4 h-4" />
              </Button>
            </div>
            <CardTitle className="text-xl font-semibold text-slate-800 font-['Manrope',Helvetica] mt-4">
              {currentProfile.first_name} {currentProfile.last_name}
            </CardTitle>
            <p className="text-slate-600 text-sm">
              Member since {currentProfile.created_at ? new Date(currentProfile.created_at).toLocaleDateString() : 'N/A'}
            </p>
            
            {imageError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800 mt-2">
                {imageError}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-slate-800">{age || 'N/A'}</div>
                  <div className="text-slate-600">Years Old</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-slate-800">{currentProfile.height || 'N/A'}cm</div>
                  <div className="text-slate-600">Height</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-slate-800">{currentProfile.weight || 'N/A'}kg</div>
                  <div className="text-slate-600">Weight</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-slate-800">{bmi ? bmi.toFixed(1) : 'N/A'}</div>
                  <div className="text-slate-600">BMI</div>
                </div>
              </div>
              
              <div className="mt-4">
                <Badge className={bmiInfo.color}>
                  {bmiInfo.category}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-700 mb-2">Fitness Level</h4>
              <Badge className="bg-cyan-100 text-cyan-800 capitalize">
                {currentProfile.fitness_level || 'Not set'}
              </Badge>
            </div>
          </CardContent>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 font-['Manrope',Helvetica]">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={currentProfile.first_name || ""}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-slate-50" : ""}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={currentProfile.last_name || ""}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-slate-50" : ""}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={currentProfile.email || ""}
                disabled={true}
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={currentProfile.date_of_birth || ""}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-slate-50" : ""}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={currentProfile.gender || "male"}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full p-2 border border-slate-300 rounded-md text-sm ${
                    !isEditing ? "bg-slate-50" : ""
                  }`}
                >
                  <option value="male">Man</option>
                  <option value="female">Woman</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={currentProfile.height || ""}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-slate-50" : ""}
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={currentProfile.weight || ""}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-slate-50" : ""}
                />
              </div>
              <div>
                <Label htmlFor="fitnessLevel">Fitness Level</Label>
                <select
                  id="fitnessLevel"
                  value={currentProfile.fitness_level || "beginner"}
                  onChange={(e) => handleInputChange('fitness_level', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full p-2 border border-slate-300 rounded-md text-sm ${
                    !isEditing ? "bg-slate-50" : ""
                  }`}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={currentProfile.bio || ""}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-slate-50" : ""}
                rows={3}
                placeholder="Tell us about yourself and your fitness journey..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
import { FaPlus, FaEdit, FaTrash, FaClock, FaDumbbell, FaCheckCircle, FaTimes } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase, MUSCLE_GROUPS, MuscleGroup } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";

interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  exercises: Exercise[];
  muscle_group: MuscleGroup;
  completed: boolean;
  notes?: string;
}

export const Workout = (): JSX.Element => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | null>(null);
  const [newWorkout, setNewWorkout] = useState<Partial<Workout>>({
    name: "",
    date: "",
    duration: 0,
    muscle_group: "chest",
    exercises: [],
    notes: "",
  });

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (workoutsError) {
        console.error('Error fetching workouts:', workoutsError);
        return;
      }

      // Fetch exercises for each workout
      const workoutsWithExercises = await Promise.all(
        (workoutsData || []).map(async (workout) => {
          const { data: exercisesData, error: exercisesError } = await supabase
            .from('exercises')
            .select('*')
            .eq('workout_id', workout.id);

          if (exercisesError) {
            console.error('Error fetching exercises:', exercisesError);
            return {
              ...workout,
              exercises: [],
              muscle_group: workout.category.toLowerCase() as MuscleGroup
            };
          }

          return {
            ...workout,
            exercises: exercisesData || [],
            muscle_group: workout.category.toLowerCase() as MuscleGroup
          };
        })
      );

      setWorkouts(workoutsWithExercises);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkout = async () => {
    if (!newWorkout.name || !newWorkout.date || !newWorkout.muscle_group || !user) return;

    try {
      // Calculate estimated duration based on exercises
      const estimatedDuration = (newWorkout.exercises?.length || 0) * 10; // 10 minutes per exercise

      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: newWorkout.name,
          date: newWorkout.date,
          duration: estimatedDuration,
          category: MUSCLE_GROUPS[newWorkout.muscle_group].name,
          notes: newWorkout.notes || "",
          completed: false
        })
        .select()
        .single();

      if (workoutError) {
        console.error('Error creating workout:', workoutError);
        alert('Failed to create workout: ' + workoutError.message);
        return;
      }

      // Insert exercises
      if (newWorkout.exercises && newWorkout.exercises.length > 0) {
        const exercisesToInsert = newWorkout.exercises.map(exercise => ({
          workout_id: workoutData.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          notes: exercise.notes
        }));

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercisesToInsert);

        if (exercisesError) {
          console.error('Error creating exercises:', exercisesError);
        }
      }

      // Refresh workouts
      await fetchWorkouts();
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error creating workout:', error);
      alert('Failed to create workout');
    }
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setNewWorkout({
      name: workout.name,
      date: workout.date,
      duration: workout.duration,
      muscle_group: workout.muscle_group,
      exercises: [...workout.exercises], // Create a copy of exercises
      notes: workout.notes || "",
    });
    setSelectedMuscleGroup(workout.muscle_group);
    setIsDialogOpen(true);
  };

  const handleUpdateWorkout = async () => {
    if (!editingWorkout || !newWorkout.name || !newWorkout.date || !newWorkout.muscle_group || !user) return;

    try {
      // Calculate estimated duration based on exercises
      const estimatedDuration = (newWorkout.exercises?.length || 0) * 10;

      // Update workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({
          name: newWorkout.name,
          date: newWorkout.date,
          duration: estimatedDuration,
          category: MUSCLE_GROUPS[newWorkout.muscle_group].name,
          notes: newWorkout.notes || "",
          updated_at: new Date().toISOString()
        })
        .eq('id', editingWorkout.id);

      if (workoutError) {
        console.error('Error updating workout:', workoutError);
        alert('Failed to update workout: ' + workoutError.message);
        return;
      }

      // Delete existing exercises
      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .eq('workout_id', editingWorkout.id);

      if (deleteError) {
        console.error('Error deleting old exercises:', deleteError);
      }

      // Insert new exercises
      if (newWorkout.exercises && newWorkout.exercises.length > 0) {
        const exercisesToInsert = newWorkout.exercises.map(exercise => ({
          workout_id: editingWorkout.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          notes: exercise.notes
        }));

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercisesToInsert);

        if (exercisesError) {
          console.error('Error updating exercises:', exercisesError);
        }
      }

      // Refresh workouts
      await fetchWorkouts();
      
      // Reset form
      resetForm();
      alert('Workout updated successfully!');
    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Failed to update workout');
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting workout:', error);
        alert('Failed to delete workout: ' + error.message);
        return;
      }

      setWorkouts(workouts.filter((w) => w.id !== id));
      alert('Workout deleted successfully!');
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout');
    }
  };

  const handleToggleComplete = async (id: string) => {
    const workout = workouts.find(w => w.id === id);
    if (!workout) return;

    try {
      const { error } = await supabase
        .from('workouts')
        .update({ completed: !workout.completed })
        .eq('id', id);

      if (error) {
        console.error('Error updating workout completion:', error);
        alert('Failed to update workout: ' + error.message);
        return;
      }

      setWorkouts(workouts.map((w) => 
        w.id === id ? { ...w, completed: !w.completed } : w
      ));
    } catch (error) {
      console.error('Error updating workout completion:', error);
      alert('Failed to update workout');
    }
  };

  const addExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      name: exerciseName,
      sets: 3,
      reps: 10,
      weight: 0,
      notes: ""
    };

    setNewWorkout(prev => ({
      ...prev,
      exercises: [...(prev.exercises || []), newExercise]
    }));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises?.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      ) || []
    }));
  };

  const removeExercise = (index: number) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises?.filter((_, i) => i !== index) || []
    }));
  };

  const resetForm = () => {
    setNewWorkout({ 
      name: "", 
      date: "", 
      duration: 0, 
      muscle_group: "chest", 
      exercises: [], 
      notes: "" 
    });
    setSelectedMuscleGroup(null);
    setEditingWorkout(null);
    setIsDialogOpen(false);
  };

  const getMuscleGroupInfo = (muscleGroup: MuscleGroup) => {
    return MUSCLE_GROUPS[muscleGroup] || MUSCLE_GROUPS.chest;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-slate-600">Loading workouts...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 font-['Manrope',Helvetica]">
            Workout Plans
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">Create muscle-specific workouts with detailed exercises</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto">
              <FaPlus className="w-4 h-4 mr-2" />
              Create Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkout ? "Edit Workout" : "Create New Workout"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Workout Name</Label>
                  <Input
                    id="name"
                    value={newWorkout.name || ""}
                    onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                    placeholder="e.g., Chest Day, Leg Blast"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newWorkout.date || ""}
                    onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
                  />
                </div>
              </div>

              {/* Muscle Group Selection */}
              <div>
                <Label>Target Muscle Group</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-2">
                  {Object.entries(MUSCLE_GROUPS).map(([key, group]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={newWorkout.muscle_group === key ? "default" : "outline"}
                      className={`p-3 sm:p-4 h-auto flex flex-col items-center gap-2 text-xs sm:text-sm ${
                        newWorkout.muscle_group === key ? group.color + ' text-white' : ''
                      }`}
                      onClick={() => {
                        setNewWorkout({ ...newWorkout, muscle_group: key as MuscleGroup });
                        setSelectedMuscleGroup(key as MuscleGroup);
                      }}
                    >
                      <span className="text-lg sm:text-2xl">{group.icon}</span>
                      <span className="font-medium text-center">{group.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Exercise Selection */}
              {selectedMuscleGroup && (
                <div>
                  <Label>Available Exercises for {MUSCLE_GROUPS[selectedMuscleGroup].name}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                    {MUSCLE_GROUPS[selectedMuscleGroup].exercises.map((exercise) => (
                      <Button
                        key={exercise}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addExercise(exercise)}
                        className="text-left justify-start text-xs sm:text-sm"
                      >
                        <FaPlus className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{exercise}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Exercises */}
              {newWorkout.exercises && newWorkout.exercises.length > 0 && (
                <div>
                  <Label>Selected Exercises ({newWorkout.exercises.length})</Label>
                  <div className="space-y-3 mt-2">
                    {newWorkout.exercises.map((exercise, index) => (
                      <Card key={index} className="p-3 sm:p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-slate-800 text-sm sm:text-base truncate flex-1">{exercise.name}</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeExercise(index)}
                              className="text-red-600 hover:text-red-700 ml-2 flex-shrink-0"
                            >
                              <FaTimes className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <div>
                              <Label className="text-xs">Sets</Label>
                              <Input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                                min="1"
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Reps</Label>
                              <Input
                                type="number"
                                value={exercise.reps}
                                onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                                min="1"
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Weight (kg)</Label>
                              <Input
                                type="number"
                                value={exercise.weight || ""}
                                onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.5"
                                className="h-8"
                                placeholder="Optional"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Notes</Label>
                            <Input
                              value={exercise.notes || ""}
                              onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                              placeholder="Form cues, rest time, etc."
                              className="h-8"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Workout Notes</Label>
                <Textarea
                  id="notes"
                  value={newWorkout.notes || ""}
                  onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                  placeholder="Overall workout notes, goals, etc."
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  onClick={editingWorkout ? handleUpdateWorkout : handleCreateWorkout}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  disabled={!newWorkout.name || !newWorkout.date || !newWorkout.muscle_group}
                >
                  {editingWorkout ? "Update Workout" : "Create Workout"}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {workouts.map((workout) => {
          const muscleInfo = getMuscleGroupInfo(workout.muscle_group);
          
          return (
            <Card key={workout.id} className={`hover:shadow-lg transition-shadow ${
              workout.completed ? 'bg-green-50 border-green-200' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className={`text-base sm:text-lg font-semibold font-['Manrope',Helvetica] truncate ${
                      workout.completed ? 'text-green-800 line-through' : 'text-slate-800'
                    }`}>
                      {workout.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {new Date(workout.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge className={`${muscleInfo.color} text-white text-xs`}>
                      <span className="mr-1">{muscleInfo.icon}</span>
                      <span className="hidden sm:inline">{muscleInfo.name}</span>
                    </Badge>
                    {workout.completed && (
                      <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <FaClock className="w-4 h-4" />
                    <span>{workout.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaDumbbell className="w-4 h-4" />
                    <span>{workout.exercises?.length || 0} exercises</span>
                  </div>
                </div>

                {/* Exercise List */}
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-700">Exercises:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {workout.exercises.map((exercise, index) => (
                        <div key={index} className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                          <div className="font-medium truncate">{exercise.name}</div>
                          <div className="text-slate-500">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight && ` @ ${exercise.weight}kg`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workout.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700 break-words">{workout.notes}</p>
                  </div>
                )}

                {workout.completed && (
                  <div className="p-2 bg-green-100 border border-green-200 rounded text-sm text-green-800">
                    ✅ Workout completed!
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleComplete(workout.id)}
                    className={`flex-1 ${
                      workout.completed 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <FaCheckCircle className="w-4 h-4 mr-1" />
                    {workout.completed ? 'Completed' : 'Complete'}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditWorkout(workout)}
                      className="px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Edit workout"
                    >
                      <FaEdit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete workout"
                    >
                      <FaTrash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {workouts.length === 0 && (
        <div className="text-center py-12">
          <FaDumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No workouts yet</h3>
          <p className="text-slate-500 mb-4 text-sm sm:text-base">Create your first muscle-specific workout plan</p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Create Your First Workout
          </Button>
        </div>
      )}
    </div>
  );
};
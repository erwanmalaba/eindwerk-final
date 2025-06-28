import { FaPlus, FaEdit, FaTrash, FaClock, FaDumbbell, FaCheckCircle, FaTimes } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { MUSCLE_GROUPS, MuscleGroup } from "../lib/supabase";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { 
  fetchWorkouts, 
  createWorkout, 
  updateWorkoutCompletion, 
  deleteWorkout,
  optimisticToggleCompletion,
  clearError,
  Exercise
} from "../store/slices/workoutSlice";
import { addNotification } from "../store/slices/uiSlice";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";

interface NewWorkout {
  name: string;
  date: string;
  muscle_group: MuscleGroup;
  exercises: Exercise[];
  notes: string;
}

export const WorkoutRedux = (): JSX.Element => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { workouts, loading, error } = useAppSelector((state) => state.workouts);
  
  // Local state for form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | null>(null);
  const [newWorkout, setNewWorkout] = useState<NewWorkout>({
    name: "",
    date: "",
    muscle_group: "chest",
    exercises: [],
    notes: "",
  });

  useEffect(() => {
    if (user) {
      dispatch(fetchWorkouts(user.id));
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

  const handleCreateWorkout = async () => {
    if (!newWorkout.name || !newWorkout.date || !newWorkout.muscle_group || !user) return;

    try {
      await dispatch(createWorkout({
        userId: user.id,
        workoutData: {
          name: newWorkout.name,
          date: newWorkout.date,
          duration: 0, // Will be calculated in the thunk
          exercises: newWorkout.exercises,
          muscle_group: newWorkout.muscle_group,
          completed: false,
          notes: newWorkout.notes,
        }
      })).unwrap();

      dispatch(addNotification({
        type: 'success',
        message: 'Workout created successfully!'
      }));

      // Reset form
      setNewWorkout({ 
        name: "", 
        date: "", 
        muscle_group: "chest", 
        exercises: [], 
        notes: "" 
      });
      setSelectedMuscleGroup(null);
      setIsDialogOpen(false);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to create workout'
      }));
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    try {
      await dispatch(deleteWorkout(id)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Workout deleted successfully!'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to delete workout'
      }));
    }
  };

  const handleToggleComplete = async (id: string) => {
    const workout = workouts.find(w => w.id === id);
    if (!workout) return;

    // Optimistic update for better UX
    dispatch(optimisticToggleCompletion(id));

    try {
      await dispatch(updateWorkoutCompletion({
        workoutId: id,
        completed: !workout.completed
      })).unwrap();

      dispatch(addNotification({
        type: 'success',
        message: workout.completed ? 'Workout marked as incomplete' : 'Workout completed! 🎉'
      }));
    } catch (error) {
      // Revert optimistic update on error
      dispatch(optimisticToggleCompletion(id));
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update workout status'
      }));
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
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const removeExercise = (index: number) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const getMuscleGroupInfo = (muscleGroup: string) => {
    return MUSCLE_GROUPS[muscleGroup as MuscleGroup] || MUSCLE_GROUPS.chest;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-slate-600">Loading workouts with Redux...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-['Manrope',Helvetica]">
            Workout Plans (Redux)
          </h1>
          <p className="text-slate-600 mt-2">
            Create muscle-specific workouts with Redux state management
          </p>
          <Badge className="mt-2 bg-blue-100 text-blue-800">
            🔄 Powered by Redux Toolkit
          </Badge>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <FaPlus className="w-4 h-4 mr-2" />
              Create Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Workout (Redux)</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Workout Name</Label>
                  <Input
                    id="name"
                    value={newWorkout.name}
                    onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                    placeholder="e.g., Chest Day, Leg Blast"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newWorkout.date}
                    onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
                  />
                </div>
              </div>

              {/* Muscle Group Selection */}
              <div>
                <Label>Target Muscle Group</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {Object.entries(MUSCLE_GROUPS).map(([key, group]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={newWorkout.muscle_group === key ? "default" : "outline"}
                      className={`p-4 h-auto flex flex-col items-center gap-2 ${
                        newWorkout.muscle_group === key ? group.color + ' text-white' : ''
                      }`}
                      onClick={() => {
                        setNewWorkout({ ...newWorkout, muscle_group: key as MuscleGroup });
                        setSelectedMuscleGroup(key as MuscleGroup);
                      }}
                    >
                      <span className="text-2xl">{group.icon}</span>
                      <span className="font-medium">{group.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Exercise Selection */}
              {selectedMuscleGroup && (
                <div>
                  <Label>Available Exercises for {MUSCLE_GROUPS[selectedMuscleGroup].name}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                    {MUSCLE_GROUPS[selectedMuscleGroup].exercises.map((exercise) => (
                      <Button
                        key={exercise}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addExercise(exercise)}
                        className="text-left justify-start"
                      >
                        <FaPlus className="w-3 h-3 mr-2" />
                        {exercise}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Exercises */}
              {newWorkout.exercises.length > 0 && (
                <div>
                  <Label>Selected Exercises ({newWorkout.exercises.length})</Label>
                  <div className="space-y-3 mt-2">
                    {newWorkout.exercises.map((exercise, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-slate-800">{exercise.name}</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeExercise(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FaTimes className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
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
                  value={newWorkout.notes}
                  onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                  placeholder="Overall workout notes, goals, etc."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateWorkout}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  disabled={!newWorkout.name || !newWorkout.date || !newWorkout.muscle_group || loading}
                >
                  {loading ? 'Creating...' : 'Create Workout'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedMuscleGroup(null);
                    setNewWorkout({ 
                      name: "", 
                      date: "", 
                      muscle_group: "chest", 
                      exercises: [], 
                      notes: "" 
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

      {/* Redux State Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-500 text-white">Redux State</Badge>
            <span className="text-sm text-blue-800">
              {workouts.length} workouts loaded • Loading: {loading ? 'Yes' : 'No'}
            </span>
          </div>
          <p className="text-sm text-blue-700">
            This page demonstrates Redux Toolkit with async thunks, optimistic updates, and centralized state management.
          </p>
        </CardContent>
      </Card>

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map((workout) => {
          const muscleInfo = getMuscleGroupInfo(workout.muscle_group);
          
          return (
            <Card key={workout.id} className={`hover:shadow-lg transition-shadow ${
              workout.completed ? 'bg-green-50 border-green-200' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`text-lg font-semibold font-['Manrope',Helvetica] ${
                      workout.completed ? 'text-green-800 line-through' : 'text-slate-800'
                    }`}>
                      {workout.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {new Date(workout.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${muscleInfo.color} text-white`}>
                      {muscleInfo.icon} {muscleInfo.name}
                    </Badge>
                    {workout.completed && (
                      <FaCheckCircle className="w-5 h-5 text-green-600" />
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
                          <div className="font-medium">{exercise.name}</div>
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
                    <p className="text-sm text-slate-700">{workout.notes}</p>
                  </div>
                )}

                {workout.completed && (
                  <div className="p-2 bg-green-100 border border-green-200 rounded text-sm text-green-800">
                    ✅ Workout completed!
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleComplete(workout.id)}
                    className={`flex-1 ${
                      workout.completed 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    disabled={loading}
                  >
                    <FaCheckCircle className="w-4 h-4 mr-1" />
                    {workout.completed ? 'Completed' : 'Complete'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteWorkout(workout.id)}
                    className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={loading}
                  >
                    <FaTrash className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {workouts.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaDumbbell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No workouts yet</h3>
          <p className="text-slate-500 mb-4">Create your first muscle-specific workout with Redux</p>
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
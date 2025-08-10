import Workout from "../models/Workout.js";

export const createWorkout = async (req, res) => {
  try {
    const workout = await Workout.create({
      ...req.body,
      user: req.userId // using req.userId from your middleware
    });
    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.userId }).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.user.toString() !== req.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: "Workout not found" });

    if (workout.user.toString() !== req.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await workout.deleteOne();
    res.json({ message: "Workout removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

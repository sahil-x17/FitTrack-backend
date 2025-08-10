import express from "express";
import { createWorkout, getWorkouts, deleteWorkout, updateWorkout} from "../controllers/workoutController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.route("/")
  .post(protect, createWorkout)
  .get(protect, getWorkouts);

router.route("/:id")
  .delete(protect, deleteWorkout)
  .put(protect, updateWorkout);

export default router;

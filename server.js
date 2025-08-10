import authRoutes from "./routes/auth.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import reportRoutes from "./routes/report.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
import workoutRoutes from "./routes/workoutRoutes.js";
app.use("/api/workouts", workoutRoutes);
app.use("/api/report", reportRoutes);

// Example route
app.get("/", (req, res) => res.send("FitTrack API Running"));
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log(err));

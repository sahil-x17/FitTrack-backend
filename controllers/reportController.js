// backend/controllers/reportController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import Workout from "../models/Workout.js";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";
import path from "path";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateReport = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(50);

    if (!workouts.length) {
      return res.status(404).json({ message: "No workouts found to generate report" });
    }

    const workoutSummary = workouts.map(w => {
      return `Date: ${w.date.toDateString()}, Type: ${w.type}, Duration: ${w.duration} mins, Calories: ${w.calories || "N/A"}, Notes: ${w.notes || "None"}`;
    }).join("\n");

    const prompt = `
You are a professional fitness coach. Analyze the following workout history and create a detailed personalized fitness report.
Include:
- Progress summary
- Performance trends
- Consistency score
- Strength & endurance notes
- 3 personalized recommendations
- Motivational message
Keep It short and simple to understand

Workout history:
${workoutSummary}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const reportText = result.response.text();

    // If ?download=true, send as PDF
    if (req.query.download === "true") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="fitness_report.pdf"');
      doc.pipe(res);

      doc.fontSize(20).text("Personalized Fitness Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(reportText, { align: "left" });

      doc.end();
      return; // end the function here since we sent the PDF
    }

    // Otherwise, send JSON
    res.json({
      report: reportText,
      rawData: workouts
    });

  } catch (error) {
    console.error("Generate Report Error:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js"; // ✅ Import MongoDB connection
import emotionRoutes from "./routes/emotionRoutes.js"; 

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // ✅ Enable JSON body parsing
app.use("/api/emotions", emotionRoutes); // ✅ Use routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

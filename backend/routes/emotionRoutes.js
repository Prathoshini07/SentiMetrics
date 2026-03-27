import express from "express";
import { analyzeText, analyzeFile, getAllFeedback, getAnalyticsData, upload } from "../controllers/emotionController.js"; 

const router = express.Router();

router.post("/analyze", analyzeText);        
router.post("/analyze-file", upload.single("file"), analyzeFile); 
router.get("/feedback", getAllFeedback);
router.get("/analytics", getAnalyticsData);

export default router;

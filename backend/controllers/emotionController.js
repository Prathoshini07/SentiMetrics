import multer from "multer";
import pdf from "pdf-parse";
import Emotion from "../models/emotion.js";
import { analyzeSentiment } from "../utils/emotionProcessor.js";

// 🟢 Multer Setup (Store PDF in Memory)
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

export const analyzeText = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required for analysis." });

        // 🟢 Perform real NLP-based emotion analysis (ASYNC)
        const { emotions, topics, adorescore } = await analyzeSentiment(text); 
        // 🟢 Save to database
        const analysisResult = new Emotion({
            text,
            emotions, 
            topics,
            adorescore
        });

        await analysisResult.save();

        return res.status(200).json(analysisResult);

    } catch (error) {
        console.error("Error analyzing text:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Fetch all feedback from the database
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Emotion.find();
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getAnalyticsData = async (req, res) => {
  try {
    // 🟢 Count total feedback entries
    const totalFeedback = await Emotion.countDocuments();

    // 🟢 Aggregate the most common emotions
    const emotionCounts = await Emotion.aggregate([
      { $group: { _id: "$emotions.primary.emotion", count: { $sum: 1 } } },
      { $sort: { count: -1 } } // Sort by most frequent
    ]);

    const mostCommonEmotion = emotionCounts.length > 0 ? emotionCounts[0]._id : "Neutral";

    // 🟢 Compute average sentiment score
    const avgSentiment = await Emotion.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$adorescore.overall" } } }
    ]);
    const averageSentiment = avgSentiment.length > 0 ? avgSentiment[0].avgScore : 50; // Default to 50 if no data

    // 🟢 Emotion Distribution
    const emotionDistribution = {};
    emotionCounts.forEach((entry) => {
      emotionDistribution[entry._id] = entry.count;
    });

    // 🟢 Sentiment Trend Analysis (Last 5 feedbacks)
    const last5Entries = await Emotion.find().sort({ _id: -1 }).limit(5);
    const sentimentTrend = {
      labels: last5Entries.map((entry, index) => `Feedback ${index + 1}`),
      data: last5Entries.map((entry) => entry.adorescore.overall)
    };

    // 🟢 Response Data
    const analyticsData = {
      totalFeedback,
      averageSentiment: parseFloat(averageSentiment.toFixed(2)),
      mostCommonEmotion,
      emotionDistribution,
      sentimentTrend
    };

    res.status(200).json(analyticsData);

  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const analyzeFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    console.log("File received:", req.file.originalname);

    // ✅ Extract text from the uploaded PDF buffer
    const pdfData = await pdf(req.file.buffer);
    const extractedText = pdfData.text.trim();

    if (!extractedText) {
      return res.status(400).json({ error: "No readable text found in PDF." });
    }

    // ✅ Process extracted text
    const feedbackList = extractedText.split("\n").filter(line => line.trim() !== "");
    
    let sentimentResults = [];
    let emotionCounts = {};
    let totalSentiment = 0;

    for (let feedback of feedbackList) {
      const { emotions, topics, adorescore } = await analyzeSentiment(feedback);
      totalSentiment += adorescore.overall;
      sentimentResults.push({ text: feedback, emotions, topics, adorescore });

      let primaryEmotion = emotions.primary.emotion;
      emotionCounts[primaryEmotion] = (emotionCounts[primaryEmotion] || 0) + 1;
    }

    const totalFeedback = sentimentResults.length;
    const averageSentiment = totalFeedback > 0 ? totalSentiment / totalFeedback : 50;
    const mostCommonEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b, "Neutral");

    res.status(200).json({
      totalFeedback,
      averageSentiment: parseFloat(averageSentiment.toFixed(2)),
      mostCommonEmotion,
      emotionDistribution: emotionCounts,
      sentimentTrend: {
        labels: feedbackList.map((_, i) => `Feedback ${i + 1}`),
        data: sentimentResults.map(entry => entry.adorescore.overall),
      },
    });

  } catch (error) {
    console.error("Error analyzing file:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

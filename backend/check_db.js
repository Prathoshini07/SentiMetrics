import mongoose from "mongoose";
import dotenv from "dotenv";
import Emotion from "./models/emotion.js";

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/sentimetrics");
        const count = await Emotion.countDocuments();
        console.log("Total Emotion documents:", count);
        
        const samples = await Emotion.find().limit(5);
        console.log("Sample documents:", JSON.stringify(samples, null, 2));
        
        const topics = await Emotion.distinct("topics.main");
        console.log("Distinct topics:", topics);
        
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkData();

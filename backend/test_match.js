import mongoose from "mongoose";
import dotenv from "dotenv";
import Emotion from "./models/emotion.js";

dotenv.config();

const testMatching = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/sentimetrics");
        const keyword = "delivery";
        const matches = await Emotion.find({
            $or: [
                { text: { $regex: keyword, $options: "i" } },
                { "topics.main": { $regex: keyword, $options: "i" } }
            ]
        });
        console.log(`Matches for "${keyword}":`, matches.length);
        if (matches.length > 0) {
            console.log("First match text:", matches[0].text);
            console.log("First match topics:", matches[0].topics.main);
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

testMatching();

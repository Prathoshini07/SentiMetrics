import mongoose from "mongoose";

const EmotionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    emotions: { 
        primary: {
            emotion: { type: String, required: true },
            activation: { type: String, required: true },
            intensity: { type: Number, required: true },
            confidence: { type: Number, required: true } 
        },
        secondary: {
            emotion: { type: String },
            activation: { type: String },
            intensity: { type: Number },
            confidence: { type: Number }
        }
    },
    topics: { 
        main: { type: Array, required: true },
        subtopics: { type: Object, required: true }
    },
    adorescore: { 
        overall: { type: Number, required: true },
        breakdown: { type: Object, required: true }
    }
});

// ✅ Export as default
export default mongoose.model("Emotion", EmotionSchema);

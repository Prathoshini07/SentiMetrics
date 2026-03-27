import { pipeline } from "@xenova/transformers";

// ✅ Load the NLP Model (Multilingual Sentiment)
let emotion_pipeline;
const loadEmotionModel = async () => {
    if (!emotion_pipeline) {
        emotion_pipeline = await pipeline(
            "text-classification",
            "Xenova/bert-base-multilingual-uncased-sentiment",
            { useGPU: true }
        );
    }
};
await loadEmotionModel(); // Load the model when the server starts

// ✅ Analyze Sentiment Using Bert-Multilingual
export const analyzeSentiment = async (text) => {
    if (!text) return null;

    // 🎯 Detect Emotions
    const emotions = await detectEmotions(text);

    // 🎯 Extract Topics Dynamically
    const topics = extractTopics(text);

    // 🎯 Compute Adorescore Based on Emotions & Topics
    const adorescore = computeAdorescore(emotions, topics);

    return { emotions, topics, adorescore };
};

const detectEmotions = async (text) => {
    if (!emotion_pipeline) {
        console.error("❌ Emotion pipeline not loaded!");
        return {
            primary: { emotion: "Neutral", activation: "Low", intensity: 0.3, confidence: 0.3 },
            secondary: { emotion: "Neutral", activation: "Low", intensity: 0.3, confidence: 0.3 }
        };
    }

    const sentences = text
        .split(/(?<=[.!?])\s+|but|however|although|though|yet|so|in spite of|despite|whereas|while/i)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    let allEmotions = [];

    for (const sentence of sentences) {
        const emotionResult = await emotion_pipeline(sentence, { top_k: 3 });
        allEmotions.push(...emotionResult);
    }

    allEmotions.sort((a, b) => b.score - a.score);

    let primaryEmotion = allEmotions[0];
    let secondaryEmotion = allEmotions.find(e => e.label !== primaryEmotion.label) || { label: "Neutral", score: 0.3 };

    return {
        primary: {
            emotion: convertLabelToEmotion(primaryEmotion.label),
            activation: getActivationLevel(convertLabelToEmotion(primaryEmotion.label), primaryEmotion.score), // ✅ Fixed
            intensity: parseFloat(primaryEmotion.score.toFixed(2)),
            confidence: parseFloat(primaryEmotion.score.toFixed(2))
        },
        secondary: {
            emotion: convertLabelToEmotion(secondaryEmotion.label),
            activation: getActivationLevel(convertLabelToEmotion(secondaryEmotion.label), secondaryEmotion.score), // ✅ Fixed
            intensity: parseFloat(secondaryEmotion.score.toFixed(2)),
            confidence: parseFloat(secondaryEmotion.score.toFixed(2))
        }
    };
};



// 🔹 Convert Sentiment Labels to Emotions
const convertLabelToEmotion = (label) => {
    const mapping = {
        "1 star": "Anger",
        "2 stars": "Disappointment",
        "3 stars": "Neutral",
        "4 stars": "Happy",
        "5 stars": "Joy"
    };
    return mapping[label] || "Neutral";
};

const getActivationLevel = (emotion, confidenceScore) => {
    const activationMapping = {
        "Joy": "High",
        "Anger": "High",
        "Disappointment": "Medium",
        "Neutral": "Low",
        "Happy": "Medium",
        "Sadness": "Low",
        "Fear": "High"
    };

    // ✅ If confidence score is high, prioritize "High" activation
    if (confidenceScore !== undefined && confidenceScore > 0.8 || ["Joy", "Anger", "Fear"].includes(emotion)) {
        return "High";
    }

    return activationMapping[emotion] || "Medium";
};



// 🔹 Extract Topics Dynamically
const extractTopics = (text) => {
    const predefined_topics = ["delivery", "quality", "customer service", "pricing", "fit", "material"];

    let topics = { main: [], subtopics: {} };

    predefined_topics.forEach((word) => {
        if (text.toLowerCase().includes(word)) {
            topics.main.push(word.charAt(0).toUpperCase() + word.slice(1));
            topics.subtopics[word] = [];
        }
    });

    return topics;
};

// 🔹 Compute Adorescore Based on Emotions & Topics
const computeAdorescore = (emotions, topics) => {
    let scores = {};
    let totalScore = 0;

    topics.main.forEach((topic) => {
        let score = Math.floor(emotions.primary.confidence * 100);
        scores[topic] = score;
        totalScore += score;
    });

    let overall = topics.main.length > 0 ? Math.round(totalScore / topics.main.length) : 50;
    return { overall, breakdown: scores };
};

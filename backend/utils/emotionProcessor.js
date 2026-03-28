import { pipeline } from "@xenova/transformers";
import nlp from "compromise";

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

    // 🎯 Perform Aspect-Based Sentiment Analysis (ABSA)
    const absa = await performABSA(text);

    // Merge dynamically discovered ABSA topics into the main topics array
    Object.keys(absa).forEach((topic) => {
        if (!topics.main.includes(topic)) {
            topics.main.push(topic);
        }
    });

    return { emotions, topics, absa };
};

// 🔹 Perform Aspect-Based Sentiment Analysis (ABSA)
const performABSA = async (text) => {
    if (!emotion_pipeline) {
        return {};
    }

    const sentences = text
        .split(/(?<=[.!?])\s+|\b(?:but|however|although|though|yet|so|in spite of|despite|whereas|while)\b/i)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    let absa = {};

    for (const sentence of sentences) {
        const topicsInSentence = extractTopics(sentence);
        if (topicsInSentence.main.length > 0) {
            const emotionResult = await emotion_pipeline(sentence, { top_k: 1 });
            if (emotionResult && emotionResult.length > 0) {
                const primary = emotionResult[0];
                const emotionName = convertLabelToEmotion(primary.label);
                // Math.floor(confidence * 100) to match how adorescore does it
                const score = Math.floor(primary.score * 100);

                topicsInSentence.main.forEach(topic => {
                    absa[topic] = `${emotionName} (${score}%)`;
                });
            }
        }
    }

    return absa;
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
        .split(/(?<=[.!?])\s+|\b(?:but|however|although|though|yet|so|in spite of|despite|whereas|while)\b/i)
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

    let topics = { main: [] };

    predefined_topics.forEach((word) => {
        if (text.toLowerCase().includes(word)) {
            topics.main.push(word.charAt(0).toUpperCase() + word.slice(1));
        }
    });

    // Also use compromise to find nouns dynamically
    const doc = nlp(text);
    // Grab strict nouns, isolating them from adjectives to prevent things like 'good' being tagged
    const nouns = doc.nouns().json().map(n => n.text.trim());
    
    // Filter out common throwaway words, short fragments, or mistaken adjectives
    const badWords = ['this', 'that', 'they', 'them', 'who', 'it', 'good', 'bad', 'great', 'awesome', 'terrible', 'excellent'];
    const filteredNouns = nouns.filter(n => n.length > 2 && !badWords.includes(n.toLowerCase()));
    
    if (filteredNouns.length > 0) {
        // Check if the overall text mentions a primary product like "phone" to nest this under it
        const docFull = nlp(text);
        const allNouns = docFull.nouns().json().map(n => n.text.trim().toLowerCase());
        
        // If "phone", "television", etc. is mentioned anywhere in the overall phrase, make it the main topic 
        // and this specific noun a subtopic. Otherwise just make this the main topic.
        let specificNoun = filteredNouns[0].trim().toLowerCase();
        let primaryProduct = allNouns.find(n => ["phone", "product", "laptop", "television", "tv"].includes(n));
            
            if (primaryProduct && specificNoun !== primaryProduct) {
                const mainTopic = primaryProduct.charAt(0).toUpperCase() + primaryProduct.slice(1);
                if (!topics.main.includes(mainTopic)) {
                    topics.main.push(mainTopic);
                }
                
                // For ABSA, we want to label it as "Phone - screen resolution"
                const combinedTopic = `${mainTopic} - ${specificNoun}`;
                if (!topics.main.includes(combinedTopic)) {
                    topics.main.push(combinedTopic);
                }
            } else {
                const mainTopic = specificNoun.charAt(0).toUpperCase() + specificNoun.slice(1);
                if (!topics.main.includes(mainTopic)) {
                    topics.main.push(mainTopic);
                }
            }
        }

    return topics;
};

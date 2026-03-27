import nlp from "compromise";

export const extractTopics = (text) => {
    const doc = nlp(text);

    // 🔹 Extract nouns and adjectives (to detect topics more effectively)
    const extractedNouns = doc.nouns().out("array").map(word => word.toLowerCase());
    const adjectives = doc.adjectives().out("array").map(word => word.toLowerCase());
    const subtopicCandidates = doc.match("#Adjective #Noun").out("array").map(word => word.toLowerCase());

    // 🔹 Predefined product-related topics
    const predefinedTopics = {
        "Product": ["product", "item", "brand", "gadget", "device", "model"],
        "Delivery": ["shipping", "delivered", "delay", "fast", "late", "arrival"],
        "Quality": ["material", "durability", "sturdy", "defect", "faulty", "poor", "excellent", "nice"],
        "Pricing": ["cost", "expensive", "cheap", "affordable", "value", "overpriced", "deal"],
        "Customer Service": ["support", "helpful", "rude", "response", "assistance", "complaint"],
        "Ease of Use": ["interface", "user-friendly", "complicated", "simple", "intuitive"],
        "Performance": ["speed", "lag", "efficient", "slow", "responsive"],
        "Features": ["functionality", "option", "capability", "missing", "customization"],
        "Aesthetics": ["design", "color", "look", "style", "appearance"]
    };

    let topics = { main: [], subtopics: {} };

    // 🔹 Check if extracted words match predefined topics
    for (let [topic, keywords] of Object.entries(predefinedTopics)) {
        if (
            extractedNouns.some(noun => keywords.includes(noun)) || 
            adjectives.some(adj => keywords.includes(adj))
        ) {
            topics.main.push(topic);
            topics.subtopics[topic] = subtopicCandidates.filter(phrase => 
                keywords.some(k => phrase.includes(k))
            );
        }
    }

    // 🔹 Ensure at least one topic is assigned
    if (topics.main.length === 0) {
        topics.main.push("General");
        topics.subtopics["General"] = ["Miscellaneous"];
    }

    console.log("🟢 Detected Topics:", topics); // 🛠 Debugging
    return topics;
};

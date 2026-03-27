import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link for navigation
import "./EmotionForm.css"; // Import the CSS file for styling

const EmotionForm = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [emojis, setEmojis] = useState([]);

  // Array of emojis to randomize
  const emojiList = ["😊", "😢", "😡", "😮", "😍", "🤔", "😎", "🥳", "😴", "🤩"];

  // Function to generate random emojis
  const generateEmojis = useCallback(() => {
    const newEmojis = Array.from({ length: 4 }, () => ({
      emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
      id: Math.random(),
      left: Math.random() * 80 + 10, // Random horizontal position
      duration: Math.random() * 10 + 10, // Random duration for slow movement
    }));
    setEmojis(newEmojis);
  }, []);

  // Generate emojis on component mount
  useEffect(() => {
    generateEmojis();
  }, [generateEmojis]);

  const analyzeText = async () => {
    if (!text) return;

    try {
      const { data } = await axios.post("http://localhost:5000/api/emotions/analyze", { text });
      setResult(data); // ✅ Store the response as-is
    } catch (error) {
      console.error("Error analyzing text:", error);
    }
  };

  return (
    <div className="container">
      {/* Floating Emoji Blobs */}
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="emoji-blob"
          style={{
            left: `${emoji.left}%`,
            animation: `float-up ${emoji.duration}s infinite ease-in-out`,
          }}
        >
          {emoji.emoji}
        </div>
      ))}

      <h2>Customer Emotion Analysis</h2>

      {/* Side-by-side layout */}
      <div className="content-wrapper">
        {/* Left Side: Text Field */}
        <div className="input-section">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter feedback..."
          />
          <button onClick={analyzeText}>Analyze</button>
        </div>

        {/* Right Side: Result */}
        <div className="result-section">
          {result && (
            <div className="result-box">
              <h4>JSON Response:</h4>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Link to Analytics Dashboard */}
      <div className="dashboard-link">
        <Link to="/analytics">
          <button>Go to Analytics Dashboard</button>
        </Link>
      </div>
      <div className="file-upload">
        <Link to="/file-analysis">
          <button>Analyze PDF File</button>
        </Link>
      </div>
    </div>
  );
};

export default EmotionForm;

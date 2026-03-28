import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link for navigation
import "./EmotionForm.css"; // Import the CSS file for styling

const EmotionForm = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [emojis, setEmojis] = useState([]);

  const generateEmojis = useCallback(() => {
    // Array of emojis to randomize
    const emojiList = ["😊", "😢", "😡", "😮", "😍", "🤔", "😎", "🥳", "😴", "🤩"];
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

      {/* Restructured Layout */}
      <div className="input-row">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter feedback..."
        />
        <button className="analyze-button" onClick={analyzeText}>Analyze</button>
      </div>

      {/* Result Section Below */}
      {result && (
        <div className="result-section">
          <div className="result-box">
            <h3>Analysis Results</h3>
            <div className="emotion-result">
              {/* Primary Emotion */}
              <div className="emotion-item primary">
                <div className="emotion-header">
                  <span className="label">Primary Emotion:</span>
                  <span className="value">{result.emotions?.primary?.emotion || "N/A"}</span>
                </div>
                <div className="confidence-details">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(result.emotions?.primary?.confidence * 100).toFixed(0)}%` }}
                    ></div>
                  </div>
                  <span className="percentage">{(result.emotions?.primary?.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Secondary Emotion */}
              {result.emotions?.secondary && result.emotions.secondary.emotion !== "Neutral" && (
                <div className="emotion-item secondary">
                  <div className="emotion-header">
                    <span className="label">Secondary Emotion:</span>
                    <span className="value">{result.emotions.secondary.emotion}</span>
                  </div>
                  <div className="confidence-details">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(result.emotions.secondary.confidence * 100).toFixed(0)}%` }}
                      ></div>
                    </div>
                    <span className="percentage">{(result.emotions.secondary.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </div>

            {result.topics?.main && result.topics.main.length > 0 && (
              <div className="topics-section">
                <h4>Key Topics</h4>
                <div className="topic-tags">
                  {result.topics.main.map((topic, i) => (
                    <span key={i} className="topic-tag">{topic}</span>
                  ))}
                </div>
              </div>
            )}

            {result.absa && Object.keys(result.absa).length > 0 && (
              <div className="absa-section">
                <h4>Aspect-Based Sentiment</h4>
                <div className="absa-list">
                  {Object.entries(result.absa).map(([aspect, score], i) => (
                    <div key={i} className="absa-item">
                      <span className="aspect">{aspect}</span>
                      <span className="score">{score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
      <div className="keyword-search-link">
        <Link to="/search">
          <button>Keyword Insights Search</button>
        </Link>
      </div>
    </div>
  );
};

export default EmotionForm;

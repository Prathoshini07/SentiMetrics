import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./KeywordSearch.css";

const KeywordSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchKeyword = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/emotions/search?keyword=${encodeURIComponent(keyword)}`);
      setResult(data);
    } catch (err) {
      console.error("Error searching keyword:", err);
      setError("Failed to fetch search results. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>🔍 Keyword Insights Search</h2>

      {/* Restructured Layout */}
      <div className="search-row">
        <input
          type="text"
          className="search-input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter product/feature keyword..."
        />
        <button className="search-button" onClick={searchKeyword} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {/* Result Section Below */}
      {result && result.insights && (
        <div className="result-section">
          <div className="result-box">
            <h4>Search Insights for "{result.keyword}"</h4>
            
            <div className="insights-grid">
              <div className="insight-card">
                <span className="label">Total Mentions</span>
                <span className="value">{result.insights.totalMentions}</span>
              </div>
              <div className="insight-card">
                <span className="label">Avg. Sentiment</span>
                <span className="value">{result.insights.averageSentiment.toFixed(1)}%</span>
              </div>
              <div className="insight-card">
                <span className="label">Top Emotion</span>
                <span className="value" style={{ textTransform: 'capitalize' }}>
                  {result.insights.mostCommonEmotion}
                </span>
              </div>
            </div>

            {result.insights.emotionDistribution && (
              <div className="distribution-summary">
                <h5>Emotion Breakdown</h5>
                <div className="topic-tags">
                  {Object.entries(result.insights.emotionDistribution).map(([emotion, count]) => (
                    <span key={emotion} className="topic-tag">
                      {emotion}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reused generic layout links */}
      <div className="navigation-links">
        <Link to="/"><button>Back to Home</button></Link>
        <Link to="/analytics"><button>Analytics Dashboard</button></Link>
        <Link to="/file-analysis"><button>Analyze PDF File</button></Link>
      </div>
    </div>
  );
};

export default KeywordSearch;

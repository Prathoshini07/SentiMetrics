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

      <div className="content-wrapper">
        <div className="input-section">
          <input
            type="text"
            className="search-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter product/feature keyword..."
          />
          <button onClick={searchKeyword} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
          
          {error && <p className="error-msg">{error}</p>}
        </div>

        <div className="result-section">
          {result && (
            <div className="result-box">
              <h4>Matches Found: {result.insights?.totalMentions || 0}</h4>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

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

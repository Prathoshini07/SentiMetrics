import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "./AnalyticsDashboard.css";

Chart.register(...registerables);

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedKeyword, setSelectedKeyword] = useState("delivery");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/emotions/analytics");
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Fetching insights...</p>
      </div>
    );
  }

  if (!analyticsData || Object.keys(analyticsData).length === 0) {
    return <div className="error-message">⚠ Error loading analytics data.</div>;
  }

  const emotionDistributionData = analyticsData.emotionDistribution || {};
  const positiveEmotions = ["joy", "happy"];
  const negativeEmotions = ["anger", "disappointment"];

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  Object.entries(emotionDistributionData).forEach(([emotion, count]) => {
    if (positiveEmotions.includes(emotion.toLowerCase())) {
      positiveCount += count;
    } else if (negativeEmotions.includes(emotion.toLowerCase())) {
      negativeCount += count;
    } else {
      neutralCount += count;
    }
  });

  const emotionDistribution = {
    labels: Object.keys(emotionDistributionData),
    datasets: [
      {
        label: "Emotion Distribution",
        data: Object.values(emotionDistributionData),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        hoverOffset: 6,
      },
    ],
  };

  const sentimentDistribution = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        label: "Sentiment Distribution",
        data: [positiveCount, neutralCount, negativeCount],
        backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
      },
    ],
  };

  const keywordTrends = analyticsData.keywordTrends || {};
  const availableKeywords = ["delivery", "quality", "customer service", "pricing", "support"];
  const activeTrendData = keywordTrends[selectedKeyword] || { labels: [], data: [] };

  const activeTrend = {
    labels: activeTrendData.labels,
    datasets: [
      {
        label: "Sentiment Score",
        data: activeTrendData.data,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "#36A2EB",
        borderWidth: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#36A2EB",
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="analytics-page">
      <div className="analytics-dashboard">
        <h1>📊 Analytics Dashboard</h1>

        {/* Metrics Section */}
        <div className="metrics-container">
          <div className="metric-card fade-in">
            <h3>Total Feedback</h3>
            <p>{analyticsData.totalFeedback || 0}</p>
          </div>
          <div className="metric-card fade-in">
            <h3>Average Sentiment</h3>
            <p>{analyticsData.averageSentiment ? analyticsData.averageSentiment.toFixed(2) : "N/A"}</p>
          </div>
          <div className="metric-card fade-in">
            <h3>Most Common Emotion</h3>
            <p>{analyticsData.mostCommonEmotion || "N/A"}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="chart-section">
          {/* Keyword Toggle UI */}
          <div className="keyword-selector fade-in">
            <h3>Analyze Trends by Keyword</h3>
            <div className="keyword-buttons">
              {availableKeywords.map((kw) => (
                <button
                  key={kw}
                  className={`kw-btn ${selectedKeyword === kw ? "active" : ""}`}
                  onClick={() => setSelectedKeyword(kw)}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-row">
            {activeTrendData.labels.length > 0 ? (
              <div className="chart-container fade-in">
                <h2>{selectedKeyword.toUpperCase()} Sentiment Trend</h2>
                <Line data={activeTrend} />
              </div>
            ) : (
              <div className="chart-container fade-in empty-chart">
                <h2>{selectedKeyword.toUpperCase()} Sentiment Trend</h2>
                <div className="no-data-msg">No sentiment trends found.</div>
              </div>
            )}

            {emotionDistribution.labels.length > 0 && (
              <div className="chart-container pie-chart fade-in">
                <h2>Emotion Distribution</h2>
                <Pie data={emotionDistribution} />
              </div>
            )}
          </div>

          {/* Sentiment Distribution Chart */}
          {sentimentDistribution.datasets[0].data.some((value) => value > 0) && (
            <div className="chart-container large-chart pie-chart fade-in">
              <h2>Overall Sentiment Distribution</h2>
              <Pie data={sentimentDistribution} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "./AnalyticsDashboard.css";

Chart.register(...registerables);

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const sentimentTrendData = analyticsData.sentimentTrend || { labels: [], data: [] };
  const emotionIntensityData = analyticsData.emotionIntensity || { labels: [], data: [] };

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

  const sentimentTrend = {
    labels: sentimentTrendData.labels || [],
    datasets: [
      {
        label: "Average Sentiment",
        data: sentimentTrendData.data || [],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "#36A2EB",
        borderWidth: 3,
        hoverBackgroundColor: "#4BC0C0",
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

  const emotionIntensity = {
    labels: emotionIntensityData.labels || [],
    datasets: [
      {
        label: "Emotion Intensity Over Time",
        data: emotionIntensityData.data || [],
        fill: false,
        borderColor: "#FF6384",
        borderWidth: 3,
        tension: 0.3,
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
          <div className="chart-row">
            {emotionDistribution.labels.length > 0 && (
              <div className="chart-container fade-in">
                <h2>Emotion Distribution</h2>
                <Pie data={emotionDistribution} options={{ maintainAspectRatio: false }} />
              </div>
            )}

            {sentimentTrend.labels.length > 0 && (
              <div className="chart-container fade-in">
                <h2>Sentiment Trend Over Time</h2>
                <Bar data={sentimentTrend} options={{ maintainAspectRatio: false }} />
              </div>
            )}
          </div>

          {/* Enlarged Sentiment Distribution Chart */}
          {sentimentDistribution.datasets[0].data.some((value) => value > 0) && (
            <div className="chart-container large-chart fade-in">
              <h2>Sentiment Distribution</h2>
              <Pie data={sentimentDistribution} options={{ maintainAspectRatio: false }} />
            </div>
          )}

          {emotionIntensity.labels.length > 0 && (
            <div className="chart-container fade-in">
              <h2>Emotion Intensity Over Time</h2>
              <Line data={emotionIntensity} options={{ maintainAspectRatio: false }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

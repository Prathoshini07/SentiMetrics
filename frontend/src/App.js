import React from "react";
import { Routes, Route } from "react-router-dom";
import EmotionForm from "./components/EmotionForm";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import FileAnalysis from "./components/FileAnalysis";
import KeywordSearch from "./components/KeywordSearch";

function App() {
  return (
    <Routes>
      <Route path="/" element={<EmotionForm />} />
      <Route path="/analytics" element={<AnalyticsDashboard />} />
      <Route path="/file-analysis" element={<FileAnalysis />} />
      <Route path="/search" element={<KeywordSearch />} />
    </Routes>
  );
}

export default App;

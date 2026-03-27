import React from "react";
import { Routes, Route } from "react-router-dom";
import EmotionForm from "./components/EmotionForm";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import FileAnalysis from "./components/FileAnalysis";

function App() {
  return (
    <Routes>
      <Route path="/" element={<EmotionForm />} />
      <Route path="/analytics" element={<AnalyticsDashboard />} />
      <Route path="/file-analysis" element={<FileAnalysis />} />
    </Routes>
  );
}

export default App;

import React from "react";
import "./FingerLegend.css";

const fingerColors = [
  { name: "Left Pinky", color: "#8ecae6" },
  { name: "Left Ring", color: "#e0aaff" },
  { name: "Left Middle", color: "#b5838d" },
  { name: "Left Index", color: "#ffb4a2" },
  { name: "Thumbs", color: "#ffe066" },
  { name: "Right Index", color: "#ffb4a2" },
  { name: "Right Middle", color: "#b5838d" },
  { name: "Right Ring", color: "#e0aaff" },
  { name: "Right Pinky", color: "#8ecae6" }
];

export default function FingerLegend() {
  return (
    <div className="finger-legend-panel">
      <h4>Finger Legend</h4>
      <ul>
        {fingerColors.map(f => (
          <li key={f.name}>
            <span className="finger-dot" style={{ background: f.color }}></span>
            <span className="finger-label" style={{ color: f.color }}>{f.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
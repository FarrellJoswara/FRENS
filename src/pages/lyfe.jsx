import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLyfe } from "../lyfe/LyfeContext";
import "./lyfe.css";

/** Scenario picker / manager */
export default function Lyfe() {
  const nav = useNavigate();
  const { list, currentId, select, create, rename, duplicate, remove } = useLyfe();
  const [newName, setNewName] = useState("");

  return (
    <div className="hub-root">
      <div className="hub-head">
        <h1>Pick a Lyfe</h1>

        <div className="hub-new">
          <input
            className="hub-input"
            placeholder="New lyfe name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            className="hub-btn primary"
            onClick={() => {
              const n = newName.trim() || "New Lyfe";
              create(n);
              setNewName("");
            }}
          >
            Create
          </button>
        </div>
      </div>

      <div className="hub-grid">
        {list.map((lyfe) => (
          <div
            key={lyfe.id}
            className={`hub-card ${lyfe.id === currentId ? "active" : ""}`}
            onClick={() => select(lyfe.id)}
          >
            <div className="hub-title">
              <input
                className="hub-rename"
                value={lyfe.name}
                onChange={(e) => rename(lyfe.id, e.target.value)}
              />
              <div className="hub-actions">
                <button className="hub-btn" onClick={(e) => { e.stopPropagation(); duplicate(lyfe.id); }}>Duplicate</button>
                <button className="hub-btn danger" onClick={(e) => { e.stopPropagation(); remove(lyfe.id); }}>Delete</button>
              </div>
            </div>

            <div className="hub-summary">
              <div><span>Finance:</span> {lyfe.finance?.inputs?.goal || "—"} · {lyfe.finance?.computed?.monthlyIncome ? `$${lyfe.finance.computed.monthlyIncome}` : "no inputs"}</div>
              <div><span>Health:</span> {lyfe.health?.inputs?.goal || "—"} · {lyfe.health?.inputs?.timeline || "—"}</div>
              <div className="muted">Updated: {new Date(lyfe.updatedAt).toLocaleString()}</div>
            </div>

            <div className="hub-buttons">
              <button className="hub-btn" onClick={(e) => { e.stopPropagation(); nav(`/finance/${lyfe.id}`); }}>Open Finance</button>
              <button className="hub-btn" onClick={(e) => { e.stopPropagation(); nav(`/health/${lyfe.id}`); }}>Open Health</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

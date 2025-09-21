import React, { useState } from "react";
import "./Lyfe.css";
import LyfeBg from "../assets/Lyfe.svg"; // <-- ensure this exists in /assets

import { useLyfe } from "../lyfe/LyfeContext";
import { useNavigate } from "react-router-dom";

const SALARY_BANDS = [
  "$12k – $20k",
  "$20k – $30k",
  "$30k – $40k",
  "$40k – $60k",
  "$60k – $80k",
  "$80k – $120k",
  "$120k – $180k",
  "$180k+",
];

/** Convert "salary band" to a monthly take-home range (rough, for UX) */
function bandToMonthlyRangeStr(label) {
  // parse first two numbers in thousands (e.g., 20 and 30 from "$20k – $30k")
  const nums = (label.match(/\d+/g) || []).map((n) => parseInt(n, 10));
  let loA = 20, hiA = 30;
  if (nums.length >= 2) { loA = nums[0]; hiA = nums[1]; }
  else if (nums.length === 1) { loA = nums[0]; hiA = nums[0] + 20; }
  // net ≈ 72% take-home
  const loNet = (loA * 1000) * 0.72;
  const hiNet = (hiA * 1000) * 0.72;
  const loM = Math.round(loNet / 12 / 100) * 100;
  const hiM = Math.round(hiNet / 12 / 100) * 100;
  return `${Math.max(800, loM)}-${Math.min(10000, hiM)}`;
}

export default function Lyfe() {
  const nav = useNavigate();
  const { list, currentId, setCurrentId, createLyfe, updateLyfeMeta, removeLyfe } = useLyfe();

  // form state (create)
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [location, setLocation] = useState("");
  const [salaryBand, setSalaryBand] = useState("$30k – $40k");

  const disabled = !name.trim();

  const handleCreate = () => {
    createLyfe({ name, job, location, salaryBand });
    nav("/front");
  };

  const onMakeActive = (id) => setCurrentId(id);

  return (
    <div className="lyfe-root" style={{ backgroundImage: `url(${LyfeBg})` }}>
      <div className="lyfe-overlay" />
      <main className="lyfe-card">
        <header className="lyfe-head">
          <div>
            <h1>Create or select a Lyfe</h1>
            <p>Each Lyfe is a scenario with its own Finance & Health plans.</p>
          </div>
          {currentId && <span className="active-pill">Active: {list.find(l=>l.id===currentId)?.name}</span>}
        </header>

        <section className="panel">
          <h2 className="panel-title">New Lyfe</h2>
          <div className="grid2">
            <label className="field">
              <div className="field-label">Name</div>
              <input className="input" placeholder="e.g., College Senior" value={name} onChange={(e)=>setName(e.target.value)} />
            </label>
            <label className="field">
              <div className="field-label">Job</div>
              <input className="input" placeholder="e.g., Part-time barista" value={job} onChange={(e)=>setJob(e.target.value)} />
            </label>
          </div>
          <div className="grid2">
            <label className="field">
              <div className="field-label">Location</div>
              <input className="input" placeholder="e.g., Austin, TX" value={location} onChange={(e)=>setLocation(e.target.value)} />
            </label>
            <label className="field">
              <div className="field-label">Salary (band)</div>
              <select className="input" value={salaryBand} onChange={(e)=>setSalaryBand(e.target.value)}>
                {SALARY_BANDS.map((b)=> <option key={b}>{b}</option>)}
              </select>
              <div className="hint">Used to pre-fill Finance income: <b>{bandToMonthlyRangeStr(salaryBand)} / mo</b></div>
            </label>
          </div>
          <div className="actions">
            <button className="primary" disabled={disabled} onClick={handleCreate}>Create & set active</button>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Your Lyfes</h2>
          {list.length === 0 ? (
            <div className="empty">You don’t have any lyfes yet. Create one above.</div>
          ) : (
            <div className="lyfe-list">
              {list.map((l) => (
                <div className={`lyfe-item ${l.id===currentId?"on":""}`} key={l.id}>
                  <div className="lyfe-main">
                    <div className="name">{l.name}</div>
                    <div className="meta">
                      <span>{l.meta?.job ?? "No job set"}</span> · <span>{l.meta?.location ?? "No location"}</span> ·{" "}
                      <span>{l.meta?.salaryBand ?? "No salary band"}</span>
                    </div>
                  </div>
                  <div className="lyfe-actions">
                    <button className="chip" onClick={() => onMakeActive(l.id)}>Set active</button>
                    <button
                      className="chip"
                      onClick={() => {
                        const nn = (prompt("Rename lyfe", l.name) ?? l.name);
                        const nj = (prompt("Job", l.meta?.job ?? "") ?? l.meta?.job ?? "");
                        const nl = (prompt("Location", l.meta?.location ?? "") ?? l.meta?.location ?? "");
                        const nb = (prompt("Salary band", l.meta?.salaryBand ?? "$30k – $40k") ?? l.meta?.salaryBand ?? "$30k – $40k");

                        updateLyfeMeta(l.id, { job: nj, location: nl, salaryBand: nb });

                        // keep name as well (quick local storage patch)
                        const updateName = nn?.trim();
                        if (updateName && updateName !== l.name) {
                          const raw = localStorage.getItem("lyfe-db-v1");
                          if (raw) {
                            const db = JSON.parse(raw);
                            db.list = db.list.map(x => x.id===l.id ? { ...x, name: updateName } : x);
                            localStorage.setItem("lyfe-db-v1", JSON.stringify(db));
                            // optional: emit a storage event if you want to trigger external listeners
                            // window.dispatchEvent(new StorageEvent("storage", { key: "lyfe-db-v1", newValue: JSON.stringify(db) }));
                          }
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button className="chip danger" onClick={() => removeLyfe(l.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {currentId && (
          <section className="panel soft next-steps">
            <div className="ns-text">Next: jump into your active lyfe’s planners</div>
            <div className="ns-actions">
              <button className="secondary" onClick={()=>nav(`/finance/${currentId}`)}>Open Finance</button>
              <button className="secondary" onClick={()=>nav(`/health/${currentId}`)}>Open Health</button>
              <button className="secondary" onClick={()=>nav("/front")}>Back to Home</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import "./Goals.css";
import GoalsBg from "../assets/Lyfe.svg"; // reuse the soft teal motif
import { useParams, useNavigate } from "react-router-dom";
import { useLyfe, useLyfeSlice } from "../lyfe/LyfeContext";

/** ---------- helpers ---------- */
const id = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const categories = ["Personal", "Finance", "Health", "Social", "Education", "Other"];
const statuses = ["Active", "Completed"];
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString() : "No date");

/** lightweight charts (SVG) reused style like other pages */
function Donut({ data, size = 160, stroke = 22 }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const r = (size - stroke) / 2, c = size / 2, circ = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg width={size} height={size} className="donut">
      <circle cx={c} cy={c} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      {data.map((d, i) => {
        const len = (d.value / total) * circ;
        const el = (
          <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={d.color}
                  strokeWidth={stroke} strokeDasharray={`${len} ${circ - len}`}
                  strokeDashoffset={-off} className="donut-anim" />
        );
        off += len; return el;
      })}
      <circle cx={c} cy={c} r={r - stroke / 2} fill="#fff" opacity="0.96" />
    </svg>
  );
}
function Bars({ data, width = 520, barH = 14, gap = 12 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const height = data.length * (barH + gap);
  return (
    <svg width={width} height={height} className="bars">
      {data.map((d, i) => {
        const usable = width - 170;
        const w = Math.max(4, (d.value / max) * usable);
        const y = i * (barH + gap);
        return (
          <g key={d.label} transform={`translate(0,${y})`}>
            <text x="0" y={barH - 2} className="bar-label">{d.label}</text>
            <rect x="130" y="0" width={usable} height={barH} fill="#eef2f7" rx="8" />
            <rect x="130" y="0" width={w} height={barH} fill={d.color || "#22c55e"} rx="8" className="bar-fill-anim" />
            <text x={130 + w + 8} y={barH - 2} className="bar-value">{d.right ?? d.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** ---------- small UI atoms ---------- */
function Field({ label, children, right }) {
  return (
    <label className="field">
      <div className="field-row">
        <div className="field-label">{label}</div>
        {right && <div className="field-right">{right}</div>}
      </div>
      {children}
    </label>
  );
}
function Section({ title, children, soft=false }) {
  return (
    <section className={`panel ${soft ? "soft" : ""}`}>
      <h2 className="panel-title">{title}</h2>
      {children}
    </section>
  );
}

/** ---------- main ---------- */
export default function Goals() {
  const nav = useNavigate();
  const { lyfeId } = useParams();
  const { getById } = useLyfe();
  const activeLyfe = getById(lyfeId);

  // Persist per-lyfe (like Finance/Health)
  const { slice, setSlice } = useLyfeSlice("goals", lyfeId);
  const savedGoals = slice?.goals || [];
  const savedCapsules = slice?.capsules || [];

  // Local state
  const [goals, setGoals] = useState(savedGoals);
  const [capsules, setCapsules] = useState(savedCapsules);

  // Hydrate when lyfe changes route
  useEffect(() => {
    setGoals(slice?.goals || []);
    setCapsules(slice?.capsules || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lyfeId]);

  // Persist back to lyfe slice
  useEffect(() => {
    setSlice({ goals, capsules, updatedAt: Date.now() });
  }, [goals, capsules, setSlice]);

  /** ------- create goal ------- */
  const [gTitle, setGTitle] = useState("");
  const [gCat, setGCat] = useState("Personal");
  const [gDue, setGDue] = useState("");
  const [gNotes, setGNotes] = useState("");
  const [gTarget, setGTarget] = useState(""); // e.g., $ or reps or count
  const disableCreate = !gTitle.trim();

  const addGoal = () => {
    if (disableCreate) return;
    setGoals(arr => [
      ...arr,
      {
        id: id(),
        title: gTitle.trim(),
        category: gCat,
        due: gDue || null,
        notes: gNotes.trim(),
        target: gTarget.trim(),
        progress: 0,
        checklist: [],
        status: "Active",
        createdAt: Date.now(),
      }
    ]);
    setGTitle(""); setGCat("Personal"); setGDue(""); setGNotes(""); setGTarget("");
  };

  /** ------- goal helpers ------- */
  const setProgress = (gid, p) =>
    setGoals(arr => arr.map(g => g.id === gid ? { ...g, progress: clamp(p, 0, 100), status: p >= 100 ? "Completed" : "Active" } : g));
  const toggleDone = (gid) =>
    setGoals(arr => arr.map(g => g.id === gid ? { ...g, progress: 100, status: "Completed" } : g));
  const removeGoal = (gid) => setGoals(arr => arr.filter(g => g.id !== gid));
  const addChecklist = (gid, text) =>
    setGoals(arr => arr.map(g => g.id === gid ? { ...g, checklist: [...g.checklist, { id: id(), text, done: false }] } : g));
  const setChecklist = (gid, cid, patch) =>
    setGoals(arr => arr.map(g => g.id === gid ? {
      ...g, checklist: g.checklist.map(c => c.id === cid ? { ...c, ...patch } : c)
    } : g));
  const removeChecklist = (gid, cid) =>
    setGoals(arr => arr.map(g => g.id === gid ? { ...g, checklist: g.checklist.filter(c => c.id !== cid) } : g));

  /** ------- filters ------- */
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Active");
  const filtered = goals.filter(g =>
    (catFilter === "All" || g.category === catFilter) &&
    (statusFilter === "All" || g.status === statusFilter) &&
    (q.trim() === "" || g.title.toLowerCase().includes(q.toLowerCase()))
  );

  /** ------- charts ------- */
  const byCat = useMemo(() => {
    return categories.map((c, i) => ({
      label: c,
      value: goals.filter(g => g.category === c).length,
      color: ["#22c55e","#3b82f6","#f59e0b","#8b5cf6","#10b981","#ef4444"][i % 6]
    })).filter(x => x.value > 0);
  }, [goals]);
  const progressStats = useMemo(() => {
    const act = goals.filter(g => g.status === "Active").length;
    const done = goals.filter(g => g.status === "Completed").length;
    return [
      { label: "Active", value: act, color: "#3b82f6", right: `${act}` },
      { label: "Completed", value: done, color: "#22c55e", right: `${done}` },
    ];
  }, [goals]);

  /** ------- capsules ------- */
  const [cTitle, setCTitle] = useState("");
  const [cOpen, setCOpen] = useState("");
  const [cMsg, setCMsg] = useState("");
  const addCapsule = () => {
    if (!cTitle.trim() || !cOpen) return;
    setCapsules(arr => [...arr, { id: id(), title: cTitle.trim(), openDate: cOpen, message: cMsg.trim(), createdAt: Date.now(), openedAt: null }]);
    setCTitle(""); setCOpen(""); setCMsg("");
  };
  const removeCapsule = (cid) => setCapsules(arr => arr.filter(c => c.id !== cid));
  const openNow = (cid) => setCapsules(arr => arr.map(c => c.id === cid ? { ...c, openedAt: Date.now() } : c));
  const isUnlocked = (c) => c.openedAt || (c.openDate && new Date() >= new Date(c.openDate));

  return (
    <div className="goals-root" style={{ backgroundImage: `url(${GoalsBg})` }}>
      <div className="goals-overlay" />
      <main className="goals-card">
        <header className="goals-head">
          <div>
            <h1>Your Goals & Time Capsules</h1>
            <p>Plan across life areas and leave notes for your future self.</p>
          </div>
          <div className="right-chip">
            <span className="k">Active lyfe</span>
            <span className="v">{activeLyfe?.name || "—"}</span>
          </div>
        </header>

        {/* CREATE GOAL */}
        <Section title="Create a goal">
          <div className="grid4">
            <Field label="Title">
              <input className="input" placeholder="Ex: Save a $1,000 emergency fund" value={gTitle} onChange={e=>setGTitle(e.target.value)} />
            </Field>
            <Field label="Category">
              <select className="input" value={gCat} onChange={e=>setGCat(e.target.value)}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Target / Metric (optional)">
              <input className="input" placeholder="Ex: $1000, 5k run, 10 events…" value={gTarget} onChange={e=>setGTarget(e.target.value)} />
            </Field>
            <Field label="Target date">
              <input className="input" type="date" value={gDue} onChange={e=>setGDue(e.target.value)} />
            </Field>
          </div>
          <Field label="Notes">
            <input className="input" placeholder="Short plan or constraints…" value={gNotes} onChange={e=>setGNotes(e.target.value)} />
          </Field>
          <div className="actions">
            <button className="primary" disabled={disableCreate} onClick={addGoal}>Add goal</button>
            <div className="chips">
              <button className="chip" onClick={()=>{
                setGTitle("Build $1,000 Emergency Fund"); setGCat("Finance"); setGTarget("$1000"); setGDue(""); setGNotes("Automate $100/mo");
              }}>Template: $1k EF</button>
              <button className="chip" onClick={()=>{
                setGTitle("Run my first 5K"); setGCat("Health"); setGTarget("5K"); setGDue(""); setGNotes("3x/week, add 10% distance");
              }}>Template: 5K</button>
              <button className="chip" onClick={()=>{
                setGTitle("Meet 10 new people"); setGCat("Social"); setGTarget("10"); setGDue(""); setGNotes("1 event/week");
              }}>Template: Social 10</button>
            </div>
          </div>
        </Section>

        {/* OVERVIEW */}
        <Section title="Overview">
          <div className="grid2">
            <div className="panel soft">
              <div className="mini-title">Goals by category</div>
              {byCat.length ? <Donut data={byCat} /> : <div className="empty">No goals yet</div>}
              <div className="legend">
                {byCat.map(d => (
                  <div className="legend-row" key={d.label}>
                    <span className="swatch" style={{ background: d.color }} />
                    <span>{d.label}</span>
                    <b>{d.value}</b>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel soft">
              <div className="mini-title">Status</div>
              <Bars data={progressStats} />
            </div>
          </div>
        </Section>

        {/* LIST / MANAGE */}
        <Section title="Your goals">
          <div className="filters">
            <input className="input" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
            <div className="chips">
              <button className={`chip ${statusFilter==="Active"?"on":""}`} onClick={()=>setStatusFilter("Active")}>Active</button>
              <button className={`chip ${statusFilter==="Completed"?"on":""}`} onClick={()=>setStatusFilter("Completed")}>Completed</button>
              <button className={`chip ${statusFilter==="All"?"on":""}`} onClick={()=>setStatusFilter("All")}>All</button>
            </div>
            <div className="chips">
              <button className={`chip ${catFilter==="All"?"on":""}`} onClick={()=>setCatFilter("All")}>All categories</button>
              {categories.map(c=>(
                <button key={c} className={`chip ${catFilter===c?"on":""}`} onClick={()=>setCatFilter(c)}>{c}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 && <div className="empty">No goals match your filters.</div>}

          <div className="goal-list">
            {filtered.map(g => (
              <div className={`goal-item ${g.status==="Completed"?"done":""}`} key={g.id}>
                <div className="goal-main">
                  <div className="goal-title">{g.title}</div>
                  <div className="goal-meta">
                    <span className={`pill cat ${g.category.toLowerCase()}`}>{g.category}</span>
                    <span className="sep">·</span>
                    <span className="due">Due: {fmtDate(g.due)}</span>
                    {g.target && (<><span className="sep">·</span><span className="target">Target: {g.target}</span></>)}
                  </div>
                </div>
                <div className="goal-actions">
                  <div className="progress">
                    <input type="range" min="0" max="100" value={g.progress}
                           onChange={e=>setProgress(g.id, +e.target.value)} />
                    <span className="pct">{g.progress}%</span>
                    <button className="chip" onClick={()=>setProgress(g.id, g.progress+10)}>+10%</button>
                  </div>
                  <div className="row-buttons">
                    <button className="chip" onClick={()=>toggleDone(g.id)}>{g.status==="Completed"?"Reopen":"Mark done"}</button>
                    <button className="chip danger" onClick={()=>removeGoal(g.id)}>Delete</button>
                  </div>
                </div>

                {/* Checklist */}
                <div className="checklist">
                  <div className="check-hd">Checklist</div>
                  {g.checklist.length === 0 && <div className="hint">Break this goal into small steps.</div>}
                  {g.checklist.map(c => (
                    <div className="check-row" key={c.id}>
                      <label className="check">
                        <input type="checkbox" checked={!!c.done} onChange={e=>setChecklist(g.id, c.id, { done: e.target.checked })}/>
                        <span className={c.done ? "str" : ""}>{c.text}</span>
                      </label>
                      <button className="chip" onClick={()=>removeChecklist(g.id, c.id)}>Remove</button>
                    </div>
                  ))}
                  <AddStep onAdd={(txt)=>txt.trim() && addChecklist(g.id, txt.trim())} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* TIME CAPSULES */}
        <Section title="Time capsules">
          <div className="grid3">
            <Field label="Title"><input className="input" value={cTitle} onChange={e=>setCTitle(e.target.value)} placeholder="Dear future me…" /></Field>
            <Field label="Open date"><input className="input" type="date" value={cOpen} onChange={e=>setCOpen(e.target.value)} /></Field>
            <Field label=" "><button className="primary" onClick={addCapsule} disabled={!cTitle.trim() || !cOpen}>Create capsule</button></Field>
          </div>
          <Field label="Message">
            <textarea className="input" rows={3} value={cMsg} onChange={e=>setCMsg(e.target.value)} placeholder="Write a note to your future self…" />
          </Field>

          <div className="capsule-list">
            {capsules.length === 0 && <div className="empty">No capsules yet.</div>}
            {capsules.map(c => {
              const unlocked = isUnlocked(c);
              return (
                <div className={`capsule ${unlocked ? "open" : "locked"}`} key={c.id}>
                  <div className="cap-hd">
                    <div className="cap-title">{c.title}</div>
                    <div className="cap-meta">
                      {unlocked ? <span className="pill open">Unlocked</span> : <span className="pill">Locks on {fmtDate(c.openDate)}</span>}
                    </div>
                  </div>
                  <div className={`cap-body ${unlocked ? "" : "blur"}`}>
                    {c.message || <i>No message</i>}
                  </div>
                  <div className="cap-actions">
                    {!unlocked && <button className="chip" onClick={()=>openNow(c.id)}>Open early</button>}
                    <button className="chip danger" onClick={()=>removeCapsule(c.id)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section soft title="Next steps">
          <div className="ns">
            <button className="secondary" onClick={()=>nav(`/finance/${lyfeId}`)}>Go to Finance</button>
            <button className="secondary" onClick={()=>nav(`/health/${lyfeId}`)}>Go to Health</button>
            <button className="secondary" onClick={()=>nav("/front")}>Back to Home</button>
          </div>
        </Section>
      </main>
    </div>
  );
}

/** inline add-step widget */
function AddStep({ onAdd }) {
  const [txt, setTxt] = useState("");
  return (
    <div className="addstep">
      <input className="input" placeholder="Add a small step…" value={txt} onChange={e=>setTxt(e.target.value)} />
      <button className="chip" onClick={()=>{ onAdd(txt); setTxt(""); }}>Add</button>
    </div>
  );
}

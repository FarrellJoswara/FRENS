import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLyfe } from "../lyfe/LyfeContext";
import "./Whiteboard.css";

/* ---------------------- helpers ---------------------- */
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const currency = (n) =>
  (isFinite(n) ? n : 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

function bandToMonthlyRangeStr(label) {
  const nums = (label?.match(/\d+/g) || []).map((n) => parseInt(n, 10));
  let loA = 20, hiA = 30;
  if (nums.length >= 2) { loA = nums[0]; hiA = nums[1]; }
  else if (nums.length === 1) { loA = nums[0]; hiA = nums[0] + 20; }
  const loNet = loA * 1000 * 0.72;
  const hiNet = hiA * 1000 * 0.72;
  const loM = Math.round(loNet / 12 / 100) * 100;
  const hiM = Math.round(hiNet / 12 / 100) * 100;
  return `${Math.max(800, loM)}-${Math.min(10000, hiM)}`;
}
const incomeMid = (rangeStr) => {
  const [lo, hi] = String(rangeStr).split("-").map(s => parseInt(String(s).replace(/[^0-9]/g, ""), 10));
  if (!isFinite(lo) || !isFinite(hi)) return 3500;
  return Math.round((lo + hi) / 2);
};

function seriesFV(monthly, annual, months = 60) {
  const r = annual / 12;
  const out = [];
  let acc = 0;
  for (let m = 1; m <= months; m++) {
    acc = r === 0 ? acc + monthly : (acc + monthly) * (1 + r);
    out.push(Math.round(acc));
  }
  return out;
}

const labelIcon = (k)=>({cash:"💵", bonds:"🏦", stocks:"📈", crypto:"🪙", venture:"🚀"}[k]||"•");

/* ---------------------- tiny charts (SVG, responsive) ---------------------- */
function Sparkline({ points, height = 120, stroke = 2.5, color = "#0f766e" }) {
  if (!points || points.length < 2) return <div style={{ height }} />;
  const vbW = 700; // logical width; SVG scales to container width
  const min = Math.min(...points), max = Math.max(...points);
  const xs = vbW / (points.length - 1);
  const y = (v) => height - ((v - min) / (max - min || 1)) * height;
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * xs} ${y(p)}`).join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${vbW} ${height}`} width="100%" height={height}>
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} />
    </svg>
  );
}
function Donut({ data, size = 180, stroke = 24 }) {
  const total = data.reduce((a,b)=>a + b.value, 0) || 1;
  const r = (size - stroke)/2, c = size/2, circ = 2*Math.PI*r;
  let off = 0;
  return (
    <svg width={size} height={size} className="donut">
      <circle cx={c} cy={c} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      {data.map((d,i)=>{
        const len = (d.value/total)*circ;
        const el = (
          <circle key={i} cx={c} cy={c} r={r}
            fill="none" stroke={d.color} strokeWidth={stroke}
            strokeDasharray={`${len} ${circ-len}`} strokeDashoffset={-off}
            className="donut-anim"
          />
        );
        off += len;
        return el;
      })}
      <circle cx={c} cy={c} r={r - stroke/2} fill="#fff" opacity="0.96" />
    </svg>
  );
}
function Bars({ data, width = 520, barH = 14, gap = 12 }) {
  const height = data.length * (barH + gap);
  return (
    <svg width={width} height={height} className="bars">
      {data.map((d, i) => {
        // If d.max is provided, scale this row by value/max; otherwise fall back to dataset max.
        const denom = d.max ?? Math.max(...data.map(x => x.value), 1);
        const usable = width - 170;
        const pct = Math.min(1, (d.value || 0) / (denom || 1));
        const w = Math.max(4, pct * usable);
        const y = i * (barH + gap);
        return (
          <g key={d.label} transform={`translate(0,${y})`}>
            <text x="0" y={barH - 2} className="bar-label">{d.label}</text>
            <rect x="130" y="0" width={usable} height={barH} fill="#eef2f7" rx="8" />
            <rect x="130" y="0" width={w} height={barH} fill={d.color || "#22c55e"} rx="8" className="bar-fill-anim" />
            <text x={130 + w + 8} y={barH - 2} className="bar-value">
              {d.right ?? (d.max ? `${Math.round(pct * 100)}%` : Math.round(d.value))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}


/* ---------------------- page ---------------------- */
export default function Whiteboard() {
  const nav = useNavigate();
  const { list, currentId, setCurrentId, getById } = useLyfe();

  // Selected Lyfe (default to active, else first)
  const [selId, setSelId] = useState(currentId || (list[0]?.id ?? null));
  const lyfe = getById(selId);

  // slices
  const fin = lyfe?.slices?.finance || {};
  const finIn = fin.inputs || {};
  const finCo = fin.computed || {};
  const hl  = lyfe?.slices?.health || {};
  const hlIn = hl.inputs || {};
  const hlCo = hl.computed || {};
  const goalsSlice = lyfe?.slices?.goals || { goals: [], capsules: [] };

  // finance fallbacks
  const incomeRange = finIn.incomeRange || (lyfe?.meta?.salaryBand ? bandToMonthlyRangeStr(lyfe.meta.salaryBand) : "3000-4000");
  const monthlyIncome = finCo.monthlyIncome ?? incomeMid(incomeRange);

  // 50/30/20 baseline if finance not filled
  const planEssentials = finCo.essentials;
  const planLifestyle  = finIn.lifestyle;
  const fallbackEss = Math.round(monthlyIncome * 0.5);
  const fallbackLife = Math.round(monthlyIncome * 0.3);
  const essentials = isFinite(planEssentials) ? planEssentials : fallbackEss;
  const lifestyle  = isFinite(planLifestyle)  ? planLifestyle  : fallbackLife;

  // user's plan contribution (could be 0)
  const planFuture = clamp(monthlyIncome - (essentials + lifestyle), 0, 10000);

  // contribution mode toggle
  const defaultAuto = planFuture <= 0;
  const [contribMode, setContribMode] = useState(defaultAuto ? "auto" : "plan"); // "plan" | "auto"
  const autoFuture = Math.max(25, Math.round(monthlyIncome * 0.10));
  const simFuture = contribMode === "plan" ? planFuture : autoFuture;

  // risk
  const risk = finIn.risk ?? 2; // 1 cautious, 2 balanced, 3 ambitious
  const [simRisk, setSimRisk] = useState(risk);
  const annualBase = simRisk === 1 ? 0.03 : simRisk === 2 ? 0.06 : 0.10;
  const annualLow  = simRisk === 1 ? -0.02 : simRisk === 2 ? -0.05 : -0.12;
  const annualHigh = simRisk === 1 ? 0.05 : simRisk === 2 ? 0.10 : 0.18;

  // wealth series
  const wealthBase = useMemo(() => seriesFV(simFuture, annualBase, 60), [simFuture, annualBase]);
  const wealthLow  = useMemo(() => seriesFV(simFuture, annualLow , 60), [simFuture, annualLow ]);
  const wealthHigh = useMemo(() => seriesFV(simFuture, annualHigh, 60), [simFuture, annualHigh]);

  // health snapshot defaults
  const routineDays = hlCo.routineDays ?? 3;
  const calories    = hlCo.calorieTarget ?? 2200;
  const proteinG    = hlCo.proteinG ?? 120;
  const waterL      = hlCo.waterL ?? 2.3;
  const goalName    = hlIn.goal || "Wellness";
  
  

  // health trajectory
  const healthGainTarget = routineDays >= 4 ? 12 : routineDays >= 3 ? 9 : routineDays >= 2 ? 6 : 3;
  const healthSeries = useMemo(()=>{
    const steps = 60;
    const out = [];
    for (let i=0;i<=steps;i++) out.push(Math.round(100 + (healthGainTarget * (i/steps))*10)/10);
    return out;
  }, [healthGainTarget]);

  // donut uses simulated contribution
  const donutData = [
    { label: "Essentials", value: essentials,    color: "#3b82f6" },
    { label: "Lifestyle",  value: lifestyle,     color: "#22c55e" },
    { label: "Future-Me",  value: simFuture,     color: "#f59e0b" },
  ];

  const barsHealth = [
    { label: "Routine days / wk", value: routineDays, color: "#3b82f6", right: `${routineDays}/7` },
    { label: "Protein / day (g)", value: proteinG,    color: "#22c55e", right: `${proteinG} g` },
    { label: "Water / day (L)",   value: waterL,      color: "#0ea5a5", right: `${waterL} L` },
    { label: "Calories / day",    value: calories,    color: "#f59e0b", right: `${calories}` },
  ];

  // Social & Wellbeing Index
  const socialGoals = (goalsSlice.goals || []).filter(g => g.category === "Social");
  const completed   = socialGoals.filter(g => g.status === "Completed").length;
  const active      = socialGoals.filter(g => g.status !== "Completed").length;
  const capsules    = (goalsSlice.capsules || []).length;

  const lifestyleShare = monthlyIncome > 0 ? lifestyle / monthlyIncome : 0.3;
  const shareScore = clamp(10 - (Math.abs(lifestyleShare - 0.30) / 0.30) * 10, 0, 10); // best near 30%

  const wellbeingNow =
    50
    + clamp((routineDays / 7) * 20, 0, 20)
    + clamp(active * 5, 0, 15)
    + clamp(completed * 8, 0, 24)
    + clamp(capsules * 2, 0, 10)
    + shareScore;

  const wellbeingSeries = useMemo(()=>{
    const start = clamp(Math.round(wellbeingNow), 0, 100);
    const end = clamp(start + 5, 0, 100);
    const steps = 60; const out = [];
    for (let i=0;i<=steps;i++) out.push(Math.round(start + (end - start) * (i/steps)));
    return out;
  }, [wellbeingNow]);

  const lastBase = wealthBase[wealthBase.length - 1] || 0;

  return (
    <div className="whiteboard-root">
      <div className="whiteboard-overlay" />
      <main className="wb-container">
        {/* header */}
        <header className="wb-header">
          <div>
            <h1 className="wb-title">5-Year Projection</h1>
            <p className="wb-sub">One canvas. Your money & health—projected to future-you.</p>
          </div>

          {/* lyfe selector */}
          <div className="wb-switch">
  <div className="wb-switch-k">Lyfe</div>
  <select value={selId || ""} onChange={(e)=>setSelId(e.target.value)} className="wb-select">
    {list.length === 0 && <option value="">(No lyfes yet)</option>}
    {list.map((l)=> <option value={l.id} key={l.id}>{l.name}</option>)}
  </select>

  <button onClick={()=> selId && setCurrentId(selId)} className="chip">Set Active</button>
  <button onClick={()=> nav(`/finance/${selId}`)} className="chip">Finance</button>
  <button onClick={()=> nav(`/health/${selId}`)} className="chip">Health</button>
  <button onClick={()=> nav("/calendar")} className="chip">Calendar</button> {/* NEW */}
</div>

        </header>

        {/* meta strip */}
        {lyfe ? (
          <div className="wb-meta">
            <div className="pill"><span className="pill-k">Name</span><b>{lyfe.name}</b></div>
            <div className="pill"><span className="pill-k">Job</span><b>{lyfe.meta?.job || "—"}</b></div>
            <div className="pill"><span className="pill-k">Location</span><b>{lyfe.meta?.location || "—"}</b></div>
            <div className="pill"><span className="pill-k">Salary band</span><b>{lyfe.meta?.salaryBand || "—"}</b></div>
          </div>
        ) : (
          <div className="wb-panel">No Lyfe selected. Create one on the Lyfe page.</div>
        )}

        {/* grid */}
        <div className="wb-grid">
          {/* Wealth forecast */}
          <section className="wb-panel">
            <div className="panel-hd">
              <div className="panel-title">Wealth Projection (5 years)</div>
              <div className="panel-sub">Contributions from <b>Future-Me</b> bucket</div>
            </div>

            <div className="row-wrap">
              <div className="row-label">Risk</div>
              <div className="row-chips">
                {[1,2,3].map(v=>(
                  <button key={v} onClick={()=>setSimRisk(v)} className={`chip ${simRisk===v?"on":""}`}>
                    {v===1?"Cautious":v===2?"Balanced":"Ambitious"}
                  </button>
                ))}
              </div>

              <div className="row-label push">Contribution</div>
              <div className="row-chips">
                <button onClick={()=>setContribMode("plan")}  className={`chip ${contribMode==="plan"?"on":""}`}>Finance plan</button>
                <button onClick={()=>setContribMode("auto")}  className={`chip ${contribMode==="auto"?"on":""}`}>Auto 10%</button>
              </div>
              <div className="row-note">
                Future-Me / mo: <b>{currency(simFuture)}</b>
                {contribMode==="auto" && <span className="note-suggest">· suggested</span>}
              </div>
            </div>

            <Sparkline points={wealthBase} color="#0f766e" />
            <div className="year-grid">
              {[12,24,36,48,60].map((m,i)=>(
                <div key={i} className="stat">
                  <div className="stat-k">Year {i+1}</div>
                  <div className="stat-v">{currency(wealthLow[m-1])} – {currency(wealthHigh[m-1])}</div>
                  <div className="stat-hint">Expected: {currency(wealthBase[m-1])}</div>
                </div>
              ))}
            </div>

            <div className="pill-row">
              <div className="pill"><span className="pill-k">Total in 5y (exp.)</span><b>{currency(lastBase)}</b></div>
              <div className="pill"><span className="pill-k">Monthly income</span><b>{currency(monthlyIncome)}</b></div>
              <div className="pill"><span className="pill-k">Essentials</span><b>{currency(essentials)}</b></div>
              <div className="pill"><span className="pill-k">Lifestyle</span><b>{currency(lifestyle)}</b></div>
            </div>
          </section>

          {/* Split + Health */}
          <section className="wb-panel">
            <div className="panel-hd">
              <div className="panel-title">Today’s Split</div>
              <div className="panel-sub">Where your money goes each month</div>
            </div>
            <div className="split-grid">
              <div className="donut-box"><Donut data={donutData} /></div>
              <div className="split-legend">
                {donutData.map((d)=>(
                  <div key={d.label} className="split-row">
                    <span className="sw" style={{ background: d.color }} />
                    <div className="split-label">{d.label}</div>
                    <b>{currency(d.value)}</b>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-hd mt">
              <div className="panel-title">Health Trajectory</div>
              <div className="panel-sub">Goal: <b>{goalName}</b> • Consistency ↑ over 5 years</div>
            </div>
            <Sparkline points={healthSeries} color="#3b82f6" />
            <div className="mt"><Bars data={barsHealth} /></div>
          </section>

          {/* Investing approach + Milestones */}
          <section className="wb-panel">
            <div className="panel-hd">
              <div className="panel-title">Investing Approach</div>
              <div className="panel-sub">from your Finance template & risk</div>
            </div>
            <Bars data={toBarsFromPortfolio(finIn.template, simRisk)} />

            <div className="panel-hd mt">
              <div className="panel-title">Milestones</div>
              <div className="panel-sub">Based on your plan & habits</div>
            </div>
            <ul className="milestones">
              <li>Year 1: Establish emergency fund, lock routine {routineDays}d/wk.</li>
              <li>Year 2: Grow investment base; try 1 new skill/hobby.</li>
              <li>Year 3: Stretch goal in {goalName.toLowerCase()} (race, PR, or wellness streak).</li>
              <li>Year 4: Consider bigger step (move, down payment, venture).</li>
              <li>Year 5: Review compounding gains & reset targets for the next 5.</li>
            </ul>
          </section>

          {/* Social & Wellbeing */}
          <section className="wb-panel">
            <div className="panel-hd">
              <div className="panel-title">Social & Wellbeing</div>
              <div className="panel-sub">A light index from your routine consistency, social goals & balance.</div>
            </div>

            <Sparkline points={wellbeingSeries} color="#8b5cf6" />
            <div className="year-grid">
              <div className="stat"><div className="stat-k">Index now</div><div className="stat-v">{Math.round(wellbeingNow)}/100</div><div className="stat-hint">target +5 over 5y</div></div>
              <div className="stat"><div className="stat-k">Social goals</div><div className="stat-v">{active} active</div><div className="stat-hint">{completed} completed</div></div>
              <div className="stat"><div className="stat-k">Time capsules</div><div className="stat-v">{capsules}</div><div className="stat-hint">keep a note to future-you</div></div>
            </div>

            <div className="tip">Tip: finishing social goals and keeping lifestyle near <b>~30%</b> of income nudges this upward.</div>
          </section>

          {/* Actions */}
          <section className="wb-panel">
            <div className="panel-hd">
              <div className="panel-title">Next Steps</div>
              <div className="panel-sub">Tune the inputs or print your plan</div>
            </div>
            <div className="actions">
              <button className="chip big" onClick={()=> nav(`/finance/${selId}`)}>Refine Finance</button>
              <button className="chip big" onClick={()=> nav(`/health/${selId}`)}>Refine Health</button>
              <button className="chip big" onClick={()=> nav(`/goals/${selId}`)}>Goals</button>
              <button className="chip big" onClick={()=> window.print()}>Print / PDF</button>
              <button className="chip big" onClick={()=> nav("/front")}>Back to Home</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ---------------------- portfolio → bars ---------------------- */
function toBarsFromPortfolio(template, risk){
  const baseMap = {
    "Lazy Index":             { cash: 20, bonds: 10, stocks: 70, crypto: 0 },
    "Safety First":           { cash: 60, bonds: 25, stocks: 15, crypto: 0 },
    "Crypto Curious":         { cash: 20, bonds: 5,  stocks: 50, crypto: 25 },
    "Student Entrepreneur":   { cash: 15, bonds: 5,  stocks: 60, venture: 20 },
  };
  const base = baseMap[template || "Lazy Index"] || baseMap["Lazy Index"];
  const shift = (risk - 2) * 5;
  const out = { ...base };
  if (shift > 0) {
    const take = Math.min(shift, (out.cash || 0) + (out.bonds || 0));
    if (out.cash)  out.cash  -= take / 2;
    if (out.bonds) out.bonds -= take / 2;
    out.stocks = (out.stocks || 0) + take * 0.7;
    if ("crypto" in out) out.crypto = (out.crypto || 0) + take * 0.3;
  } else if (shift < 0) {
    const give = Math.min(-shift, out.stocks || 0);
    if (out.stocks) out.stocks -= give * 0.7;
    if (out.crypto) out.crypto -= give * 0.3;
    out.cash  = (out.cash  || 0) + give / 2;
    out.bonds = (out.bonds || 0) + give / 2;
  }
  const sum = Object.values(out).reduce((a,b)=>a+b,0) || 1;
  return Object.entries(out).map(([k,v])=>({ label: `${labelIcon(k)} ${k}`, value: Math.round((v/sum)*100) }));
}

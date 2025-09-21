import React, { useMemo, useState } from "react";
import "./Finance.css";
import FinanceBg from "../assets/Finance.svg";

/** ---------- helpers ---------- */
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const currency = (n) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const incomeMid = (range) => {
  const [lo, hi] = range.split("-").map(s => parseInt(s.replace(/[^0-9]/g, ""), 10));
  return Math.round((lo + hi) / 2);
};

// quick base cost presets by living setup & city cost (rough, just for UX)
const BASE_COSTS = {
  campus:   { low:{rent:450, food:220, transport:45},  avg:{rent:600, food:260, transport:55}, high:{rent:800, food:320, transport:70} },
  roommates:{ low:{rent:600, food:240, transport:60},  avg:{rent:900, food:300, transport:80}, high:{rent:1300,food:360, transport:95} },
  solo:     { low:{rent:900, food:260, transport:80},  avg:{rent:1400,food:330, transport:95}, high:{rent:2000,food:420, transport:110} },
};

export default function Finance() {
  /** 1) GOAL */
  const [goal, setGoal] = useState("Travel");

  /** 2) SITUATION */
  const [incomeRange, setIncomeRange] = useState("3000-4000");
  const [living, setLiving] = useState("roommates"); // campus | roommates | solo
  const [cityCost, setCityCost] = useState("avg");   // low | avg | high
  const monthlyIncome = useMemo(() => incomeMid(incomeRange), [incomeRange]);

  // derived defaults for essentials
  const defaults = BASE_COSTS[living][cityCost];

  /** 3) MONTHLY PLAN (with optional adjust) */
  const [showAdjust, setShowAdjust] = useState(false);
  const [rent, setRent] = useState(defaults.rent);
  const [food, setFood] = useState(defaults.food);
  const [transport, setTransport] = useState(defaults.transport);
  const [lifestyle, setLifestyle] = useState(400); // fun/other
  const essentials = rent + food + transport;

  // compute Future-Me = leftover
  const future = clamp(monthlyIncome - (essentials + lifestyle), 0, 10_000);

  // percent split for the donut (Essentials, Lifestyle, Future-Me)
  const planPct = useMemo(() => {
    const sum = Math.max(1, essentials + lifestyle + future);
    return {
      essentials: Math.round((essentials / sum) * 1000) / 10,
      lifestyle:  Math.round((lifestyle  / sum) * 1000) / 10,
      future:     Math.round((future     / sum) * 1000) / 10,
    };
  }, [essentials, lifestyle, future]);

  /** 4) INVESTING */
  const [risk, setRisk] = useState(2); // 1 cautious, 2 balanced, 3 ambitious
  const [template, setTemplate] = useState("Lazy Index");
  const portfolio = useMemo(() => {
    const base = {
      "Lazy Index":       { cash: 20, bonds: 10, stocks: 70, crypto: 0 },
      "Safety First":     { cash: 60, bonds: 25, stocks: 15, crypto: 0 },
      "Crypto Curious":   { cash: 20, bonds: 5,  stocks: 50, crypto: 25 },
      "Student Entrepreneur": { cash: 15, bonds: 5,  stocks: 60, venture: 20 },
    }[template] || { cash: 20, bonds: 10, stocks: 70, crypto: 0 };

    const shift = (risk - 2) * 5;
    const out = { ...base };
    if (shift > 0) { // move safe -> growth
      const take = Math.min(shift, (out.cash || 0) + (out.bonds || 0));
      if (out.cash)  out.cash  -= take / 2;
      if (out.bonds) out.bonds -= take / 2;
      out.stocks = (out.stocks || 0) + take * 0.7;
      if ("crypto" in out) out.crypto = (out.crypto || 0) + take * 0.3;
    } else if (shift < 0) { // move growth -> safe
      const give = Math.min(-shift, out.stocks || 0);
      if (out.stocks) out.stocks -= give * 0.7;
      if (out.crypto) out.crypto -= give * 0.3;
      out.cash  = (out.cash  || 0) + give / 2;
      out.bonds = (out.bonds || 0) + give / 2;
    }
    const sum = Object.values(out).reduce((a,b)=>a+b,0) || 1;
    const norm = {};
    for (const [k,v] of Object.entries(out)) norm[k] = Math.round((v/sum)*1000)/10;
    return norm;
  }, [template, risk]);

  /** 5) 5-YEAR OUTLOOK */
  const monthlyFuture = future; // amount invested/saved per month
  const fv = (m, annual, months=60) => {
    const r = annual/12;
    return r === 0 ? m*months : m*((Math.pow(1+r, months)-1)/r);
  };
  const annualReturn = risk === 1 ? 0.03 : risk === 2 ? 0.06 : 0.10;
  const annualWorst  = risk === 1 ? -0.02 : risk === 2 ? -0.05 : -0.12;
  const annualBest   = risk === 1 ? 0.05 : risk === 2 ? 0.10 : 0.18;

  const outlook = useMemo(()=>({
    worst: Math.round(fv(monthlyFuture, annualWorst)),
    base:  Math.round(fv(monthlyFuture, annualReturn)),
    best:  Math.round(fv(monthlyFuture, annualBest)),
  }), [monthlyFuture, annualReturn, annualWorst, annualBest]);

  /** narrative line tailored to goal */
  const goalLine = useMemo(() => {
    if (goal === "Travel")          return "Enough to fund a couple of international trips.";
    if (goal === "Emergency Fund")  return `≈ ${Math.max(1, Math.floor(outlook.base / Math.max(1, essentials)))} months of living costs.`;
    if (goal === "Down Payment")    return "A strong start toward a starter home down payment.";
    if (goal === "Retirement")      return "A solid habit—review yearly and let compounding work.";
    return "";
  }, [goal, outlook.base, essentials]);

  /** keep defaults in sync if user changes situation and never opened “Adjust amounts” */
  React.useEffect(() => {
    if (!showAdjust) {
      setRent(defaults.rent);
      setFood(defaults.food);
      setTransport(defaults.transport);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [living, cityCost]);

  /** ---------- UI ---------- */
  return (
    <div className="finance-root" style={{ backgroundImage: `url(${FinanceBg})` }}>
      <div className="finance-overlay" />
      <section className="finance-card" role="region" aria-label="Future-You Finance planner">
        {/* Header */}
        <header className="card-header">
          <div>
            <h1 className="card-title">Future-You Finance</h1>
            <p className="card-subtitle">Minimal inputs. Maximum clarity. Your 5-year path.</p>
          </div>
          <span className="badge"><span className="dot" /> Live</span>
        </header>

        <div className="body-grid">
          {/* Main content */}
          <div className="main">
            {/* 1) Goal */}
            <Section title="What are we planning for?">
              <div className="goals">
                {["Travel","Emergency Fund","Down Payment","Retirement"].map(k=>(
                  <button
                    key={k}
                    type="button"
                    className={`goal-card ${goal===k?"active":""}`}
                    onClick={()=>setGoal(k)}
                  >
                    <span className="goal-emoji">{emojiFor(k)}</span>
                    <span className="goal-text">{k}</span>
                  </button>
                ))}
              </div>
              <p className="hint">We’ll tailor the plan around this goal.</p>
            </Section>

            {/* 2) Situation */}
            <Section title="Your situation">
              <div className="grid3">
                <Field label="Monthly income">
                  <select className="select" value={incomeRange} onChange={e=>setIncomeRange(e.target.value)}>
                    <option value="1000-2000">$1,000 – $2,000</option>
                    <option value="2000-3000">$2,000 – $3,000</option>
                    <option value="3000-4000">$3,000 – $4,000</option>
                    <option value="4000-5000">$4,000 – $5,000</option>
                    <option value="5000-7000">$5,000 – $7,000</option>
                  </select>
                </Field>

                <Field label="Living setup">
                  <Segmented options={[
                    {label:"On-campus", value:"campus"},
                    {label:"Roommates", value:"roommates"},
                    {label:"Solo", value:"solo"},
                  ]} value={living} onChange={setLiving}/>
                </Field>

                <Field label="City cost">
                  <Segmented options={[
                    {label:"Low", value:"low"},
                    {label:"Average", value:"avg"},
                    {label:"High", value:"high"},
                  ]} value={cityCost} onChange={setCityCost}/>
                </Field>
              </div>
              <p className="hint">
                Based on this, we’ll start with rent ≈ {currency(defaults.rent)}, food ≈ {currency(defaults.food)}, transport ≈ {currency(defaults.transport)}.
              </p>
            </Section>

            {/* 3) Monthly plan */}
            <Section title="Your monthly plan">
              <p className="narrative">
                With <strong>{currency(monthlyIncome)}</strong> coming in, this plan covers life and moves you toward <strong>{goal}</strong>.
              </p>

              <div className="plan">
                <div className="plan-left">
                  <Group title={`Essentials — ${currency(essentials)}`} desc="everyday living">
                    <Row label="Rent" value={currency(rent)} />
                    <Row label="Food" value={currency(food)} />
                    <Row label="Transport" value={currency(transport)} />
                  </Group>
                  <Group title={`Lifestyle — ${currency(lifestyle)}`} desc="your fun & flexibility">
                    <Row label="Fun/Other" value={currency(lifestyle)} />
                  </Group>
                  <Group title={`Future-Me — ${currency(future)}`} desc="savings & investing" highlight />
                </div>

                <div className="plan-right">
                  <DonutChart data={[
                    {label:"Essentials", value: planPct.essentials, color:"#3b82f6"},
                    {label:"Lifestyle",  value: planPct.lifestyle,  color:"#22c55e"},
                    {label:"Future-Me",  value: planPct.future,     color:"#f59e0b"},
                  ]}/>
                  <div className="legend">
                    <LegendRow label="Essentials" color="#3b82f6" value={`${planPct.essentials}%`} />
                    <LegendRow label="Lifestyle"  color="#22c55e" value={`${planPct.lifestyle}%`} />
                    <LegendRow label="Future-Me"  color="#f59e0b" value={`${planPct.future}%`} />
                  </div>
                </div>
              </div>

              <button className="link" type="button" onClick={()=>setShowAdjust(!showAdjust)}>
                {showAdjust ? "Hide" : "Adjust amounts"}
              </button>

              {showAdjust && (
                <div className="adjust-grid">
                  <Adj label="Rent" value={rent}  setValue={setRent} />
                  <Adj label="Food" value={food}  setValue={setFood} />
                  <Adj label="Transport" value={transport} setValue={setTransport} />
                  <Adj label="Lifestyle (Fun/Other)" value={lifestyle} setValue={setLifestyle} />
                </div>
              )}
            </Section>

            {/* 4) Investing approach */}
            {future > 0 && (
              <Section title="How should we invest your ‘Future-Me’ money?">
                <div className="grid2">
                  <Field label="Risk appetite">
                    <Segmented options={[
                      {label:"Cautious", value:1},
                      {label:"Balanced", value:2},
                      {label:"Ambitious", value:3},
                    ]} value={risk} onChange={setRisk}/>
                  </Field>

                  <Field label="Portfolio template">
                    <Segmented dense options={[
                      {label:"Lazy Index", value:"Lazy Index"},
                      {label:"Student Entrep.", value:"Student Entrepreneur"},
                      {label:"Crypto Curious", value:"Crypto Curious"},
                      {label:"Safety First", value:"Safety First"},
                    ]} value={template} onChange={setTemplate}/>
                  </Field>
                </div>

                <BarChart data={Object.entries(portfolio).map(([k,v])=>({label:k, value:v}))}/>
                <p className="hint">We’ll keep it simple and diversified. You can refine later.</p>
              </Section>
            )}

            {/* 5) 5-year outlook */}
            <Section title="Fast-forward 5 years">
              <div className="range-cards">
                <RangeCard label="Conservative" value={currency(outlook.worst)} />
                <RangeCard label="Expected"    value={currency(outlook.base)} highlight />
                <RangeCard label="Optimistic"  value={currency(outlook.best)} />
              </div>
              <p className="narrative small">{goalLine}</p>
              <div className="actions">
                <button type="button" className="btn secondary" onClick={()=>window.print()}>Print plan</button>
                {/* for PDF you can also rely on print-to-PDF */}
              </div>
            </Section>
          </div>

          {/* Sticky summary */}
          <aside className="summary">
            <div className="summary-card">
              <div className="sum-row"><span>Income</span><strong>{currency(monthlyIncome)}</strong></div>
              <div className="sum-row"><span>Essentials</span><strong>{currency(essentials)}</strong></div>
              <div className="sum-row"><span>Lifestyle</span><strong>{currency(lifestyle)}</strong></div>
              <div className="sum-row total"><span>Future-Me</span><strong>{currency(future)}</strong></div>
              <div className="sum-note">
                Based on <b>{goal}</b>, <b>{labelLiving(living)}</b>, <b>{labelCity(cityCost)}</b> city.
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

/** ---------- small UI pieces ---------- */
function Section({ title, children }) {
  return (
    <section className="panel">
      <h2 className="panel-title">{title}</h2>
      {children}
    </section>
  );
}
function Field({ label, children }) {
  return (
    <label className="field">
      <div className="field-label">{label}</div>
      {children}
    </label>
  );
}
function Segmented({ options, value, onChange, dense=false }) {
  return (
    <div className={`segmented ${dense?"dense":""}`} role="tablist" aria-label="choices">
      {options.map(opt=>(
        <button
          key={String(opt.value)}
          className={`seg-item ${value===opt.value?"active":""}`}
          onClick={()=>onChange(opt.value)}
          type="button"
          role="tab"
          aria-selected={value===opt.value}
        >{opt.label}</button>
      ))}
    </div>
  );
}
function Group({ title, desc, children, highlight=false }) {
  return (
    <div className={`group ${highlight?"hi":""}`}>
      <div className="group-hd">
        <div className="group-title">{title}</div>
        <div className="group-desc">{desc}</div>
      </div>
      <div className="group-body">{children}</div>
    </div>
  );
}
function Row({ label, value }) {
  return <div className="row"><span>{label}</span><strong>{value}</strong></div>;
}
function LegendRow({ label, color, value }) {
  return (
    <div className="legend-row">
      <span className="swatch" style={{background:color}}/>
      <span className="legend-label">{label}</span>
      <span className="legend-value">{value}</span>
    </div>
  );
}
function RangeCard({ label, value, highlight=false }) {
  return (
    <div className={`range ${highlight?"range-hi":""}`}>
      <div className="range-label">{label}</div>
      <div className="range-value">{value}</div>
    </div>
  );
}
function Adj({ label, value, setValue }) {
  return (
    <div className="adj">
      <div className="adj-label">{label}</div>
      <div className="adj-ctrls">
        <button type="button" onClick={()=>setValue(Math.max(0, value-25))} className="chip">−25</button>
        <button type="button" onClick={()=>setValue(Math.max(0, value-100))} className="chip">−100</button>
        <input
          className="adj-input"
          type="number" min={0}
          value={value}
          onChange={(e)=>setValue(parseInt(e.target.value||"0",10))}
        />
        <button type="button" onClick={()=>setValue(value+25)} className="chip">+25</button>
        <button type="button" onClick={()=>setValue(value+100)} className="chip">+100</button>
      </div>
    </div>
  );
}

/** ---------- Charts ---------- */
function DonutChart({ data, size=160, stroke=22 }) {
  const total = data.reduce((a,b)=>a+b.value,0) || 1;
  const r = (size - stroke)/2;
  const c = size/2;
  const circ = 2*Math.PI*r;
  let offset = 0;
  return (
    <svg width={size} height={size} className="donut">
      <circle cx={c} cy={c} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke}/>
      {data.map((d,i)=>{
        const len = (d.value/100)*circ;
        const el = (
          <circle key={i} cx={c} cy={c} r={r}
            fill="none" stroke={d.color} strokeWidth={stroke}
            strokeDasharray={`${len} ${circ-len}`} strokeDashoffset={-offset}
            className="donut-anim"
          />
        );
        offset += len;
        return el;
      })}
      <circle cx={c} cy={c} r={r - stroke/2} fill="white" opacity="0.92"/>
    </svg>
  );
}
function BarChart({ data, width=460, barH=14, gap=12 }) {
  const max = Math.max(...data.map(d=>d.value), 1);
  const height = data.length*(barH+gap);
  const colors = { cash:"#10b981", bonds:"#60a5fa", stocks:"#f59e0b", crypto:"#8b5cf6", venture:"#ef4444" };
  return (
    <svg width={width} height={height} className="bars">
      {data.map((d,i)=>{
        const w = Math.max(4, (d.value/max)*(width-150));
        const y = i*(barH+gap);
        const color = colors[d.label] || "#94a3b8";
        return (
          <g key={d.label} transform={`translate(0,${y})`}>
            <text x="0" y={barH-2} className="bar-label">{labelIcon(d.label)} {d.label}</text>
            <rect x="130" y="0" width={width-150} height={barH} fill="#eef2f7" rx="7"/>
            <rect x="130" y="0" width={w} height={barH} fill={color} rx="7" className="bar-fill-anim"/>
            <text x={130+w+6} y={barH-2} className="bar-value">{Math.round(d.value)}%</text>
          </g>
        );
      })}
    </svg>
  );
}

/** ---------- tiny label helpers ---------- */
const emojiFor = (k) => ({Travel:"✈️","Emergency Fund":"🛟","Down Payment":"🏡",Retirement:"👵"}[k] || "🎯");
const labelLiving = (v)=>({campus:"on-campus", roommates:"roommates", solo:"solo"}[v]);
const labelCity = (v)=>({low:"low-cost", avg:"average-cost", high:"high-cost"}[v]);
const labelIcon = (k)=>({cash:"💵", bonds:"🏦", stocks:"📈", crypto:"🪙", venture:"🚀"}[k]||"•");

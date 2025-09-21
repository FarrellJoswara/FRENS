import React, { useEffect, useMemo, useState } from "react";
import "./Health.css";
import HealthBg from "../assets/Health.svg";
import { useParams } from "react-router-dom";
import { useLyfeSlice } from "../lyfe/LyfeContext";

/* ---------- math & helpers ---------- */
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const kgToLb = (kg) => kg / 0.45359237;
const lbToKg = (lb) => lb * 0.45359237;
const cmFromFtIn = (ft, inch) => Math.round((ft * 12 + inch) * 2.54);
const ftInFromCm = (cm) => {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  return { ft, inch };
};
const ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
const TIMELINE_WEEKS = { "8 weeks": 8, "12 weeks": 12, "6 months": 26, "1 year": 52 };
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function mifflinStJeor({ sex, weightKg, heightCm, age }) {
  return sex === "F"
    ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
    : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}
const round = (n, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

/* ---------- local tracker store (browser only) ---------- */
const LS_KEY = "health-db";
function lsGetDB() { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; } }
function lsSetDB(db) { localStorage.setItem(LS_KEY, JSON.stringify(db)); }
function saveDay(dateStr, partial) {
  const db = lsGetDB();
  db[dateStr] = { ...(db[dateStr] || {}), ...partial };
  lsSetDB(db);
}
function loadDay(dateStr) { return lsGetDB()[dateStr] || null; }
function loadRange(fromStr, toStr) {
  const db = lsGetDB();
  const from = new Date(fromStr), to = new Date(toStr);
  const out = [];
  for (const [k, v] of Object.entries(db)) {
    const d = new Date(k);
    if (d >= from && d <= to) out.push({ date: k, ...v });
  }
  return out.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/* ---------- charts ---------- */
function Donut({ data, size = 180, stroke = 24 }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg width={size} height={size} className="donut">
      <circle cx={c} cy={c} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      {data.map((d, i) => {
        const len = (d.value / total) * circ;
        const el = (
          <circle
            key={i}
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={stroke}
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-off}
            className="donut-anim"
          />
        );
        off += len;
        return el;
      })}
      <circle cx={c} cy={c} r={r - stroke / 2} fill="#fff" opacity="0.96" />
    </svg>
  );
}
function Bars({ data, width = 560, barH = 14, gap = 12 }) {
  const max = Math.max(...data.map((d) => d.value), 1);
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
            <text x={130 + w + 8} y={barH - 2} className="bar-value">{d.right ?? round(d.value)}</text>
          </g>
        );
      })}
    </svg>
  );
}
function Sparkline({ points, width = 560, height = 100, color = "#22c55e" }) {
  if (!points || points.length < 2) return <div style={{ height }} />;
  const min = Math.min(...points), max = Math.max(...points);
  const xs = width / (points.length - 1);
  const y = (v) => height - ((v - min) / (max - min || 1)) * height;
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * xs} ${y(p)}`).join(" ");
  return <svg width={width} height={height} className="spark"><path d={d} fill="none" stroke={color} strokeWidth="2.5" /></svg>;
}

/* ---------- small UI atoms ---------- */
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
function Stepper({ step }) {
  return (
    <div className="stepper">
      <span className={step === 1 ? "active" : ""}>1. Goal</span>
      <span className={step === 2 ? "active" : ""}>2. About you</span>
      <span className={step === 3 ? "active" : ""}>3. Plan</span>
    </div>
  );
}

/* ---------- routine builder ---------- */
function buildRoutine({ focus, daysSel, minutes }) {
  const chosenDays = DAY_NAMES.filter((_, i) => daysSel[i]);
  if (!chosenDays.length) return { plan: [], weekly: { sessions: 0, minutesTotal: 0, minutesCardio: 0, minutesStrength: 0 } };

  const blocks =
    focus === "PPL" ? ["Push", "Pull", "Legs"] :
      focus === "Upper/Lower" ? ["Upper", "Lower"] :
        focus === "Cardio-first" ? ["Cardio", "Strength (short)"] :
          ["Full-body"];

  const menu = {
    "Full-body": ["Squat/Leg Press", "Bench/DB Press", "Row/Lat Pull", "Hinge (RDL)", "Core/Carry", "10–15m easy cardio"],
    "Push": ["Bench/DB Press", "Overhead Press", "Incline DB", "Triceps pushdown", "Lateral raises", "Core"],
    "Pull": ["Row", "Lat Pull", "Rear delt fly", "Biceps curl", "Back extension", "Core"],
    "Legs": ["Back/Front Squat", "RDL", "Lunge/Leg Press", "Leg curl", "Calf raise", "Core"],
    "Upper": ["Bench/DB Press", "Row/Lat Pull", "Overhead Press", "Pulldown", "Curls/Triceps"],
    "Lower": ["Back/Front Squat", "RDL", "Leg Press/Lunge", "Leg curl", "Calf raise", "Core"],
    "Cardio": ["30–45m Zone 2 (easy pace)"],
    "Strength (short)": ["Full-body circuit 25m (squat, push, pull, hinge)"]
  };

  const plan = [];
  let b = 0;
  for (const day of chosenDays) {
    const block = blocks[b % blocks.length];
    const list = menu[block] || menu["Full-body"];
    plan.push({ day, block, minutes, exercises: list.slice(0, 6) });
    b++;
  }

  const weekly = {
    sessions: plan.length,
    minutesTotal: plan.reduce((a, s) => a + s.minutes, 0),
    minutesCardio: plan.filter(s => s.block === "Cardio").reduce((a, s) => a + s.minutes, 0),
    minutesStrength: plan.filter(s => s.block !== "Cardio").reduce((a, s) => a + s.minutes, 0),
  };

  return { plan, weekly };
}

/* ======================= MAIN ======================= */
export default function Health() {
  /** ---------- load per-lyfe slice ---------- */
  const { lyfeId } = useParams();
  const { slice, setSlice } = useLyfeSlice("health", lyfeId);
  const saved = slice?.inputs || {};

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState(saved.goal ?? ""); // Weight | Strength | Cardio | Wellness
  const [timeline, setTimeline] = useState(saved.timeline ?? "8 weeks");

  /* ===== Units (kg/lb, cm/ft+in) ===== */
  const [weightUnit, setWeightUnit] = useState(saved.weightUnit ?? "kg"); // "kg" | "lb"
  const [heightUnit, setHeightUnit] = useState(saved.heightUnit ?? "cm"); // "cm" | "ftin"

  // inputs (internally store metric)
  const [age, setAge] = useState(saved.age ?? "");
  const [sex, setSex] = useState(saved.sex ?? "F");
  const [heightCm, setHeightCm] = useState(saved.heightCm ?? ""); // internally cm
  const [heightFt, setHeightFt] = useState(saved.heightFt ?? 5);  // shown if ft+in selected
  const [heightIn, setHeightIn] = useState(saved.heightIn ?? 5);
  const [weightKg, setWeightKg] = useState(saved.weightKg ?? ""); // internally kg
  const [activity, setActivity] = useState(saved.activity ?? "light");
  const [diet, setDiet] = useState(saved.diet ?? "Omni");

  // routine params
  const [focus, setFocus] = useState(saved.focus ?? "Full-body");
  const [minutes, setMinutes] = useState(saved.minutes ?? 45);
  const [daysSel, setDaysSel] = useState(saved.daysSel ?? [true, false, true, false, true, false, false]);

  /** ---------- hydrate when :lyfeId changes ---------- */
  useEffect(() => {
    const sv = (slice && slice.inputs) || {};
    setGoal(sv.goal ?? "");
    setTimeline(sv.timeline ?? "8 weeks");
    setWeightUnit(sv.weightUnit ?? "kg");
    setHeightUnit(sv.heightUnit ?? "cm");

    setAge(sv.age ?? "");
    setSex(sv.sex ?? "F");
    setHeightCm(sv.heightCm ?? "");
    setHeightFt(sv.heightFt ?? 5);
    setHeightIn(sv.heightIn ?? 5);
    setWeightKg(sv.weightKg ?? "");
    setActivity(sv.activity ?? "light");
    setDiet(sv.diet ?? "Omni");

    setFocus(sv.focus ?? "Full-body");
    setMinutes(sv.minutes ?? 45);
    setDaysSel(sv.daysSel ?? [true, false, true, false, true, false, false]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lyfeId]);

  // when unit toggles change, convert the existing stored values
  const toggleWeightUnit = (u) => { if (u !== weightUnit) setWeightUnit(u); };
  const toggleHeightUnit = (u) => {
    if (u === heightUnit) return;
    if (u === "ftin" && heightCm) {
      const { ft, inch } = ftInFromCm(+heightCm);
      setHeightFt(ft); setHeightIn(inch);
    }
    if (u === "cm" && (heightFt || heightIn)) {
      setHeightCm(cmFromFtIn(+heightFt || 0, +heightIn || 0));
    }
    setHeightUnit(u);
  };

  // display proxies
  const weightDisplay = weightUnit === "kg"
    ? (weightKg ?? "")
    : (weightKg !== "" ? round(kgToLb(+weightKg), 1) : "");
  const setWeightDisplay = (val) => {
    if (val === "" || isNaN(val)) { setWeightKg(""); return; }
    const num = +val;
    setWeightKg(weightUnit === "kg" ? num : lbToKg(num));
  };

  const heightDisplayCm = heightUnit === "cm" ? heightCm : (heightCm ? heightCm : "");
  const setHeightDisplayCm = (v) => {
    if (v === "" || isNaN(v)) { setHeightCm(""); return; }
    setHeightCm(+v);
  };

  useEffect(() => {
    if (heightUnit === "ftin") {
      const cm = cmFromFtIn(+heightFt || 0, +heightIn || 0);
      setHeightCm(cm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heightFt, heightIn, heightUnit]);

  const validInfo = age && heightCm && weightKg && goal;
  const weeks = TIMELINE_WEEKS[timeline] || 8;

  // energy
  const bmr = useMemo(() => validInfo ? mifflinStJeor({ sex, weightKg: +weightKg, heightCm: +heightCm, age: +age }) : 0, [sex, weightKg, heightCm, age, validInfo]);
  const tdee = useMemo(() => (bmr ? bmr * (ACTIVITY[activity] || 1.375) : 0), [bmr, activity]);

  const calorieTarget = useMemo(() => {
    if (!tdee) return 0;
    if (goal === "Weight") return clamp(Math.round(tdee - 400), sex === "F" ? 1200 : 1500, 3500);
    if (goal === "Strength") return Math.round(tdee + 250);
    if (goal === "Cardio") return Math.round(tdee);
    if (goal === "Wellness") return Math.round(tdee - 150);
    return Math.round(tdee);
  }, [tdee, goal, sex]);

  const proteinPerKg = goal === "Strength" || goal === "Weight" ? 1.8 : 1.6;
  const proteinG = validInfo ? Math.round(proteinPerKg * +weightKg) : 0;

  const fatTargetPct = 30;
  const fatCal = Math.round((fatTargetPct / 100) * calorieTarget);
  const fatG = Math.round(fatCal / 9);

  const carbCal = Math.max(0, calorieTarget - (proteinG * 4 + fatCal));
  const carbsG = Math.round(carbCal / 4);

  const proteinPct = calorieTarget ? round(((proteinG * 4) / calorieTarget) * 100) : 0;
  const carbPct = calorieTarget ? round((carbCal / calorieTarget) * 100) : 0;
  const fatSharePct = calorieTarget ? round((fatCal / calorieTarget) * 100) : 0;

  const waterL = validInfo ? clamp(round(+weightKg * 0.035, 1), 1.8, 3.5) : 0;

  // routine
  const { plan: routinePlan, weekly: routineWeekly } = useMemo(
    () => buildRoutine({ focus, daysSel, minutes }),
    [focus, daysSel, minutes]
  );

  // Outlook controls for Weight
  const [weightChangeLbs, setWeightChangeLbs] = useState(-8);
  const [paceLbsPerWk, setPaceLbsPerWk] = useState(-1);

  // outlook series
  const dailyGap = Math.round(calorieTarget - tdee);
  const kgPerWeek = round((dailyGap * 7) / 7700, 2);
  const weightSeries = useMemo(() => {
    if (goal !== "Weight" || !weightKg) return [];
    const startLb = kgToLb(+weightKg);
    const weeksInt = weeks || 8;
    const byChangeEnd = startLb + weightChangeLbs;
    const endLb = byChangeEnd;
    const arr = [];
    for (let w = 0; w <= weeksInt; w++) {
      const v = startLb + (endLb - startLb) * (w / weeksInt);
      arr.push(round(v, 1));
    }
    return arr;
  }, [goal, weightKg, weeks, weightChangeLbs]);

  const strengthIndex = useMemo(() => {
    if (goal !== "Strength") return [];
    const sessions = routineWeekly.sessions;
    const rate = sessions >= 3 ? 1.03 : sessions >= 2 ? 1.02 : 1.01; // per 4 weeks
    const steps = Math.max(1, Math.ceil(weeks / 4));
    const arr = [100];
    for (let i = 1; i <= steps; i++) arr.push(round(arr[i - 1] * rate, 1));
    const weekly = [];
    for (let w = 0; w <= weeks; w++) weekly.push(round(100 + (arr[arr.length - 1] - 100) * (w / weeks), 1));
    return weekly;
  }, [goal, weeks, routineWeekly.sessions]);

  const cardioIndex = useMemo(() => {
    if (goal !== "Cardio") return [];
    const minWeek = routineWeekly.minutesCardio || 0;
    const good = minWeek >= 150;
    const totalGain = good ? 10 : 5; // %
    const arr = [];
    for (let w = 0; w <= weeks; w++) arr.push(round(100 + (totalGain * w / weeks), 1));
    return arr;
  }, [goal, weeks, routineWeekly.minutesCardio]);

  const paceText = goal === "Weight"
    ? `Pace needed: ${paceLbsPerWk} lb/week`
    : `Minutes/week: ${routineWeekly.minutesTotal}`;

  // plan UI
  const [planVisible, setPlanVisible] = useState(false);
  const [planTab, setPlanTab] = useState("daily"); // daily | routine | outlook | playbook | tracker
  const calculatePlan = () => { if (validInfo) { setPlanVisible(true); setStep(3); } };

  /* ---------- tracker state ---------- */
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [tDate, setTDate] = useState(today);
  const [tWeightKg, setTWeightKg] = useState(() => loadDay(today)?.weightKg ?? (+weightKg || ""));
  const [tWaterMl, setTWaterMl] = useState(() => loadDay(today)?.waterMl ?? 0);
  const [tWorkoutDone, setTWorkoutDone] = useState(() => loadDay(today)?.workout ?? false);
  const [tWorkoutEntries, setTWorkoutEntries] = useState(() => loadDay(today)?.workoutEntries || []);
  const [tMeals, setTMeals] = useState(() => loadDay(today)?.meals || []);
  const [tNotes, setTNotes] = useState(() => loadDay(today)?.notes || "");

  const onChangeDate = (d) => {
    setTDate(d);
    const day = loadDay(d) || {};
    setTWeightKg(day.weightKg ?? "");
    setTWaterMl(day.waterMl ?? 0);
    setTWorkoutDone(!!day.workout);
    setTWorkoutEntries(day.workoutEntries || []);
    setTMeals(day.meals || []);
    setTNotes(day.notes || "");
  };

  useEffect(() => {
    saveDay(tDate, {
      weightKg: tWeightKg === "" ? undefined : +tWeightKg,
      waterMl: +tWaterMl,
      workout: !!tWorkoutDone,
      workoutEntries: tWorkoutEntries,
      meals: tMeals,
      notes: tNotes
    });
  }, [tDate, tWeightKg, tWaterMl, tWorkoutDone, tWorkoutEntries, tMeals, tNotes]);

  const hist = useMemo(() => {
    const end = new Date();
    const start = new Date(end); start.setDate(start.getDate() - 29);
    const fmt = (d) => d.toISOString().slice(0, 10);
    return loadRange(fmt(start), fmt(end));
  }, [tDate, tWorkoutDone, tWaterMl, tWeightKg, tWorkoutEntries, tMeals, tNotes]);

  const weightSeries30 = hist.map(h => (h.weightKg ? kgToLb(h.weightKg) : null)).filter(v => v != null);
  const waterSeries30 = hist.map(h => (h.waterMl ?? 0) / 1000);
  const workoutCount7 = hist.slice(-7).filter(h => h.workout).length;

  /** ---------- persist to lyfe ---------- */
  useEffect(() => {
    setSlice({
      inputs: {
        goal, timeline, weightUnit, heightUnit,
        age, sex, heightCm, heightFt, heightIn, weightKg,
        activity, diet, focus, minutes, daysSel,
      },
      computed: {
        calorieTarget, proteinG, waterL, routineDays: routinePlan.length,
      },
    });
  }, [
    goal, timeline, weightUnit, heightUnit,
    age, sex, heightCm, heightFt, heightIn, weightKg,
    activity, diet, focus, minutes, daysSel,
    calorieTarget, proteinG, waterL, routinePlan.length,
  ]);

  /* ---------- render ---------- */
  return (
    <div className="health-root" style={{ backgroundImage: `url(${HealthBg})` }}>
      <div className="health-overlay" />
      <section className="health-card">
        <header className="page-header">
          <h1>Future-You Health</h1>
          <p>Simple choices. Clear plan. Track your progress into the future.</p>
        </header>

        <Stepper step={step} />

        {/* STEP 1 */}
        <section className="panel">
          <h2 className="panel-title">What’s your primary goal?</h2>
          <div className="goal-row">
            {["Weight", "Strength", "Cardio", "Wellness"].map((g) => (
              <button
                key={g}
                className={`goal-card ${goal === g ? "active" : ""}`}
                onClick={() => setGoal(g)}
                type="button"
              >
                {g}
              </button>
            ))}
          </div>
          <Field label="Over this timeline">
            <select className="input" value={timeline} onChange={(e) => setTimeline(e.target.value)}>
              {Object.keys(TIMELINE_WEEKS).map((k) => <option key={k}>{k}</option>)}
            </select>
          </Field>
          <div className="actions">
            <button className="primary" disabled={!goal} onClick={() => setStep(2)}>Next</button>
          </div>
        </section>

        {/* STEP 2 */}
        {step >= 2 && (
          <section className="panel">
            <h2 className="panel-title">About you</h2>

            {/* Unit toggles */}
            <div className="grid3">
              <Field label="Weight unit" right={<span className="unit-badge">{weightUnit.toUpperCase()}</span>}>
                <div className="chips">
                  <button className={`chip ${weightUnit==="kg"?"on":""}`} onClick={()=>toggleWeightUnit("kg")}>kg</button>
                  <button className={`chip ${weightUnit==="lb"?"on":""}`} onClick={()=>toggleWeightUnit("lb")}>lb</button>
                </div>
              </Field>
              <Field label="Height unit" right={<span className="unit-badge">{heightUnit==="cm"?"CM":"FT+IN"}</span>}>
                <div className="chips">
                  <button className={`chip ${heightUnit==="cm"?"on":""}`} onClick={()=>toggleHeightUnit("cm")}>cm</button>
                  <button className={`chip ${heightUnit==="ftin"?"on":""}`} onClick={()=>toggleHeightUnit("ftin")}>ft+in</button>
                </div>
              </Field>
            </div>

            <div className="grid4">
              <Field label="Age"><input className="input" type="number" min={14} max={80} value={age} onChange={(e) => setAge(e.target.value)} /></Field>
              <Field label="Sex"><select className="input" value={sex} onChange={(e) => setSex(e.target.value)}><option>F</option><option>M</option></select></Field>

              {/* Height inputs */}
              {heightUnit === "cm" ? (
                <Field label="Height (cm)">
                  <input className="input" type="number" min={140} max={210} value={heightDisplayCm} onChange={(e) => setHeightDisplayCm(e.target.value)} />
                </Field>
              ) : (
                <Field label="Height (ft + in)">
                  <div className="ftin">
                    <input className="input" type="number" min={4} max={7} value={heightFt} onChange={(e)=>setHeightFt(+e.target.value)} />
                    <span className="ftin-sep">ft</span>
                    <input className="input" type="number" min={0} max={11} value={heightIn} onChange={(e)=>setHeightIn(+e.target.value)} />
                    <span className="ftin-sep">in</span>
                  </div>
                </Field>
              )}

              {/* Weight input */}
              <Field label={`Weight (${weightUnit})`}>
                <input className="input" type="number" min={weightUnit==="kg"?40:88} max={weightUnit==="kg"?180:400}
                       value={weightDisplay} onChange={(e)=>setWeightDisplay(e.target.value)} />
              </Field>
            </div>

            <div className="grid3">
              <Field label="Activity">
                <select className="input" value={activity} onChange={(e) => setActivity(e.target.value)}>
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                </select>
              </Field>
              <Field label="Diet style">
                <select className="input" value={diet} onChange={(e) => setDiet(e.target.value)}>
                  <option>Omni</option><option>Vegetarian</option><option>Vegan</option><option>Mediterranean</option><option>High-protein</option>
                </select>
              </Field>
            </div>

            <p className="hint">We’ll compute your daily targets from this. You can tweak them after calculation.</p>

            <div className="actions">
              <button className="secondary" onClick={() => setStep(1)}>Back</button>
              <button className="primary" disabled={!validInfo} onClick={calculatePlan}>Calculate plan</button>
            </div>
          </section>
        )}

        {/* PLAN */}
        {planVisible && (
          <section className="plan-panel">
            <div className="plan-summary">
              <div className="pill">{goal}</div>
              <div className="sum-item"><span>Timeline</span><b>{timeline}</b></div>
              <div className="sum-item"><span>Calories</span><b>{calorieTarget} kcal</b></div>
              <div className="sum-item"><span>Protein</span><b>{proteinG} g</b></div>
              <div className="sum-item"><span>Water</span><b>{waterL} L</b></div>
              <div className="sum-item"><span>Routine</span><b>{minutes}m · {routinePlan.length}d · {focus}</b></div>
              <div className={`sum-item tag ${goal === "Weight" && (kgPerWeek < -1 || kgPerWeek > 1) ? "warn" : ""}`}>{paceText}</div>
              {goal === "Weight" && (sex === "F" ? calorieTarget < 1200 : calorieTarget < 1500) && (
                <div className="sum-item tag warn">We clamped calories to a safer minimum.</div>
              )}
              <button className="print-btn" onClick={() => window.print()}>Print / PDF</button>
            </div>

            <div className="tabs">
              {["daily", "routine", "outlook", "playbook", "tracker"].map(t => (
                <button key={t} className={planTab === t ? "active" : ""} onClick={() => setPlanTab(t)}>
                  {t === "daily" ? "Daily targets" : t === "routine" ? "Weekly routine" : t === "outlook" ? "Outlook" : t === "playbook" ? "Playbook" : "Tracker"}
                </button>
              ))}
            </div>

            <div className="tab-body">
              {/* DAILY */}
              {planTab === "daily" && (
                <div className="grid2">
                  <div>
                    <div className="target"><div className="target-label">Calories / day</div><div className="target-value">{calorieTarget} kcal</div></div>
                    <div className="macro-box">
                      <div className="macro-row"><span>Protein</span><b>{proteinG} g</b><i>({proteinPct}%)</i></div>
                      <div className="macro-row"><span>Carbs</span><b>{carbsG} g</b><i>({carbPct}%)</i></div>
                      <div className="macro-row"><span>Fat</span><b>{fatG} g</b><i>({fatSharePct}%)</i></div>
                      <div className="macro-row"><span>Water</span><b>{waterL} L/day</b></div>
                    </div>
                    <div className="templates">
                      {["3 meals + 2 snacks", "High-protein 3 meals", "16:8 IF", "Budget-friendly"].map(m => (
                        <button key={m} className="template">{m}</button>
                      ))}
                    </div>
                  </div>
                  <div className="center">
                    <Donut data={[
                      { label: "Protein", value: proteinG * 4, color: "#22c55e" },
                      { label: "Carbs", value: carbsG * 4, color: "#3b82f6" },
                      { label: "Fat", value: fatCal, color: "#f59e0b" },
                    ]} />
                    <div className="legend">
                      <div className="legend-row"><span className="swatch" style={{ background: "#22c55e" }} /><span>Protein</span><b>{proteinPct}%</b></div>
                      <div className="legend-row"><span className="swatch" style={{ background: "#3b82f6" }} /><span>Carbs</span><b>{carbPct}%</b></div>
                      <div className="legend-row"><span className="swatch" style={{ background: "#f59e0b" }} /><span>Fat</span><b>{fatSharePct}%</b></div>
                    </div>
                  </div>
                </div>
              )}

              {/* ROUTINE */}
              {planTab === "routine" && (
                <>
                  <div className="grid3">
                    <Field label="Focus">
                      <select className="input" value={focus} onChange={(e) => setFocus(e.target.value)}>
                        <option>Full-body</option><option>PPL</option><option>Upper/Lower</option><option>Cardio-first</option>
                      </select>
                    </Field>
                    <Field label="Session length">
                      <select className="input" value={minutes} onChange={(e) => setMinutes(+e.target.value)}>
                        <option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>60 min</option>
                      </select>
                    </Field>
                    <Field label="Days">
                      <div className="chips">
                        {DAY_NAMES.map((d, i) => (
                          <button key={d} className={`chip ${daysSel[i] ? "on" : ""}`} onClick={() => setDaysSel(s => s.map((v, idx) => idx === i ? !v : v))}>{d}</button>
                        ))}
                      </div>
                    </Field>
                  </div>

                  <div className="panel soft">
                    {routinePlan.length === 0 ? (
                      <div className="routine-row">Pick 2–4 days to build your routine.</div>
                    ) : routinePlan.map((s, i) => (
                      <div key={i} className="routine-row">
                        <b>{s.day} — {s.block} · {s.minutes}m</b>
                        <div className="routine-ex">{s.exercises.join(" · ")}</div>
                      </div>
                    ))}
                  </div>

                  <div className="panel soft" style={{marginTop:10}}>
                    <div className="legend-row"><span className="swatch" style={{background:"#22c55e"}}/> Strength volume</div>
                    <div className="legend-row"><span className="swatch" style={{background:"#60a5fa"}}/> Cardio minutes</div>
                    <div className="legend-row"><span className="swatch" style={{background:"#f59e0b"}}/> Total time</div>
                  </div>

                  <div className="panel soft" style={{marginTop:10}}>
                    <b>Status:</b>{" "}
                    {(goal==="Cardio" && routineWeekly.minutesCardio >= 150) || 
                    (goal!=="Cardio" && routineWeekly.sessions >= 2)
                      ? "On track" : "Needs more days or minutes"}
                  </div>

                  <div className="grid1">
                    <Bars
                      data={[
                        { label: "Sessions/wk", value: routineWeekly.sessions, color: "#22c55e", right: `${routineWeekly.sessions}` },
                        { label: "Strength min/wk", value: routineWeekly.minutesStrength, color: "#3b82f6", right: `${routineWeekly.minutesStrength}m` },
                        { label: "Cardio min/wk", value: routineWeekly.minutesCardio, color: "#60a5fa", right: `${routineWeekly.minutesCardio}m` },
                        { label: "Total min/wk", value: routineWeekly.minutesTotal, color: "#f59e0b", right: `${routineWeekly.minutesTotal}m` },
                      ]}
                    />
                  </div>
                </>
              )}

              {/* OUTLOOK */}
              {planTab === "outlook" && (
                <div className="grid1">
                  {goal === "Weight" && (
                    <>
                      <div className="grid3" style={{marginBottom:8}}>
                        <Field label="Target change (lb)">
                          <input className="input" type="number" value={weightChangeLbs}
                                 onChange={(e)=>setWeightChangeLbs(Number(e.target.value)||0)} />
                        </Field>
                        <Field label="Pace (lb / week)">
                          <input className="input" type="number" step="0.1" value={paceLbsPerWk}
                                 onChange={(e)=>setPaceLbsPerWk(Number(e.target.value)||0)} />
                        </Field>
                        <div className="hint" style={{alignSelf:"end"}}>Tip: −0.5 to −1.0 lb/wk is a steady, realistic pace.</div>
                      </div>
                      {weightSeries.length > 1 && (
                        <>
                          <Sparkline points={weightSeries} color="#22c55e" />
                          <p className="hint">
                            Start: {weightSeries[0]} lb · Target: {weightSeries.at(-1)} lb · Pace: {paceLbsPerWk} lb/wk · Timeline: {timeline}.
                          </p>
                        </>
                      )}
                    </>
                  )}
                  {goal === "Strength" && strengthIndex.length > 0 && (
                    <>
                      <Sparkline points={strengthIndex} color="#3b82f6" />
                      <p className="hint">
                        With {routinePlan.length} sessions/week & protein target, expect ~{round(strengthIndex.at(-1) - 100, 1)}% in {timeline}.
                      </p>
                    </>
                  )}
                  {goal === "Cardio" && cardioIndex.length > 0 && (
                    <>
                      <Sparkline points={cardioIndex} color="#60a5fa" />
                      <p className="hint">
                        Minutes/week: {routineWeekly.minutesCardio} (cardio). Consistency drives gains—target ≥150 min/week.
                      </p>
                    </>
                  )}
                  {goal === "Wellness" && (
                    <p className="hint">Keep routine consistency and sleep habits; expect gradual energy & recovery improvements over {timeline}.</p>
                  )}
                </div>
              )}

              {/* PLAYBOOK */}
              {planTab === "playbook" && (
                <div className="playbook">
                  <h3>Daily playbook</h3>
                  <ul>
                    <li>Protein first each meal (eggs/yogurt/chicken/tempeh).</li>
                    <li>2–3 repeatable breakfasts & lunches; keep it boring on weekdays.</li>
                    <li>Carry a bottle; hit {waterL} L.</li>
                    <li>Walk 5–10 min after 1–2 meals for glucose control.</li>
                  </ul>
                  <h3>Weekly playbook</h3>
                  <ul>
                    <li>Train {routinePlan.length} day(s) • {minutes} min • {focus}. Put them on your calendar.</li>
                    <li>Batch-cook carbs + protein once on weekends.</li>
                    <li>Deload every 4–6 weeks (reduce sets by ~30%).</li>
                    <li>Review progress monthly; adjust calories by ±100–150 if trend stalls.</li>
                  </ul>
                </div>
              )}

              {/* TRACKER */}
              {planTab === "tracker" && (
                <div className="grid2">
                  <div>
                    <h3>Today</h3>
                    <div className="grid3">
                      <Field label="Date">
                        <input className="input" type="date" value={tDate} onChange={(e)=>onChangeDate(e.target.value)} />
                      </Field>
                      <Field label={`Weight (${weightUnit})`}>
                        <input className="input" type="number"
                          value={weightUnit==="kg" ? (tWeightKg ?? "") : (tWeightKg!==""? round(kgToLb(+tWeightKg),1):"")}
                          onChange={(e)=>{
                            const v = e.target.value;
                            if (v==="" || isNaN(v)) { setTWeightKg(""); return; }
                            setTWeightKg(weightUnit==="kg" ? +v : lbToKg(+v));
                          }} />
                      </Field>
                      <Field label={`Water (${Math.round(tWaterMl/10)/100} L)`}>
                        <div className="water-row">
                          <div className="water-track"><div className="water-fill" style={{ width: `${Math.min(100, (tWaterMl/(waterL*1000||1))*100)}%` }} /></div>
                          <div className="chips">
                            <button className="chip" onClick={()=>setTWaterMl(m=>m+250)}>+250 ml</button>
                            <button className="chip" onClick={()=>setTWaterMl(0)}>Reset</button>
                          </div>
                        </div>
                      </Field>
                    </div>

                    <div className="grid1">
                      <div className="panel soft">
                        <div className="panel-title">Workouts</div>
                        <div className="chips" style={{marginBottom:8}}>
                          <button className="chip" onClick={()=>setTWorkoutEntries(arr=>[...arr,{type:"Full-body", minutes:minutes}])}>+ Add workout</button>
                          <div className="chips">
                            <button className={`chip ${tWorkoutDone?'on':''}`} onClick={()=>setTWorkoutDone(v=>!v)}>{tWorkoutDone?"Workout done":"Workout not done"}</button>
                          </div>
                        </div>
                        {tWorkoutEntries.length === 0 && <div className="hint">No workouts logged.</div>}
                        {tWorkoutEntries.map((w,i)=>(
                          <div key={i} className="routine-row">
                            <div className="grid3">
                              <Field label="Type">
                                <select className="input" value={w.type} onChange={(e)=>setTWorkoutEntries(arr=>arr.map((x,idx)=>idx===i?{...x,type:e.target.value}:x))}>
                                  <option>Full-body</option><option>Upper</option><option>Lower</option><option>Push</option><option>Pull</option><option>Cardio</option>
                                </select>
                              </Field>
                              <Field label="Minutes">
                                <input className="input" type="number" value={w.minutes} onChange={(e)=>setTWorkoutEntries(arr=>arr.map((x,idx)=>idx===i?{...x,minutes:+e.target.value}:x))}/>
                              </Field>
                              <Field label="Remove">
                                <button className="chip" onClick={()=>setTWorkoutEntries(arr=>arr.filter((_,idx)=>idx!==i))}>Delete</button>
                              </Field>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="panel soft">
                        <div className="panel-title">Meals</div>
                        <div className="chips" style={{marginBottom:8}}>
                          <button className="chip" onClick={()=>setTMeals(arr=>[...arr,{name:"Meal", cal:500}])}>+ Add meal</button>
                        </div>
                        {tMeals.length === 0 && <div className="hint">No meals logged.</div>}
                        {tMeals.map((m,i)=>(
                          <div key={i} className="routine-row">
                            <div className="grid3">
                              <Field label="Name">
                                <input className="input" value={m.name} onChange={(e)=>setTMeals(arr=>arr.map((x,idx)=>idx===i?{...x,name:e.target.value}:x))}/>
                              </Field>
                              <Field label="Calories">
                                <input className="input" type="number" value={m.cal} onChange={(e)=>setTMeals(arr=>arr.map((x,idx)=>idx===i?{...x,cal:+e.target.value}:x))}/>
                              </Field>
                              <Field label="Remove">
                                <button className="chip" onClick={()=>setTMeals(arr=>arr.filter((_,idx)=>idx!==i))}>Delete</button>
                              </Field>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="panel soft">
                        <div className="panel-title">Notes</div>
                        <textarea className="input" rows={3} placeholder="How did today feel?" value={tNotes} onChange={(e)=>setTNotes(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3>Last 30 days</h3>
                    <div className="panel soft">
                      <div className="mini-chart"><div className="mini-title">Weight trend (lb)</div><Sparkline points={weightSeries30} color="#3b82f6" /></div>
                      <div className="mini-chart"><div className="mini-title">Water per day (L)</div><Sparkline points={waterSeries30} color="#0ea5a3" /></div>
                      <div className="mini-stats">
                        <div className="stat"><div className="k">Workouts (7d)</div><div className="v">{workoutCount7}/7</div></div>
                        <div className="stat"><div className="k">Entries (30d)</div><div className="v">{hist.length}</div></div>
                      </div>
                    </div>

                    <h4>Raw log (latest 10)</h4>
                    <div className="table">
                      <div className="tr tr-head">
                        <div className="td">Date</div><div className="td">Weight (kg)</div><div className="td">Water (ml)</div><div className="td">Workout</div>
                      </div>
                      {hist.slice(-10).reverse().map((h,i)=>(
                        <div className="tr" key={i}>
                          <div className="td">{h.date}</div>
                          <div className="td">{h.weightKg ?? "—"}</div>
                          <div className="td">{h.waterMl ?? 0}</div>
                          <div className="td">{h.workout ? "✓" : "—"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

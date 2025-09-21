import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/** Local persistence */
const LS_KEY = "lyfe-db-v1";

/**
 * Shape:
 * {
 *   list: [{ id, name, meta:{ job, location, salaryBand }, finance:{inputs,computed}, health:{inputs,computed} }],
 *   currentId: string|null
 * }
 */

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { list: [], currentId: null }; // ⬅️ no default lyfe
    const parsed = JSON.parse(raw);
    if (!parsed.list) return { list: [], currentId: null };
    return parsed;
  } catch {
    return { list: [], currentId: null };
  }
}
function save(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

const LyfeCtx = createContext(null);

export function LyfeProvider({ userEmail, children }) {
  const [list, setList] = useState(() => load().list);
  const [currentId, setCurrentId] = useState(() => load().currentId ?? null);

  useEffect(() => {
    save({ list, currentId });
  }, [list, currentId]);

  // basic helpers
  const getById = (id) => list.find((l) => l.id === id) || null;

  const createLyfe = ({ name, job, location, salaryBand }) => {
    const id = Math.random().toString(36).slice(2, 9);
    const entry = {
      id,
      name: name?.trim() || "My Lyfe",
      meta: { job: job || "", location: location || "", salaryBand: salaryBand || "" },
      finance: { inputs: {}, computed: {} },
      health: { inputs: {}, computed: {} },
    };
    setList((arr) => [...arr, entry]);
    setCurrentId(id);
    return id;
  };

  const updateLyfeMeta = (id, partial) => {
    setList((arr) =>
      arr.map((l) => (l.id === id ? { ...l, meta: { ...(l.meta || {}), ...partial } } : l))
    );
  };

  const removeLyfe = (id) => {
    setList((arr) => arr.filter((l) => l.id !== id));
    setCurrentId((cid) => (cid === id ? null : cid));
  };

  // slice writer/reader (finance/health/etc)
  const setSliceById = (id, sliceName, updaterOrObject) => {
    setList((arr) =>
      arr.map((l) => {
        if (l.id !== id) return l;
        const prev = l[sliceName] || {};
        const next =
          typeof updaterOrObject === "function"
            ? updaterOrObject(prev)
            : { ...prev, ...updaterOrObject };
        return { ...l, [sliceName]: next };
      })
    );
  };

  const value = useMemo(
    () => ({
      list,
      currentId,
      setCurrentId,
      getById,
      createLyfe,
      updateLyfeMeta,
      removeLyfe,
      setSliceById,
    }),
    [list, currentId]
  );

  return <LyfeCtx.Provider value={value}>{children}</LyfeCtx.Provider>;
}

export function useLyfe() {
  const ctx = useContext(LyfeCtx);
  if (!ctx) throw new Error("useLyfe must be used inside <LyfeProvider>");
  return ctx;
}

/** Convenience hook used by pages to bind to a slice of a lyfe */
export function useLyfeSlice(sliceName, lyfeId) {
  const { getById, setSliceById } = useLyfe();
  const id = lyfeId; // required for persistence per-lyfe
  const lyfe = getById(id);

  const slice = lyfe?.[sliceName] || {};
  const setSlice = (updaterOrObject) => setSliceById(id, sliceName, updaterOrObject);

  return { slice, setSlice, lyfe };
}

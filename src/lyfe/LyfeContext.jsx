import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ctx = createContext(null);
const keyFor = (email) => `lyfe::${email || "anon"}`;

const emptyBundle = (name = "My First Lyfe") => {
  const id = crypto.randomUUID?.() || String(Date.now());
  const now = new Date().toISOString();
  return {
    byId: {
      [id]: {
        id, name, createdAt: now, updatedAt: now,
        finance: { inputs: {}, computed: {} },
        health:  { inputs: {}, computed: {} },
      },
    },
    order: [id],
    currentId: id,
  };
};

const load = (email) => {
  try {
    const raw = localStorage.getItem(keyFor(email));
    return raw ? JSON.parse(raw) : emptyBundle();
  } catch { return emptyBundle(); }
};
const persist = (email, data) => localStorage.setItem(keyFor(email), JSON.stringify(data));

export function LyfeProvider({ userEmail, children }) {
  const [data, setData] = useState(() => load(userEmail));
  useEffect(() => persist(userEmail, data), [userEmail, data]);
  const value = useMemo(() => ({ data, setData, userEmail }), [data, userEmail]);
  return <ctx.Provider value={value}>{children}</ctx.Provider>;
}

export function useLyfe() {
  const c = useContext(ctx);
  if (!c) throw new Error("LyfeProvider missing");
  const { data, setData } = c;

  const list = data.order.map((id) => data.byId[id]);
  const select = (id) => setData((d) => ({ ...d, currentId: id }));
  const create = (name = "New Lyfe") =>
    setData((d) => {
      const id = crypto.randomUUID?.() || String(Date.now());
      const now = new Date().toISOString();
      return {
        ...d,
        byId: { ...d.byId, [id]: { id, name, createdAt: now, updatedAt: now, finance:{inputs:{},computed:{}}, health:{inputs:{},computed:{}} } },
        order: [id, ...d.order],
        currentId: id,
      };
    });
  const rename = (id, name) =>
    setData((d) => ({ ...d, byId: { ...d.byId, [id]: { ...d.byId[id], name, updatedAt: new Date().toISOString() } } }));
  const remove = (id) =>
    setData((d) => {
      const byId = { ...d.byId }; delete byId[id];
      const order = d.order.filter((x) => x !== id);
      return { ...d, byId, order, currentId: d.currentId === id ? order[0] : d.currentId };
    });
  const duplicate = (id) =>
    setData((d) => {
      const src = d.byId[id]; if (!src) return d;
      const newId = crypto.randomUUID?.() || String(Date.now());
      const now = new Date().toISOString();
      return {
        ...d,
        byId: { ...d.byId, [newId]: { ...src, id: newId, name: `${src.name} (copy)`, createdAt: now, updatedAt: now } },
        order: [newId, ...d.order],
        currentId: newId,
      };
    });

  return { list, currentId: data.currentId, byId: data.byId, select, create, rename, remove, duplicate, setData };
}

/** Per-lyfe slice reader/writer (sliceName: 'finance' | 'health') */
export function useLyfeSlice(sliceName, lyfeId) {
  const { byId, currentId, setData } = useLyfe();
  const id = lyfeId || currentId;
  const lyfe = byId[id];
  const slice = lyfe?.[sliceName] || { inputs: {}, computed: {} };

  const setSlice = (patch) => {
    setData((d) => {
      const cur = d.byId[id] || {};
      const prev = cur[sliceName] || {};
      return {
        ...d,
        byId: {
          ...d.byId,
          [id]: { ...cur, [sliceName]: { ...prev, ...patch }, updatedAt: new Date().toISOString() },
        },
      };
    });
  };

  return { lyfeId: id, lyfe, slice, setSlice };
}

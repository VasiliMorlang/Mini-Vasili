import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "firmenbot-kb-v1";
const EMBED_STORAGE_KEY = "minivasili-embeddings-v1";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const CHAT_MODEL = "gemini-2.5-flash";
const EMBED_MODEL = "gemini-embedding-001";
const CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/models/" + CHAT_MODEL + ":generateContent?key=" + API_KEY;
const EMBED_URL = "https://generativelanguage.googleapis.com/v1beta/models/" + EMBED_MODEL + ":embedContent?key=" + API_KEY;
const EMBED_BATCH_URL = "https://generativelanguage.googleapis.com/v1beta/models/" + EMBED_MODEL + ":batchEmbedContents?key=" + API_KEY;
const DRIVE_URL = "https://script.google.com/macros/s/AKfycbzMZopv6BoR0xKgUei7txo6XePZRRuPll2nU863L27JdF45q0Hfh2KP_5QE_KvnAHSsow/exec";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; overflow: hidden; }
  body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
  .app { display: flex; height: 100vh; }
  .sidebar { width: 220px; min-width: 220px; background: #0c1628; display: flex; flex-direction: column; color: white; }
  .logo { padding: 20px 18px 18px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .logo-icon { font-size: 26px; }
  .logo-name { font-size: 15px; font-weight: 800; letter-spacing: -0.3px; }
  .logo-sub { font-size: 11px; color: #4a6fa5; font-weight: 500; margin-top: 2px; }
  nav { padding: 12px 10px; flex: 1; }
  .nav-item { width: 100%; display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 8px; background: none; border: none; color: #8ba3c7; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.12s; margin-bottom: 3px; }
  .nav-item:hover { color: white; background: rgba(255,255,255,0.07); }
  .nav-item.active { color: white; background: rgba(59,130,246,0.18); }
  .nav-badge { margin-left: auto; background: #3b82f6; color: white; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 20px; }
  .sidebar-foot { padding: 14px 18px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #4a6fa5; }
  .setup-screen { flex: 1; display: flex; align-items: center; justify-content: center; background: #f0f4f8; }
  .setup-card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); max-width: 500px; width: 100%; text-align: center; }
  .setup-icon { font-size: 48px; margin-bottom: 16px; }
  .setup-card h2 { font-size: 20px; font-weight: 800; color: #0c1628; margin-bottom: 12px; }
  .setup-card p { font-size: 14px; color: #64748b; line-height: 1.8; }
  .setup-card a { color: #3b82f6; text-decoration: none; font-weight: 600; }
  .setup-code { display: inline-block; background: #f1f5f9; padding: 2px 8px; border-radius: 5px; font-family: monospace; font-size: 13px; color: #0c1628; }
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #f0f4f8; }
  .admin { flex: 1; overflow-y: auto; padding: 28px 30px; display: flex; flex-direction: column; gap: 22px; }
  .admin-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .page-head h2 { font-size: 20px; font-weight: 800; color: #0c1628; letter-spacing: -0.4px; }
  .page-head p { font-size: 13px; color: #64748b; margin-top: 4px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .card { background: white; border-radius: 12px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
  .card-title { font-size: 11.5px; font-weight: 700; color: #334155; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.8px; }
  .fg { margin-bottom: 12px; }
  .fg label { display: block; font-size: 12.5px; font-weight: 600; color: #475569; margin-bottom: 5px; }
  .inp { width: 100%; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13.5px; font-family: inherit; color: #0c1628; outline: none; background: #f8fafc; transition: border-color 0.15s; resize: vertical; }
  .inp:focus { border-color: #3b82f6; background: white; }
  .btn-blue { padding: 9px 18px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: background 0.15s; }
  .btn-blue:hover:not(:disabled) { background: #2563eb; }
  .btn-blue:disabled { background: #94a3b8; cursor: not-allowed; }
  .btn-green { padding: 9px 18px; background: #16a34a; color: white; border: none; border-radius: 8px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
  .btn-green:hover:not(:disabled) { background: #15803d; }
  .btn-green:disabled { background: #94a3b8; cursor: not-allowed; }
  .drop { border: 2px dashed #cbd5e1; border-radius: 10px; padding: 28px 20px; text-align: center; cursor: pointer; background: #f8fafc; transition: all 0.15s; margin-bottom: 10px; }
  .drop:hover { border-color: #3b82f6; background: #eff6ff; }
  .drop-icon { font-size: 28px; margin-bottom: 8px; }
  .drop-title { font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 4px; }
  .drop-fmts { font-size: 12px; color: #94a3b8; }
  .file-tip { font-size: 12px; color: #94a3b8; }
  .entry-list { display: flex; flex-direction: column; gap: 8px; }
  .entry { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e9eef5; }
  .entry-l { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
  .entry-ico { font-size: 18px; flex-shrink: 0; }
  .entry-name { font-size: 13.5px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .entry-meta { font-size: 11.5px; color: #94a3b8; margin-top: 2px; }
  .btn-del { padding: 5px 11px; background: none; border: 1px solid #fecaca; border-radius: 6px; color: #ef4444; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; margin-left: 12px; flex-shrink: 0; transition: all 0.15s; }
  .btn-del:hover { background: #fee2e2; }
  .empty-txt { font-size: 13px; color: #94a3b8; text-align: center; padding: 18px; }
  .drive-badge { display: inline-block; background: #dcfce7; color: #16a34a; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; margin-left: 8px; }
  .chat { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .chat-head { background: white; padding: 14px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #e2e8f0; flex-shrink: 0; }
  .chat-av { font-size: 24px; }
  .chat-hname { font-size: 14px; font-weight: 700; color: #0c1628; }
  .chat-status { font-size: 12px; color: #22c55e; margin-top: 1px; }
  .btn-ghost { margin-left: auto; padding: 7px 14px; background: none; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: #64748b; cursor: pointer; font-family: inherit; transition: all 0.15s; }
  .btn-ghost:hover { background: #f1f5f9; }
  .kb-warn { background: #fffbeb; border-bottom: 1px solid #fde68a; padding: 10px 20px; font-size: 13px; color: #92400e; flex-shrink: 0; }
  .messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; background: #f0f4f8; }
  .msg { display: flex; align-items: flex-end; gap: 8px; max-width: 82%; }
  .msg.user { align-self: flex-end; flex-direction: row-reverse; }
  .msg.assistant { align-self: flex-start; }
  .m-av { font-size: 22px; flex-shrink: 0; margin-bottom: 2px; }
  .bubble { padding: 11px 15px; border-radius: 16px; font-size: 14px; line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
  .msg.assistant .bubble { background: white; color: #1e293b; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .msg.user .bubble { background: #3b82f6; color: white; border-bottom-right-radius: 4px; }
  .bubble.typing { display: flex; align-items: center; gap: 5px; padding: 14px 18px; }
  .bubble.typing span { width: 7px; height: 7px; background: #94a3b8; border-radius: 50%; animation: blink 1.4s infinite ease-in-out both; }
  .bubble.typing span:nth-child(2) { animation-delay: 0.2s; }
  .bubble.typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
  .input-bar { padding: 14px 20px; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; align-items: flex-end; flex-shrink: 0; }
  .chat-inp { flex: 1; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: inherit; color: #0c1628; outline: none; resize: none; background: #f8fafc; transition: border-color 0.15s; line-height: 1.5; }
  .chat-inp:focus { border-color: #3b82f6; background: white; }
  .send-btn { width: 42px; height: 42px; background: #3b82f6; border: none; border-radius: 10px; cursor: pointer; font-size: 18px; color: white; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; }
  .send-btn:hover:not(:disabled) { background: #2563eb; }
  .send-btn:disabled { background: #94a3b8; cursor: not-allowed; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
`;

const loadLocal = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
};

const loadEmbedCache = () => {
  try { return JSON.parse(localStorage.getItem(EMBED_STORAGE_KEY) || "{}"); }
  catch { return {}; }
};

// Teilt einen Text in kleinere, ueberlappungsfreie Abschnitte (max. ~700 Zeichen),
// damit pro Frage nur die relevanten Stuecke statt der ganzen Wissensbasis verschickt werden.
function chunkText(text, maxChars = 700) {
  const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (!paras.length) return text.trim() ? [text.trim()] : [];
  const chunks = [];
  let buf = "";
  for (let p of paras) {
    while (p.length > maxChars) {
      if (buf) { chunks.push(buf); buf = ""; }
      chunks.push(p.slice(0, maxChars));
      p = p.slice(maxChars);
    }
    if (buf && (buf.length + p.length + 2) > maxChars) {
      chunks.push(buf);
      buf = p;
    } else {
      buf = buf ? buf + "\n\n" + p : p;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

// Einfacher, schneller Hash um zu erkennen ob sich ein Eintrag seit dem letzten
// Indexieren geaendert hat (dann muss er neu eingebettet werden, sonst nicht).
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return h.toString(36) + ":" + str.length;
}

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}

// Embeddet mehrere Textabschnitte auf einmal (effizienter als einzeln) ueber Gemini.
async function embedBatch(texts, taskType) {
  const out = [];
  for (let i = 0; i < texts.length; i += 90) {
    const slice = texts.slice(i, i + 90);
    const res = await fetch(EMBED_BATCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: slice.map(t => ({
          model: "models/" + EMBED_MODEL,
          content: { parts: [{ text: t.slice(0, 8000) }] },
          taskType,
          outputDimensionality: 768
        }))
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    out.push(...data.embeddings.map(e => e.values || (e.embedding && e.embedding.values)));
  }
  return out;
}

// Embeddet die Nutzerfrage (separater Endpoint, da nur ein einzelner Text).
async function embedOne(text, taskType) {
  const res = await fetch(EMBED_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/" + EMBED_MODEL,
      content: { parts: [{ text: text.slice(0, 8000) }] },
      taskType,
      outputDimensionality: 768
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.embedding.values;
}

export default function App() {
  const [view, setView] = useState("chat");
  const [localEntries, setLocalEntries] = useState(() => loadLocal());
  const [driveEntries, setDriveEntries] = useState([]);
  const [driveLoading, setDriveLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [fileProc, setFileProc] = useState(false);
  const fileRef = useRef(null);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! Ich bin Mini-Vasili - der digitale Vasili.\nFragt mich alles, was ihr sonst dem echten Vasili fragen wuerdet. Ich nerve nicht zurueck!" }
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef(null);

  const allEntries = [...driveEntries, ...localEntries];
  const embedCacheRef = useRef(loadEmbedCache());
  const indexingRef = useRef(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatLoading]);

  // Baut/aktualisiert den Embedding-Index im Hintergrund, sobald sich die Wissensbasis aendert.
  // Unveraenderte Eintraege werden per Hash erkannt und NICHT neu eingebettet (spart Tokens/Zeit).
  useEffect(() => {
    if (allEntries.length) ensureIndex(allEntries).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveEntries, localEntries]);

  async function ensureIndex(entries) {
    if (indexingRef.current) return embedCacheRef.current;
    indexingRef.current = true;
    try {
      const cache = embedCacheRef.current;
      const validIds = new Set();
      for (const e of entries) {
        validIds.add(e.id);
        const h = simpleHash(e.content);
        if (cache[e.id] && cache[e.id].hash === h) continue;
        const chunks = chunkText(e.content);
        if (!chunks.length) continue;
        const vectors = await embedBatch(chunks, "RETRIEVAL_DOCUMENT");
        cache[e.id] = { hash: h, title: e.title, chunks: chunks.map((text, i) => ({ text, vec: vectors[i] })) };
      }
      for (const id of Object.keys(cache)) { if (!validIds.has(id)) delete cache[id]; }
      try { localStorage.setItem(EMBED_STORAGE_KEY, JSON.stringify(cache)); } catch (e) {}
      return cache;
    } finally {
      indexingRef.current = false;
    }
  }

  // Sucht die zur Frage passendsten Wissensbasis-Ausschnitte statt alles zu verschicken.
  async function getRelevantContext(question, entries, topK = 6) {
    const cache = await ensureIndex(entries);
    const qVec = await embedOne(question, "RETRIEVAL_QUERY");
    const scored = [];
    for (const id of Object.keys(cache)) {
      const entry = cache[id];
      for (const c of entry.chunks) scored.push({ title: entry.title, text: c.text, score: cosineSim(qVec, c.vec) });
    }
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, topK);
    if (!top.length) return "";
    return top.map(t => "=== " + t.title + " ===\n" + t.text).join("\n\n---\n\n");
  }

  const loadDrive = async () => {
    setDriveLoading(true);
    try {
      const res = await fetch(DRIVE_URL);
      const data = await res.json();
      setDriveEntries(data.map((d, i) => ({ id: "drive-" + i, title: d.title, content: d.content, isFile: true })));
    } catch (e) {
      setDriveEntries([]);
    } finally {
      setDriveLoading(false);
    }
  };

  useEffect(() => { loadDrive(); }, []);

  const persistLocal = (arr) => {
    setLocalEntries(arr);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
  };

  const addText = () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    persistLocal([...localEntries, { id: Date.now().toString(), title: title.trim(), content: content.trim(), date: new Date().toLocaleDateString("de-DE") }]);
    setTitle(""); setContent(""); setSaving(false);
  };

  const handleFile = async (file) => {
    if (!file) return;
    setFileProc(true);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      let text = "";
      if (ext === "txt" || ext === "csv") {
        text = await file.text();
      } else {
        alert("Bitte .txt oder .csv verwenden.");
        return;
      }
      if (!text.trim()) { alert("Datei ist leer."); return; }
      persistLocal([...localEntries, { id: Date.now().toString(), title: file.name, content: text.trim(), date: new Date().toLocaleDateString("de-DE"), isFile: true }]);
    } catch (e) {
      alert("Fehler beim Lesen.");
    } finally {
      setFileProc(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteLocal = (id) => persistLocal(localEntries.filter(e => e.id !== id));

  const buildSystem = (context) => {
    if (!allEntries.length) return "Du bist Mini-Vasili. Deine Wissensbasis ist noch leer. Sag es locker und mit Humor. Antworte auf Deutsch.";
    const kb = (context && context.trim())
      ? context
      : allEntries.map(e => "=== " + e.title + " ===\n" + e.content).join("\n\n---\n\n");
    return "Du bist Mini-Vasili, der digitale Assistent von Vasili.\nSei freundlich, witzig aber hilfreich.\nBeantworte Fragen NUR auf Basis der folgenden Wissensbasis-Ausschnitte (das sind die zur Frage passendsten Stellen, nicht zwingend die komplette Wissensbasis).\nWenn Info fehlt: Das weiss ich leider nicht, frag den echten Vasili.\nAntworte auf Deutsch.\n\nWISSENSBASIS-AUSSCHNITTE:\n" + kb;
  };

  const send = async () => {
    const txt = input.trim();
    if (!txt || chatLoading) return;
    const msgs = [...messages, { role: "user", content: txt }];
    setMessages(msgs); setInput(""); setChatLoading(true);
    try {
      let systemText;
      if (!allEntries.length) {
        systemText = buildSystem();
      } else {
        try {
          const context = await getRelevantContext(txt, allEntries);
          systemText = buildSystem(context);
        } catch (ragErr) {
          // Falls die Embedding-Suche mal ausfaellt: Notloesung mit der vollen Wissensbasis,
          // damit der Bot trotzdem antwortet (kostet dann mehr Tokens, aber funktioniert).
          systemText = buildSystem();
        }
      }
      const history = msgs.slice(1).map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemText }] },
          contents: history,
          generationConfig: { maxOutputTokens: 1024 }
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Keine Antwort erhalten.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Fehler: " + (e.message || "Verbindungsproblem.") }]);
    } finally { setChatLoading(false); }
  };

  const resetChat = () => setMessages([{ role: "assistant", content: "Hey! Was kann Mini-Vasili fuer euch tun?" }]);

  if (!API_KEY) {
    return (
      <>
        <style>{CSS}</style>
        <div className="app">
          <aside className="sidebar">
            <div className="logo">
              <div className="logo-icon">🤖</div>
              <div>
                <div className="logo-name">Mini-Vasili</div>
                <div className="logo-sub">Immer fuer euch da</div>
              </div>
            </div>
          </aside>
          <main className="main">
            <div className="setup-screen">
              <div className="setup-card">
                <div className="setup-icon">🔑</div>
                <h2>API-Key fehlt</h2>
                <p>
                  Vercel Dashboard, Settings, Environment Variables:<br /><br />
                  Name: <span className="setup-code">VITE_GEMINI_API_KEY</span><br />
                  Key von <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">aistudio.google.com</a><br /><br />
                  Dann Redeploy klicken.
                </p>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-icon">🤖</div>
            <div>
              <div className="logo-name">Mini-Vasili</div>
              <div className="logo-sub">Immer fuer euch da</div>
            </div>
          </div>
          <nav>
            <button className={"nav-item " + (view === "chat" ? "active" : "")} onClick={() => setView("chat")}>
              Chat
            </button>
            <button className={"nav-item " + (view === "admin" ? "active" : "")} onClick={() => setView("admin")}>
              Wissensbasis
              {allEntries.length > 0 && <span className="nav-badge">{allEntries.length}</span>}
            </button>
          </nav>
          <div className="sidebar-foot">
            {allEntries.length === 0 ? "Keine Daten" : allEntries.length + " Eintraege aktiv"}
          </div>
        </aside>
        <main className="main">
          {view === "admin" && (
            <div className="admin">
              <div className="admin-top">
                <div className="page-head">
                  <h2>Wissensbasis</h2>
                  <p>Google Drive + manuelle Eintraege</p>
                </div>
                <button className="btn-green" onClick={loadDrive} disabled={driveLoading}>
                  {driveLoading ? "Laedt..." : "Drive aktualisieren"}
                </button>
              </div>

              {driveEntries.length > 0 && (
                <div className="card">
                  <div className="card-title">
                    Google Drive
                    <span className="drive-badge">{driveEntries.length} Dokumente</span>
                  </div>
                  <div className="entry-list">
                    {driveEntries.map(function(e) {
                      return (
                        <div className="entry" key={e.id}>
                          <div className="entry-l">
                            <span className="entry-ico">📄</span>
                            <div style={{ minWidth: 0 }}>
                              <div className="entry-name">{e.title}</div>
                              <div className="entry-meta">{e.content.length.toLocaleString("de")} Zeichen</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {driveLoading && (
                <div className="card">
                  <p className="empty-txt">Google Drive wird geladen...</p>
                </div>
              )}

              <div className="grid2">
                <div className="card">
                  <div className="card-title">Text eingeben</div>
                  <div className="fg">
                    <label>Titel</label>
                    <input className="inp" value={title} onChange={function(e) { setTitle(e.target.value); }} placeholder="z. B. Preisliste 2026" />
                  </div>
                  <div className="fg">
                    <label>Inhalt</label>
                    <textarea className="inp" value={content} onChange={function(e) { setContent(e.target.value); }} placeholder="Texte, Preise, Infos..." rows={7} />
                  </div>
                  <button className="btn-blue" onClick={addText} disabled={saving || !title.trim() || !content.trim()} style={{ marginTop: 4 }}>
                    {saving ? "Speichert..." : "Hinzufuegen"}
                  </button>
                </div>
                <div className="card">
                  <div className="card-title">Datei hochladen</div>
                  <div className="drop" onClick={function() { if (fileRef.current) fileRef.current.click(); }}>
                    {fileProc
                      ? <p className="drop-title">Wird gelesen...</p>
                      : (
                        <>
                          <div className="drop-icon">📤</div>
                          <p className="drop-title">Klicken zum Hochladen</p>
                          <p className="drop-fmts">Text (.txt) oder CSV (.csv)</p>
                        </>
                      )
                    }
                  </div>
                  <input ref={fileRef} type="file" accept=".txt,.csv" style={{ display: "none" }} onChange={function(e) { handleFile(e.target.files[0]); }} />
                  <p className="file-tip">PDFs/Word: Als Google Doc in Drive speichern.</p>
                </div>
              </div>

              {localEntries.length > 0 && (
                <div className="card">
                  <div className="card-title">Manuelle Eintraege ({localEntries.length})</div>
                  <div className="entry-list">
                    {localEntries.map(function(e) {
                      return (
                        <div className="entry" key={e.id}>
                          <div className="entry-l">
                            <span className="entry-ico">{e.isFile ? "📄" : "📝"}</span>
                            <div style={{ minWidth: 0 }}>
                              <div className="entry-name">{e.title}</div>
                              <div className="entry-meta">{e.date} - {e.content.length.toLocaleString("de")} Zeichen</div>
                            </div>
                          </div>
                          <button className="btn-del" onClick={function() { deleteLocal(e.id); }}>Loeschen</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "chat" && (
            <div className="chat">
              <div className="chat-head">
                <div className="chat-av">🤖</div>
                <div>
                  <div className="chat-hname">Mini-Vasili</div>
                  <div className="chat-status">Online - {allEntries.length} Infoquellen</div>
                </div>
                <button className="btn-ghost" onClick={resetChat}>Neu starten</button>
              </div>
              {allEntries.length === 0 && !driveLoading && (
                <div className="kb-warn">
                  Wissensbasis leer - lege Docs in den Google Drive Ordner oder fuege manuell Infos hinzu.
                </div>
              )}
              <div className="messages">
                {messages.map(function(m, i) {
                  return (
                    <div key={i} className={"msg " + m.role}>
                      {m.role === "assistant" && <div className="m-av">🤖</div>}
                      <div className="bubble">{m.content}</div>
                      {m.role === "user" && <div className="m-av">👤</div>}
                    </div>
                  );
                })}
                {chatLoading && (
                  <div className="msg assistant">
                    <div className="m-av">🤖</div>
                    <div className="bubble typing"><span></span><span></span><span></span></div>
                  </div>
                )}
                <div ref={bottomRef}></div>
              </div>
              <div className="input-bar">
                <textarea
                  className="chat-inp"
                  value={input}
                  onChange={function(e) { setInput(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Frage eingeben... (Enter senden)"
                  rows={1}
                  disabled={chatLoading}
                />
                <button className="send-btn" onClick={send} disabled={chatLoading || !input.trim()}>➤</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

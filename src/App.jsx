import { useState, useEffect, useRef } from "react";
const STORAGE_KEY = "firmenbot-kb-v1";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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
  .page-head h2 { font-size: 20px; font-weight: 800; color: #0c1628; letter-spacing: -0.4px; }
  .page-head p { font-size: 13px; color: #64748b; margin-top: 4px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .card { background: white; border-radius: 12px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
  .card-title { font-size: 11.5px; font-weight: 700; color: #334155; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.8px; }
  .fg { margin-bottom: 12px; }
  .fg label { display: block; font-size: 12.5px; font-weight: 600; color: #475569; margin-bottom: 5px; }
  .inp { width: 100%; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13.5px; font-family: inherit; color: #0c1628; outline: none; background: #f8fafc; transition: border-color 0.15s; resize: vertical; }
  .inp:focus { border-color: #3b82f6; background: white; }
  .btn-blue { padding: 9px 18px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: background 0.15s; margin-top: 4px; }
  .btn-blue:hover:not(:disabled) { background: #2563eb; }
  .btn-blue:disabled { background: #94a3b8; cursor: not-allowed; }
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

const loadEntries = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
};

export default function App() {
  const [view, setView] = useState("chat");
  const [entries, setEntries] = useState(() => loadEntries());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [fileProc, setFileProc] = useState(false);
  const fileRef = useRef(null);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! 👋 Ich bin Mini-Vasili – der digitale Vasili.\nFragt mich alles, was ihr sonst dem echten Vasili fragen würdet. Ich nerve nicht zurück! 😄" }
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatLoading]);

  const persist = (arr) => {
    setEntries(arr);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch {}
  };

  const addText = () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    persist([...entries, { id: Date.now().toString(), title: title.trim(), content: content.trim(), date: new Date().toLocaleDateString("de-DE") }]);
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
        alert("Bitte .txt oder .csv Dateien verwenden. Für Word und Excel: Inhalt kopieren und oben einfügen.");
        return;
      }
      if (!text.trim()) { alert("Datei ist leer."); return; }
      persist([...entries, { id: Date.now().toString(), title: file.name, content: text.trim(), date: new Date().toLocaleDateString("de-DE"), isFile: true }]);
    } catch { alert("Fehler beim Lesen der Datei."); }
    finally { setFileProc(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const deleteEntry = (id) => persist(entries.filter(e => e.id !== id));

  const buildSystem = () => {
    if (!entries.length) return "Du bist Mini-Vasili. Deine Wissensbasis ist noch leer. Sag dem Nutzer das locker und mit Humor. Antworte auf Deutsch.";
    const kb = entries.map(e => `=== ${e.title} ===\n${e.content}`).join("\n\n---\n\n");
    return `Du bist Mini-Vasili – der digitale Assistent, der den echten Vasili ersetzt.\nDu bist freundlich, ein bisschen witzig, aber immer hilfreich und auf den Punkt.\nBeantworte Fragen AUSSCHLIESSLICH auf Basis der folgenden Wissensbasis.\nWenn eine Info fehlt: "Das weiß selbst ich nicht – frag vielleicht doch den echten Vasili 😄"\nAntworte auf Deutsch, kurz, klar und mit Charme.\n\nWISSENSBASIS:\n${kb}`;
  };

  const send = async () => {
    const txt = input.trim();
    if (!txt || chatLoading) return;
    const msgs = [...messages, { role: "user", content: txt }];
    setMessages(msgs); setInput(""); setChatLoading(true);
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: buildSystem() },
            ...msgs.slice(1).map(m => ({ role: m.role, content: m.content }))
          ],
          max_tokens: 1024
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.choices?.[0]?.message?.content || "Keine Antwort erhalten.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `Fehler: ${e.message || "Verbindungsproblem."}` }]);
    } finally { setChatLoading(false); }
  };

  const resetChat = () => setMessages([{ role: "assistant", content: "Hey! 👋 Was kann Mini-Vasili für euch tun?" }]);

  if (!API_KEY) return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="logo"><div className="logo-icon">🤖</div><div><div className="logo-name">Mini-Vasili</div><div className="logo-sub">Immer für euch da 🤙</div></div></div>
        </aside>
        <main className="main">
          <div className="setup-screen">
            <div className="setup-card">
              <div className="setup-icon">🔑</div>
              <h2>API-Key fehlt</h2>
              <p>Füge in Vercel unter <em>Settings → Environment Variables</em> hinzu:<br /><br />
                Name: <span className="setup-code">VITE_GROQ_API_KEY</span><br />
                Wert: Key von <a href="https://console.groq.com" target="_blank" rel="noreferrer">console.groq.com</a><br /><br />
                Dann <strong>Redeploy</strong> klicken ✅</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="logo"><div className="logo-icon">🤖</div><div><div className="logo-name">Mini-Vasili</div><div className="logo-sub">Immer für euch da 🤙</div></div></div>
          <nav>
            <button className={`nav-item ${view === "chat" ? "active" : ""}`} onClick={() => setView("chat")}>💬 Chat</button>
            <button className={`nav-item ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}>
              ⚙️ Wissensbasis {entries.length > 0 && <span className="nav-badge">{entries.length}</span>}
            </button>
          </nav>
          <div className="sidebar-foot">{entries.length === 0 ? "⚠️ Keine Daten gepflegt" : `✅ ${entries.length} Einträge aktiv`}</div>
        </aside>
        <main className="main">
          {view === "admin" && (
            <div className="admin">
              <div className="page-head"><h2>Wissensbasis verwalten</h2><p>Füge Texte hinzu, auf die Mini-Vasili zugreift.</p></div>
              <div className="grid2">
                <div className="card">
                  <div className="card-title">📝 Text eingeben</div>
                  <div className="fg"><label>Titel</label><input className="inp" value={title} onChange={e => setTitle(e.target.value)} placeholder="z. B. Preisliste 2026" /></div>
                  <div className="fg"><label>Inhalt</label><textarea className="inp" value={content} onChange={e => setContent(e.target.value)} placeholder="Texte, Preise, Infos hier einfügen…" rows={7} /></div>
                  <button className="btn-blue" onClick={addText} disabled={saving || !title.trim() || !content.trim()}>{saving ? "Speichert…" : "➕ Hinzufügen"}</button>
                </div>
                <div className="card">
                  <div className="card-title">📁 Textdatei hochladen</div>
                  <div className="drop" onClick={() => fileRef.current?.click()}>
                    {fileProc ? <><div className="drop-icon">⏳</div><p className="drop-title">Wird gelesen…</p></> : <><div className="drop-icon">📤</div><p className="drop-title">Klicken zum Hochladen</p><p className="drop-fmts">Text (.txt) · CSV (.csv)</p></>}
                  </div>
                  <input ref={fileRef} type="file" accept=".txt,.csv" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                  <p className="file-tip">💡 Excel/Word: Inhalt kopieren und links einfügen.</p>
                </div>
              </div>
              <div className="card">
                <div className="card-title">📚 Einträge ({entries.length})</div>
                {entries.length === 0 ? <p className="empty-txt">Noch leer. Füge oben Infos hinzu.</p> : (
                  <div className="entry-list">
                    {entries.map(e => (
                      <div className="entry" key={e.id}>
                        <div className="entry-l"><span className="entry-ico">{e.isFile ? "📄" : "📝"}</span><div style={{ minWidth: 0 }}><div className="entry-name">{e.title}</div><div className="entry-meta">{e.date} · {e.content.length.toLocaleString("de")} Zeichen</div></div></div>
                        <button className="btn-del" onClick={() => deleteEntry(e.id)}>Löschen</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {view === "chat" && (
            <div className="chat">
              <div className="chat-head">
                <div className="chat-av">🤖</div>
                <div><div className="chat-hname">Mini-Vasili</div><div className="chat-status">● Online · {entries.length} Infoquellen</div></div>
                <button className="btn-ghost" onClick={resetChat}>↺ Neu starten</button>
              </div>
              {entries.length === 0 && <div className="kb-warn">⚠️ Wissensbasis leer – gehe zu <strong>Wissensbasis</strong> und füge Infos hinzu.</div>}
              <div className="messages">
                {messages.map((m, i) => (
                  <div key={i} className={`msg ${m.role}`}>
                    {m.role === "assistant" && <div className="m-av">🤖</div>}
                    <div className="bubble">{m.content}</div>
                    {m.role === "user" && <div className="m-av">👤</div>}
                  </div>
                ))}
                {chatLoading && <div className="msg assistant"><div className="m-av">🤖</div><div className="bubble typing"><span /><span /><span /></div></div>}
                <div ref={bottomRef} />
              </div>
              <div className="input-bar">
                <textarea className="chat-inp" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
                  placeholder="Frage eingeben… (Enter senden)" rows={1} disabled={chatLoading} />
                <button className="send-btn" onClick={send} disabled={chatLoading || !input.trim()}>➤</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

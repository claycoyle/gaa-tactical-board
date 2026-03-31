import { useState, useRef, useCallback } from "react";

const PITCH_W = 800;
const PITCH_H = 520;
const R = 16;
const BALL_R = 11;

const initialBall = { x: 400, y: 260, attachedTo: null };

const videoLibrary = [
  {
    category: "1-2s",
    clips: [
      { url: "https://www.youtube.com/embed/StrVREfJCLA?start=294", note: "Slow to press — what happens to the 6 when the forward passes?" },
      { url: "https://www.youtube.com/embed/3We4g2F_qpo?start=1380", note: "Good width in build up, defenders pulled to the ball" },
    ]
  },
  {
    category: "Getting Out of the Running Lane",
    clips: [
      { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=5819", note: "Corner forward movement creates the goal" },
    ]
  },
  {
    category: "Providing Wide Options from Deep",
    clips: [
      { url: "https://www.youtube.com/embed/biMDyHgnn3Y?start=174", note: "" },
    ]
  },
  {
    category: "Changing Direction",
    clips: [
      { url: "https://www.youtube.com/embed/biMDyHgnn3Y?start=174", note: "" },
    ]
  },
  {
    category: "Out in Front & Attack the Space",
    clips: [
      { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=2850", note: "" },
      { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=2858", note: "" },
      { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=5684", note: "" },
      { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=5765", note: "" },
    ]
  },
  {
    category: "Overloads",
    clips: [
      { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=2850", note: "" },
      { url: "https://www.youtube.com/embed/3We4g2F_qpo?start=1738", note: "" },
    ]
  },
];

const initialPositions = () => {
  const home = [
    { id: "h1", x: 400, y: 490, label: "1" },
    { id: "h2", x: 200, y: 420, label: "2" },
    { id: "h3", x: 400, y: 430, label: "3" },
    { id: "h4", x: 600, y: 420, label: "4" },
    { id: "h5", x: 200, y: 340, label: "5" },
    { id: "h6", x: 400, y: 350, label: "6" },
    { id: "h7", x: 600, y: 340, label: "7" },
    { id: "h8", x: 300, y: 270, label: "8" },
    { id: "h9", x: 500, y: 270, label: "9" },
    { id: "h10", x: 200, y: 190, label: "10" },
    { id: "h11", x: 400, y: 200, label: "11" },
    { id: "h12", x: 600, y: 190, label: "12" },
    { id: "h13", x: 280, y: 110, label: "13" },
    { id: "h14", x: 400, y: 90, label: "14" },
    { id: "h15", x: 520, y: 110, label: "15" },
  ];
  const away = [
    { id: "a1", x: 400, y: 30, label: "1" },
    { id: "a2", x: 600, y: 100, label: "2" },
    { id: "a3", x: 400, y: 90, label: "3" },
    { id: "a4", x: 200, y: 100, label: "4" },
    { id: "a5", x: 600, y: 180, label: "5" },
    { id: "a6", x: 400, y: 170, label: "6" },
    { id: "a7", x: 200, y: 180, label: "7" },
    { id: "a8", x: 500, y: 250, label: "8" },
    { id: "a9", x: 300, y: 250, label: "9" },
    { id: "a10", x: 600, y: 330, label: "10" },
    { id: "a11", x: 400, y: 320, label: "11" },
    { id: "a12", x: 200, y: 330, label: "12" },
    { id: "a13", x: 520, y: 410, label: "13" },
    { id: "a14", x: 400, y: 430, label: "14" },
    { id: "a15", x: 280, y: 410, label: "15" },
  ];
  return { home, away };
};

const ONeillsBall = ({ x, y, isDragged, attached, onPointerDown }) => (
  <g style={{ cursor: isDragged ? "grabbing" : "grab" }} onPointerDown={onPointerDown}>
    <ellipse cx={x + 1} cy={y + 2} rx={BALL_R} ry={BALL_R} fill="rgba(0,0,0,0.25)" />
    <circle cx={x} cy={y} r={BALL_R} fill="#e8dcc8" stroke="#6b5b3e" strokeWidth="1.2" />
    <defs>
      <radialGradient id="ballGrad" cx="40%" cy="35%">
        <stop offset="0%" stopColor="#f5edd8" />
        <stop offset="60%" stopColor="#e0d2b4" />
        <stop offset="100%" stopColor="#c4ad82" />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={BALL_R - 0.6} fill="url(#ballGrad)" />
    <line x1={x} y1={y - BALL_R + 1.5} x2={x} y2={y + BALL_R - 1.5} stroke="#7a6842" strokeWidth="0.9" />
    <line x1={x - BALL_R + 1.5} y1={y} x2={x + BALL_R - 1.5} y2={y} stroke="#7a6842" strokeWidth="0.9" />
    <line x1={x - BALL_R * 0.6} y1={y - BALL_R * 0.6} x2={x + BALL_R * 0.6} y2={y + BALL_R * 0.6} stroke="#7a6842" strokeWidth="0.6" opacity="0.6" />
    <line x1={x + BALL_R * 0.6} y1={y - BALL_R * 0.6} x2={x - BALL_R * 0.6} y2={y + BALL_R * 0.6} stroke="#7a6842" strokeWidth="0.6" opacity="0.6" />
    {[[-3,-5],[3,-5],[-5,-2],[5,-2],[-5,2],[5,2],[-3,5],[3,5],[-7,0],[7,0],[0,-7],[0,7],[-2,-2],[2,-2],[-2,2],[2,2]].map(([dx,dy],i) => {
      if (Math.sqrt(dx*dx+dy*dy) > BALL_R - 1.5) return null;
      return <circle key={i} cx={x+dx} cy={y+dy} r="0.5" fill="#8a7a5a" opacity="0.5" />;
    })}
    <ellipse cx={x-3} cy={y-3} rx="3" ry="2" fill="white" opacity="0.3" transform={`rotate(-30 ${x-3} ${y-3})`} />
    {attached && (
      <circle cx={x} cy={y} r={BALL_R+3} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`360 ${x} ${y}`} dur="4s" repeatCount="indefinite" />
      </circle>
    )}
  </g>
);

const VideoModal = ({ url, onClose }) => (
  <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
    <div onClick={e => e.stopPropagation()} style={{ width:"90vw", maxWidth:1100, aspectRatio:"16/9", position:"relative", cursor:"default" }}>
      <iframe
        src={url + "&autoplay=1&rel=0"}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        style={{ width:"100%", height:"100%", border:"none", borderRadius:8 }}
      />
      <button onClick={onClose} style={{ position:"absolute", top:-44, right:0, background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", fontSize:22, cursor:"pointer", fontWeight:700, width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
    </div>
  </div>
);

const VideoLibrarySidebar = ({ open, setOpen, onExpand }) => {
  const [expanded, setExpanded] = useState({});
  const toggle = (cat) => setExpanded(p => ({ ...p, [cat]: !p[cat] }));

  return (
    <div style={{
      width: open ? 320 : 0, minWidth: open ? 320 : 0, transition: "all 0.3s",
      background: "#12122a", borderLeft: open ? "1px solid #333" : "none",
      overflow: "hidden", display: "flex", flexDirection: "column", height: "100vh"
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", borderBottom:"1px solid #2a2a4a" }}>
        <span style={{ color:"#fff", fontWeight:700, fontSize:15 }}>Video Library</span>
        <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:18 }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"6px 0" }}>
        {videoLibrary.map((cat, ci) => (
          <div key={ci}>
            <button onClick={() => toggle(cat.category)} style={{
              width:"100%", textAlign:"left", background: expanded[cat.category] ? "#1e1e3a" : "transparent",
              border:"none", borderBottom:"1px solid #1e1e3a", padding:"10px 14px", cursor:"pointer",
              color:"#fbbf24", fontSize:13, fontWeight:700, display:"flex", justifyContent:"space-between", alignItems:"center"
            }}>
              {cat.category}
              <span style={{ fontSize:10, color:"#888", marginLeft:6 }}>{cat.clips.length} clip{cat.clips.length > 1 ? "s" : ""} {expanded[cat.category] ? "▲" : "▼"}</span>
            </button>
            {expanded[cat.category] && (
              <div style={{ padding:"4px 10px 8px" }}>
                {cat.clips.map((clip, vi) => {
                  const vidId = clip.url.match(/embed\/([^?]+)/)?.[1] || "";
                  const startParam = clip.url.match(/start=(\d+)/)?.[1] || "0";
                  const thumb = `https://img.youtube.com/vi/${vidId}/mqdefault.jpg`;
                  return (
                    <div key={vi} style={{ marginBottom:8, background:"#1a1a36", borderRadius:6, overflow:"hidden", border:"1px solid #2a2a4a" }}>
                      <div style={{ position:"relative", cursor:"pointer" }} onClick={() => onExpand(clip.url)}>
                        <img src={thumb} alt="" style={{ width:"100%", height:90, objectFit:"cover", display:"block", opacity:0.85 }} />
                        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <div style={{ width:0, height:0, borderTop:"8px solid transparent", borderBottom:"8px solid transparent", borderLeft:"14px solid #fff", marginLeft:3 }} />
                          </div>
                        </div>
                        <div style={{ position:"absolute", bottom:4, right:6, background:"rgba(0,0,0,0.7)", color:"#fff", fontSize:10, padding:"2px 5px", borderRadius:3 }}>
                          {Math.floor(startParam / 60)}:{String(startParam % 60).padStart(2,"0")}
                        </div>
                      </div>
                      {clip.note && <div style={{ padding:"6px 8px", color:"#ccc", fontSize:11, lineHeight:1.4 }}>{clip.note}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function GAAWhiteboard() {
  const [ball, setBall] = useState({ ...initialBall });
  const [players, setPlayers] = useState(() => {
    const p = initialPositions();
    return [...p.home.map(h => ({ ...h, team: "home" })), ...p.away.map(a => ({ ...a, team: "away" }))];
  });
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ballOffset, setBallOffset] = useState({ x: 0, y: 0 });
  const [trails, setTrails] = useState({});
  const [showTrails, setShowTrails] = useState(false);
  const [attachMode, setAttachMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalUrl, setModalUrl] = useState(null);
  const svgRef = useRef(null);

  const getBallPos = useCallback(() => {
    if (ball.attachedTo) {
      const p = players.find(pl => pl.id === ball.attachedTo);
      if (p) return { x: p.x + ballOffset.x, y: p.y + ballOffset.y };
    }
    return { x: ball.x, y: ball.y };
  }, [ball, players, ballOffset]);

  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    pt.x = cx; pt.y = cy;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }, []);

  const handlePointerDown = useCallback((e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getSVGPoint(e);
    if (attachMode && id !== "ball") {
      setBall(prev => {
        if (prev.attachedTo === id) {
          const p = players.find(pl => pl.id === id);
          return { x: p.x + ballOffset.x, y: p.y + ballOffset.y, attachedTo: null };
        } else {
          setBallOffset({ x: R + BALL_R - 2, y: -(R + BALL_R - 2) });
          return { ...prev, attachedTo: id };
        }
      });
      setAttachMode(false);
      return;
    }
    if (id === "ball") {
      if (ball.attachedTo) return;
      setDragging("ball");
      setOffset({ x: pos.x - ball.x, y: pos.y - ball.y });
      if (showTrails) setTrails(prev => ({ ...prev, ball: [...(prev.ball || []), { x: ball.x, y: ball.y, break: true }] }));
      return;
    }
    const player = players.find(p => p.id === id);
    setDragging(id);
    setOffset({ x: pos.x - player.x, y: pos.y - player.y });
    if (showTrails) setTrails(prev => ({ ...prev, [id]: [...(prev[id] || []), { x: player.x, y: player.y, break: true }] }));
  }, [players, ball, ballOffset, getSVGPoint, showTrails, attachMode]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const pos = getSVGPoint(e);
    if (dragging === "ball") {
      const nx = Math.max(BALL_R, Math.min(PITCH_W - BALL_R, pos.x - offset.x));
      const ny = Math.max(BALL_R, Math.min(PITCH_H - BALL_R, pos.y - offset.y));
      setBall(prev => ({ ...prev, x: nx, y: ny }));
      if (showTrails) setTrails(prev => ({ ...prev, ball: [...(prev.ball || []), { x: nx, y: ny }] }));
      return;
    }
    const nx = Math.max(R, Math.min(PITCH_W - R, pos.x - offset.x));
    const ny = Math.max(R, Math.min(PITCH_H - R, pos.y - offset.y));
    setPlayers(prev => prev.map(p => p.id === dragging ? { ...p, x: nx, y: ny } : p));
    if (showTrails) {
      setTrails(prev => {
        const next = { ...prev, [dragging]: [...(prev[dragging] || []), { x: nx, y: ny }] };
        if (ball.attachedTo === dragging) next.ball = [...(prev.ball || []), { x: nx + ballOffset.x, y: ny + ballOffset.y }];
        return next;
      });
    }
  }, [dragging, offset, getSVGPoint, showTrails, ball.attachedTo, ballOffset]);

  const handlePointerUp = useCallback(() => setDragging(null), []);

  const reset = () => {
    const p = initialPositions();
    setPlayers([...p.home.map(h => ({ ...h, team: "home" })), ...p.away.map(a => ({ ...a, team: "away" }))]);
    setBall({ ...initialBall });
    setBallOffset({ x: 0, y: 0 });
    setTrails({});
    setAttachMode(false);
  };

  const clearTrails = () => setTrails({});

  const buildTrailPath = (points) => {
    if (!points || points.length < 2) return "";
    let d = "";
    for (let i = 0; i < points.length; i++) d += (i === 0 || points[i].break) ? `M ${points[i].x} ${points[i].y} ` : `L ${points[i].x} ${points[i].y} `;
    return d;
  };

  const trailColor = (id) => id === "ball" ? "rgba(255,255,255,0.7)" : id.startsWith("h") ? "rgba(251,191,36,0.7)" : "rgba(252,165,165,0.7)";

  const PitchMarkings = () => (
    <g>
      <rect x="20" y="10" width="760" height="500" rx="4" fill="#2d8a4e" stroke="white" strokeWidth="2" />
      <line x1="20" y1="260" x2="780" y2="260" stroke="white" strokeWidth="1.5" strokeDasharray="8,4" />
      <line x1="20" y1="130" x2="780" y2="130" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4,6" />
      <line x1="20" y1="390" x2="780" y2="390" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4,6" />
      <line x1="20" y1="80" x2="780" y2="80" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4,6" />
      <line x1="20" y1="440" x2="780" y2="440" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4,6" />
      <line x1="20" y1="45" x2="780" y2="45" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4,6" />
      <line x1="20" y1="475" x2="780" y2="475" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4,6" />
      <rect x="330" y="10" width="140" height="25" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M 280 10 L 280 50 L 520 50 L 520 10" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M 310 10 Q 400 70 490 10" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4,4" />
      <rect x="330" y="485" width="140" height="25" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M 280 510 L 280 470 L 520 470 L 520 510" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M 310 510 Q 400 450 490 510" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="370" y1="5" x2="370" y2="14" stroke="#eee" strokeWidth="3" />
      <line x1="430" y1="5" x2="430" y2="14" stroke="#eee" strokeWidth="3" />
      <line x1="370" y1="8" x2="430" y2="8" stroke="#eee" strokeWidth="2.5" />
      <rect x="371" y="9" width="58" height="5" fill="rgba(255,255,255,0.15)" />
      <line x1="370" y1="506" x2="370" y2="515" stroke="#eee" strokeWidth="3" />
      <line x1="430" y1="506" x2="430" y2="515" stroke="#eee" strokeWidth="3" />
      <line x1="370" y1="512" x2="430" y2="512" stroke="#eee" strokeWidth="2.5" />
      <rect x="371" y="506" width="58" height="5" fill="rgba(255,255,255,0.15)" />
      <circle cx="400" cy="260" r="40" fill="none" stroke="white" strokeWidth="1.5" />
      <circle cx="400" cy="260" r="3" fill="white" />
    </g>
  );

  const PlayerCounter = ({ player }) => {
    const isHome = player.team === "home";
    const isDragged = dragging === player.id;
    const isAttached = ball.attachedTo === player.id;
    const isAttachTarget = attachMode && !isDragged;
    return (
      <g style={{ cursor: attachMode ? "crosshair" : isDragged ? "grabbing" : "grab" }} onPointerDown={(e) => handlePointerDown(e, player.id)}>
        {isAttachTarget && <circle cx={player.x} cy={player.y} r={R + 4} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.6" />}
        <circle cx={player.x} cy={player.y} r={R}
          fill={isHome ? "#1a56db" : "#dc2626"}
          stroke={isAttached ? "#fbbf24" : isHome ? "#fbbf24" : "#fca5a5"}
          strokeWidth={isAttached ? 3.5 : isHome ? 3 : 2}
          filter={isDragged ? "url(#shadow)" : "none"}
          opacity={isDragged ? 0.85 : 1} />
        <text x={player.x} y={player.y + 1} textAnchor="middle" dominantBaseline="central"
          fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif"
          pointerEvents="none" style={{ userSelect: "none" }}>
          {player.label}
        </text>
      </g>
    );
  };

  const ballPos = getBallPos();

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif", background: "#1a1a2e", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 8px", overflow: "auto", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, width: "100%", maxWidth: 820, justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ margin: 0, color: "#fff", fontSize: 17, fontWeight: 700 }}>GAA Tactical Board</h2>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#1a56db", border: "2px solid #fbbf24", display: "inline-block" }} />
              <span style={{ color: "#ccc", fontSize: 11 }}>Home</span>
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#dc2626", border: "2px solid #fca5a5", display: "inline-block" }} />
              <span style={{ color: "#ccc", fontSize: 11 }}>Opp</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => { if (ball.attachedTo) { const p = players.find(pl => pl.id === ball.attachedTo); setBall({ x: p.x + ballOffset.x, y: p.y + ballOffset.y, attachedTo: null }); setBallOffset({ x: 0, y: 0 }); setAttachMode(false); } else { setAttachMode(m => !m); } }}
              style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid", borderColor: ball.attachedTo ? "#f87171" : attachMode ? "#fbbf24" : "#555", background: ball.attachedTo ? "rgba(248,113,113,0.15)" : attachMode ? "rgba(251,191,36,0.15)" : "#333", color: ball.attachedTo ? "#f87171" : attachMode ? "#fbbf24" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
              {ball.attachedTo ? "Detach" : attachMode ? "Pick Player..." : "Attach Ball"}
            </button>
            <button onClick={() => setShowTrails(t => !t)}
              style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid", borderColor: showTrails ? "#fbbf24" : "#555", background: showTrails ? "rgba(251,191,36,0.15)" : "#333", color: showTrails ? "#fbbf24" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
              {showTrails ? "Trails ON" : "Trails OFF"}
            </button>
            {Object.keys(trails).length > 0 && (
              <button onClick={clearTrails} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #555", background: "#333", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Clear</button>
            )}
            <button onClick={reset} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #555", background: "#333", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Reset</button>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)}
                style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #6366f1", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                Videos
              </button>
            )}
          </div>
        </div>

        {attachMode && (
          <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 6, padding: "5px 14px", marginBottom: 8, maxWidth: 820, width: "100%" }}>
            <span style={{ color: "#fbbf24", fontSize: 12 }}>Click any player to attach the ball</span>
          </div>
        )}

        <svg ref={svgRef} viewBox={`0 0 ${PITCH_W} ${PITCH_H}`}
          style={{ width: "100%", maxWidth: 820, borderRadius: 8, touchAction: "none", userSelect: "none" }}
          onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
            </filter>
          </defs>
          <rect width={PITCH_W} height={PITCH_H} fill="#1e3a1e" rx="8" />
          <PitchMarkings />
          {Object.entries(trails).map(([id, pts]) => {
            const d = buildTrailPath(pts);
            if (!d) return null;
            return (
              <g key={`trail-${id}`}>
                <path d={d} fill="none" stroke={trailColor(id)} strokeWidth={id === "ball" ? 2 : 3} strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                {pts.length >= 2 && (() => {
                  const last = pts[pts.length - 1], prev = pts[pts.length - 2];
                  const dx = last.x - prev.x, dy = last.y - prev.y, len = Math.sqrt(dx * dx + dy * dy);
                  if (len < 2) return null;
                  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                  return <polygon points="-6,-4 0,0 -6,4" fill={trailColor(id)} transform={`translate(${last.x},${last.y}) rotate(${angle})`} />;
                })()}
              </g>
            );
          })}
          {players.filter(p => p.team === "away" && p.id !== dragging).map(p => <PlayerCounter key={p.id} player={p} />)}
          {players.filter(p => p.team === "home" && p.id !== dragging).map(p => <PlayerCounter key={p.id} player={p} />)}
          {dragging && dragging !== "ball" && <PlayerCounter player={players.find(p => p.id === dragging)} />}
          <ONeillsBall x={ballPos.x} y={ballPos.y} isDragged={dragging === "ball"} attached={!!ball.attachedTo} onPointerDown={(e) => handlePointerDown(e, "ball")} />
        </svg>
      </div>

      <VideoLibrarySidebar open={sidebarOpen} setOpen={setSidebarOpen} onExpand={(url) => setModalUrl(url)} />
      {modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl(null)} />}
    </div>
  );
}

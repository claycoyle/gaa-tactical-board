import { useState, useRef, useCallback } from "react";

const PITCH_W = 660;
const PITCH_H = 640;
const R = 14;
const BALL_R = 10;

const initialBall = { x: 330, y: 320, attachedTo: null };

const videoLibrary = [
  { category: "1-2s", clips: [
    { url: "https://www.youtube.com/embed/StrVREfJCLA?start=294", note: "Slow to press — what happens to the 6 when the forward passes?" },
    { url: "https://www.youtube.com/embed/3We4g2F_qpo?start=1380", note: "Good width in build up, defenders pulled to the ball" },
  ]},
  { category: "Getting Out of the Running Lane", clips: [
    { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=5819", note: "Corner forward movement creates the goal" },
  ]},
  { category: "Providing Wide Options from Deep", clips: [
    { url: "https://www.youtube.com/embed/biMDyHgnn3Y?start=174", note: "" },
  ]},
  { category: "Changing Direction", clips: [
    { url: "https://www.youtube.com/embed/biMDyHgnn3Y?start=174", note: "" },
  ]},
  { category: "Out in Front & Attack the Space", clips: [
    { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=2850", note: "" },
    { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=2858", note: "" },
    { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=5684", note: "" },
    { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=5765", note: "" },
  ]},
  { category: "Overloads", clips: [
    { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=2850", note: "" },
    { url: "https://www.youtube.com/embed/3We4g2F_qpo?start=1738", note: "" },
  ]},
];

const initialPositions = () => {
  const pw = 600, ph = 580;
  const ox = 30, oy = 30;
  const cx = ox + pw/2; // 330
  const wide = pw * 0.38; // wing spread

  // Home (blue/gold) — attacking upward, GK at bottom
  const hGK  = oy + ph - 30;
  const hFB  = oy + ph - 75;
  const hHB  = oy + ph - 175;
  const hMid = oy + ph/2 + 10;
  const hHF  = oy + 175;
  const hFF  = oy + 75;
  const home = [
    { id:"h1",  x:cx,        y:hGK,  label:"1" },
    { id:"h2",  x:cx-wide,   y:hFB,  label:"2" },
    { id:"h3",  x:cx,        y:hFB,  label:"3" },
    { id:"h4",  x:cx+wide,   y:hFB,  label:"4" },
    { id:"h5",  x:cx-wide,   y:hHB,  label:"5" },
    { id:"h6",  x:cx,        y:hHB,  label:"6" },
    { id:"h7",  x:cx+wide,   y:hHB,  label:"7" },
    { id:"h8",  x:cx-pw*0.12,y:hMid, label:"8" },
    { id:"h9",  x:cx+pw*0.18,y:hMid, label:"9" },
    { id:"h10", x:cx-wide,   y:hHF,  label:"10" },
    { id:"h11", x:cx,        y:hHF,  label:"11" },
    { id:"h12", x:cx+wide,   y:hHF,  label:"12" },
    { id:"h13", x:cx-wide,   y:hFF,  label:"13" },
    { id:"h14", x:cx,        y:hFF,  label:"14" },
    { id:"h15", x:cx+wide,   y:hFF,  label:"15" },
  ];

  // Away (red) — offset from their direct opponent
  // Right-side players offset top-right, left-side players offset top-left
  const ro = 14; // right offset
  const lo = -14; // left offset
  const uo = -14; // up offset
  const away = [
    { id:"a1",  x:cx,              y:oy + 30,          label:"1" },
    { id:"a2",  x:cx+wide+lo,     y:hFF+uo,            label:"2" },
    { id:"a3",  x:cx+ro,          y:hFF+uo,            label:"3" },
    { id:"a4",  x:cx-wide+ro,     y:hFF+uo,            label:"4" },
    { id:"a5",  x:cx+wide+lo,     y:hHF+uo,            label:"5" },
    { id:"a6",  x:cx+ro,          y:hHF+uo,            label:"6" },
    { id:"a7",  x:cx-wide+ro,     y:hHF+uo,            label:"7" },
    { id:"a8",  x:cx+pw*0.18+lo,  y:oy+ph/2-15,        label:"8" },
    { id:"a9",  x:cx-pw*0.12+ro,  y:hMid+uo,           label:"9" },
    { id:"a10", x:cx+wide+lo,     y:hHB+uo,            label:"10" },
    { id:"a11", x:cx+ro,          y:hHB+uo,            label:"11" },
    { id:"a12", x:cx-wide+ro,     y:hHB+uo,            label:"12" },
    { id:"a13", x:cx+wide+lo,     y:hFB+uo,            label:"13" },
    { id:"a14", x:cx+ro,          y:hFB+uo,            label:"14" },
    { id:"a15", x:cx-wide+ro,     y:hFB+uo,            label:"15" },
  ];
  return { home, away };
};

const ONeillsBall = ({ x, y, isDragged, attached, onPointerDown }) => {
  const r = BALL_R;
  return (
    <g style={{ cursor: isDragged ? "grabbing" : "grab" }} onPointerDown={onPointerDown}>
      <ellipse cx={x+1} cy={y+2} rx={r} ry={r} fill="rgba(0,0,0,0.25)" />
      <defs>
        <radialGradient id="ballGrad" cx="38%" cy="32%">
          <stop offset="0%" stopColor="#f8f2e4" />
          <stop offset="50%" stopColor="#e8dcc4" />
          <stop offset="100%" stopColor="#c4ad82" />
        </radialGradient>
        <clipPath id="ballClip">
          <circle cx={x} cy={y} r={r} />
        </clipPath>
      </defs>
      <circle cx={x} cy={y} r={r} fill="url(#ballGrad)" stroke="#5a4e36" strokeWidth="1.2" />
      <g clipPath="url(#ballClip)" fill="none" stroke="#5a4e36" strokeWidth="0.9" strokeLinecap="round">
        <path d={`M ${x-r} ${y-r*0.15} Q ${x-r*0.3} ${y-r*0.7} ${x+r*0.15} ${y-r}`} />
        <path d={`M ${x-r} ${y+r*0.15} Q ${x} ${y-r*0.15} ${x+r} ${y-r*0.15}`} />
        <path d={`M ${x-r*0.15} ${y+r} Q ${x+r*0.3} ${y+r*0.7} ${x+r} ${y+r*0.15}`} />
        <path d={`M ${x+r} ${y-r*0.15} Q ${x+r*0.3} ${y-r*0.7} ${x-r*0.15} ${y-r}`} />
        <path d={`M ${x+r} ${y+r*0.15} Q ${x} ${y+r*0.15} ${x-r} ${y+r*0.15}`} />
        <path d={`M ${x+r*0.15} ${y+r} Q ${x-r*0.3} ${y+r*0.7} ${x-r} ${y+r*0.15}`} />
      </g>
      <ellipse cx={x-r*0.2} cy={y-r*0.2} rx={r*0.22} ry={r*0.15} fill="white" opacity="0.35" transform={`rotate(-30 ${x-r*0.2} ${y-r*0.2})`} />
      {attached && (
        <circle cx={x} cy={y} r={r+3} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`360 ${x} ${y}`} dur="4s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
};

const VideoModal = ({ url, onClose }) => (
  <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
    <div onClick={e => e.stopPropagation()} style={{ width:"90vw", maxWidth:1100, aspectRatio:"16/9", position:"relative", cursor:"default" }}>
      <iframe src={url+"&autoplay=1&rel=0"} title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen style={{ width:"100%", height:"100%", border:"none", borderRadius:8 }} />
      <button onClick={onClose} style={{ position:"absolute", top:-44, right:0, background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", fontSize:22, cursor:"pointer", fontWeight:700, width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
    </div>
  </div>
);

const VideoLibrarySidebar = ({ open, setOpen, onExpand }) => {
  const [expanded, setExpanded] = useState({});
  const toggle = (cat) => setExpanded(p => ({ ...p, [cat]: !p[cat] }));
  return (
    <div style={{ width: open ? 300 : 0, minWidth: open ? 300 : 0, transition:"all 0.3s", background:"#12122a", borderLeft: open ? "1px solid #333" : "none", overflow:"hidden", display:"flex", flexDirection:"column", height:"100vh" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", borderBottom:"1px solid #2a2a4a" }}>
        <span style={{ color:"#fff", fontWeight:700, fontSize:15 }}>Video Library</span>
        <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:18 }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"6px 0" }}>
        {videoLibrary.map((cat, ci) => (
          <div key={ci}>
            <button onClick={() => toggle(cat.category)} style={{ width:"100%", textAlign:"left", background: expanded[cat.category] ? "#1e1e3a" : "transparent", border:"none", borderBottom:"1px solid #1e1e3a", padding:"10px 14px", cursor:"pointer", color:"#fbbf24", fontSize:13, fontWeight:700, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              {cat.category}
              <span style={{ fontSize:10, color:"#888", marginLeft:6 }}>{cat.clips.length} clip{cat.clips.length>1?"s":""} {expanded[cat.category]?"▲":"▼"}</span>
            </button>
            {expanded[cat.category] && (
              <div style={{ padding:"4px 10px 8px" }}>
                {cat.clips.map((clip, vi) => {
                  const vidId = clip.url.match(/embed\/([^?]+)/)?.[1]||"";
                  const startParam = clip.url.match(/start=(\d+)/)?.[1]||"0";
                  const thumb = `https://img.youtube.com/vi/${vidId}/mqdefault.jpg`;
                  return (
                    <div key={vi} style={{ marginBottom:8, background:"#1a1a36", borderRadius:6, overflow:"hidden", border:"1px solid #2a2a4a" }}>
                      <div style={{ position:"relative", cursor:"pointer" }} onClick={() => onExpand(clip.url)}>
                        <img src={thumb} alt="" style={{ width:"100%", height:85, objectFit:"cover", display:"block", opacity:0.85 }} />
                        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <div style={{ width:0, height:0, borderTop:"7px solid transparent", borderBottom:"7px solid transparent", borderLeft:"12px solid #fff", marginLeft:2 }} />
                          </div>
                        </div>
                        <div style={{ position:"absolute", bottom:4, right:6, background:"rgba(0,0,0,0.7)", color:"#fff", fontSize:10, padding:"2px 5px", borderRadius:3 }}>
                          {Math.floor(startParam/60)}:{String(startParam%60).padStart(2,"0")}
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
    return [...p.home.map(h => ({ ...h, team:"home" })), ...p.away.map(a => ({ ...a, team:"away" }))];
  });
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x:0, y:0 });
  const [ballOffset, setBallOffset] = useState({ x:0, y:0 });
  const [trails, setTrails] = useState({});
  const [showTrails, setShowTrails] = useState(false);
  const [showBallTrail, setShowBallTrail] = useState(false);
  const [attachMode, setAttachMode] = useState(false);
  const [showLanes, setShowLanes] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalUrl, setModalUrl] = useState(null);
  const svgRef = useRef(null);

  const getBallPos = useCallback(() => {
    if (ball.attachedTo) {
      const p = players.find(pl => pl.id === ball.attachedTo);
      if (p) return { x: p.x+ballOffset.x, y: p.y+ballOffset.y };
    }
    return { x: ball.x, y: ball.y };
  }, [ball, players, ballOffset]);

  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.touches ? e.touches[0].clientX : e.clientX;
    pt.y = e.touches ? e.touches[0].clientY : e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }, []);

  const handlePointerDown = useCallback((e, id) => {
    e.preventDefault(); e.stopPropagation();
    const pos = getSVGPoint(e);
    if (attachMode && id !== "ball") {
      setBall(prev => {
        if (prev.attachedTo === id) {
          const p = players.find(pl => pl.id === id);
          return { x:p.x+ballOffset.x, y:p.y+ballOffset.y, attachedTo:null };
        } else {
          setBallOffset({ x:R+BALL_R-2, y:-(R+BALL_R-2) });
          return { ...prev, attachedTo:id };
        }
      });
      setAttachMode(false); return;
    }
    if (id === "ball") {
      if (ball.attachedTo) return;
      setDragging("ball");
      setOffset({ x:pos.x-ball.x, y:pos.y-ball.y });
      if (showBallTrail) setTrails(prev => ({ ...prev, ball:[...(prev.ball||[]),{x:ball.x,y:ball.y,break:true}] }));
      return;
    }
    const player = players.find(p => p.id === id);
    setDragging(id);
    setOffset({ x:pos.x-player.x, y:pos.y-player.y });
    if (showTrails) setTrails(prev => ({ ...prev, [id]:[...(prev[id]||[]),{x:player.x,y:player.y,break:true}] }));
  }, [players, ball, ballOffset, getSVGPoint, showTrails, attachMode]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const pos = getSVGPoint(e);
    if (dragging === "ball") {
      const nx = Math.max(BALL_R, Math.min(PITCH_W-BALL_R, pos.x-offset.x));
      const ny = Math.max(BALL_R, Math.min(PITCH_H-BALL_R, pos.y-offset.y));
      setBall(prev => ({ ...prev, x:nx, y:ny }));
      if (showBallTrail) setTrails(prev => ({ ...prev, ball:[...(prev.ball||[]),{x:nx,y:ny}] }));
      return;
    }
    const nx = Math.max(R, Math.min(PITCH_W-R, pos.x-offset.x));
    const ny = Math.max(R, Math.min(PITCH_H-R, pos.y-offset.y));
    setPlayers(prev => prev.map(p => p.id===dragging ? {...p,x:nx,y:ny} : p));
    if (showTrails) {
      setTrails(prev => {
        const next = { ...prev, [dragging]:[...(prev[dragging]||[]),{x:nx,y:ny}] };
        if (ball.attachedTo===dragging && showBallTrail) next.ball=[...(prev.ball||[]),{x:nx+ballOffset.x,y:ny+ballOffset.y}];
        return next;
      });
    } else if (ball.attachedTo===dragging && showBallTrail) {
      setTrails(prev => ({ ...prev, ball:[...(prev.ball||[]),{x:nx+ballOffset.x,y:ny+ballOffset.y}] }));
    }
  }, [dragging, offset, getSVGPoint, showTrails, ball.attachedTo, ballOffset]);

  const handlePointerUp = useCallback(() => setDragging(null), []);

  const reset = () => {
    const p = initialPositions();
    setPlayers([...p.home.map(h=>({...h,team:"home"})),...p.away.map(a=>({...a,team:"away"}))]);
    setBall({...initialBall}); setBallOffset({x:0,y:0}); setTrails({}); setAttachMode(false); setShowBallTrail(false);
  };

  const clearTrails = () => setTrails({});

  const buildTrailPath = (points) => {
    if (!points || points.length < 2) return "";
    let d = "";
    for (let i = 0; i < points.length; i++) d += (i===0||points[i].break) ? `M ${points[i].x} ${points[i].y} ` : `L ${points[i].x} ${points[i].y} `;
    return d;
  };

  const trailColor = (id) => id==="ball" ? "rgba(255,255,255,0.7)" : id.startsWith("h") ? "rgba(251,191,36,0.7)" : "rgba(252,165,165,0.7)";

  // === GAA PITCH MARKINGS ===
  // Real: 145m long x 90m wide. Drawn in metre-space then scaled.
  const PitchMarkings = () => {
    const RW = 90, RH = 145; // real metres
    // Pitch pixel area
    const pw = 600, ph = 580;
    const ox = (PITCH_W - pw) / 2, oy = (PITCH_H - ph) / 2;
    const sx = pw / RW, sy = ph / RH; // px per metre
    const cx = pw / 2;

    // Convert metres to px
    const mx = (m) => m * sx;
    const my = (m) => m * sy;

    // Line distances from endline (in px)
    const d13 = my(13), d20 = my(20), d45 = my(45), d65 = my(65);

    // Goal: 6.5m wide
    const ghw = mx(6.5/2);
    // Small rect: 3.75m from each post = 7m from centre, 4.5m deep
    const srW = mx(7), srH = my(4.5);
    // Large rect: 6.25m from each post = 9.5m from centre, 13m deep
    const lrW = mx(9.5), lrH = my(13);

    // Penalty: 11m from goal line
    const penD = my(11);

    // Arc helper: true circle of radius r_m (metres) centred at (cx_m, cy_m) in metre-space.
    // Converted to pixel-space (becomes an ellipse due to different x/y scales).
    // Only renders points between clipMin and clipMax (in pixel y-coords, relative to pitch origin).
    const arc = (cx_m, cy_m, r_m, dir, clipMin, clipMax) => {
      const pts = [];
      const n = 200;
      for (let i = 0; i <= n; i++) {
        const t = dir === 'down' ? Math.PI * i / n : Math.PI + Math.PI * i / n;
        const xm = cx_m + r_m * Math.cos(t);
        const ym = cy_m + r_m * Math.sin(t);
        const xp = mx(xm), yp = my(ym);
        if (xp >= 0 && xp <= pw && yp >= clipMin && yp <= clipMax) {
          pts.push({ x: xp, y: yp });
        }
      }
      if (pts.length < 2) return "";
      return "M " + pts.map(p => `${p.x} ${p.y}`).join(" L ");
    };

    // Midline: 10m solid centre, then 5m dashes at 5m gaps
    const mHalf = mx(5), mDash = mx(5), mGap = mx(5);
    const midY = ph / 2;

    const flagLines = [d13, d20, d45, d65];

    return (
      <g transform={`translate(${ox},${oy})`}>
        <rect x={0} y={0} width={pw} height={ph} rx="3" fill="#338a3e" stroke="white" strokeWidth="2" />

        {/* Grass stripes */}
        {Array.from({length:16}).map((_,i) => (
          <rect key={i} x={0} y={i*(ph/16)} width={pw} height={ph/32} fill="rgba(255,255,255,0.018)" />
        ))}

        {/* Top lines */}
        <line x1={0} y1={d13} x2={pw} y2={d13} stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="8,6" />
        <line x1={0} y1={d20} x2={pw} y2={d20} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <line x1={0} y1={d45} x2={pw} y2={d45} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <line x1={0} y1={d65} x2={pw} y2={d65} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />

        {/* Bottom lines */}
        <line x1={0} y1={ph-d13} x2={pw} y2={ph-d13} stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="8,6" />
        <line x1={0} y1={ph-d20} x2={pw} y2={ph-d20} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <line x1={0} y1={ph-d45} x2={pw} y2={ph-d45} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <line x1={0} y1={ph-d65} x2={pw} y2={ph-d65} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />

        {/* Midline */}
        <line x1={cx-mHalf} y1={midY} x2={cx+mHalf} y2={midY} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
        {(() => {
          const s = []; let pos = mHalf+mGap, i = 0;
          while (pos < pw/2+mDash) {
            if (cx+pos < pw) s.push(<line key={`r${i}`} x1={cx+pos} y1={midY} x2={Math.min(cx+pos+mDash,pw)} y2={midY} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />);
            if (cx-pos > 0) s.push(<line key={`l${i}`} x1={Math.max(cx-pos-mDash,0)} y1={midY} x2={cx-pos} y2={midY} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />);
            pos += mDash+mGap; i++;
          }
          return s;
        })()}

        {/* Flags */}
        {[...flagLines, midY].map((d,i) => (
          <g key={`ft${i}`}>
            <polygon points={`0,${d-4} 5,${d-2} 0,${d}`} fill="rgba(255,255,200,0.4)" />
            <polygon points={`${pw},${d-4} ${pw-5},${d-2} ${pw},${d}`} fill="rgba(255,255,200,0.4)" />
          </g>
        ))}
        {flagLines.map((d,i) => (
          <g key={`fb${i}`}>
            <polygon points={`0,${ph-d-4} 5,${ph-d-2} 0,${ph-d}`} fill="rgba(255,255,200,0.4)" />
            <polygon points={`${pw},${ph-d-4} ${pw-5},${ph-d-2} ${pw},${ph-d}`} fill="rgba(255,255,200,0.4)" />
          </g>
        ))}

        {/* === TOP GOAL END === */}
        <rect x={cx-srW} y={0} width={srW*2} height={srH} fill="none" stroke="white" strokeWidth="1.5" />
        <rect x={cx-lrW} y={0} width={lrW*2} height={lrH} fill="none" stroke="white" strokeWidth="1.5" />
        {/* 40m arc centred on goal line midpoint, only shown outside 20m line */}
        <path d={arc(45, 0, 40, 'down', d20, ph/2)} fill="none" stroke="white" strokeWidth="1.8" />
        {/* 13m arc centred on 20m line midpoint, only shown outside 20m line */}
        <path d={arc(45, 20, 13, 'down', d20, ph/2)} fill="none" stroke="white" strokeWidth="1.5" />
        <circle cx={cx} cy={penD} r="2.5" fill="white" />
        {/* H-posts */}
        <line x1={cx-ghw} y1={-9} x2={cx-ghw} y2={2} stroke="white" strokeWidth="3" />
        <line x1={cx+ghw} y1={-9} x2={cx+ghw} y2={2} stroke="white" strokeWidth="3" />
        <line x1={cx-ghw} y1={-4} x2={cx+ghw} y2={-4} stroke="white" strokeWidth="2" />

        {/* === BOTTOM GOAL END === */}
        <rect x={cx-srW} y={ph-srH} width={srW*2} height={srH} fill="none" stroke="white" strokeWidth="1.5" />
        <rect x={cx-lrW} y={ph-lrH} width={lrW*2} height={lrH} fill="none" stroke="white" strokeWidth="1.5" />
        <path d={arc(45, 145, 40, 'up', ph/2, ph-d20)} fill="none" stroke="white" strokeWidth="1.8" />
        <path d={arc(45, 125, 13, 'up', ph/2, ph-d20)} fill="none" stroke="white" strokeWidth="1.5" />
        <circle cx={cx} cy={ph-penD} r="2.5" fill="white" />
        <line x1={cx-ghw} y1={ph-2} x2={cx-ghw} y2={ph+9} stroke="white" strokeWidth="3" />
        <line x1={cx+ghw} y1={ph-2} x2={cx+ghw} y2={ph+9} stroke="white" strokeWidth="3" />
        <line x1={cx-ghw} y1={ph+4} x2={cx+ghw} y2={ph+4} stroke="white" strokeWidth="2" />
      </g>
    );
  };

  const PlayerCounter = ({ player }) => {
    const isHome = player.team === "home";
    const isDragged = dragging === player.id;
    const isAttached = ball.attachedTo === player.id;
    return (
      <g style={{ cursor: attachMode ? "crosshair" : isDragged ? "grabbing" : "grab" }} onPointerDown={(e) => handlePointerDown(e, player.id)}>
        {attachMode && <circle cx={player.x} cy={player.y} r={R+4} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.6" />}
        <circle cx={player.x} cy={player.y} r={R}
          fill={isHome ? "#1a56db" : "#dc2626"}
          stroke={isAttached ? "#fbbf24" : isHome ? "#fbbf24" : "#fca5a5"}
          strokeWidth={isAttached ? 3.5 : isHome ? 3 : 2}
          filter={isDragged ? "url(#shadow)" : "none"}
          opacity={isDragged ? 0.85 : 1} />
        <text x={player.x} y={player.y+1} textAnchor="middle" dominantBaseline="central"
          fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui,sans-serif"
          pointerEvents="none" style={{ userSelect:"none" }}>
          {player.label}
        </text>
      </g>
    );
  };

  const ballPos = getBallPos();

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"system-ui,sans-serif", background:"#1a1a2e", overflow:"hidden" }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"8px", overflow:"auto", minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, width:"100%", maxWidth:680, justifyContent:"space-between", flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <h2 style={{ margin:0, color:"#fff", fontSize:16, fontWeight:700 }}>GAA Tactical Board</h2>
            <span style={{ display:"inline-flex", alignItems:"center", gap:3 }}>
              <span style={{ width:10, height:10, borderRadius:"50%", background:"#1a56db", border:"2px solid #fbbf24", display:"inline-block" }} />
              <span style={{ color:"#ccc", fontSize:11 }}>Home</span>
            </span>
            <span style={{ display:"inline-flex", alignItems:"center", gap:3 }}>
              <span style={{ width:10, height:10, borderRadius:"50%", background:"#dc2626", border:"2px solid #fca5a5", display:"inline-block" }} />
              <span style={{ color:"#ccc", fontSize:11 }}>Opp</span>
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
            <button onClick={() => { if (ball.attachedTo) { const p = players.find(pl=>pl.id===ball.attachedTo); setBall({x:p.x+ballOffset.x,y:p.y+ballOffset.y,attachedTo:null}); setBallOffset({x:0,y:0}); setAttachMode(false); } else setAttachMode(m=>!m); }}
              style={{ padding:"4px 10px", borderRadius:6, border:"1px solid", borderColor:ball.attachedTo?"#f87171":attachMode?"#fbbf24":"#555", background:ball.attachedTo?"rgba(248,113,113,0.15)":attachMode?"rgba(251,191,36,0.15)":"#333", color:ball.attachedTo?"#f87171":attachMode?"#fbbf24":"#fff", cursor:"pointer", fontSize:11, fontWeight:600 }}>
              {ball.attachedTo ? "Detach" : attachMode ? "Pick Player..." : "Attach Ball"}
            </button>
            <button onClick={() => setShowTrails(t=>!t)}
              style={{ padding:"4px 10px", borderRadius:6, border:"1px solid", borderColor:showTrails?"#fbbf24":"#555", background:showTrails?"rgba(251,191,36,0.15)":"#333", color:showTrails?"#fbbf24":"#fff", cursor:"pointer", fontSize:11, fontWeight:600 }}>
              {showTrails ? "Trails ON" : "Trails OFF"}
            </button>
            <button onClick={() => setShowBallTrail(t=>!t)}
              style={{ padding:"4px 10px", borderRadius:6, border:"1px solid", borderColor:showBallTrail?"#fff":"#555", background:showBallTrail?"rgba(255,255,255,0.12)":"#333", color:showBallTrail?"#fff":"#999", cursor:"pointer", fontSize:11, fontWeight:600 }}>
              {showBallTrail ? "Ball Trail ON" : "Ball Trail OFF"}
            </button>
            <button onClick={() => setShowLanes(l=>!l)}
              style={{ padding:"4px 10px", borderRadius:6, border:"1px solid", borderColor:showLanes?"#a78bfa":"#555", background:showLanes?"rgba(167,139,250,0.15)":"#333", color:showLanes?"#a78bfa":"#fff", cursor:"pointer", fontSize:11, fontWeight:600 }}>
              {showLanes ? "Lanes ON" : "Lanes OFF"}
            </button>
            {Object.keys(trails).length > 0 && (
              <button onClick={clearTrails} style={{ padding:"4px 10px", borderRadius:6, border:"1px solid #555", background:"#333", color:"#fff", cursor:"pointer", fontSize:11, fontWeight:600 }}>Clear</button>
            )}
            <button onClick={reset} style={{ padding:"4px 10px", borderRadius:6, border:"1px solid #555", background:"#333", color:"#fff", cursor:"pointer", fontSize:11, fontWeight:600 }}>Reset</button>
            {!sidebarOpen && (
              <button onClick={()=>setSidebarOpen(true)} style={{ padding:"4px 10px", borderRadius:6, border:"1px solid #6366f1", background:"rgba(99,102,241,0.15)", color:"#a5b4fc", cursor:"pointer", fontSize:11, fontWeight:600 }}>Videos</button>
            )}
          </div>
        </div>

        {attachMode && (
          <div style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", borderRadius:6, padding:"4px 12px", marginBottom:6, maxWidth:680, width:"100%" }}>
            <span style={{ color:"#fbbf24", fontSize:11 }}>Click any player to attach the ball</span>
          </div>
        )}

        <svg ref={svgRef} viewBox={`0 0 ${PITCH_W} ${PITCH_H}`}
          style={{ width:"100%", maxWidth:680, borderRadius:8, touchAction:"none", userSelect:"none" }}
          onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
            </filter>
          </defs>
          <rect width={PITCH_W} height={PITCH_H} fill="#1e3a1e" rx="8" />
          <PitchMarkings />
          {/* Vertical lanes overlay */}
          {showLanes && (() => {
            const pw = 600, ph = 580, lox = (PITCH_W - pw) / 2, loy = (PITCH_H - ph) / 2;
            const laneW = pw / 7;
            const colors = [
              "rgba(255,100,100,0.12)",
              "rgba(100,150,255,0.12)",
              "rgba(255,200,50,0.12)",
              "rgba(100,255,150,0.12)",
              "rgba(255,200,50,0.12)",
              "rgba(100,150,255,0.12)",
              "rgba(255,100,100,0.12)",
            ];
            return (
              <g>
                {colors.map((c, i) => (
                  <rect key={i} x={lox + i * laneW} y={loy} width={laneW} height={ph} fill={c} />
                ))}
                {/* Lane divider lines */}
                {[1,2,3,4,5,6].map(i => (
                  <line key={`ld${i}`} x1={lox + i * laneW} y1={loy} x2={lox + i * laneW} y2={loy + ph}
                    stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="6,4" />
                ))}
              </g>
            );
          })()}
          {Object.entries(trails).map(([id, pts]) => {
            const d = buildTrailPath(pts);
            if (!d) return null;
            return (
              <g key={`trail-${id}`}>
                <path d={d} fill="none" stroke={trailColor(id)} strokeWidth={id==="ball"?2:3} strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                {pts.length >= 2 && (() => {
                  const last=pts[pts.length-1], prev=pts[pts.length-2];
                  const dx=last.x-prev.x, dy=last.y-prev.y;
                  if (Math.sqrt(dx*dx+dy*dy)<2) return null;
                  const angle=Math.atan2(dy,dx)*180/Math.PI;
                  return <polygon points="-6,-4 0,0 -6,4" fill={trailColor(id)} transform={`translate(${last.x},${last.y}) rotate(${angle})`} />;
                })()}
              </g>
            );
          })}
          {players.filter(p=>p.team==="away"&&p.id!==dragging).map(p=><PlayerCounter key={p.id} player={p} />)}
          {players.filter(p=>p.team==="home"&&p.id!==dragging).map(p=><PlayerCounter key={p.id} player={p} />)}
          {dragging&&dragging!=="ball"&&<PlayerCounter player={players.find(p=>p.id===dragging)} />}
          <ONeillsBall x={ballPos.x} y={ballPos.y} isDragged={dragging==="ball"} attached={!!ball.attachedTo} onPointerDown={(e)=>handlePointerDown(e,"ball")} />
        </svg>
      </div>

      <VideoLibrarySidebar open={sidebarOpen} setOpen={setSidebarOpen} onExpand={(url)=>setModalUrl(url)} />
      {modalUrl && <VideoModal url={modalUrl} onClose={()=>setModalUrl(null)} />}
    </div>
  );
}

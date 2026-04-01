import { useState, useRef, useCallback } from "react";

const PITCH_W = 660;
const PITCH_H = 640;
const R = 14;
const BALL_R = 10;
const initialBall = { x: 330, y: 320, attachedTo: null };

const videoLibrary = [
  { category: "Getting Out of the Running Lane & Creating Space", clips: [
    { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=5819", note: "Great run to get out in front, ball recycles back to the other side. Watch 2 players make small movements away from the runner", tag: "Dublin vs Cork (Seniors)" },
    { url: "https://www.youtube.com/embed/7PgsWo2-l9U?start=518", note: "Plenty of options in front throughout the attack, players make sure they are slightly to the left or right, rather than straight in front of", tag: "Donegal vs Galway (Seniors)" },
    { url: "https://www.youtube.com/embed/5YwuQLlRz3g?start=68", note: "Cork with the ball at the sideline. All looks congested. Two Cork forwards make sideline runs, creates space for ball carrier to run at goal", tag: "Cork vs Galway (Seniors)" },
  ]},
  { category: "Out in Front & Attack the Space", clips: [
    { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=2846", note: "Forward run creates the passing option, great pass inside and easy score", tag: "Dublin vs Cork (Seniors)" },
    { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=2858", note: "Forward run creates the passing option, great pass inside and easy score", tag: "Dublin vs Cork (Seniors)" },
    { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=5684", note: "Brilliant run to the side creates the passing option, cut back inside for easy score", tag: "Dublin vs Cork (Seniors)" },
    { url: "https://www.youtube.com/embed/gubrXY3mCW0?start=5765", note: "Great run out in front, but… no 1-2 option, players in same running lane = no easy shot, and play breaks down", tag: "Dublin vs Cork (Seniors)" },
  ]},
  { category: "1-2s", clips: [
    { url: "https://www.youtube.com/embed/StrVREfJCLA?start=294", note: "Cork are slow to press, but what happens to the centre back when the forward passes the ball", tag: "Mayo vs Cork (Seniors)" },
    { url: "https://www.youtube.com/embed/3We4g2F_qpo?start=1380", note: "Great width in build up with purposeful runs, watch the defender naturally follow the ball", tag: "Dublin vs Kildare (Minors)" },
    { url: "https://www.youtube.com/embed/7PgsWo2-l9U?start=246", note: "Great out in front run to start the play, watch how the defenders get caught out with the 1-2", tag: "Donegal vs Galway (Seniors)" },
  ]},
];

const principles = {
  attacking: [
    { title: "Always Influencing", desc: "Everything I do influences the game – my starting position, do I move towards the ball, do I create space, do I attack that space, do I pull opposition players out of position, etc?" },
    { title: "Running with Purpose", desc: "When I make runs for the ball, I do it with intensity and clear communication (commanding voice, clear hand signals)" },
    { title: "Back Ourselves on the Ball", desc: "We attack 1v1s, we take shots when they are on" },
    { title: "Trust our Teammates", desc: "Reward great runs for the ball, by putting the ball in there" },
  ],
  defending: [
    { title: "Pressure", desc: "The player on the goal side, nearest the ball carrier closes them down quickly and with control to limit their time and space, forcing rushed decisions and errors." },
    { title: "Communication", desc: "Players must constantly talk to each other to organise the defensive line, signal who is pressing the ball, and alert teammates to unmarked opponents or potential dangers. The goalkeeper is especially crucial in this role, acting as the organiser of the defence." },
    { title: "Work Rate and Sacrifice", desc: "Every player, including forwards, must be willing to track back and contribute defensively. A high work rate across the entire pitch is essential for maintaining a strong defensive structure." },
    { title: "Cover & Support", desc: "If a player is beaten by an attacker, they drop deeper to provide the next layer of cover for their teammate - either picking up an opponent, or being ready to press if their teammate is also beaten" },
  ],
};

const FORMATIONS = {
  defending_deep: {
    home: [
      { id:"h1", x:329, y:602, label:"1" },
      { id:"h2", x:263, y:574, label:"2" }, { id:"h3", x:331, y:560, label:"3" }, { id:"h4", x:389, y:563, label:"4" },
      { id:"h5", x:202, y:491, label:"5" }, { id:"h6", x:328, y:484, label:"6" }, { id:"h7", x:442, y:483, label:"7" },
      { id:"h8", x:264, y:458, label:"8" }, { id:"h9", x:378, y:455, label:"9" },
      { id:"h10", x:91, y:315, label:"10" }, { id:"h11", x:312, y:304, label:"11" }, { id:"h12", x:558, y:320, label:"12" },
      { id:"h13", x:102, y:192, label:"13" }, { id:"h14", x:329, y:117, label:"14" }, { id:"h15", x:558, y:192, label:"15" },
    ],
    away: [
      { id:"a1", x:330, y:60, label:"1" },
      { id:"a2", x:544, y:178, label:"2" }, { id:"a3", x:347, y:100, label:"3" }, { id:"a4", x:116, y:178, label:"4" },
      { id:"a5", x:544, y:306, label:"5" }, { id:"a6", x:334, y:243, label:"6" }, { id:"a7", x:105, y:292, label:"7" },
      { id:"a8", x:349, y:374, label:"8" }, { id:"a9", x:219, y:386, label:"9" },
      { id:"a10", x:544, y:451, label:"10" }, { id:"a11", x:334, y:425, label:"11" }, { id:"a12", x:116, y:451, label:"12" },
      { id:"a13", x:395, y:540, label:"13" }, { id:"a14", x:319, y:536, label:"14" }, { id:"a15", x:237, y:562, label:"15" },
    ]
  },
  attacking_low_block: {
    home: [
      { id:"h1", x:330, y:580, label:"1" },
      { id:"h2", x:128, y:501, label:"2" }, { id:"h3", x:330, y:535, label:"3" }, { id:"h4", x:533, y:496, label:"4" },
      { id:"h5", x:91, y:309, label:"5" }, { id:"h6", x:334, y:350, label:"6" }, { id:"h7", x:514, y:313, label:"7" },
      { id:"h8", x:204, y:240, label:"8" }, { id:"h9", x:367, y:271, label:"9" },
      { id:"h10", x:98, y:122, label:"10" }, { id:"h11", x:312, y:192, label:"11" }, { id:"h12", x:526, y:151, label:"12" },
      { id:"h13", x:219, y:77, label:"13" }, { id:"h14", x:315, y:93, label:"14" }, { id:"h15", x:453, y:78, label:"15" },
    ],
    away: [
      { id:"a1", x:329, y:40, label:"1" },
      { id:"a2", x:393, y:66, label:"2" }, { id:"a3", x:329, y:73, label:"3" }, { id:"a4", x:244, y:69, label:"4" },
      { id:"a5", x:500, y:135, label:"5" }, { id:"a6", x:341, y:141, label:"6" }, { id:"a7", x:154, y:113, label:"7" },
      { id:"a8", x:398, y:203, label:"8" }, { id:"a9", x:229, y:174, label:"9" },
      { id:"a10", x:497, y:291, label:"10" }, { id:"a11", x:318, y:332, label:"11" }, { id:"a12", x:108, y:363, label:"12" },
      { id:"a13", x:519, y:476, label:"13" }, { id:"a14", x:344, y:521, label:"14" }, { id:"a15", x:112, y:482, label:"15" },
    ]
  }
};

function getDefaultFormation() {
  const pw = 600, ph = 580, ox = 30, oy = 30;
  const cx = ox + pw / 2, wide = pw * 0.38;
  const ro = 14, lo = -14, uo = -14;
  const hGK = oy+ph-30, hFB = oy+ph-75, hHB = oy+ph-175, hMid = oy+ph/2+10, hHF = oy+175, hFF = oy+75;
  return {
    home: [
      { id:"h1", x:cx, y:hGK, label:"1" },
      { id:"h2", x:cx-wide, y:hFB, label:"2" }, { id:"h3", x:cx, y:hFB, label:"3" }, { id:"h4", x:cx+wide, y:hFB, label:"4" },
      { id:"h5", x:cx-wide, y:hHB, label:"5" }, { id:"h6", x:cx, y:hHB, label:"6" }, { id:"h7", x:cx+wide, y:hHB, label:"7" },
      { id:"h8", x:cx-pw*0.12, y:hMid, label:"8" }, { id:"h9", x:cx+pw*0.18, y:hMid, label:"9" },
      { id:"h10", x:cx-wide, y:hHF, label:"10" }, { id:"h11", x:cx, y:hHF, label:"11" }, { id:"h12", x:cx+wide, y:hHF, label:"12" },
      { id:"h13", x:cx-wide, y:hFF, label:"13" }, { id:"h14", x:cx, y:hFF, label:"14" }, { id:"h15", x:cx+wide, y:hFF, label:"15" },
    ],
    away: [
      { id:"a1", x:cx, y:oy+30, label:"1" },
      { id:"a2", x:cx+wide+lo, y:hFF+uo, label:"2" }, { id:"a3", x:cx+ro, y:hFF+uo, label:"3" }, { id:"a4", x:cx-wide+ro, y:hFF+uo, label:"4" },
      { id:"a5", x:cx+wide+lo, y:hHF+uo, label:"5" }, { id:"a6", x:cx+ro, y:hHF+uo, label:"6" }, { id:"a7", x:cx-wide+ro, y:hHF+uo, label:"7" },
      { id:"a8", x:cx+pw*0.18+lo, y:oy+ph/2-15, label:"8" }, { id:"a9", x:cx-pw*0.12+ro, y:hMid+uo, label:"9" },
      { id:"a10", x:cx+wide+lo, y:hHB+uo, label:"10" }, { id:"a11", x:cx+ro, y:hHB+uo, label:"11" }, { id:"a12", x:cx-wide+ro, y:hHB+uo, label:"12" },
      { id:"a13", x:cx+wide+lo, y:hFB+uo, label:"13" }, { id:"a14", x:cx+ro, y:hFB+uo, label:"14" }, { id:"a15", x:cx-wide+ro, y:hFB+uo, label:"15" },
    ]
  };
}

function loadFormationData(name) {
  if (FORMATIONS[name]) return FORMATIONS[name];
  return getDefaultFormation();
}

const ONeillsBall = ({ x, y, isDragged, attached, onPointerDown }) => {
  const r = BALL_R;
  return (
    <g style={{ cursor: isDragged?"grabbing":"grab" }} onPointerDown={onPointerDown}>
      <ellipse cx={x+1} cy={y+2} rx={r} ry={r} fill="rgba(0,0,0,0.25)" />
      <defs>
        <radialGradient id="ballGrad" cx="38%" cy="32%"><stop offset="0%" stopColor="#f8f2e4" /><stop offset="50%" stopColor="#e8dcc4" /><stop offset="100%" stopColor="#c4ad82" /></radialGradient>
        <clipPath id="ballClip"><circle cx={x} cy={y} r={r} /></clipPath>
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
      {attached && <circle cx={x} cy={y} r={r+3} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.8"><animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`360 ${x} ${y}`} dur="4s" repeatCount="indefinite" /></circle>}
    </g>
  );
};

const PrinciplesTab = () => {
  const [mode, setMode] = useState("attacking");
  const [openIdx, setOpenIdx] = useState(null);
  const items = principles[mode];
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"20px 24px", overflow:"auto", maxWidth:700, margin:"0 auto", width:"100%" }}>
      <h2 style={{ color:"#fff", fontSize:44, fontWeight:700, textAlign:"center", marginBottom:16 }}>Principles</h2>
      <div style={{ display:"flex", gap:0, marginBottom:24, borderRadius:8, overflow:"hidden", border:"1px solid #444" }}>
        <button onClick={()=>{setMode("attacking");setOpenIdx(null);}} style={{ flex:1, padding:"10px 0", border:"none", cursor:"pointer", fontSize:28, fontWeight:700, background:mode==="attacking"?"#2d6a1e":"#333", color:mode==="attacking"?"#fff":"#999" }}>Attacking</button>
        <button onClick={()=>{setMode("defending");setOpenIdx(null);}} style={{ flex:1, padding:"10px 0", border:"none", cursor:"pointer", fontSize:28, fontWeight:700, background:mode==="defending"?"#8b1a1a":"#333", color:mode==="defending"?"#fff":"#999" }}>Defending</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {items.map((item,i)=>(
          <div key={i} style={{ background:openIdx===i?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.03)", border:"1px solid", borderColor:openIdx===i?(mode==="attacking"?"#4a9e2f":"#c0392b"):"#333", borderRadius:8, overflow:"hidden" }}>
            <button onClick={()=>setOpenIdx(openIdx===i?null:i)} style={{ width:"100%", textAlign:"left", padding:"14px 18px", border:"none", cursor:"pointer", background:"transparent", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:"#fff", fontSize:34, fontWeight:700 }}>{item.title}</span>
              <span style={{ color:"#888", fontSize:28, marginLeft:12 }}>{openIdx===i?"▲":"▼"}</span>
            </button>
            {openIdx===i && <div style={{ padding:"0 18px 16px", color:"#ccc", fontSize:28, lineHeight:1.6 }}>{item.desc}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const VideoModal = ({ url, onClose }) => (
  <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
    <div onClick={e=>e.stopPropagation()} style={{ width:"90vw", maxWidth:1100, aspectRatio:"16/9", position:"relative", cursor:"default" }}>
      <iframe src={url+"&autoplay=1&rel=0"} title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen style={{ width:"100%", height:"100%", border:"none", borderRadius:8 }} />
      <button onClick={onClose} style={{ position:"absolute", top:-44, right:0, background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", fontSize:22, cursor:"pointer", fontWeight:700, width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
    </div>
  </div>
);

const VideoLibrarySidebar = ({ open, setOpen, onExpand }) => {
  const [expanded, setExpanded] = useState({});
  const toggle = (cat) => setExpanded(p=>({...p,[cat]:!p[cat]}));
  return (
    <div style={{ width:open?300:0, minWidth:open?300:0, transition:"all 0.3s", background:"#12122a", borderLeft:open?"1px solid #333":"none", overflow:"hidden", display:"flex", flexDirection:"column", height:"100vh" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", borderBottom:"1px solid #2a2a4a" }}>
        <span style={{ color:"#fff", fontWeight:700, fontSize:14, lineHeight:1.3 }}>Tactical Movement<br/><span style={{ fontWeight:400, fontSize:12, color:"#999" }}>video library</span></span>
        <button onClick={()=>setOpen(false)} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:18 }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"6px 0" }}>
        {videoLibrary.map((cat,ci)=>(
          <div key={ci}>
            <button onClick={()=>toggle(cat.category)} style={{ width:"100%", textAlign:"left", background:expanded[cat.category]?"#1e1e3a":"transparent", border:"none", borderBottom:"1px solid #1e1e3a", padding:"10px 14px", cursor:"pointer", color:"#fbbf24", fontSize:13, fontWeight:700, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              {cat.category}
              <span style={{ fontSize:10, color:"#888", marginLeft:6 }}>{cat.clips.length} clip{cat.clips.length>1?"s":""} {expanded[cat.category]?"▲":"▼"}</span>
            </button>
            {expanded[cat.category] && (
              <div style={{ padding:"4px 10px 8px" }}>
                {cat.clips.map((clip,vi)=>{
                  const vidId=clip.url.match(/embed\/([^?]+)/)?.[1]||"";
                  const startParam=clip.url.match(/start=(\d+)/)?.[1]||"0";
                  const thumb=`https://img.youtube.com/vi/${vidId}/mqdefault.jpg`;
                  return (
                    <div key={vi} style={{ marginBottom:8, background:"#1a1a36", borderRadius:6, overflow:"hidden", border:"1px solid #2a2a4a" }}>
                      <div style={{ position:"relative", cursor:"pointer" }} onClick={()=>onExpand(clip.url)}>
                        <img src={thumb} alt="" style={{ width:"100%", height:85, objectFit:"cover", display:"block", opacity:0.85 }} />
                        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <div style={{ width:0, height:0, borderTop:"7px solid transparent", borderBottom:"7px solid transparent", borderLeft:"12px solid #fff", marginLeft:2 }} />
                          </div>
                        </div>
                        <div style={{ position:"absolute", bottom:4, right:6, background:"rgba(0,0,0,0.7)", color:"#fff", fontSize:10, padding:"2px 5px", borderRadius:3 }}>{Math.floor(startParam/60)}:{String(startParam%60).padStart(2,"0")}</div>
                      </div>
                      {clip.note && <div style={{ padding:"6px 8px", color:"#ccc", fontSize:11, lineHeight:1.4 }}>{clip.note}</div>}
                      {clip.tag && <div style={{ padding:"2px 8px 6px", color:"#888", fontSize:10, fontStyle:"italic" }}>{clip.tag}</div>}
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
  const [players, setPlayers] = useState(()=>{
    const p=getDefaultFormation();
    return [...p.home.map(h=>({...h,team:"home"})),...p.away.map(a=>({...a,team:"away"}))];
  });
  const [ball, setBall] = useState({...initialBall});
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({x:0,y:0});
  const [ballOffset, setBallOffset] = useState({x:0,y:0});
  const [trails, setTrails] = useState({});
  const [showTrails, setShowTrails] = useState(false);
  const [showBallTrail, setShowBallTrail] = useState(false);
  const [attachMode, setAttachMode] = useState(false);
  const [showLanes, setShowLanes] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalUrl, setModalUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("board");
  const [savedPositions, setSavedPositions] = useState(null);
  const svgRef = useRef(null);

  const applyFormation = useCallback((name) => {
    const p = loadFormationData(name);
    setPlayers([...p.home.map(h=>({...h,team:"home"})),...p.away.map(a=>({...a,team:"away"}))]);
    setBall({...initialBall});
    setBallOffset({x:0,y:0});
    setTrails({});
    setAttachMode(false);
  }, []);

  const reset = useCallback(() => { applyFormation("default"); setShowBallTrail(false); }, [applyFormation]);

  const getBallPos = useCallback(()=>{
    if(ball.attachedTo){const p=players.find(pl=>pl.id===ball.attachedTo);if(p) return {x:p.x+ballOffset.x,y:p.y+ballOffset.y};}
    return {x:ball.x,y:ball.y};
  },[ball,players,ballOffset]);

  const getSVGPoint = useCallback((e)=>{
    const svg=svgRef.current;const pt=svg.createSVGPoint();
    pt.x=e.touches?e.touches[0].clientX:e.clientX;pt.y=e.touches?e.touches[0].clientY:e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  },[]);

  const handlePointerDown = useCallback((e,id)=>{
    e.preventDefault();e.stopPropagation();const pos=getSVGPoint(e);
    if(attachMode&&id!=="ball"){
      setBall(prev=>{if(prev.attachedTo===id){const p=players.find(pl=>pl.id===id);return{x:p.x+ballOffset.x,y:p.y+ballOffset.y,attachedTo:null};}else{setBallOffset({x:R+BALL_R-2,y:-(R+BALL_R-2)});return{...prev,attachedTo:id};}});
      setAttachMode(false);return;
    }
    if(id==="ball"){
      if(ball.attachedTo)return;setDragging("ball");setOffset({x:pos.x-ball.x,y:pos.y-ball.y});
      if(showBallTrail)setTrails(prev=>({...prev,ball:[...(prev.ball||[]),{x:ball.x,y:ball.y,break:true}]}));return;
    }
    const player=players.find(p=>p.id===id);setDragging(id);setOffset({x:pos.x-player.x,y:pos.y-player.y});
    if(showTrails)setTrails(prev=>({...prev,[id]:[...(prev[id]||[]),{x:player.x,y:player.y,break:true}]}));
  },[players,ball,ballOffset,getSVGPoint,showTrails,showBallTrail,attachMode]);

  const handlePointerMove = useCallback((e)=>{
    if(!dragging)return;e.preventDefault();const pos=getSVGPoint(e);
    if(dragging==="ball"){
      const nx=Math.max(BALL_R,Math.min(PITCH_W-BALL_R,pos.x-offset.x)),ny=Math.max(BALL_R,Math.min(PITCH_H-BALL_R,pos.y-offset.y));
      setBall(prev=>({...prev,x:nx,y:ny}));
      if(showBallTrail)setTrails(prev=>({...prev,ball:[...(prev.ball||[]),{x:nx,y:ny}]}));return;
    }
    const nx=Math.max(R,Math.min(PITCH_W-R,pos.x-offset.x)),ny=Math.max(R,Math.min(PITCH_H-R,pos.y-offset.y));
    setPlayers(prev=>prev.map(p=>p.id===dragging?{...p,x:nx,y:ny}:p));
    if(showTrails){
      setTrails(prev=>{const next={...prev,[dragging]:[...(prev[dragging]||[]),{x:nx,y:ny}]};if(ball.attachedTo===dragging&&showBallTrail)next.ball=[...(prev.ball||[]),{x:nx+ballOffset.x,y:ny+ballOffset.y}];return next;});
    }else if(ball.attachedTo===dragging&&showBallTrail){
      setTrails(prev=>({...prev,ball:[...(prev.ball||[]),{x:nx+ballOffset.x,y:ny+ballOffset.y}]}));
    }
  },[dragging,offset,getSVGPoint,showTrails,showBallTrail,ball.attachedTo,ballOffset]);

  const handlePointerUp = useCallback(()=>setDragging(null),[]);
  const clearTrails = ()=>setTrails({});
  const buildTrailPath = (points)=>{if(!points||points.length<2)return "";let d="";for(let i=0;i<points.length;i++)d+=(i===0||points[i].break)?`M ${points[i].x} ${points[i].y} `:`L ${points[i].x} ${points[i].y} `;return d;};
  const trailColor = (id)=>id==="ball"?"rgba(255,255,255,0.7)":id.startsWith("h")?"rgba(251,191,36,0.7)":"rgba(252,165,165,0.7)";

  const PitchMarkings = ()=>{
    const RW=90,RH=145,pw=600,ph=580;
    const lox=(PITCH_W-pw)/2,loy=(PITCH_H-ph)/2;
    const sx=pw/RW,sy=ph/RH,cx2=pw/2;
    const mx2=(m)=>m*sx,my2=(m)=>m*sy;
    const d13=my2(13),d20=my2(20),d45=my2(45),d65=my2(65);
    const ghw=mx2(6.5/2),srW=mx2(7),srH=my2(4.5),lrW=mx2(9.5),lrH=my2(13),penD=my2(11);
    const mHalf=mx2(5),mDash=mx2(5),mGap=mx2(5),midY2=ph/2;
    const flagLines=[d13,d20,d45,d65];
    const arc2=(cx_m,cy_m,r_m,dir,clipMin,clipMax)=>{const pts=[];const n=200;for(let i=0;i<=n;i++){const t=dir==='down'?Math.PI*i/n:Math.PI+Math.PI*i/n;const xm=cx_m+r_m*Math.cos(t),ym=cy_m+r_m*Math.sin(t);const xp=mx2(xm),yp=my2(ym);if(xp>=0&&xp<=pw&&yp>=clipMin&&yp<=clipMax)pts.push({x:xp,y:yp});}if(pts.length<2)return "";return "M "+pts.map(p=>`${p.x} ${p.y}`).join(" L ");};
    return (
      <g transform={`translate(${lox},${loy})`}>
        <rect x={0} y={0} width={pw} height={ph} rx="3" fill="#338a3e" stroke="white" strokeWidth="2" />
        {Array.from({length:16}).map((_,i)=><rect key={i} x={0} y={i*(ph/16)} width={pw} height={ph/32} fill="rgba(255,255,255,0.018)" />)}
        <line x1={0} y1={d13} x2={pw} y2={d13} stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="8,6" />
        <line x1={0} y1={d20} x2={pw} y2={d20} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <line x1={0} y1={d45} x2={pw} y2={d45} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <line x1={0} y1={d65} x2={pw} y2={d65} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <line x1={0} y1={ph-d13} x2={pw} y2={ph-d13} stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="8,6" />
        <line x1={0} y1={ph-d20} x2={pw} y2={ph-d20} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <line x1={0} y1={ph-d45} x2={pw} y2={ph-d45} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <line x1={0} y1={ph-d65} x2={pw} y2={ph-d65} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <line x1={cx2-mHalf} y1={midY2} x2={cx2+mHalf} y2={midY2} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
        {(()=>{const s=[];let pos=mHalf+mGap,i=0;while(pos<pw/2+mDash){if(cx2+pos<pw)s.push(<line key={`r${i}`} x1={cx2+pos} y1={midY2} x2={Math.min(cx2+pos+mDash,pw)} y2={midY2} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />);if(cx2-pos>0)s.push(<line key={`l${i}`} x1={Math.max(cx2-pos-mDash,0)} y1={midY2} x2={cx2-pos} y2={midY2} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />);pos+=mDash+mGap;i++;}return s;})()}
        {[...flagLines,midY2].map((d,i)=><g key={`ft${i}`}><polygon points={`0,${d-4} 5,${d-2} 0,${d}`} fill="rgba(255,255,200,0.4)" /><polygon points={`${pw},${d-4} ${pw-5},${d-2} ${pw},${d}`} fill="rgba(255,255,200,0.4)" /></g>)}
        {flagLines.map((d,i)=><g key={`fb${i}`}><polygon points={`0,${ph-d-4} 5,${ph-d-2} 0,${ph-d}`} fill="rgba(255,255,200,0.4)" /><polygon points={`${pw},${ph-d-4} ${pw-5},${ph-d-2} ${pw},${ph-d}`} fill="rgba(255,255,200,0.4)" /></g>)}
        <rect x={cx2-srW} y={0} width={srW*2} height={srH} fill="none" stroke="white" strokeWidth="1.5" />
        <rect x={cx2-lrW} y={0} width={lrW*2} height={lrH} fill="none" stroke="white" strokeWidth="1.5" />
        <path d={arc2(45,0,40,'down',d20,ph/2)} fill="none" stroke="white" strokeWidth="1.8" />
        <path d={arc2(45,20,13,'down',d20,ph/2)} fill="none" stroke="white" strokeWidth="1.5" />
        <circle cx={cx2} cy={penD} r="2.5" fill="white" />
        <line x1={cx2-ghw} y1={-9} x2={cx2-ghw} y2={2} stroke="white" strokeWidth="3" /><line x1={cx2+ghw} y1={-9} x2={cx2+ghw} y2={2} stroke="white" strokeWidth="3" /><line x1={cx2-ghw} y1={-4} x2={cx2+ghw} y2={-4} stroke="white" strokeWidth="2" />
        <rect x={cx2-srW} y={ph-srH} width={srW*2} height={srH} fill="none" stroke="white" strokeWidth="1.5" />
        <rect x={cx2-lrW} y={ph-lrH} width={lrW*2} height={lrH} fill="none" stroke="white" strokeWidth="1.5" />
        <path d={arc2(45,145,40,'up',ph/2,ph-d20)} fill="none" stroke="white" strokeWidth="1.8" />
        <path d={arc2(45,125,13,'up',ph/2,ph-d20)} fill="none" stroke="white" strokeWidth="1.5" />
        <circle cx={cx2} cy={ph-penD} r="2.5" fill="white" />
        <line x1={cx2-ghw} y1={ph-2} x2={cx2-ghw} y2={ph+9} stroke="white" strokeWidth="3" /><line x1={cx2+ghw} y1={ph-2} x2={cx2+ghw} y2={ph+9} stroke="white" strokeWidth="3" /><line x1={cx2-ghw} y1={ph+4} x2={cx2+ghw} y2={ph+4} stroke="white" strokeWidth="2" />
      </g>
    );
  };

  const PlayerCounter = ({player})=>{
    const isHome=player.team==="home",isDragged=dragging===player.id,isAttached=ball.attachedTo===player.id;
    return (
      <g style={{cursor:attachMode?"crosshair":isDragged?"grabbing":"grab"}} onPointerDown={(e)=>handlePointerDown(e,player.id)}>
        {attachMode&&<circle cx={player.x} cy={player.y} r={R+4} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.6" />}
        <circle cx={player.x} cy={player.y} r={R} fill={isHome?"#1a56db":"#dc2626"} stroke={isAttached?"#fbbf24":isHome?"#fbbf24":"#fca5a5"} strokeWidth={isAttached?3.5:isHome?3:2} filter={isDragged?"url(#shadow)":"none"} opacity={isDragged?0.85:1} />
        <text x={player.x} y={player.y+1} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui,sans-serif" pointerEvents="none" style={{userSelect:"none"}}>{player.label}</text>
      </g>
    );
  };

  const ballPos = getBallPos();

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"system-ui,sans-serif",background:"#1a1a2e",overflow:"hidden"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <div style={{display:"flex",borderBottom:"1px solid #333",flexShrink:0}}>
          <button onClick={()=>setActiveTab("board")} style={{padding:"8px 20px",border:"none",borderBottom:activeTab==="board"?"2px solid #fbbf24":"2px solid transparent",cursor:"pointer",fontSize:13,fontWeight:700,background:"transparent",color:activeTab==="board"?"#fbbf24":"#888"}}>Tactical Board</button>
          <button onClick={()=>setActiveTab("principles")} style={{padding:"8px 20px",border:"none",borderBottom:activeTab==="principles"?"2px solid #fbbf24":"2px solid transparent",cursor:"pointer",fontSize:13,fontWeight:700,background:"transparent",color:activeTab==="principles"?"#fbbf24":"#888"}}>Principles</button>
        </div>
        {activeTab==="principles" ? <PrinciplesTab /> : (
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"8px",overflow:"auto",minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,width:"100%",maxWidth:680,justifyContent:"space-between",flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{display:"flex",flexDirection:"column",gap:0}}><h2 style={{margin:0,color:"#fff",fontSize:15,fontWeight:700}}>Castleknock U16 Ladies Football</h2><span style={{color:"#999",fontSize:11,fontWeight:600}}>Tactics Board</span></div>
                <span style={{display:"inline-flex",alignItems:"center",gap:3}}><span style={{width:10,height:10,borderRadius:"50%",background:"#1a56db",border:"2px solid #fbbf24",display:"inline-block"}} /><span style={{color:"#ccc",fontSize:11}}>Home</span></span>
                <span style={{display:"inline-flex",alignItems:"center",gap:3}}><span style={{width:10,height:10,borderRadius:"50%",background:"#dc2626",border:"2px solid #fca5a5",display:"inline-block"}} /><span style={{color:"#ccc",fontSize:11}}>Opp</span></span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                <button onClick={()=>{if(ball.attachedTo){const p=players.find(pl=>pl.id===ball.attachedTo);setBall({x:p.x+ballOffset.x,y:p.y+ballOffset.y,attachedTo:null});setBallOffset({x:0,y:0});setAttachMode(false);}else setAttachMode(m=>!m);}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid",borderColor:ball.attachedTo?"#f87171":attachMode?"#fbbf24":"#555",background:ball.attachedTo?"rgba(248,113,113,0.15)":attachMode?"rgba(251,191,36,0.15)":"#333",color:ball.attachedTo?"#f87171":attachMode?"#fbbf24":"#fff",cursor:"pointer",fontSize:11,fontWeight:600}}>{ball.attachedTo?"Detach":attachMode?"Pick Player...":"Attach Ball"}</button>
                <button onClick={()=>setShowTrails(t=>!t)} style={{padding:"4px 10px",borderRadius:6,border:"1px solid",borderColor:showTrails?"#fbbf24":"#555",background:showTrails?"rgba(251,191,36,0.15)":"#333",color:showTrails?"#fbbf24":"#fff",cursor:"pointer",fontSize:11,fontWeight:600}}>{showTrails?"Trails ON":"Trails OFF"}</button>
                <button onClick={()=>setShowBallTrail(t=>!t)} style={{padding:"4px 10px",borderRadius:6,border:"1px solid",borderColor:showBallTrail?"#fff":"#555",background:showBallTrail?"rgba(255,255,255,0.12)":"#333",color:showBallTrail?"#fff":"#999",cursor:"pointer",fontSize:11,fontWeight:600}}>{showBallTrail?"Ball Trail ON":"Ball Trail OFF"}</button>
                <button onClick={()=>setShowLanes(l=>!l)} style={{padding:"4px 10px",borderRadius:6,border:"1px solid",borderColor:showLanes?"#a78bfa":"#555",background:showLanes?"rgba(167,139,250,0.15)":"#333",color:showLanes?"#a78bfa":"#fff",cursor:"pointer",fontSize:11,fontWeight:600}}>{showLanes?"Lanes ON":"Lanes OFF"}</button>
                {Object.keys(trails).length>0&&<button onClick={clearTrails} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #555",background:"#333",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:600}}>Clear</button>}
                <button onClick={reset} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #555",background:"#333",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:600}}>Reset</button>
                <button onClick={()=>applyFormation("defending_deep")} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #c0392b",background:"rgba(192,57,43,0.15)",color:"#e74c3c",cursor:"pointer",fontSize:11,fontWeight:600}}>Defending Deep</button>
                <button onClick={()=>applyFormation("attacking_low_block")} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #2ecc71",background:"rgba(46,204,113,0.15)",color:"#2ecc71",cursor:"pointer",fontSize:11,fontWeight:600}}>Attacking Low Block</button>
                {!sidebarOpen&&<button onClick={()=>setSidebarOpen(true)} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #6366f1",background:"rgba(99,102,241,0.15)",color:"#a5b4fc",cursor:"pointer",fontSize:11,fontWeight:600}}>Videos</button>}
              </div>
            </div>
            {attachMode&&<div style={{background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",borderRadius:6,padding:"4px 12px",marginBottom:6,maxWidth:680,width:"100%"}}><span style={{color:"#fbbf24",fontSize:11}}>Click any player to attach the ball</span></div>}
            {savedPositions&&(
              <div style={{maxWidth:680,width:"100%",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{color:"#10b981",fontSize:11,fontWeight:600}}>Select all, copy, and paste to me:</span>
                  <button onClick={()=>setSavedPositions(null)} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:14}}>✕</button>
                </div>
                <textarea readOnly value={savedPositions} style={{width:"100%",height:120,background:"#111",color:"#10b981",border:"1px solid #333",borderRadius:6,padding:8,fontSize:10,fontFamily:"monospace",resize:"none"}} onFocus={e=>e.target.select()} />
              </div>
            )}
            <svg ref={svgRef} viewBox={`0 0 ${PITCH_W} ${PITCH_H}`} style={{width:"100%",maxWidth:680,borderRadius:8,touchAction:"none",userSelect:"none"}} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
              <defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" /></filter></defs>
              <rect width={PITCH_W} height={PITCH_H} fill="#1e3a1e" rx="8" />
              <PitchMarkings />
              {showLanes&&(()=>{const pw2=600,lox2=(PITCH_W-pw2)/2,loy2=(PITCH_H-580)/2,laneW=pw2/7;const colors=["rgba(255,100,100,0.12)","rgba(100,150,255,0.12)","rgba(255,200,50,0.12)","rgba(100,255,150,0.12)","rgba(255,200,50,0.12)","rgba(100,150,255,0.12)","rgba(255,100,100,0.12)"];return <g>{colors.map((c,i)=><rect key={i} x={lox2+i*laneW} y={loy2} width={laneW} height={580} fill={c} />)}{[1,2,3,4,5,6].map(i=><line key={`ld${i}`} x1={lox2+i*laneW} y1={loy2} x2={lox2+i*laneW} y2={loy2+580} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="6,4" />)}</g>;})()}
              {Object.entries(trails).map(([id,pts])=>{const d=buildTrailPath(pts);if(!d)return null;return <g key={`trail-${id}`}><path d={d} fill="none" stroke={trailColor(id)} strokeWidth={id==="ball"?2:3} strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />{pts.length>=2&&(()=>{const last=pts[pts.length-1],prev=pts[pts.length-2];const dx2=last.x-prev.x,dy2=last.y-prev.y;if(Math.sqrt(dx2*dx2+dy2*dy2)<2)return null;const angle=Math.atan2(dy2,dx2)*180/Math.PI;return <polygon points="-6,-4 0,0 -6,4" fill={trailColor(id)} transform={`translate(${last.x},${last.y}) rotate(${angle})`} />;})()}</g>;})}
              {players.filter(p=>p.team==="away"&&p.id!==dragging).map(p=><PlayerCounter key={p.id} player={p} />)}
              {players.filter(p=>p.team==="home"&&p.id!==dragging).map(p=><PlayerCounter key={p.id} player={p} />)}
              {dragging&&dragging!=="ball"&&<PlayerCounter player={players.find(p=>p.id===dragging)} />}
              <ONeillsBall x={ballPos.x} y={ballPos.y} isDragged={dragging==="ball"} attached={!!ball.attachedTo} onPointerDown={(e)=>handlePointerDown(e,"ball")} />
            </svg>
          </div>
        )}
      </div>
      <VideoLibrarySidebar open={sidebarOpen} setOpen={setSidebarOpen} onExpand={(url)=>setModalUrl(url)} />
      {modalUrl&&<VideoModal url={modalUrl} onClose={()=>setModalUrl(null)} />}
    </div>
  );
}

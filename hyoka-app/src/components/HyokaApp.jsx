import { useState, useRef } from "react";

// ─── Constants ───────────────────────────────────────────────
const HUMAN_CATS = [
  { id:"vibe",    label:"雰囲気・オーラ",  emoji:"✨", grad:"linear-gradient(135deg,#f9a8d4,#e879f9)" },
  { id:"fashion", label:"ファッション",     emoji:"👗", grad:"linear-gradient(135deg,#fb923c,#f43f5e)" },
  { id:"style",   label:"スタイル",        emoji:"💪", grad:"linear-gradient(135deg,#34d399,#06b6d4)" },
  { id:"mote",    label:"モテそう",        emoji:"💘", grad:"linear-gradient(135deg,#f472b6,#c084fc)" },
  { id:"clean",   label:"清潔感",          emoji:"🧼", grad:"linear-gradient(135deg,#60a5fa,#818cf8)" },
  { id:"talk",    label:"話しかけやすさ",  emoji:"😊", grad:"linear-gradient(135deg,#fbbf24,#f97316)" },
];

const HEART_TIERS = [
  { id:"random", label:"ランダム",    desc:"気まぐれにいいね",   power:null,        icon:"🎲", grad:"linear-gradient(135deg,#6366f1,#818cf8)" },
  { id:"t0",     label:"0〜100",      desc:"ちょっといいね",     power:[0,100],     icon:"🌱", grad:"linear-gradient(135deg,#34d399,#06b6d4)" },
  { id:"t1",     label:"101〜1000",   desc:"かなりいいね",       power:[101,1000],  icon:"💫", grad:"linear-gradient(135deg,#f472b6,#c084fc)" },
  { id:"t2",     label:"1001〜10000", desc:"めっちゃ推し！",     power:[1001,10000],icon:"🔥", grad:"linear-gradient(135deg,#f43f5e,#f97316)" },
];

// Popularity tiers for filtering posts by total like power
const POPULARITY_TIERS = [
  { id:"t0", label:"0〜100",      range:[0, 100],        icon:"🌱", grad:"linear-gradient(135deg,#34d399,#06b6d4)" },
  { id:"t1", label:"101〜1000",   range:[101, 1000],     icon:"💫", grad:"linear-gradient(135deg,#f472b6,#c084fc)" },
  { id:"t2", label:"1001〜10000", range:[1001, 10000],   icon:"🔥", grad:"linear-gradient(135deg,#f43f5e,#f97316)" },
  { id:"t3", label:"10001以上",   range:[10001, Infinity], icon:"👑", grad:"linear-gradient(135deg,#fbbf24,#f97316)" },
];

const FACE_PARTS = [
  { id:"eyes",     label:"目",       emoji:"👁" },
  { id:"eyebrows", label:"眉毛",     emoji:"✏️" },
  { id:"nose",     label:"鼻",       emoji:"👃" },
  { id:"mouth",    label:"口",       emoji:"👄" },
  { id:"ears",     label:"耳",       emoji:"👂" },
  { id:"balance",  label:"顔の余白", emoji:"🪞" },
  { id:"depth",    label:"顔の凹凸", emoji:"⛰" },
];

const randomPower = (tier) => !tier.power
  ? Math.floor(Math.random()*100)
  : Math.floor(Math.random()*(tier.power[1]-tier.power[0]+1))+tier.power[0];

const totalPower = (cats) => Object.values(cats).reduce((a,b)=>a+(b.power||0),0);
const totalCount = (cats) => Object.values(cats).reduce((a,b)=>a+(b.count||0),0);

// ─── 8-Type Classification (顔タイプ診断®風) ─────────────────
const EIGHT_TYPES = [
  { id:"cute",           label:"キュート",           axes:"子供寄り × 親しみ × 曲線", grad:"linear-gradient(135deg,#fbcfe8,#f9a8d4)" },
  { id:"fresh",          label:"フレッシュ",         axes:"子供寄り × 親しみ × 直線", grad:"linear-gradient(135deg,#bbf7d0,#86efac)" },
  { id:"activeCute",     label:"アクティブキュート", axes:"子供寄り × かっこいい × 曲線", grad:"linear-gradient(135deg,#fde68a,#fbbf24)" },
  { id:"coolCasual",     label:"クールカジュアル",   axes:"子供寄り × かっこいい × 直線", grad:"linear-gradient(135deg,#bae6fd,#7dd3fc)" },
  { id:"feminine",       label:"フェミニン",         axes:"大人寄り × 親しみ × 曲線", grad:"linear-gradient(135deg,#f5d0fe,#e879f9)" },
  { id:"softElegant",    label:"ソフトエレガント",   axes:"大人寄り × 親しみ × 直線", grad:"linear-gradient(135deg,#e9d5ff,#c084fc)" },
  { id:"elegant",        label:"エレガント",         axes:"大人寄り × かっこいい × 曲線", grad:"linear-gradient(135deg,#fecaca,#f87171)" },
  { id:"cool",           label:"クール",             axes:"大人寄り × かっこいい × 直線", grad:"linear-gradient(135deg,#c7d2fe,#818cf8)" },
];

// ─── Bone Structure (骨格診断) ────────────────────────────
const BONE_TYPES = [
  { id:"straight", label:"ストレート", feature:"メリハリがあり上半身に厚み、肌に弾力", grad:"linear-gradient(135deg,#fef3c7,#fbbf24)" },
  { id:"wave",     label:"ウェーブ",   feature:"柔らかく華奢、下半身にボリューム", grad:"linear-gradient(135deg,#fce7f3,#f472b6)" },
  { id:"natural",  label:"ナチュラル", feature:"フレーム感があり骨・関節が目立つ", grad:"linear-gradient(135deg,#d1fae5,#34d399)" },
];

// ─── Personal Color (パーソナルカラー) ─────────────────────
const PC_TYPES = [
  { id:"spring", label:"スプリング", tone:"イエローベース・明るい", colors:["コーラル","ピーチ","クリーム","サーモンピンク"], grad:"linear-gradient(135deg,#fde68a,#fb923c)" },
  { id:"summer", label:"サマー",     tone:"ブルーベース・柔らかい", colors:["ラベンダー","ローズピンク","スカイブルー","ミントグリーン"], grad:"linear-gradient(135deg,#bae6fd,#c4b5fd)" },
  { id:"autumn", label:"オータム",   tone:"イエローベース・深い",   colors:["テラコッタ","マスタード","カーキ","ブラウン"], grad:"linear-gradient(135deg,#fdba74,#c2410c)" },
  { id:"winter", label:"ウィンター", tone:"ブルーベース・鮮やか",   colors:["ロイヤルブルー","マゼンタ","ピュアホワイト","黒"], grad:"linear-gradient(135deg,#67e8f9,#6366f1)" },
];

const sampleAnalysis = (eightType="フェミニン", bone="ウェーブ", pc="スプリング") => ({
  parts:{
    eyes:"やや丸みを帯びた、印象的な目元です。",
    eyebrows:"自然なアーチを描き、優しい印象。",
    nose:"鼻筋が通り、バランスの良い形。",
    mouth:"口角がやや上がり、親しみやすい印象。",
    ears:"顔とのバランスが整っています。",
    balance:"パーツの配置に余裕があり、落ち着いた印象。",
    depth:"自然な陰影があり、立体感があります。",
  },
  charm:"温かみのある自然体な表情が魅力です。",
  eightType:{
    primary: eightType,
    axes:{ age:"大人寄り", impression:"親しみ", line:"曲線" },
    note:"柔らかい印象と曲線的なラインが特徴的に見えます。",
  },
  bone:{
    primary: bone,
    breakdown:[
      { type: bone, percentage:55 },
      { type: BONE_TYPES.filter(b=>b.label!==bone)[0].label, percentage:25 },
      { type: BONE_TYPES.filter(b=>b.label!==bone)[1].label, percentage:20 },
    ],
    note:"首や肩の印象からの推測です。より正確な判定には全身写真が必要です。",
  },
  personalColor:{
    primary: pc,
    undertone: pc==="スプリング"||pc==="オータム" ? "イエローベース" : "ブルーベース",
    note:"肌の明るさとトーンから判定しました。",
    recommendedColors: PC_TYPES.find(p=>p.label===pc)?.colors.slice(0,3) || [],
  },
});


const DEMO_POSTS = [
  { id:1, username:"sakura_chan", sns:"https://twitter.com/sakura",
    image:"https://api.dicebear.com/7.x/avataaars/svg?seed=sakura&backgroundColor=ffd5dc",
    analysis:sampleAnalysis("フェミニン","ウェーブ","スプリング"),
    cats:{ vibe:{count:8,power:320}, fashion:{count:5,power:180}, style:{count:3,power:90},
           mote:{count:9,power:420}, clean:{count:7,power:260}, talk:{count:6,power:200} }, isMyPost:false },
  { id:2, username:"taro_cool", sns:"https://instagram.com/taro",
    image:"https://api.dicebear.com/7.x/avataaars/svg?seed=taro&backgroundColor=c0e8ff",
    analysis:sampleAnalysis("クール","ストレート","ウィンター"),
    cats:{ vibe:{count:4,power:150}, fashion:{count:6,power:280}, style:{count:7,power:350},
           mote:{count:5,power:190}, clean:{count:8,power:400}, talk:{count:3,power:90} }, isMyPost:false },
  { id:3, username:"mimi_style", sns:"https://tiktok.com/@mimi",
    image:"https://api.dicebear.com/7.x/avataaars/svg?seed=mimi&backgroundColor=d4f5d4",
    analysis:sampleAnalysis("キュート","ウェーブ","スプリング"),
    cats:{ vibe:{count:12,power:800}, fashion:{count:11,power:750}, style:{count:4,power:200},
           mote:{count:14,power:980}, clean:{count:9,power:600}, talk:{count:10,power:700} }, isMyPost:false },
  { id:4, username:"kei_vibes", sns:"",
    image:"https://api.dicebear.com/7.x/avataaars/svg?seed=kei&backgroundColor=ffe4e1",
    analysis:sampleAnalysis("ソフトエレガント","ナチュラル","サマー"),
    cats:{ vibe:{count:2,power:50}, fashion:{count:1,power:20}, style:{count:0,power:0},
           mote:{count:3,power:80}, clean:{count:2,power:40}, talk:{count:1,power:10} }, isMyPost:false },
  { id:5, username:"hana_fox", sns:"https://instagram.com/hana",
    image:"https://api.dicebear.com/7.x/avataaars/svg?seed=hana&backgroundColor=e8f4fd",
    analysis:sampleAnalysis("エレガント","ストレート","オータム"),
    cats:{ vibe:{count:0,power:0}, fashion:{count:0,power:0}, style:{count:0,power:0},
           mote:{count:0,power:0}, clean:{count:0,power:0}, talk:{count:0,power:0} }, isMyPost:false },
];

// ─── Shared UI ───────────────────────────────────────────────
const Orbs = () => (
  <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    <div style={{position:"absolute",top:"-80px",left:"-60px",width:280,height:280,borderRadius:"50%",
      background:"radial-gradient(circle,rgba(244,114,182,0.28),transparent 70%)",filter:"blur(8px)"}}/>
    <div style={{position:"absolute",top:"35%",right:"-80px",width:240,height:240,borderRadius:"50%",
      background:"radial-gradient(circle,rgba(167,139,250,0.22),transparent 70%)",filter:"blur(8px)"}}/>
    <div style={{position:"absolute",bottom:"8%",left:"5%",width:200,height:200,borderRadius:"50%",
      background:"radial-gradient(circle,rgba(96,165,250,0.18),transparent 70%)",filter:"blur(8px)"}}/>
  </div>
);

const GradBtn = ({ grad, onClick, disabled, children, small }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width:"100%", padding:small?"10px 14px":"15px", borderRadius:small?12:18,
    border:"none", background:disabled?"rgba(255,255,255,0.08)":grad,
    color:disabled?"rgba(255,255,255,0.25)":"#fff", fontWeight:800,
    fontSize:small?13:15, cursor:disabled?"not-allowed":"pointer",
    boxShadow:disabled?"none":"0 4px 18px rgba(0,0,0,0.3)", transition:"all .15s",
    letterSpacing:"0.2px",
  }}>{children}</button>
);

const GlassInput = ({ placeholder, value, onChange }) => (
  <input placeholder={placeholder} value={value} onChange={onChange} style={{
    width:"100%", padding:"13px 16px", borderRadius:14,
    border:"1.5px solid rgba(255,255,255,0.15)", fontSize:15, outline:"none",
    background:"rgba(255,255,255,0.07)", backdropFilter:"blur(12px)",
    color:"#fff", caretColor:"#f472b6", boxSizing:"border-box",
  }}/>
);

const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{
    background:"none", border:"none", cursor:"pointer", padding:0,
    fontSize:14, fontWeight:700, color:"rgba(255,255,255,0.4)", alignSelf:"flex-start",
  }}>← 戻る</button>
);

const Glass = ({ children, style={} }) => (
  <div style={{borderRadius:24, background:"rgba(255,255,255,0.06)", backdropFilter:"blur(18px)",
    border:"1.5px solid rgba(255,255,255,0.11)", boxShadow:"0 6px 28px rgba(0,0,0,0.3)", ...style}}>
    {children}
  </div>
);

// ─── Filter chip ─────────────────────────────────────────
const FilterChip = ({ label, active, onClick, grad }) => (
  <button onClick={onClick} style={{
    padding:"7px 14px", borderRadius:99, border:"none", cursor:"pointer",
    background:active?(grad||"linear-gradient(135deg,#f472b6,#c084fc)"):"rgba(255,255,255,0.08)",
    color:active?"#fff":"rgba(255,255,255,0.45)",
    fontWeight:active?800:500, fontSize:12, whiteSpace:"nowrap",
    boxShadow:active?"0 2px 10px rgba(0,0,0,0.25)":"none", transition:"all .15s",
  }}>{label}</button>
);

// count active filters (non-null values)
const activeFilterCount = (f) => (f.eightType?1:0) + (f.bone?1:0) + (f.color?1:0) + (f.popularity?1:0);

// Does post match the filter?
const matchFilter = (post, f) => {
  if (f.eightType && post.analysis?.eightType?.primary !== f.eightType) return false;
  if (f.bone && post.analysis?.bone?.primary !== f.bone) return false;
  if (f.color && post.analysis?.personalColor?.primary !== f.color) return false;
  if (f.popularity) {
    const tier = POPULARITY_TIERS.find(t=>t.id===f.popularity);
    if (tier) {
      const tp = totalPower(post.cats);
      if (tp < tier.range[0] || tp > tier.range[1]) return false;
    }
  }
  return true;
};

// ─── Filter Icon Button ───────────────────────────────
const FilterIconButton = ({ count, onClick }) => (
  <button onClick={onClick} style={{
    position:"relative", width:42, height:42, borderRadius:14, cursor:"pointer",
    background: count>0 ? "linear-gradient(135deg,#f472b6,#c084fc)" : "rgba(255,255,255,0.08)",
    border: count>0 ? "none" : "1.5px solid rgba(255,255,255,0.12)",
    display:"flex", alignItems:"center", justifyContent:"center",
    boxShadow: count>0 ? "0 3px 14px rgba(244,114,182,0.4)" : "none",
    transition:"all .15s",
  }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={count>0?"#fff":"rgba(255,255,255,0.55)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
    {count>0 && (
      <span style={{
        position:"absolute", top:-4, right:-4, minWidth:18, height:18, borderRadius:9,
        background:"#fff", color:"#c9184a", fontSize:10, fontWeight:900,
        display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px",
        boxShadow:"0 2px 6px rgba(0,0,0,0.3)",
      }}>{count}</span>
    )}
  </button>
);

// ─── Filter Modal/Panel ────────────────────────────────
const FilterPanel = ({ filter, onChange, onClose }) => {
  const update = (key, val) => onChange({ ...filter, [key]: filter[key]===val ? null : val });
  const clearAll = () => onChange({ eightType:null, bone:null, color:null, popularity:null });

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      display:"flex", alignItems:"flex-end", justifyContent:"center",
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:"absolute", inset:0,
        background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)",
      }}/>

      {/* Panel */}
      <div style={{
        position:"relative", width:"100%", maxWidth:430,
        background:"linear-gradient(180deg,#1e1b4b 0%,#0f172a 100%)",
        borderRadius:"28px 28px 0 0",
        padding:"20px 24px 32px",
        maxHeight:"85vh", overflowY:"auto",
        borderTop:"1px solid rgba(255,255,255,0.1)",
        boxShadow:"0 -10px 40px rgba(0,0,0,0.5)",
      }}>
        {/* Handle */}
        <div style={{
          width:40, height:4, background:"rgba(255,255,255,0.2)",
          borderRadius:99, margin:"0 auto 16px",
        }}/>

        {/* Title */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h2 style={{margin:0,fontSize:20,fontWeight:900,
              background:"linear-gradient(135deg,#f9a8d4,#c084fc)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              🔍 絞り込み
            </h2>
            <p style={{margin:"3px 0 0",fontSize:11,color:"rgba(255,255,255,0.4)"}}>
              AI診断の結果でフィルター
            </p>
          </div>
          {activeFilterCount(filter)>0 && (
            <button onClick={clearAll} style={{
              background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",
              color:"rgba(255,255,255,0.7)",padding:"6px 12px",borderRadius:99,
              fontSize:11,fontWeight:700,cursor:"pointer",
            }}>クリア</button>
          )}
        </div>

        {/* 8-type */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:800,color:"rgba(255,255,255,0.6)",marginBottom:10}}>💫 8タイプ分類</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {EIGHT_TYPES.map(e => (
              <FilterChip key={e.id} label={e.label}
                active={filter.eightType===e.label}
                grad={e.grad}
                onClick={()=>update("eightType", e.label)}/>
            ))}
          </div>
        </div>

        {/* Bone */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:800,color:"rgba(255,255,255,0.6)",marginBottom:10}}>🦴 骨格診断</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {BONE_TYPES.map(b => (
              <FilterChip key={b.id} label={b.label}
                active={filter.bone===b.label}
                grad={b.grad}
                onClick={()=>update("bone", b.label)}/>
            ))}
          </div>
        </div>

        {/* Personal Color */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:800,color:"rgba(255,255,255,0.6)",marginBottom:10}}>🎨 パーソナルカラー</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {PC_TYPES.map(p => (
              <FilterChip key={p.id} label={p.label}
                active={filter.color===p.label}
                grad={p.grad}
                onClick={()=>update("color", p.label)}/>
            ))}
          </div>
        </div>

        {/* Popularity (like power tier) */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:800,color:"rgba(255,255,255,0.6)",marginBottom:10}}>❤️ 人気度（合計いいねパワー）</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {POPULARITY_TIERS.map(t => (
              <FilterChip key={t.id} label={`${t.icon} ${t.label}`}
                active={filter.popularity===t.id}
                grad={t.grad}
                onClick={()=>update("popularity", t.id)}/>
            ))}
          </div>
        </div>

        {/* Apply button */}
        <GradBtn grad="linear-gradient(135deg,#f43f5e,#f472b6,#c084fc)" onClick={onClose}>
          ✨ 絞り込みを適用
        </GradBtn>
      </div>
    </div>
  );
};

// Active filter display (small chips under header)
const ActiveFilterRow = ({ filter, onClear }) => {
  const chips = [];
  if (filter.eightType) {
    const t = EIGHT_TYPES.find(e=>e.label===filter.eightType);
    chips.push({ key:"eightType", label:"💫 "+filter.eightType, grad:t?.grad });
  }
  if (filter.bone) {
    const t = BONE_TYPES.find(b=>b.label===filter.bone);
    chips.push({ key:"bone", label:"🦴 "+filter.bone, grad:t?.grad });
  }
  if (filter.color) {
    const t = PC_TYPES.find(p=>p.label===filter.color);
    chips.push({ key:"color", label:"🎨 "+filter.color, grad:t?.grad });
  }
  if (filter.popularity) {
    const t = POPULARITY_TIERS.find(p=>p.id===filter.popularity);
    if (t) chips.push({ key:"popularity", label:`${t.icon} ${t.label}`, grad:t.grad });
  }
  if (chips.length===0) return null;
  return (
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {chips.map(c => (
        <button key={c.key} onClick={()=>onClear(c.key)} style={{
          padding:"5px 12px", borderRadius:99, border:"none", cursor:"pointer",
          background: c.grad || "linear-gradient(135deg,#f472b6,#c084fc)",
          color:"#fff", fontSize:11, fontWeight:800, display:"flex", alignItems:"center", gap:5,
          boxShadow:"0 2px 8px rgba(0,0,0,0.25)",
        }}>
          {c.label}
          <span style={{opacity:0.8,fontSize:12,marginLeft:2}}>×</span>
        </button>
      ))}
    </div>
  );
};

// ─── Bottom Nav ──────────────────────────────────────────────
const BottomNav = ({ current, onChange }) => {
  const tabs = [
    { id:"feed",   label:"ホーム",  icon:"🏠", grad:"linear-gradient(135deg,#818cf8,#60a5fa)" },
    { id:"post",   label:"投稿",    icon:"📸", grad:"linear-gradient(135deg,#f472b6,#e879f9)" },
    { id:"aiOnly", label:"AI診断",  icon:"🤖", grad:"linear-gradient(135deg,#8b5cf6,#ec4899)" },
    { id:"mypage", label:"マイ",    icon:"👤", grad:"linear-gradient(135deg,#06b6d4,#34d399)" },
  ];
  return (
    <div style={{
      position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
      width:"100%", maxWidth:430, zIndex:100,
      background:"rgba(15,10,30,0.85)", backdropFilter:"blur(24px)",
      borderTop:"1px solid rgba(255,255,255,0.1)",
      padding:"8px 10px 18px",
    }}>
      <div style={{display:"flex",justifyContent:"space-around",alignItems:"center"}}>
        {tabs.map(t => {
          const active = current === t.id;
          return (
            <button key={t.id} onClick={()=>onChange(t.id)} style={{
              background:"none", border:"none", cursor:"pointer", padding:"6px 10px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:3, flex:1,
            }}>
              <div style={{fontSize:22, transition:"transform .15s",
                transform:active?"scale(1.15)":"scale(1)",
                filter:active?"none":"grayscale(1) opacity(0.5)"}}>{t.icon}</div>
              <div style={{fontSize:10, fontWeight:800,
                background: active ? t.grad : "transparent",
                WebkitBackgroundClip: active ? "text" : "initial",
                WebkitTextFillColor: active ? "transparent" : "rgba(255,255,255,0.4)"}}>
                {t.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── AI Analysis Card ────────────────────────────────────────
const AIAnalysisCard = ({ analysis, defaultOpen=true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState("eight"); // eight | bone | color | parts
  if (!analysis) return null;

  const tabs = [
    { id:"eight", label:"8タイプ",   icon:"💫", show: !!analysis.eightType },
    { id:"bone",  label:"骨格",      icon:"🦴", show: !!analysis.bone },
    { id:"color", label:"カラー",    icon:"🎨", show: !!analysis.personalColor },
    { id:"parts", label:"パーツ",    icon:"👁",  show: !!analysis.parts },
  ].filter(t => t.show);

  return (
    <div style={{borderRadius:16,overflow:"hidden",
      background:"linear-gradient(145deg,rgba(139,92,246,0.12),rgba(236,72,153,0.08))",
      border:"1px solid rgba(139,92,246,0.3)"}}>
      {/* Header */}
      <div style={{padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",
        background:"linear-gradient(135deg,rgba(139,92,246,0.25),rgba(236,72,153,0.15))",
        borderBottom:"1px solid rgba(255,255,255,0.08)",cursor:"pointer"}}
        onClick={()=>setOpen(o=>!o)}>
        <span style={{fontSize:12,fontWeight:800,
          background:"linear-gradient(135deg,#c084fc,#ec4899)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          🤖 AI詳細診断 by Claude
        </span>
        <span style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:700}}>
          {open?"▲ 閉じる":"▼ 詳細"}
        </span>
      </div>

      {/* Summary (always visible) */}
      <div style={{padding:"14px 16px"}}>
        {analysis.charm && (
          <div style={{fontSize:14,color:"rgba(255,255,255,0.85)",lineHeight:1.6,fontStyle:"italic",
            background:"linear-gradient(135deg,#f9a8d4,#c084fc,#818cf8)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontWeight:700}}>
            💭 {analysis.charm}
          </div>
        )}

        {/* Quick badges of all 3 diagnoses */}
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12}}>
          {analysis.eightType?.primary && (
            <span style={{padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:800,color:"#fff",
              background:EIGHT_TYPES.find(e=>e.label===analysis.eightType.primary)?.grad||"linear-gradient(135deg,#818cf8,#c084fc)"}}>
              💫 {analysis.eightType.primary}
            </span>
          )}
          {analysis.bone?.primary && (
            <span style={{padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:800,color:"#fff",
              background:BONE_TYPES.find(b=>b.label===analysis.bone.primary)?.grad||"linear-gradient(135deg,#34d399,#06b6d4)"}}>
              🦴 {analysis.bone.primary}
            </span>
          )}
          {analysis.personalColor?.primary && (
            <span style={{padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:800,color:"#fff",
              background:PC_TYPES.find(p=>p.label===analysis.personalColor.primary)?.grad||"linear-gradient(135deg,#fb923c,#f43f5e)"}}>
              🎨 {analysis.personalColor.primary}
            </span>
          )}
        </div>

        {open && (
          <>
            {/* Tab selector */}
            {tabs.length > 1 && (
              <div style={{display:"flex",gap:5,marginTop:16,padding:"3px",
                background:"rgba(0,0,0,0.25)",borderRadius:12,
                border:"1px solid rgba(255,255,255,0.05)"}}>
                {tabs.map(t => (
                  <button key={t.id} onClick={()=>setTab(t.id)} style={{
                    flex:1, padding:"7px 4px", borderRadius:9, border:"none",
                    background: tab===t.id ? "linear-gradient(135deg,#8b5cf6,#ec4899)" : "transparent",
                    color: tab===t.id ? "#fff" : "rgba(255,255,255,0.45)",
                    fontSize:11, fontWeight:800, cursor:"pointer",
                    transition:"all .15s",
                  }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* TAB: Face parts */}
            {tab==="parts" && analysis.parts && (
              <div style={{marginTop:14}}>
                <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.55)",marginBottom:10,letterSpacing:"0.5px"}}>
                  ◆ パーツごとの観察
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {FACE_PARTS.map(part => analysis.parts[part.id] && (
                    <div key={part.id} style={{display:"flex",gap:10,alignItems:"flex-start",
                      padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,0.04)"}}>
                      <div style={{fontSize:13,minWidth:72,color:"rgba(255,255,255,0.6)",fontWeight:800}}>
                        {part.emoji} {part.label}
                      </div>
                      <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",lineHeight:1.6,flex:1}}>
                        {analysis.parts[part.id]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: 8-type classification */}
            {tab==="eight" && analysis.eightType && (
              <div style={{marginTop:14}}>
                <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.55)",marginBottom:10}}>
                  ◆ 8タイプ分類
                </div>
                <div style={{padding:"14px",borderRadius:14,
                  background:EIGHT_TYPES.find(e=>e.label===analysis.eightType.primary)?.grad||"linear-gradient(135deg,#818cf8,#c084fc)",
                  color:"#fff",textAlign:"center"}}>
                  <div style={{fontSize:11,fontWeight:700,opacity:0.85}}>あなたのタイプは</div>
                  <div style={{fontSize:22,fontWeight:900,marginTop:4}}>💫 {analysis.eightType.primary}</div>
                </div>

                {/* 3 axes */}
                {analysis.eightType.axes && (
                  <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                    {[
                      { key:"age",        label:"年齢感" },
                      { key:"impression", label:"印象" },
                      { key:"line",       label:"ライン" },
                    ].map(a => (
                      <div key={a.key} style={{padding:"8px",borderRadius:10,
                        background:"rgba(255,255,255,0.06)",textAlign:"center"}}>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{a.label}</div>
                        <div style={{fontSize:12,fontWeight:800,color:"#fff",marginTop:3}}>
                          {analysis.eightType.axes[a.key] || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {analysis.eightType.note && (
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:12,lineHeight:1.6,
                    padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.04)"}}>
                    {analysis.eightType.note}
                  </div>
                )}

                {/* 8 types reference */}
                <div style={{marginTop:14,paddingTop:14,borderTop:"1px dashed rgba(255,255,255,0.12)"}}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:8}}>8タイプ一覧</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                    {EIGHT_TYPES.map(e => (
                      <div key={e.id} style={{
                        padding:"6px 8px",borderRadius:8,
                        background: e.label===analysis.eightType.primary ? e.grad : "rgba(255,255,255,0.04)",
                        border: e.label===analysis.eightType.primary ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <div style={{fontSize:11,fontWeight:800,color: e.label===analysis.eightType.primary ? "#fff" : "rgba(255,255,255,0.5)"}}>
                          {e.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Bone structure */}
            {tab==="bone" && analysis.bone && (
              <div style={{marginTop:14}}>
                <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.55)",marginBottom:10}}>
                  ◆ 骨格診断
                </div>
                <div style={{padding:"14px",borderRadius:14,
                  background:BONE_TYPES.find(b=>b.label===analysis.bone.primary)?.grad||"linear-gradient(135deg,#34d399,#06b6d4)",
                  color:"#fff",textAlign:"center"}}>
                  <div style={{fontSize:11,fontWeight:700,opacity:0.85}}>あなたの骨格は</div>
                  <div style={{fontSize:22,fontWeight:900,marginTop:4}}>🦴 {analysis.bone.primary}タイプ</div>
                  <div style={{fontSize:11,marginTop:4,opacity:0.85}}>
                    {BONE_TYPES.find(b=>b.label===analysis.bone.primary)?.feature}
                  </div>
                </div>

                {/* Breakdown */}
                {analysis.bone.breakdown && (
                  <div style={{marginTop:12}}>
                    {analysis.bone.breakdown.map((item, i) => {
                      const typeData = BONE_TYPES.find(b=>b.label===item.type);
                      return (
                        <div key={i} style={{marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontSize:12,fontWeight:700,color:i===0?"#fff":"rgba(255,255,255,0.6)"}}>
                              {i===0?"🏆 ":""}{item.type}
                            </span>
                            <span style={{fontSize:11,fontWeight:800,color:"#34d399"}}>{item.percentage}%</span>
                          </div>
                          <div style={{background:"rgba(255,255,255,0.08)",borderRadius:99,height:5,overflow:"hidden"}}>
                            <div style={{width:`${item.percentage}%`,height:"100%",borderRadius:99,
                              background: typeData?.grad || "linear-gradient(90deg,#34d399,#06b6d4)",
                              transition:"width .6s ease"}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {analysis.bone.note && (
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",marginTop:12,lineHeight:1.5,
                    padding:"8px 10px",borderRadius:10,
                    background:"rgba(255,200,100,0.08)",border:"1px solid rgba(255,200,100,0.2)"}}>
                    ⚠️ {analysis.bone.note}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Personal Color */}
            {tab==="color" && analysis.personalColor && (
              <div style={{marginTop:14}}>
                <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.55)",marginBottom:10}}>
                  ◆ パーソナルカラー
                </div>
                <div style={{padding:"14px",borderRadius:14,
                  background:PC_TYPES.find(p=>p.label===analysis.personalColor.primary)?.grad||"linear-gradient(135deg,#fb923c,#f43f5e)",
                  color:"#fff",textAlign:"center"}}>
                  <div style={{fontSize:11,fontWeight:700,opacity:0.85}}>あなたのシーズンは</div>
                  <div style={{fontSize:22,fontWeight:900,marginTop:4}}>🎨 {analysis.personalColor.primary}</div>
                  {analysis.personalColor.undertone && (
                    <div style={{fontSize:11,marginTop:4,opacity:0.9}}>{analysis.personalColor.undertone}</div>
                  )}
                </div>

                {/* Recommended colors */}
                {analysis.personalColor.recommendedColors && analysis.personalColor.recommendedColors.length > 0 && (
                  <div style={{marginTop:12}}>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:8,fontWeight:700}}>
                      🎨 おすすめカラー
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {analysis.personalColor.recommendedColors.map((c,i) => (
                        <span key={i} style={{
                          padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:700,color:"#fff",
                          background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",
                        }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.personalColor.note && (
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:12,lineHeight:1.6,
                    padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.04)"}}>
                    {analysis.personalColor.note}
                  </div>
                )}

                {/* Seasons reference */}
                <div style={{marginTop:14,paddingTop:14,borderTop:"1px dashed rgba(255,255,255,0.12)"}}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:8}}>4シーズン一覧</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                    {PC_TYPES.map(p => {
                      const active = p.label===analysis.personalColor.primary;
                      return (
                        <div key={p.id} style={{
                          padding:"8px",borderRadius:10,
                          background: active ? p.grad : "rgba(255,255,255,0.04)",
                          border: active ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.06)",
                        }}>
                          <div style={{fontSize:11,fontWeight:800,color:active?"#fff":"rgba(255,255,255,0.5)"}}>
                            {p.label}
                          </div>
                          <div style={{fontSize:9,color:active?"rgba(255,255,255,0.8)":"rgba(255,255,255,0.35)",marginTop:2}}>
                            {p.tone}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div style={{marginTop:14,padding:"8px 10px",borderRadius:10,
              background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",lineHeight:1.5}}>
                ⚠️ AIの分析は参考情報です。あなたの魅力はタイプで決まりません。
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main App ────────────────────────────────────────────────
export default function HyokaApp() {
  const [mode, setMode] = useState("feed");
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [myPost, setMyPost] = useState(null);
  const [myEvals, setMyEvals] = useState([]);
  const [uploadedImg, setUploadedImg] = useState(null);
  const [snsLink, setSnsLink] = useState("");
  const [username, setUsername] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [feedFilter, setFeedFilter] = useState({ eightType:null, bone:null, color:null, popularity:null });
  const [browseFilter, setBrowseFilter] = useState({ eightType:null, bone:null, color:null, popularity:null });
  const [filterOpen, setFilterOpen] = useState(false); // which panel open: null | "feed" | "browse"
  const [aiOnlyHistory, setAiOnlyHistory] = useState([]);
  const fileRef = useRef();

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),2400); };

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setUploadedImg(ev.target.result); setAnalysisResult(null); };
    reader.readAsDataURL(file);
  };

  // ─── Detailed AI Diagnosis ──────────────────
  const diagnoseWithAI = async () => {
    if (!uploadedImg) return;
    setAiLoading(true);
    const prompt = `この写真の顔を詳しく観察し、以下のJSONフォーマットのみで返してください（前後の説明文不要）。

【観察する顔パーツ】
- eyes（目：形、大きさ、目尻の角度）
- eyebrows（眉毛：形、太さ、角度）
- nose（鼻：形、高さ、鼻筋）
- mouth（口：形、大きさ、口角）
- ears（耳：形、大きさ、位置）
- balance（顔の余白：パーツ配置バランス、空間）
- depth（顔の凹凸：立体感、陰影）

【3つの診断】
① 8タイプ分類（8種類）：キュート、フレッシュ、アクティブキュート、クールカジュアル、フェミニン、ソフトエレガント、エレガント、クール
   ※「子供寄り/大人寄り」「親しみ/かっこいい」「曲線/直線」の3軸で判定
② 骨格診断（3種類）：ストレート、ウェーブ、ナチュラル
   ※首・肩・顔の印象から推測。全身写真がないため参考情報である旨を明記
③ パーソナルカラー（4種類）：スプリング、サマー、オータム、ウィンター
   ※肌のアンダートーン、髪色、瞳の色から判定

【ルール】
- 各パーツを30文字程度で具体的に説明
- 断定せず「〜な傾向」「〜の印象」など観察ベースで
- ②は上位3タイプを合計100%で配分
- charmは20文字以内で温かく自信が持てる言葉
- 辛辣・否定的な表現は絶対禁止

【JSON形式】
{
  "parts": {"eyes":"...","eyebrows":"...","nose":"...","mouth":"...","ears":"...","balance":"...","depth":"..."},
  "charm": "〇〇〇〇",
  "eightType": {
    "primary": "〇〇",
    "axes": {"age":"子供寄り|大人寄り","impression":"親しみ|かっこいい","line":"曲線|直線"},
    "note": "なぜこのタイプかの観察コメント"
  },
  "bone": {
    "primary": "ストレート|ウェーブ|ナチュラル",
    "breakdown": [
      {"type":"〇〇","percentage":50},
      {"type":"〇〇","percentage":30},
      {"type":"〇〇","percentage":20}
    ],
    "note": "全身写真がないため参考程度です。〇〇の特徴が..."
  },
  "personalColor": {
    "primary": "スプリング|サマー|オータム|ウィンター",
    "undertone": "イエローベース|ブルーベース",
    "note": "判定理由",
    "recommendedColors": ["色1","色2","色3"]
  }
}`;
    try {
      const res = await fetch("/api/diagnose",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          image: uploadedImg.split(",")[1],
          prompt: prompt,
        })
      });
      const data = await res.json();
      if (data.result) {
        setAnalysisResult(data.result);
      } else {
        setAnalysisResult(sampleAnalysis());
      }
    } catch {
      setAnalysisResult(sampleAnalysis());
    }
    setAiLoading(false);
  };

  const submitPost = () => {
    if (!uploadedImg||!username||!analysisResult) return;
    const newPost = {
      id:Date.now(), username, sns:snsLink, image:uploadedImg,
      analysis: analysisResult,
      cats: Object.fromEntries(HUMAN_CATS.map(c=>[c.id,{count:0,power:0}])),
      isMyPost: true,
    };
    setMyPost(newPost);
    setPosts(p=>[newPost,...p]);
    setUploadedImg(null); setAnalysisResult(null); setUsername(""); setSnsLink("");
    setMode("result");
    showToast("💝 投稿しました！");
  };

  const saveAiOnly = () => {
    if (!uploadedImg || !analysisResult) return;
    setAiOnlyHistory(h => [{
      id: Date.now(), image: uploadedImg,
      analysis: analysisResult, time: new Date().toLocaleString("ja-JP"),
    }, ...h]);
    setUploadedImg(null); setAnalysisResult(null);
    showToast("💾 あなただけの記録に保存しました");
    setMode("aiHistory");
  };

  const handleEval = (postId, catId, tierId) => {
    const post = posts.find(p=>p.id===postId); if (!post) return;
    const tier = HEART_TIERS.find(t=>t.id===tierId);
    const power = randomPower(tier);
    const existing = myEvals.find(e=>e.postId===postId);
    if (existing) {
      setMyEvals(e=>e.map(ev=> ev.postId===postId
        ? {...ev, entries:[...ev.entries,{catId,tierId,power,time:new Date().toLocaleTimeString("ja-JP")}]}
        : ev ));
    } else {
      setMyEvals(e=>[...e,{postId,postUsername:post.username,
        entries:[{catId,tierId,power,time:new Date().toLocaleTimeString("ja-JP")}]}]);
    }
    const up = (cats) => { const n={...cats};
      n[catId]={count:(n[catId].count||0)+1, power:(n[catId].power||0)+power};
      return n; };
    setPosts(p=>p.map(pp=>pp.id===postId?{...pp,cats:up(pp.cats)}:pp));
    if (myPost?.id===postId) setMyPost(p=>({...p,cats:up(p.cats)}));
    showToast(`${tier.icon} +${power.toLocaleString()} パワー送信！`);
  };

  const feedPosts = posts.filter(p=>!p.isMyPost && matchFilter(p, feedFilter));
  const browsePosts = posts.filter(p=>matchFilter(p, browseFilter));
  const isMainTab = ["feed","post","aiOnly","mypage"].includes(mode);

  return (
    <div style={{minHeight:"100vh",
      background:"linear-gradient(145deg,#1a0533 0%,#2d1065 30%,#1e1b4b 60%,#0f172a 100%)",
      fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
      maxWidth:430, margin:"0 auto", position:"relative", overflowX:"hidden",
      paddingBottom: isMainTab ? 90 : 20}}>
      <Orbs/>

      {toast && (
        <div style={{position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",
          background:"linear-gradient(135deg,#f472b6,#818cf8)",color:"#fff",borderRadius:24,
          padding:"10px 28px",zIndex:9999,fontSize:14,fontWeight:700,whiteSpace:"nowrap",
          boxShadow:"0 4px 24px rgba(244,114,182,0.5)",maxWidth:"90%",textAlign:"center"}}>
          {toast}
        </div>
      )}

      <style>{`
        button:active{transform:scale(0.96)!important}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{display:none}
      `}</style>

      {/* FEED (MAIN) */}
      {mode==="feed" && (
        <div style={{position:"relative",zIndex:1,padding:"36px 24px 24px",display:"flex",flexDirection:"column",gap:18}}>
          {/* Header: title left, filter icon top-right */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
            <div style={{flex:1}}>
              <h1 style={{margin:0,fontSize:28,fontWeight:900,lineHeight:1.15,
                background:"linear-gradient(135deg,#f9a8d4,#c084fc,#818cf8)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                💘 みんなを評価
              </h1>
              <p style={{margin:"6px 0 0",fontSize:12,color:"rgba(255,255,255,0.4)"}}>
                誰かの魅力を見つけて、いいねを送ろう
              </p>
            </div>
            <FilterIconButton count={activeFilterCount(feedFilter)} onClick={()=>setFilterOpen("feed")}/>
          </div>

          {/* Active filters as dismissible chips */}
          {activeFilterCount(feedFilter)>0 && (
            <ActiveFilterRow filter={feedFilter}
              onClear={(key)=>setFeedFilter(f=>({...f, [key]:null}))}/>
          )}

          {feedPosts.length===0 && (
            <div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",marginTop:60,fontSize:15}}>
              {activeFilterCount(feedFilter)===0?"投稿がまだありません":"この条件に合う投稿はありません"}
            </div>
          )}

          {feedPosts.map(post=>(
            <EvalCard key={post.id} post={post}
              myEval={myEvals.find(e=>e.postId===post.id)}
              onEval={(catId,tierId)=>handleEval(post.id,catId,tierId)}/>
          ))}
        </div>
      )}

      {/* POST */}
      {mode==="post" && (
        <div style={{position:"relative",zIndex:1,padding:"36px 24px 24px",display:"flex",flexDirection:"column",gap:18}}>
          <div>
            <h1 style={{margin:0,fontSize:28,fontWeight:900,
              background:"linear-gradient(135deg,#f9a8d4,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              📸 写真を投稿
            </h1>
            <p style={{margin:"6px 0 0",fontSize:12,color:"rgba(255,255,255,0.4)"}}>
              AI詳細診断を経て、みんなから評価してもらおう
            </p>
          </div>

          <div onClick={()=>fileRef.current.click()} style={{
            width:"100%",aspectRatio:"1",borderRadius:28,
            border:"2px solid rgba(244,114,182,0.35)",
            background:uploadedImg?"transparent":"rgba(255,255,255,0.04)",
            backdropFilter:"blur(12px)",
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",overflow:"hidden"}}>
            {uploadedImg
              ? <img src={uploadedImg} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : <div style={{textAlign:"center",color:"rgba(244,114,182,0.6)"}}>
                  <div style={{fontSize:48}}>📷</div>
                  <div style={{fontSize:13,marginTop:10}}>タップして写真を選ぶ</div>
                </div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:"none"}}/>

          {uploadedImg && !analysisResult && (
            <GradBtn
              grad={aiLoading?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#f97316,#f43f5e,#e879f9)"}
              onClick={diagnoseWithAI} disabled={aiLoading}>
              {aiLoading?"✨ パーツを細かく見ています...":"🤖 AI詳細診断（必須）"}
            </GradBtn>
          )}

          {analysisResult && <AIAnalysisCard analysis={analysisResult}/>}

          {analysisResult && (
            <>
              <GlassInput placeholder="ニックネーム *" value={username} onChange={e=>setUsername(e.target.value)}/>
              <GlassInput placeholder="SNSリンク（任意）" value={snsLink} onChange={e=>setSnsLink(e.target.value)}/>
              <GradBtn
                grad={!username?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#f43f5e,#f472b6,#c084fc)"}
                onClick={submitPost} disabled={!username}>
                💝 みんなに公開して投稿
              </GradBtn>
            </>
          )}
        </div>
      )}

      {/* AI ONLY */}
      {mode==="aiOnly" && (
        <div style={{position:"relative",zIndex:1,padding:"36px 24px 24px",display:"flex",flexDirection:"column",gap:18}}>
          <div>
            <h1 style={{margin:0,fontSize:28,fontWeight:900,
              background:"linear-gradient(135deg,#8b5cf6,#ec4899,#f97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              🤖 AI診断だけ
            </h1>
            <p style={{margin:"6px 0 0",fontSize:12,color:"rgba(255,255,255,0.4)",lineHeight:1.7}}>
              他の人には公開せず、AIだけに診断してもらえます
            </p>
          </div>

          <div style={{padding:"10px 14px",borderRadius:14,display:"flex",alignItems:"center",gap:8,
            background:"linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.1))",
            border:"1px solid rgba(139,92,246,0.3)"}}>
            <span style={{fontSize:18}}>🔒</span>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.7)",fontWeight:600}}>
              プライベートモード：あなた以外には見えません
            </span>
          </div>

          <div onClick={()=>fileRef.current.click()} style={{
            width:"100%",aspectRatio:"1",borderRadius:28,
            border:"2px solid rgba(139,92,246,0.4)",
            background:uploadedImg?"transparent":"rgba(255,255,255,0.04)",
            backdropFilter:"blur(12px)",
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",overflow:"hidden"}}>
            {uploadedImg
              ? <img src={uploadedImg} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : <div style={{textAlign:"center",color:"rgba(139,92,246,0.7)"}}>
                  <div style={{fontSize:48}}>📷</div>
                  <div style={{fontSize:13,marginTop:10}}>タップして写真を選ぶ</div>
                </div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:"none"}}/>

          {uploadedImg && !analysisResult && (
            <GradBtn
              grad={aiLoading?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#8b5cf6,#ec4899,#f97316)"}
              onClick={diagnoseWithAI} disabled={aiLoading}>
              {aiLoading?"✨ パーツを細かく見ています...":"🤖 AI詳細診断スタート"}
            </GradBtn>
          )}

          {analysisResult && (
            <>
              <AIAnalysisCard analysis={analysisResult}/>
              <div style={{padding:"14px",borderRadius:16,
                background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:12,textAlign:"center",fontWeight:600}}>
                  結果をどうしますか？
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <GradBtn grad="linear-gradient(135deg,#8b5cf6,#ec4899)" onClick={saveAiOnly}>
                    💾 自分だけの記録として保存
                  </GradBtn>
                  <GradBtn grad="linear-gradient(135deg,#f43f5e,#f472b6,#c084fc)" onClick={()=>setMode("post")}>
                    📸 みんなにも公開する（投稿へ）
                  </GradBtn>
                  <button onClick={()=>{setUploadedImg(null); setAnalysisResult(null);}} style={{
                    background:"none",border:"none",color:"rgba(255,255,255,0.4)",
                    fontSize:13,fontWeight:600,cursor:"pointer",padding:"8px"}}>
                    🗑 この結果を捨ててやり直す
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* MY PAGE */}
      {mode==="mypage" && (
        <div style={{position:"relative",zIndex:1,padding:"36px 24px 24px",display:"flex",flexDirection:"column",gap:20}}>
          <div>
            <h1 style={{margin:0,fontSize:28,fontWeight:900,
              background:"linear-gradient(135deg,#06b6d4,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              👤 マイページ
            </h1>
            <p style={{margin:"6px 0 0",fontSize:12,color:"rgba(255,255,255,0.4)"}}>
              あなたの記録と評価
            </p>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <GradBtn grad="linear-gradient(135deg,#06b6d4,#34d399)" onClick={()=>setMode("result")}
              disabled={!myPost}>
              📊 自分の投稿へのいいね{myPost?"":"（未投稿）"}
            </GradBtn>
            <GradBtn grad="linear-gradient(135deg,#8b5cf6,#ec4899)" onClick={()=>setMode("aiHistory")}>
              🗂 AI診断の履歴 {aiOnlyHistory.length>0 && `(${aiOnlyHistory.length})`}
            </GradBtn>
            <GradBtn grad="linear-gradient(135deg,#6366f1,#818cf8)" onClick={()=>setMode("myeval")}>
              📝 自分のいいね履歴 {myEvals.length>0 && `(${myEvals.length})`}
            </GradBtn>
            <GradBtn grad="linear-gradient(135deg,#475569,#64748b)" onClick={()=>setMode("browse")}>
              🔍 タイプで投稿を探す
            </GradBtn>
          </div>
        </div>
      )}

      {/* BROWSE */}
      {mode==="browse" && (
        <div style={{position:"relative",zIndex:1,padding:"36px 24px 60px",display:"flex",flexDirection:"column",gap:18}}>
          <BackBtn onClick={()=>setMode("mypage")}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
            <div style={{flex:1}}>
              <h2 style={{margin:0,fontSize:24,fontWeight:900,
                background:"linear-gradient(135deg,#94a3b8,#cbd5e1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                🔍 投稿を探す
              </h2>
              <p style={{margin:"4px 0 0",fontSize:11,color:"rgba(255,255,255,0.35)"}}>
                似たタイプの人を見つけよう
              </p>
            </div>
            <FilterIconButton count={activeFilterCount(browseFilter)} onClick={()=>setFilterOpen("browse")}/>
          </div>
          {activeFilterCount(browseFilter)>0 && (
            <ActiveFilterRow filter={browseFilter}
              onClear={(key)=>setBrowseFilter(f=>({...f, [key]:null}))}/>
          )}
          {browsePosts.length===0 && (
            <div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",marginTop:60,fontSize:15}}>
              {activeFilterCount(browseFilter)===0?"投稿がありません":"この条件に合う投稿はありません"}
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {browsePosts.map(post=>{
              const tp = totalPower(post.cats); const tc = totalCount(post.cats);
              return (
                <Glass key={post.id} style={{overflow:"hidden"}}>
                  <div style={{position:"relative"}}>
                    <img src={post.image} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}/>
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(15,23,42,0.7) 0%,transparent 50%)"}}/>
                    {post.analysis?.eightType?.primary && (
                      <div style={{position:"absolute",bottom:12,left:12,
                        background:EIGHT_TYPES.find(e=>e.label===post.analysis.eightType.primary)?.grad||"linear-gradient(135deg,#f9a8d4,#c084fc)",
                        borderRadius:20,padding:"4px 14px",
                        fontSize:12,fontWeight:800,color:"#fff"}}>💫 {post.analysis.eightType.primary}</div>
                    )}
                    <div style={{position:"absolute",top:12,right:12,
                      background:"linear-gradient(135deg,#f43f5e,#e879f9)",borderRadius:20,padding:"4px 14px",
                      fontSize:12,fontWeight:800,color:"#fff"}}>❤️ {tp.toLocaleString()}</div>
                  </div>
                  <div style={{padding:"14px 18px"}}>
                    <div style={{fontWeight:800,fontSize:15,color:"#fff"}}>@{post.username}</div>
                    {post.analysis?.charm && <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4,fontStyle:"italic"}}>💭 {post.analysis.charm}</div>}
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginTop:6}}>👥 {tc}人が評価</div>
                  </div>
                </Glass>
              );
            })}
          </div>
        </div>
      )}

      {/* MY RESULT */}
      {mode==="result" && myPost && (
        <div style={{position:"relative",zIndex:1,padding:"36px 24px 60px",display:"flex",flexDirection:"column",gap:20}}>
          <BackBtn onClick={()=>setMode("mypage")}/>
          <h2 style={{margin:0,fontSize:24,fontWeight:900,
            background:"linear-gradient(135deg,#34d399,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            📊 あなたへのいいね
          </h2>

          <Glass style={{overflow:"hidden"}}>
            <div style={{position:"relative"}}>
              <img src={myPost.image} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(15,23,42,0.7) 0%,transparent 50%)"}}/>
              {myPost.analysis?.eightType?.primary && (
                <div style={{position:"absolute",bottom:14,left:14,
                  background:EIGHT_TYPES.find(e=>e.label===myPost.analysis.eightType.primary)?.grad||"linear-gradient(135deg,#f9a8d4,#c084fc)",
                  borderRadius:20,padding:"5px 14px",
                  fontSize:13,fontWeight:800,color:"#fff"}}>💫 {myPost.analysis.eightType.primary}</div>
              )}
            </div>
            <div style={{padding:"18px 20px"}}>
              <div style={{fontWeight:800,fontSize:17,color:"#fff",marginBottom:14}}>@{myPost.username}</div>

              {myPost.analysis && <AIAnalysisCard analysis={myPost.analysis} defaultOpen={false}/>}

              <div style={{marginTop:14,borderRadius:16,overflow:"hidden",
                border:"1px solid rgba(244,114,182,0.3)"}}>
                <div style={{padding:"8px 14px",
                  background:"linear-gradient(135deg,rgba(244,114,182,0.2),rgba(192,132,252,0.15))"}}>
                  <span style={{fontSize:12,fontWeight:800,
                    background:"linear-gradient(135deg,#f9a8d4,#f472b6)",
                    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                    👥 みんなの評価
                  </span>
                </div>
                <div style={{padding:"14px"}}>
                  {totalCount(myPost.cats)===0 ? (
                    <div style={{color:"rgba(255,255,255,0.35)",fontSize:13,textAlign:"center",padding:"10px"}}>
                      まだ評価がありません。投稿はちゃんと届いていますよ！
                    </div>
                  ) : (
                    <>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                        <div>
                          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>合計パワー</div>
                          <div style={{fontSize:28,fontWeight:900,
                            background:"linear-gradient(135deg,#f9a8d4,#c084fc)",
                            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                            {totalPower(myPost.cats).toLocaleString()}
                          </div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>評価人数</div>
                          <div style={{fontSize:22,fontWeight:900,color:"#fff"}}>{totalCount(myPost.cats)}人</div>
                        </div>
                      </div>
                      {HUMAN_CATS.map(cat=>{
                        const d = myPost.cats[cat.id]||{count:0,power:0};
                        const maxP = Math.max(...HUMAN_CATS.map(c=>myPost.cats[c.id]?.power||0),1);
                        const pct = Math.round((d.power/maxP)*100);
                        return (
                          <div key={cat.id} style={{marginBottom:10}}>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,marginBottom:4,color:"rgba(255,255,255,0.65)"}}>
                              <span>{cat.emoji} {cat.label}</span>
                              <span style={{color:"#fff",fontWeight:800}}>
                                {d.count}人 / {d.power.toLocaleString()}P
                              </span>
                            </div>
                            <div style={{background:"rgba(255,255,255,0.08)",borderRadius:99,height:8,overflow:"hidden"}}>
                              <div style={{width:`${pct}%`,height:"100%",background:cat.grad,borderRadius:99,transition:"width .6s ease"}}/>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Glass>
        </div>
      )}

      {/* MY EVAL */}
      {mode==="myeval" && (
        <div style={{position:"relative",zIndex:1,padding:"36px 24px 60px",display:"flex",flexDirection:"column",gap:14}}>
          <BackBtn onClick={()=>setMode("mypage")}/>
          <h2 style={{margin:0,fontSize:24,fontWeight:900,
            background:"linear-gradient(135deg,#94a3b8,#cbd5e1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            📝 自分のいいね履歴
          </h2>
          <p style={{margin:0,fontSize:12,color:"rgba(255,255,255,0.28)"}}>※ あなた自身のいいね履歴のみ表示されます</p>
          {myEvals.length===0 && (
            <div style={{color:"rgba(255,255,255,0.2)",textAlign:"center",marginTop:60,fontSize:15}}>まだ評価していません</div>
          )}
          {myEvals.map((ev,i)=>(
            <Glass key={i} style={{padding:"16px 18px"}}>
              <div style={{fontWeight:700,color:"#fff",fontSize:15}}>@{ev.postUsername}</div>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:10}}>
                {ev.entries.map((entry,j)=>{
                  const cat = HUMAN_CATS.find(c=>c.id===entry.catId);
                  const tier = HEART_TIERS.find(t=>t.id===entry.tierId);
                  return cat&&tier ? (
                    <div key={j} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                      <span style={{borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700,color:"#fff",
                        background:cat.grad,boxShadow:"0 2px 8px rgba(0,0,0,0.25)"}}>
                        {cat.emoji} {cat.label}
                      </span>
                      <span style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,color:"#fff",
                          background:tier.grad}}>
                          {tier.icon} {tier.label}
                        </span>
                        <span style={{fontSize:11,fontWeight:800,color:"#f9a8d4",whiteSpace:"nowrap"}}>
                          +{entry.power.toLocaleString()}P
                        </span>
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.22)",marginTop:8}}>
                {ev.entries[ev.entries.length-1]?.time}
              </div>
            </Glass>
          ))}
        </div>
      )}

      {/* AI HISTORY */}
      {mode==="aiHistory" && (
        <div style={{position:"relative",zIndex:1,padding:"36px 24px 60px",display:"flex",flexDirection:"column",gap:16}}>
          <BackBtn onClick={()=>setMode("mypage")}/>
          <div>
            <h2 style={{margin:0,fontSize:24,fontWeight:900,
              background:"linear-gradient(135deg,#8b5cf6,#ec4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              🗂 AI診断の履歴
            </h2>
            <p style={{margin:"8px 0 0",fontSize:12,color:"rgba(255,255,255,0.35)"}}>🔒 自分だけの記録（非公開）</p>
          </div>
          {aiOnlyHistory.length===0 && (
            <div style={{color:"rgba(255,255,255,0.2)",textAlign:"center",marginTop:60,fontSize:15}}>まだ診断していません</div>
          )}
          {aiOnlyHistory.map(item => (
            <Glass key={item.id} style={{overflow:"hidden",padding:14}}>
              <div style={{display:"flex",gap:12,marginBottom:12}}>
                <img src={item.image} style={{width:70,height:70,borderRadius:14,objectFit:"cover",flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{item.time}</div>
                  <div style={{fontSize:18,fontWeight:900,marginTop:3,
                    background:"linear-gradient(135deg,#f9a8d4,#c084fc)",
                    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                    💫 {item.analysis?.eightType?.primary}
                  </div>
                  {item.analysis?.charm && <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",marginTop:3,lineHeight:1.5,fontStyle:"italic"}}>💭 {item.analysis.charm}</div>}
                </div>
              </div>
              <AIAnalysisCard analysis={item.analysis} defaultOpen={false}/>
            </Glass>
          ))}
          {aiOnlyHistory.length>0 && (
            <button onClick={()=>{
              if (window.confirm("すべての履歴を削除しますか？")) setAiOnlyHistory([]);
            }} style={{
              background:"none",border:"1px solid rgba(255,255,255,0.15)",
              color:"rgba(255,255,255,0.4)",fontSize:12,fontWeight:600,
              padding:"10px",borderRadius:12,cursor:"pointer",marginTop:8}}>
              🗑 履歴をすべて削除
            </button>
          )}
        </div>
      )}

      {isMainTab && (
        <BottomNav current={mode} onChange={(t)=>{
          if (t !== mode) { setUploadedImg(null); setAnalysisResult(null); }
          setMode(t);
        }}/>
      )}

      {/* Filter Panel */}
      {filterOpen==="feed" && (
        <FilterPanel filter={feedFilter} onChange={setFeedFilter} onClose={()=>setFilterOpen(false)}/>
      )}
      {filterOpen==="browse" && (
        <FilterPanel filter={browseFilter} onChange={setBrowseFilter} onClose={()=>setFilterOpen(false)}/>
      )}
    </div>
  );
}

// ─── EvalCard ────────────────────────────────────────────────
function EvalCard({ post, myEval, onEval }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const tp = totalPower(post.cats);
  const tc = totalCount(post.cats);
  const canSend = selectedCat && selectedTier;
  const send = () => {
    if (!canSend) return;
    onEval(selectedCat, selectedTier);
    setSelectedCat(null); setSelectedTier(null);
  };

  return (
    <Glass style={{overflow:"hidden"}}>
      <div style={{position:"relative"}}>
        <img src={post.image} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(15,23,42,0.65) 0%,transparent 50%)"}}/>
        {post.analysis?.eightType?.primary && (
          <div style={{position:"absolute",bottom:12,left:12,
            background:"rgba(255,255,255,0.15)",backdropFilter:"blur(10px)",
            borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:700,color:"#fff",
            border:"1px solid rgba(255,255,255,0.25)"}}>
            💫 {post.analysis.eightType.primary}
          </div>
        )}
        <div style={{position:"absolute",top:12,right:12,
          background:"linear-gradient(135deg,#f43f5e,#e879f9)",borderRadius:20,padding:"4px 14px",
          fontSize:12,fontWeight:700,color:"#fff",boxShadow:"0 2px 10px rgba(244,63,94,0.45)"}}>
          ❤️ {tp.toLocaleString()}P
        </div>
      </div>

      <div style={{padding:"16px 18px"}}>
        <div style={{fontWeight:800,fontSize:15,color:"#fff"}}>@{post.username}</div>
        {post.sns && <div style={{fontSize:11,color:"rgba(255,255,255,0.28)",marginTop:2}}>🔗 {post.sns}</div>}
        {tc>0 && <div style={{fontSize:11,color:"rgba(255,255,255,0.28)",marginTop:2}}>👥 {tc}人が評価済み</div>}

        {/* Compact AI summary + 詳細 toggle */}
        {post.analysis && (
          <div style={{marginTop:12}}>
            {showDetail ? (
              <AIAnalysisCard analysis={post.analysis} defaultOpen={true}/>
            ) : (
              <div style={{borderRadius:14,padding:"12px 14px",
                background:"linear-gradient(145deg,rgba(139,92,246,0.12),rgba(236,72,153,0.08))",
                border:"1px solid rgba(139,92,246,0.25)"}}>
                <div style={{fontSize:11,fontWeight:800,
                  background:"linear-gradient(135deg,#c084fc,#ec4899)",
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>
                  🤖 AI診断
                </div>
                {post.analysis.charm && (
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",fontStyle:"italic",marginBottom:10,lineHeight:1.5}}>
                    💭 {post.analysis.charm}
                  </div>
                )}
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                  {post.analysis.eightType?.primary && (
                    <span style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:800,color:"#fff",
                      background:EIGHT_TYPES.find(e=>e.label===post.analysis.eightType.primary)?.grad}}>
                      💫 {post.analysis.eightType.primary}
                    </span>
                  )}
                  {post.analysis.bone?.primary && (
                    <span style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:800,color:"#fff",
                      background:BONE_TYPES.find(b=>b.label===post.analysis.bone.primary)?.grad}}>
                      🦴 {post.analysis.bone.primary}
                    </span>
                  )}
                  {post.analysis.personalColor?.primary && (
                    <span style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:800,color:"#fff",
                      background:PC_TYPES.find(p=>p.label===post.analysis.personalColor.primary)?.grad}}>
                      🎨 {post.analysis.personalColor.primary}
                    </span>
                  )}
                </div>
                <button onClick={()=>setShowDetail(true)} style={{
                  width:"100%",padding:"7px 12px",borderRadius:10,border:"none",cursor:"pointer",
                  background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.8)",
                  fontSize:11,fontWeight:800,
                }}>📖 詳細を見る</button>
              </div>
            )}
            {showDetail && (
              <button onClick={()=>setShowDetail(false)} style={{
                width:"100%",marginTop:8,padding:"7px 12px",borderRadius:10,border:"none",cursor:"pointer",
                background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.6)",
                fontSize:11,fontWeight:700,
              }}>▲ 詳細を閉じる</button>
            )}
          </div>
        )}

        <div style={{marginTop:14,padding:"12px",borderRadius:16,
          background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{fontSize:11,fontWeight:800,
            background:"linear-gradient(135deg,#f9a8d4,#f472b6)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:10}}>
            👥 あなたの評価
          </div>

          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:7}}>① カテゴリを選ぶ</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14}}>
            {HUMAN_CATS.map(cat=>{
              const active = selectedCat===cat.id;
              return (
                <button key={cat.id} onClick={()=>setSelectedCat(active?null:cat.id)} style={{
                  padding:"9px 8px",borderRadius:12,border:"none",
                  background:active?cat.grad:"rgba(255,255,255,0.07)",
                  cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                  fontSize:12,fontWeight:active?800:500,
                  color:active?"#fff":"rgba(255,255,255,0.45)",
                  boxShadow:active?"0 3px 12px rgba(0,0,0,0.3)":"none",
                  transition:"all .15s",
                  outline:active?"1.5px solid rgba(255,255,255,0.25)":"none"}}>
                  <span style={{fontSize:16}}>{cat.emoji}</span>
                  <span style={{lineHeight:1.3,textAlign:"left"}}>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:7}}>② ハートの重さを選ぶ</div>
          <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
            {HEART_TIERS.map(tier=>{
              const active = selectedTier===tier.id;
              return (
                <button key={tier.id} onClick={()=>setSelectedTier(active?null:tier.id)} style={{
                  padding:"10px 14px",borderRadius:12,border:"none",
                  background:active?tier.grad:"rgba(255,255,255,0.07)",
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",
                  color:active?"#fff":"rgba(255,255,255,0.45)",
                  boxShadow:active?"0 3px 14px rgba(0,0,0,0.3)":"none",
                  transition:"all .15s",
                  outline:active?"1.5px solid rgba(255,255,255,0.2)":"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>{tier.icon}</span>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:13,fontWeight:active?800:600}}>{tier.label}</div>
                      <div style={{fontSize:11,opacity:.7}}>{tier.desc}</div>
                    </div>
                  </div>
                  {active && <span style={{fontSize:12,fontWeight:800}}>✓</span>}
                </button>
              );
            })}
          </div>

          <GradBtn
            grad={canSend?"linear-gradient(135deg,#f43f5e,#f472b6,#c084fc)":"rgba(255,255,255,0.06)"}
            onClick={send} disabled={!canSend}>
            {canSend?"💝 いいねを送る":"① ② を選んでね"}
          </GradBtn>
        </div>
      </div>
    </Glass>
  );
}

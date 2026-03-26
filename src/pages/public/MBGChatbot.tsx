import { useState, useRef, useEffect } from "react";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const genTK = () =>
  `TK-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${String(
    Math.floor(Math.random()*999)).padStart(3,"0")}`;
const nowStr = () => {
  const d = new Date();
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};

// ── Data ──────────────────────────────────────────────────────────────────────
const SEKOLAH_LIST = [
  "SDN Merdeka 01","SDN Harapan Bangsa","SDIT Al-Hikmah",
  "SD Muhammadiyah 5","SDN Pancasila 02","SD Kartini",
  "SMPN 3 Cibubur","SMAN 1 Depok","SDN Cijantung 04",
  "MI Nurul Iman","MTs Darul Falah",
];
const SPPG_LIST = [
  "SPPG Maju Bersama","SPPG Nusantara Sejahtera","SPPG Berkah Mandiri",
  "SPPG Tunas Bangsa","SPPG Harapan Ibu","SPPG Cita Rasa",
  "Dapur MBG Cipinang","Dapur MBG Cibubur","Dapur MBG Depok Timur",
];
const MASALAH_LIST = [
  { label:"Makanan basi / tidak layak",  val:"Makanan basi" },
  { label:"Porsi terlalu sedikit",       val:"Porsi kurang" },
  { label:"Keracunan makanan",           val:"Keracunan makanan" },
  { label:"Benda asing dalam makanan",   val:"Benda asing" },
  { label:"Makanan tidak dikirim",       val:"Makanan tidak dikirim" },
  { label:"Kualitas gizi buruk",         val:"Kualitas gizi buruk" },
  { label:"Masalah SPPG / vendor",       val:"Masalah SPPG" },
  { label:"Lainnya",                     val:"Lainnya" },
];
const TICKETS = {
  "TK-20260321-042":{ status:"Sedang diproses",    sekolah:"SDN Merdeka 01",      sppg:"SPPG Maju Bersama",       masalah:"Makanan basi",  catatan:"Tim inspeksi dijadwalkan besok pukul 09.00.", waktu:"21/3/2026 08:14" },
  "TK-20260318-007":{ status:"Selesai ditangani",  sekolah:"SDN Harapan Bangsa",  sppg:"SPPG Nusantara Sejahtera",masalah:"Porsi kurang",  catatan:"Vendor sudah diperingatkan, porsi diperbaiki.", waktu:"18/3/2026 11:32" },
  "TK-20260315-088":{ status:"Menunggu verifikasi",sekolah:"SDIT Al-Hikmah",      sppg:"SPPG Berkah Mandiri",     masalah:"Benda asing",   catatan:"Laporan diterima, sedang diverifikasi petugas.", waktu:"15/3/2026 09:55" },
};
const STATUS_META = {
  "Sedang diproses":     { color:"#d97706", bg:"rgba(217,119,6,0.08)"   },
  "Selesai ditangani":   { color:"#059669", bg:"rgba(5,150,105,0.08)"   },
  "Menunggu verifikasi": { color:"#4f46e5", bg:"rgba(79,70,229,0.08)"   },
};

// ── Atom components ───────────────────────────────────────────────────────────
const Avatar = () => (
  <div style={{
    width:28,height:28,borderRadius:"50%",flexShrink:0,
    background:"linear-gradient(135deg,#16a34a,#065f46)",
    display:"flex",alignItems:"center",justifyContent:"center",
    fontSize:12,boxShadow:"0 2px 8px rgba(22,163,74,.35)",
    color:"#fff",fontWeight:700,letterSpacing:-.3,
  }}>M</div>
);

const TypingDots = () => (
  <div style={{display:"flex",gap:5,padding:"3px 0"}}>
    {[0,1,2].map(i=>(
      <div key={i} style={{
        width:6,height:6,borderRadius:"50%",background:"#16a34a",opacity:.6,
        animation:"mbgB 1.2s infinite",animationDelay:`${i*.2}s`,
      }}/>
    ))}
  </div>
);

const BotBubble = ({children,sm}) => (
  <div style={{display:"flex",gap:8,alignItems:"flex-end",maxWidth:"88%"}}>
    <Avatar/>
    <div style={{
      background:"#fff",color:"#111827",
      borderRadius:"3px 14px 14px 14px",
      padding:sm?"8px 13px":"11px 14px",
      fontSize:13.5,lineHeight:1.7,
      border:"1px solid #e5e7eb",
      boxShadow:"0 1px 6px rgba(0,0,0,.06)",
    }}>{children}</div>
  </div>
);

const UserBubble = ({text}) => (
  <div style={{display:"flex",justifyContent:"flex-end"}}>
    <div style={{
      background:"linear-gradient(135deg,#16a34a,#0d7a38)",
      color:"#fff",borderRadius:"14px 3px 14px 14px",
      padding:"11px 14px",maxWidth:"80%",
      fontSize:13.5,lineHeight:1.65,
      boxShadow:"0 3px 12px rgba(22,163,74,.3)",
    }}>{text}</div>
  </div>
);

const Txt = ({t}) => {
  if(!t) return null;
  return (
    <>
      {t.split("\n").map((line,i,arr)=>(
        <span key={i}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((p,j)=>
            p.startsWith("**")&&p.endsWith("**")
              ?<strong key={j}>{p.slice(2,-2)}</strong>
              :<span key={j}>{p}</span>
          )}
          {i<arr.length-1&&<br/>}
        </span>
      ))}
    </>
  );
};

// Pill button (quick reply)
const Pill = ({label,onClick,variant}) => {
  const [h,setH]=useState(false);
  const styles = variant==="primary"
    ? { bg:h?"#0d7a38":"#16a34a", border:"#16a34a", txt:"#fff" }
    : { bg:h?"#f0fdf4":"#fff", border:h?"#16a34a":"#d1d5db", txt:"#374151" };
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background:styles.bg,border:`1px solid ${styles.border}`,
        color:styles.txt,borderRadius:6,padding:"6px 12px",
        fontSize:12.5,fontWeight:500,cursor:"pointer",
        fontFamily:"inherit",transition:"all .12s",
        boxShadow:"0 1px 3px rgba(0,0,0,.06)",
      }}>{label}</button>
  );
};

const PillRow = ({items,onSelect}) => (
  <div style={{display:"flex",flexWrap:"wrap",gap:6,paddingLeft:36,paddingTop:2}}>
    {items.map(item=>(
      <Pill key={item.val||item} label={item.label||item}
        variant={item.variant||null}
        onClick={()=>onSelect(item.val||item)}/>
    ))}
  </div>
);

// ── Masalah picker ────────────────────────────────────────────────────────────
const MasalahBtn = ({item,onSelect}) => {
  const [h,setH]=useState(false);
  return (
    <button onClick={()=>onSelect(item.val)}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background:h?"#f0fdf4":"#fff",
        color:"#111827",
        border:`1px solid ${h?"#16a34a":"#e5e7eb"}`,
        borderRadius:8,padding:"9px 11px",
        fontSize:12.5,fontWeight:500,cursor:"pointer",
        fontFamily:"inherit",transition:"all .12s",
        textAlign:"left",lineHeight:1.4,
      }}>{item.label}</button>
  );
};

const MasalahPicker = ({onSelect}) => (
  <div style={{display:"flex",gap:8,alignItems:"flex-start",maxWidth:"96%"}}>
    <Avatar/>
    <div style={{
      background:"#fff",borderRadius:"3px 14px 14px 14px",
      border:"1px solid #e5e7eb",padding:"13px 14px",
      boxShadow:"0 1px 6px rgba(0,0,0,.06)",flex:1,
    }}>
      <div style={{fontSize:10,fontWeight:700,color:"#6b7280",letterSpacing:.8,marginBottom:10,textTransform:"uppercase"}}>Pilih jenis masalah</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {MASALAH_LIST.map(m=>(
          <MasalahBtn key={m.val} item={m} onSelect={onSelect}/>
        ))}
      </div>
    </div>
  </div>
);

// ── Lokasi picker ─────────────────────────────────────────────────────────────
const LokasiItem = ({label,onClick}) => {
  const [h,setH]=useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background:h?"#f0fdf4":"transparent",
        border:`1px solid ${h?"#d1fae5":"transparent"}`,
        borderRadius:7,padding:"7px 10px",
        fontSize:12.5,color:"#111827",fontWeight:h?500:400,
        cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all .1s",
        width:"100%",
      }}>{label}</button>
  );
};

const LokasiPicker = ({type,onSelect,onManual}) => {
  const [q,setQ]=useState("");
  const list = type==="sekolah" ? SEKOLAH_LIST : SPPG_LIST;
  const filtered = q ? list.filter(s=>s.toLowerCase().includes(q.toLowerCase())) : list;
  return (
    <div style={{display:"flex",gap:8,alignItems:"flex-start",maxWidth:"96%"}}>
      <Avatar/>
      <div style={{
        background:"#fff",borderRadius:"3px 14px 14px 14px",
        border:"1px solid #e5e7eb",padding:"13px 14px",
        boxShadow:"0 1px 6px rgba(0,0,0,.06)",flex:1,
      }}>
        <div style={{fontSize:10,fontWeight:700,color:"#6b7280",letterSpacing:.8,marginBottom:9,textTransform:"uppercase"}}>
          {type==="sekolah"?"Pilih sekolah":"Pilih SPPG / Dapur MBG"}
        </div>
        <input autoFocus value={q} onChange={e=>setQ(e.target.value)}
          placeholder={type==="sekolah"?"Cari nama sekolah...":"Cari nama SPPG..."}
          style={{
            width:"100%",border:"1px solid #d1d5db",borderRadius:7,
            padding:"7px 10px",fontSize:12.5,fontFamily:"inherit",
            color:"#111827",background:"#f9fafb",marginBottom:7,outline:"none",
          }}
          onFocus={e=>{e.currentTarget.style.borderColor="#16a34a";e.currentTarget.style.background="#fff";}}
          onBlur={e=>{e.currentTarget.style.borderColor="#d1d5db";e.currentTarget.style.background="#f9fafb";}}
        />
        <div style={{maxHeight:144,overflowY:"auto",display:"flex",flexDirection:"column"}}>
          {filtered.slice(0,8).map(s=>(
            <LokasiItem key={s} label={s} onClick={()=>onSelect(s)}/>
          ))}
          {filtered.length===0&&(
            <div style={{fontSize:12,color:"#9ca3af",padding:"6px 4px"}}>Tidak ditemukan</div>
          )}
        </div>
        <button onClick={()=>onManual(q||"")} style={{
          marginTop:9,width:"100%",background:"transparent",
          border:"1px dashed #d1d5db",borderRadius:7,
          padding:"7px 0",fontSize:12,color:"#6b7280",fontWeight:500,
          cursor:"pointer",fontFamily:"inherit",
        }}>
          + Ketik nama {type==="sekolah"?"sekolah":"SPPG"} sendiri
        </button>
      </div>
    </div>
  );
};

// ── Confirm card ──────────────────────────────────────────────────────────────
const ConfirmCard = ({data,onKirim,onEdit}) => (
  <div style={{display:"flex",gap:8,alignItems:"flex-start",maxWidth:"96%"}}>
    <Avatar/>
    <div style={{
      background:"#fff",borderRadius:"3px 14px 14px 14px",
      border:"1px solid #e5e7eb",padding:"14px 15px",
      boxShadow:"0 1px 6px rgba(0,0,0,.06)",flex:1,
    }}>
      <div style={{fontSize:10,fontWeight:700,color:"#6b7280",letterSpacing:.8,marginBottom:12,textTransform:"uppercase"}}>Ringkasan laporan</div>
      {[
        ["Jenis masalah",  data.masalah],
        [data.lokasiType==="sekolah"?"Sekolah":"SPPG / Dapur", data.lokasi],
        ["Waktu kejadian", data.waktu||"Hari ini"],
        ["Kronologi",      data.kronologi],
      ].map(([label,val])=>val&&(
        <div key={label} style={{marginBottom:9}}>
          <div style={{fontSize:10.5,fontWeight:600,color:"#9ca3af",marginBottom:2}}>{label}</div>
          <div style={{
            fontSize:13,color:"#111827",lineHeight:1.55,
            ...(label==="Kronologi"?{
              background:"#f9fafb",borderRadius:7,padding:"7px 10px",
              border:"1px solid #f3f4f6",
            }:{})
          }}>{val}</div>
        </div>
      ))}
      <div style={{display:"flex",gap:7,marginTop:13}}>
        <button onClick={onKirim} style={{
          flex:1,background:"#16a34a",color:"#fff",
          border:"none",borderRadius:8,padding:"9px 0",fontSize:13,fontWeight:600,
          cursor:"pointer",fontFamily:"inherit",
          boxShadow:"0 2px 8px rgba(22,163,74,.3)",
        }}>Kirim laporan</button>
        <button onClick={onEdit} style={{
          flex:1,background:"#f9fafb",color:"#374151",
          border:"1px solid #e5e7eb",borderRadius:8,padding:"9px 0",
          fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",
        }}>Edit</button>
      </div>
    </div>
  </div>
);

// ── Sending card ──────────────────────────────────────────────────────────────
const SendingCard = () => {
  const [s,setS]=useState(0);
  const steps=["Mengenkripsi data laporan...","Mengirim ke server MBG Pusat...","Meneruskan ke Dinas terkait...","Membuat nomor tiket..."];
  useEffect(()=>{
    const t=setInterval(()=>setS(p=>p<steps.length-1?p+1:p),650);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div style={{display:"flex",gap:8,alignItems:"flex-end",maxWidth:"88%"}}>
      <Avatar/>
      <div style={{
        background:"#fff",borderRadius:"3px 14px 14px 14px",
        border:"1px solid #e5e7eb",padding:"13px 14px",
        boxShadow:"0 1px 6px rgba(0,0,0,.06)",minWidth:210,
      }}>
        <div style={{fontSize:11,fontWeight:600,color:"#16a34a",marginBottom:10}}>Mengirim laporan...</div>
        {steps.map((txt,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,opacity:i<=s?1:.2,transition:"opacity .3s"}}>
            <div style={{
              width:14,height:14,borderRadius:"50%",flexShrink:0,
              background:i<s?"#16a34a":i===s?"#f59e0b":"#e5e7eb",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:7,color:"#fff",fontWeight:700,transition:"background .3s",
            }}>{i<s?"✓":""}</div>
            <span style={{fontSize:11.5,color:i<=s?"#374151":"#9ca3af"}}>{txt}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Success card ──────────────────────────────────────────────────────────────
const SuccessCard = ({data}) => (
  <div style={{display:"flex",gap:8,alignItems:"flex-start",maxWidth:"96%"}}>
    <Avatar/>
    <div style={{
      background:"#fff",borderRadius:"3px 14px 14px 14px",
      border:"1px solid #e5e7eb",padding:"15px 15px",
      boxShadow:"0 1px 6px rgba(0,0,0,.06)",flex:1,
    }}>
      <div style={{
        display:"inline-block",background:"#f0fdf4",
        color:"#15803d",borderRadius:6,padding:"3px 9px",
        fontSize:11,fontWeight:600,marginBottom:10,
        border:"1px solid #bbf7d0",
      }}>Laporan diterima</div>

      <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",letterSpacing:.8,marginBottom:5,textTransform:"uppercase"}}>Nomor tiket</div>
      <div style={{
        background:"#111827",borderRadius:8,padding:"10px 14px",
        fontFamily:"monospace",fontWeight:800,fontSize:15,
        letterSpacing:2,textAlign:"center",color:"#fff",
        marginBottom:13,
      }}>{data.tiket}</div>

      <div style={{borderTop:"1px solid #f3f4f6",paddingTop:10}}>
        {[
          ["Masalah",    data.masalah],
          [data.lokasiType==="sekolah"?"Sekolah":"SPPG", data.lokasi],
          ["Dikirim",    data.waktuKirim],
          ["Penanganan", "Tim Pengawas MBG Daerah"],
          ["Target",     "1×24 jam kerja"],
        ].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
            <span style={{fontSize:11.5,color:"#9ca3af",fontWeight:500,flexShrink:0}}>{l}</span>
            <span style={{fontSize:11.5,color:"#111827",fontWeight:600,textAlign:"right",maxWidth:"60%",marginLeft:8}}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{marginTop:9,fontSize:11.5,color:"#6b7280",lineHeight:1.6}}>
        Simpan nomor tiket ini untuk memantau status laporan kamu.
      </div>
    </div>
  </div>
);

// ── Ticket status card ────────────────────────────────────────────────────────
const TicketCard = ({ticket,data}) => {
  const meta = STATUS_META[data.status]||{color:"#6b7280",bg:"rgba(107,114,128,.08)"};
  return (
    <div style={{display:"flex",gap:8,alignItems:"flex-start",maxWidth:"96%"}}>
      <Avatar/>
      <div style={{
        background:"#fff",borderRadius:"3px 14px 14px 14px",
        border:"1px solid #e5e7eb",padding:"14px 15px",
        boxShadow:"0 1px 6px rgba(0,0,0,.06)",flex:1,
      }}>
        <div style={{fontSize:10,fontWeight:700,color:"#6b7280",letterSpacing:.8,marginBottom:8,textTransform:"uppercase"}}>Status laporan</div>
        <div style={{fontFamily:"monospace",fontWeight:700,fontSize:13,color:"#111827",marginBottom:8}}>{ticket}</div>
        <div style={{
          display:"inline-block",background:meta.bg,color:meta.color,
          borderRadius:5,padding:"3px 9px",fontSize:11.5,fontWeight:600,marginBottom:11,
        }}>{data.status}</div>
        <div style={{borderTop:"1px solid #f3f4f6",paddingTop:9}}>
          {[
            ["Sekolah",     data.sekolah],
            ["SPPG",        data.sppg],
            ["Masalah",     data.masalah],
            ["Dilaporkan",  data.waktu],
          ].map(([l,v])=>v&&(
            <div key={l} style={{marginBottom:6}}>
              <div style={{fontSize:10.5,fontWeight:600,color:"#9ca3af"}}>{l}</div>
              <div style={{fontSize:12.5,color:"#111827",fontWeight:500,marginTop:1}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#f9fafb",borderRadius:8,padding:"9px 11px",marginTop:4,border:"1px solid #f3f4f6"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#6b7280",marginBottom:3,textTransform:"uppercase"}}>Catatan petugas</div>
          <div style={{fontSize:12.5,color:"#374151",lineHeight:1.6}}>{data.catatan}</div>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MBGChatbot() {
  const [open,setOpen]         = useState(false);
  const [messages,setMessages] = useState([]);
  const [input,setInput]       = useState("");
  const [typing,setTyping]     = useState(false);
  const [qr,setQr]             = useState(null);
  const [started,setStarted]   = useState(false);

  const [step,setStep]   = useState("idle");
  const [draft,setDraft] = useState({masalah:"",lokasiType:"sekolah",lokasi:"",waktu:"",kronologi:""});

  const [showMasalah,setShowMasalah] = useState(false);
  const [showLokasi,setShowLokasi]   = useState(false);
  const [showConfirm,setShowConfirm] = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const idRef     = useRef(0);
  const uid = () => { idRef.current+=1; return idRef.current; };

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,typing,qr,showMasalah,showLokasi,showConfirm]);
  useEffect(()=>{
    if(open&&!started){ setStarted(true); setTimeout(doIntro,400); }
  },[open]); // eslint-disable-line

  const push  = (role,content,type) => setMessages(p=>[...p,{id:uid(),role,type:type||"text",content}]);
  const pushB = (content,type)      => push("bot",content,type||"text");
  const pushU = (text)              => push("user",text,"text");
  const say   = async (text,delay)  => {
    setTyping(true); await sleep(delay!==undefined?delay:700);
    setTyping(false); pushB(text,"text");
  };

  // ── Reset draft ──────────────────────────────────────────────────────────
  const resetDraft = () => setDraft({masalah:"",lokasiType:"sekolah",lokasi:"",waktu:"",kronologi:""});

  // ── Intro ────────────────────────────────────────────────────────────────
  const doIntro = async () => {
    setTyping(true); await sleep(550); setTyping(false);
    pushB("Halo! Saya MBOG Assistant, siap membantu kamu melaporkan masalah Program Makan Bergizi Gratis.");
    await sleep(250);
    setTyping(true); await sleep(750); setTyping(false);
    pushB("Laporan bersifat anonim dan akan diteruskan langsung ke tim pengawas daerah. Mau mulai dari mana?");
    setStep("menu");
    setQr([
      {label:"Laporkan masalah MBG", val:"lapor",   variant:"primary"},
      {label:"Cek status laporan",   val:"cek"},
      {label:"Info program MBG",     val:"info"},
    ]);
  };

  // ── Start lapor ──────────────────────────────────────────────────────────
  const startLapor = async () => {
    setQr(null); resetDraft();
    setShowMasalah(false); setShowLokasi(false); setShowConfirm(false);
    await say("Oke, kita mulai laporan baru. Pilih jenis masalah terlebih dahulu.",500);
    setStep("masalah");
    setShowMasalah(true);
  };

  // ── Pilih masalah ────────────────────────────────────────────────────────
  const pilihMasalah = async (val) => {
    setShowMasalah(false);
    setDraft(d=>({...d,masalah:val}));
    pushU(val);
    await say(`Dicatat. Masalah ini terjadi di sekolah atau di SPPG (dapur/vendor MBG)?`,600);
    setStep("lokasi_type");
    setQr([
      {label:"Di sekolah",          val:"sekolah"},
      {label:"Di SPPG / Dapur MBG", val:"sppg"},
    ]);
  };

  // ── Pilih tipe lokasi ────────────────────────────────────────────────────
  const pilihLokasiType = async (val) => {
    setQr(null);
    setDraft(d=>({...d,lokasiType:val}));
    pushU(val==="sekolah"?"Di sekolah":"Di SPPG / Dapur MBG");
    setTyping(true); await sleep(500); setTyping(false);
    pushB(val==="sekolah"
      ?"Pilih nama sekolah dari daftar, atau ketik sendiri."
      :"Pilih nama SPPG atau dapur MBG dari daftar, atau ketik sendiri.");
    setStep("lokasi");
    setShowLokasi(true);
  };

  // ── Pilih lokasi ─────────────────────────────────────────────────────────
  const pilihLokasi = async (val) => {
    setShowLokasi(false);
    setDraft(d=>({...d,lokasi:val}));
    pushU(val);
    await say(`Tercatat ${val}.\n\nKejadian ini terjadi kapan? Ketik waktunya atau pilih di bawah.`,700);
    setStep("waktu");
    setQr([
      {label:"Hari ini",   val:"Hari ini"},
      {label:"Kemarin",    val:"Kemarin"},
      {label:"Minggu ini", val:"Minggu ini"},
      {label:"Lewati",     val:"skip"},
    ]);
  };

  // ── Input waktu ──────────────────────────────────────────────────────────
  const inputWaktu = async (val) => {
    setQr(null);
    const w = val==="skip"?"Tidak disebutkan":val;
    setDraft(d=>({...d,waktu:w}));
    pushU(val==="skip"?"Lewati":val);
    await say("Terakhir, ceritakan kronologi kejadiannya apa yang kamu lihat, dengar, atau rasakan?",700);
    setStep("kronologi");
    setTimeout(()=>inputRef.current?.focus(),300);
  };

  // ── Input kronologi ──────────────────────────────────────────────────────
  const inputKronologi = async (val) => {
    if(val.trim().length<5) return;
    setDraft(d=>({...d,kronologi:val}));
    pushU(val);
    setStep("confirm");
    setTyping(true); await sleep(700); setTyping(false);
    pushB("Berikut ringkasan laporan kamu. Periksa sebentar sebelum dikirim.");
    await sleep(150);
    setShowConfirm(true);
  };

  // ── Kirim laporan ────────────────────────────────────────────────────────
  const kirimLaporan = async () => {
    setShowConfirm(false);
    setStep("sending");
    pushB(null,"sending");
    await sleep(2900);
    setMessages(p=>p.filter(m=>m.type!=="sending"));
    const tk = genTK();
    const result = {...draft, tiket:tk, waktuKirim:nowStr()};
    pushB(result,"success");
    setStep("done");
    await sleep(350);
    await say("Laporan kamu sudah kami terima. Simpan nomor tiket di atas untuk memantau perkembangan.",800);
    await sleep(200);
    setQr([
      {label:"Buat laporan lain", val:"lapor", variant:"primary"},
      {label:"Cek status tiket",  val:"cek"},
      {label:"Selesai",           val:"selesai"},
    ]);
  };

  // ── Edit laporan ─────────────────────────────────────────────────────────
  const editLaporan = async () => {
    setShowConfirm(false);
    await say("Bagian mana yang ingin diubah?",400);
    setQr([
      {label:"Jenis masalah", val:"edit_masalah"},
      {label:"Lokasi",        val:"edit_lokasi"},
      {label:"Waktu",         val:"edit_waktu"},
      {label:"Kronologi",     val:"edit_kronologi"},
    ]);
    setStep("edit_menu");
  };

  // ── Flow cek tiket ───────────────────────────────────────────────────────
  const startCek = async () => {
    setQr(null);
    await say("Masukkan nomor tiket laporan kamu.\nContoh: **TK-20260321-042**",500);
    setStep("cek");
    setTimeout(()=>inputRef.current?.focus(),300);
  };

  const cekTiket = async (txt) => {
    const m = txt.toUpperCase().match(/TK-\d{8}-\d{3}/);
    if(!m){
      await say("Format nomor tiket kurang tepat.\nContoh yang benar: **TK-20260321-042**",500);
      return;
    }
    const key=m[0], data=TICKETS[key];
    setTyping(true); await sleep(800); setTyping(false);
    if(data){
      pushB({ticket:key,data},"ticket");
      await sleep(300);
      await say("Berikut status terbaru laporan kamu.",500);
    } else {
      await say(`Nomor tiket **${key}** tidak ditemukan.\nPastikan penulisannya sudah benar.`,600);
    }
    setQr([
      {label:"Cek tiket lain",    val:"cek"},
      {label:"Buat laporan baru", val:"lapor", variant:"primary"},
      {label:"Selesai",           val:"selesai"},
    ]);
    setStep("menu");
  };

  // ── Info ─────────────────────────────────────────────────────────────────
  const showInfo = async () => {
    setQr(null);
    await say("**Program Makan Bergizi Gratis (MBG)**\n\nProgram pemerintah Indonesia yang menyediakan makanan bergizi setiap hari untuk siswa SD, SMP, SMA/SMK, ibu hamil, ibu menyusui, dan balita.\n\n**SPPG** (Satuan Pelayanan Pemenuhan Gizi) adalah dapur atau vendor resmi yang memasak dan mendistribusikan makanan ke sekolah-sekolah.\n\nSetiap laporan yang masuk akan ditindaklanjuti oleh Dinas terkait dalam **1×24 jam kerja**.",850);
    await sleep(200);
    setQr([
      {label:"Laporkan masalah", val:"lapor", variant:"primary"},
      {label:"Cek status laporan",val:"cek"},
    ]);
    setStep("menu");
  };

  // ── Handle send ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const txt = input.trim();
    if(!txt||typing) return;
    setInput("");
    if(step==="kronologi"){
      await inputKronologi(txt);
    } else if(step==="cek"){
      pushU(txt);
      await cekTiket(txt);
    } else if(step==="waktu"){
      setQr(null);
      await inputWaktu(txt);
    } else {
      pushU(txt);
      const m = txt.toUpperCase().match(/TK-\d{8}-\d{3}/);
      if(m){ await cekTiket(txt); }
      else {
        await say("Gunakan tombol pilihan di bawah untuk melanjutkan.",500);
        setQr([
          {label:"Buat laporan baru",  val:"lapor", variant:"primary"},
          {label:"Cek status laporan", val:"cek"},
        ]);
      }
    }
  };

  // ── Handle quick reply ────────────────────────────────────────────────────
  const handleQR = async (val) => {
    setQr(null);
    if(val==="lapor"||val==="lapor_lain"){
      pushU("Buat laporan baru");
      await startLapor();
    } else if(val==="cek"){
      pushU("Cek status laporan");
      await startCek();
    } else if(val==="info"){
      pushU("Info program MBG");
      await showInfo();
    } else if(val==="sekolah"||val==="sppg"){
      await pilihLokasiType(val);
    } else if(["Hari ini","Kemarin","Minggu ini","skip"].includes(val)){
      await inputWaktu(val);
    } else if(val==="selesai"){
      await say("Terima kasih sudah berkontribusi untuk program MBG yang lebih baik.",500);
      setStep("done_final");
      await sleep(300);
      // Tetap bisa lapor lagi
      setQr([
        {label:"Buat laporan baru",  val:"lapor", variant:"primary"},
        {label:"Cek status laporan", val:"cek"},
      ]);
    } else if(val==="edit_masalah"){
      setStep("masalah"); setShowMasalah(true);
      await say("Pilih jenis masalah yang baru.",300);
    } else if(val==="edit_lokasi"){
      setStep("lokasi"); setShowLokasi(true);
      await say("Pilih lokasi yang baru.",300);
    } else if(val==="edit_waktu"){
      await say("Kapan kejadian ini terjadi?",400);
      setStep("waktu");
      setQr([
        {label:"Hari ini",val:"Hari ini"},
        {label:"Kemarin", val:"Kemarin"},
        {label:"Lewati",  val:"skip"},
      ]);
    } else if(val==="edit_kronologi"){
      await say("Ceritakan ulang kronologinya.",400);
      setStep("kronologi");
      setTimeout(()=>inputRef.current?.focus(),300);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const renderMsg = (msg) => {
    if(msg.role==="user")       return <UserBubble key={msg.id} text={msg.content}/>;
    if(msg.type==="sending")    return <SendingCard key={msg.id}/>;
    if(msg.type==="success")    return <SuccessCard key={msg.id} data={msg.content}/>;
    if(msg.type==="ticket")     return <TicketCard key={msg.id} ticket={msg.content.ticket} data={msg.content.data}/>;
    return <BotBubble key={msg.id}><Txt t={msg.content}/></BotBubble>;
  };

  const inputActive = ["kronologi","cek","waktu"].includes(step);
  const ph = step==="kronologi"?"Ceritakan apa yang terjadi..."
    :step==="cek"?"Masukkan nomor tiket..."
    :step==="waktu"?"Ketik waktu kejadian..."
    :"Ketik pesan...";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *{box-sizing:border-box;}
        @keyframes mbgB{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-5px);opacity:1}}
        @keyframes mbgP{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.8);opacity:0}}
        @keyframes mbgSU{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes mbgFI{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mbgGL{0%,100%{opacity:.6}50%{opacity:1}}
        .mbg-win{animation:mbgSU .3s cubic-bezier(.34,1.2,.64,1) forwards;}
        .mbg-msg{animation:mbgFI .18s ease forwards;}
        .mbg-fab{transition:all .25s cubic-bezier(.34,1.2,.64,1)!important;}
        .mbg-fab:hover{transform:scale(1.08)!important;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:99px;}
        textarea,input{caret-color:#16a34a;}
        textarea:focus,input:focus{outline:none!important;}
      `}</style>

      {/* Pulse rings */}
      {!open&&[0,.7].map((d,i)=>(
        <div key={i} style={{
          position:"fixed",bottom:22,right:22,
          width:52,height:52,borderRadius:"50%",
          border:"1.5px solid #16a34a",zIndex:9996,
          animation:"mbgP 2.2s ease-out infinite",
          animationDelay:`${d}s`,pointerEvents:"none",
        }}/>
      ))}

      {/* Tooltip */}
      {!open&&(
        <div style={{
          position:"fixed",bottom:86,right:17,zIndex:9997,
          background:"#111827",color:"#fff",
          borderRadius:"9px 9px 2px 9px",
          padding:"7px 12px",fontSize:12,fontWeight:500,
          whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",
          boxShadow:"0 4px 14px rgba(0,0,0,.2)",
          animation:"mbgFI .35s ease",
        }}>
          Laporkan masalah MBG secara anonim
        </div>
      )}

      {/* FAB */}
      <button className="mbg-fab" onClick={()=>setOpen(o=>!o)} style={{
        position:"fixed",bottom:22,right:22,
        width:52,height:52,borderRadius:"50%",
        border:"none",cursor:"pointer",zIndex:9999,
        background:open?"#374151":"linear-gradient(135deg,#16a34a,#0d7a38)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:open?17:20,color:"#fff",
        boxShadow:open?"0 4px 16px rgba(0,0,0,.25)":"0 4px 20px rgba(22,163,74,.5)",
        fontFamily:"'DM Sans',sans-serif",
      }}>{open?"✕":"M"}</button>

      {/* Chat window */}
      {open&&(
        <div className="mbg-win" style={{
          position:"fixed",bottom:84,right:16,
          width:355,height:540,borderRadius:16,
          background:"#f9fafb",
          zIndex:9998,
          boxShadow:"0 16px 48px rgba(0,0,0,.12),0 4px 16px rgba(0,0,0,.08)",
          display:"flex",flexDirection:"column",overflow:"hidden",
          border:"1px solid #e5e7eb",
          fontFamily:"'DM Sans',sans-serif",
        }}>

          {/* Header */}
          <div style={{
            background:"#16a34a",
            padding:"12px 15px",
            display:"flex",alignItems:"center",gap:10,flexShrink:0,
          }}>
            <div style={{
              width:34,height:34,borderRadius:"50%",
              background:"rgba(255,255,255,.15)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:14,fontWeight:700,color:"#fff",
              border:"1.5px solid rgba(255,255,255,.25)",flexShrink:0,
            }}>M</div>
            <div style={{flex:1}}>
              <div style={{color:"#fff",fontWeight:700,fontSize:13.5}}>MBOG Assistant</div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:1}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"#a7f3d0",animation:"mbgGL 2s ease infinite"}}/>
                <span style={{color:"rgba(255,255,255,.75)",fontSize:11,fontWeight:400}}>
                  {typing?"Mengetik...":"Aktif Laporan anonim"}
                </span>
              </div>
            </div>
            <div style={{
              background:"rgba(255,255,255,.15)",
              border:"1px solid rgba(255,255,255,.2)",
              borderRadius:5,padding:"3px 8px",
              fontSize:10,color:"rgba(255,255,255,.9)",fontWeight:600,letterSpacing:.3,
            }}>ANONIM</div>
          </div>

          {/* Progress bar */}
          {["masalah","lokasi_type","lokasi","waktu","kronologi","confirm","sending"].includes(step)&&(
            <div style={{background:"#fff",borderBottom:"1px solid #f3f4f6",padding:"7px 15px 6px",flexShrink:0}}>
              <div style={{display:"flex",gap:3,marginBottom:4}}>
                {[0,1,2,3].map(i=>{
                  const order=["masalah","lokasi_type","lokasi","waktu","kronologi","confirm","sending"];
                  const cur=order.indexOf(step);
                  const thresholds=[0,1,3,4];
                  const done=cur>thresholds[i];
                  const active=cur>=thresholds[i]&&(i===3?true:cur<thresholds[i+1]??true);
                  return (
                    <div key={i} style={{
                      flex:1,height:2.5,borderRadius:99,
                      background:done?"#16a34a":active?"#16a34a":"#e5e7eb",
                      opacity:active&&!done?.6:1,
                      transition:"all .3s",
                    }}/>
                  );
                })}
              </div>
              <div style={{fontSize:10.5,color:"#9ca3af",fontWeight:500}}>
                {step==="masalah"&&"Langkah 1 dari 4 Jenis masalah"}
                {(step==="lokasi_type"||step==="lokasi")&&"Langkah 2 dari 4 Lokasi"}
                {step==="waktu"&&"Langkah 3 dari 4 Waktu kejadian"}
                {step==="kronologi"&&"Langkah 4 dari 4 Kronologi"}
                {(step==="confirm"||step==="sending")&&"Konfirmasi dan kirim"}
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{
            flex:1,overflowY:"auto",
            padding:"12px 11px",
            display:"flex",flexDirection:"column",gap:9,
            background:"#f9fafb",
          }}>
            {messages.map(msg=>(
              <div key={msg.id} className="mbg-msg">{renderMsg(msg)}</div>
            ))}
            {typing&&(
              <div className="mbg-msg">
                <BotBubble sm><TypingDots/></BotBubble>
              </div>
            )}
            {showMasalah&&!typing&&(
              <div className="mbg-msg"><MasalahPicker onSelect={pilihMasalah}/></div>
            )}
            {showLokasi&&!typing&&(
              <div className="mbg-msg">
                <LokasiPicker
                  type={draft.lokasiType}
                  onSelect={async v=>{setShowLokasi(false);await pilihLokasi(v);}}
                  onManual={async v=>{setShowLokasi(false);await pilihLokasi(v||"Lokasi tidak diketahui");}}
                />
              </div>
            )}
            {showConfirm&&!typing&&(
              <div className="mbg-msg">
                <ConfirmCard data={draft} onKirim={kirimLaporan} onEdit={editLaporan}/>
              </div>
            )}
            {qr&&!typing&&!showMasalah&&!showLokasi&&!showConfirm&&(
              <div className="mbg-msg"><PillRow items={qr} onSelect={handleQR}/></div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{
            padding:"9px 11px",
            borderTop:"1px solid #f3f4f6",
            background:"#fff",
            display:"flex",gap:8,alignItems:"flex-end",flexShrink:0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();}}}
              placeholder={ph}
              disabled={typing||!inputActive}
              rows={step==="kronologi"?3:2}
              style={{
                flex:1,border:"1px solid #e5e7eb",
                borderRadius:10,padding:"8px 11px",
                fontSize:13,fontFamily:"inherit",
                background:!inputActive||typing?"#f9fafb":"#fff",
                color:"#111827",resize:"none",lineHeight:1.5,
                transition:"all .15s",
                opacity:!inputActive||typing?0.45:1,
              }}
              onFocus={e=>{e.currentTarget.style.borderColor="#16a34a";e.currentTarget.style.boxShadow="0 0 0 2px rgba(22,163,74,.12)";}}
              onBlur={e=>{e.currentTarget.style.borderColor="#e5e7eb";e.currentTarget.style.boxShadow="none";}}
            />
            <button onClick={handleSend}
              disabled={!input.trim()||typing||!inputActive}
              style={{
                width:36,height:36,borderRadius:9,border:"none",
                background:input.trim()&&inputActive&&!typing?"#16a34a":"#e5e7eb",
                cursor:input.trim()&&inputActive&&!typing?"pointer":"not-allowed",
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,transition:"all .15s",
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
} 
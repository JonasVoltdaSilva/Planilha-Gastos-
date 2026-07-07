/* ============================================================
   App raiz — estado, navegação, quick-add, filtros
   ============================================================ */
const { useState, useMemo, useEffect, useRef, useCallback } = React;

// Debounce — evita refiltrar e re-renderizar a lista a cada tecla digitada na busca
function useDebouncedValue(value, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const NAV = [
  { id: "home",      nome: "Início",    icon: Ic.home },
  { id: "dashboard", nome: "Dashboard", icon: Ic.dashboard },
  { id: "gastos",    nome: "Gastos",    icon: Ic.wallet },
  { id: "faturas",   nome: "Faturas",   icon: Ic.invoice },
  { id: "relatorios",nome: "Relatórios",icon: Ic.chart },
  { id: "config",    nome: "Config.",   icon: Ic.settings },
];

const PAGE_META = {
  home:        { t: "Início",        s: "" },
  dashboard:   { t: "Dashboard",     s: "Visão geral das suas finanças pessoais" },
  gastos:      { t: "Gastos",        s: "Sua planilha completa de lançamentos" },
  faturas:     { t: "Faturas",       s: "Gestão de faturas dos seus cartões de crédito" },
  relatorios:  { t: "Relatórios",    s: "Análise da distribuição dos seus gastos" },
  config:      { t: "Configurações", s: "Personalize sua experiência" },
};

const LS_KEY   = "planilha_gastos_v1";
const LS_SET   = "planilha_gastos_settings_v1";
const LS_CATS  = "planilha_gastos_cats_v1";
const LS_CARDS = "planilha_gastos_cards_v1";
const LS_FAT   = "planilha_gastos_faturas_v1";
const LS_FIXAS       = "planilha_gastos_fixas_v1";
const LS_CALOTEIROS  = "planilha_gastos_caloteiros_v1";
const LS_EMPRESTIMOS = "planilha_gastos_emprestimos_v1";

/* Flores P&B + grain de filme — tema Petal (Ariana Grande, álbum 31/07) */
function PetalDecor({ theme }) {
  if (theme !== "petal") return null;

  const petals = [
    { id: 0,  left: "5%",  dur: "15s", delay: "0s",    size: 22, type: 0, drift: "-26px", spin: "260deg" },
    { id: 1,  left: "17%", dur: "20s", delay: "3.5s",  size: 28, type: 1, drift: "34px",  spin: "310deg" },
    { id: 2,  left: "32%", dur: "17s", delay: "7s",    size: 19, type: 0, drift: "-20px", spin: "200deg" },
    { id: 3,  left: "49%", dur: "23s", delay: "1.5s",  size: 24, type: 1, drift: "28px",  spin: "290deg" },
    { id: 4,  left: "64%", dur: "16s", delay: "5.5s",  size: 17, type: 0, drift: "-24px", spin: "340deg" },
    { id: 5,  left: "77%", dur: "21s", delay: "9.5s",  size: 30, type: 1, drift: "20px",  spin: "220deg" },
    { id: 6,  left: "89%", dur: "14s", delay: "2.5s",  size: 20, type: 0, drift: "-30px", spin: "300deg" },
    { id: 7,  left: "41%", dur: "19s", delay: "12s",   size: 18, type: 2, drift: "22px",  spin: "180deg" },
    { id: 8,  left: "24%", dur: "22s", delay: "15s",   size: 25, type: 0, drift: "-18px", spin: "240deg" },
    { id: 9,  left: "71%", dur: "18s", delay: "6.5s",  size: 22, type: 2, drift: "32px",  spin: "320deg" },
    { id: 10, left: "56%", dur: "13s", delay: "18s",   size: 16, type: 1, drift: "-22px", spin: "270deg" },
    { id: 11, left: "12%", dur: "24s", delay: "10s",   size: 26, type: 2, drift: "18px",  spin: "190deg" },
  ];

  return (
    <>
      <div className="ariana-grain" />
      {petals.map(p => (
        <div key={p.id} className="ariana-petal" style={{
          left: p.left,
          width: p.size,
          height: p.size,
          "--drift": p.drift,
          "--spin": p.spin,
          animation: `petalFall ${p.dur} ${p.delay} linear infinite`,
        }}>
          {p.type === 0 ? (
            /* Margarida — 12 pétalas finas alongadas, miolo pequeno */
            <svg viewBox="0 0 50 50" width={p.size} height={p.size} fill="none">
              <ellipse cx="25" cy="7" rx="2.2" ry="11" fill="white" opacity="0.75"/>
              <ellipse cx="25" cy="7" rx="2.2" ry="11" fill="white" opacity="0.75" transform="rotate(30 25 25)"/>
              <ellipse cx="25" cy="7" rx="2.2" ry="11" fill="white" opacity="0.75" transform="rotate(60 25 25)"/>
              <ellipse cx="25" cy="7" rx="2.2" ry="11" fill="white" opacity="0.75" transform="rotate(90 25 25)"/>
              <ellipse cx="25" cy="7" rx="2.2" ry="11" fill="white" opacity="0.75" transform="rotate(120 25 25)"/>
              <ellipse cx="25" cy="7" rx="2.2" ry="11" fill="white" opacity="0.75" transform="rotate(150 25 25)"/>
              <ellipse cx="25" cy="7" rx="2.2" ry="11" fill="white" opacity="0.75" transform="rotate(180 25 25)"/>
              <ellipse cx="25" cy="7" rx="2.2" ry="11" fill="white" opacity="0.75" transform="rotate(210 25 25)"/>
              <ellipse cx="25" cy="7" rx="2.2" ry="11" fill="white" opacity="0.75" transform="rotate(240 25 25)"/>
              <ellipse cx="25" cy="7" rx="2.2" ry="11" fill="white" opacity="0.75" transform="rotate(270 25 25)"/>
              <ellipse cx="25" cy="7" rx="2.2" ry="11" fill="white" opacity="0.75" transform="rotate(300 25 25)"/>
              <ellipse cx="25" cy="7" rx="2.2" ry="11" fill="white" opacity="0.75" transform="rotate(330 25 25)"/>
              <ellipse cx="25" cy="25" rx="4" ry="4" fill="white" opacity="0.90"/>
            </svg>
          ) : p.type === 1 ? (
            /* Pétala solta de margarida — forma de lágrima com nervura central */
            <svg viewBox="0 0 24 52" width={Math.round(p.size * 0.5)} height={p.size} fill="none">
              <path d="M12 2 C18 10,20 26,12 50 C4 26,6 10,12 2Z" fill="white" opacity="0.65"/>
              <line x1="12" y1="4" x2="12" y2="48" stroke="rgba(255,255,255,0.28)" strokeWidth="0.7"/>
            </svg>
          ) : (
            /* Flor silvestre — 8 pétalas ovais médias */
            <svg viewBox="0 0 50 50" width={p.size} height={p.size} fill="none">
              <ellipse cx="25" cy="9" rx="3.5" ry="12" fill="white" opacity="0.68" transform="rotate(0 25 25)"/>
              <ellipse cx="25" cy="9" rx="3.5" ry="12" fill="white" opacity="0.68" transform="rotate(45 25 25)"/>
              <ellipse cx="25" cy="9" rx="3.5" ry="12" fill="white" opacity="0.68" transform="rotate(90 25 25)"/>
              <ellipse cx="25" cy="9" rx="3.5" ry="12" fill="white" opacity="0.68" transform="rotate(135 25 25)"/>
              <ellipse cx="25" cy="9" rx="3.5" ry="12" fill="white" opacity="0.68" transform="rotate(180 25 25)"/>
              <ellipse cx="25" cy="9" rx="3.5" ry="12" fill="white" opacity="0.68" transform="rotate(225 25 25)"/>
              <ellipse cx="25" cy="9" rx="3.5" ry="12" fill="white" opacity="0.68" transform="rotate(270 25 25)"/>
              <ellipse cx="25" cy="9" rx="3.5" ry="12" fill="white" opacity="0.68" transform="rotate(315 25 25)"/>
              <ellipse cx="25" cy="25" rx="4.5" ry="4.5" fill="white" opacity="0.90"/>
            </svg>
          )}
        </div>
      ))}
    </>
  );
}

/* Fatia de limão SVG — anatomia real: casca + pith + gomos + brilho */
function LemonSVG({ sz }) {
  const cx = sz / 2, cy = sz / 2;
  const toR = d => (d * Math.PI) / 180;

  // Camadas concêntricas (do maior para o menor)
  const rOuter = sz * 0.48;  // borda exterior da casca
  const rRind  = sz * 0.375; // casca → pith
  const rPith  = sz * 0.305; // pith → polpa (carne)
  const rFlesh = sz * 0.305; // raio externo dos gomos
  const rCore  = sz * 0.062; // pip central

  const N    = 8;      // 8 gomos (típico do limão)
  const step = 360 / N;
  const gap  = 2.2;    // graus de margem entre gomos

  // Caminho de cada gomo: fatia de pizza com arco
  const seg = (i) => {
    const a1 = toR(i * step - 90 + gap);
    const a2 = toR((i + 1) * step - 90 - gap);
    const x1 = cx + rFlesh * Math.cos(a1), y1 = cy + rFlesh * Math.sin(a1);
    const x2 = cx + rFlesh * Math.cos(a2), y2 = cy + rFlesh * Math.sin(a2);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${rFlesh} ${rFlesh} 0 0 1 ${x2} ${y2} Z`;
  };

  // Linhas de membrana do centro ao pith
  const memEnd = (i) => {
    const a = toR(i * step - 90);
    return { x: cx + rFlesh * Math.cos(a), y: cy + rFlesh * Math.sin(a) };
  };

  // ID único por tamanho para gradientes
  const gid = `lsv${sz}`;

  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} fill="none">
      <defs>
        {/* Gradiente da casca: brilhante no centro da iluminação, escuro nas bordas */}
        <radialGradient id={`${gid}k`} cx="38%" cy="33%" r="62%">
          <stop offset="0%"   stopColor="#D8F528" />
          <stop offset="50%"  stopColor="#9AC800" />
          <stop offset="100%" stopColor="#507800" />
        </radialGradient>
        {/* Gradiente dos gomos: amarelo-limão → verde-limão */}
        <radialGradient id={`${gid}f`} cx="50%" cy="50%" r="52%">
          <stop offset="0%"   stopColor="#F2FF68" />
          <stop offset="100%" stopColor="#C8EC00" />
        </radialGradient>
      </defs>

      {/* 1. Disco da casca (ring externo visível) */}
      <circle cx={cx} cy={cy} r={rOuter} fill={`url(#${gid}k)`} />

      {/* 2. Disco do pith — branco-creme, esconde centro da casca */}
      <circle cx={cx} cy={cy} r={rRind} fill="rgba(246,255,230,0.95)" />

      {/* 3. Disco de fundo da polpa */}
      <circle cx={cx} cy={cy} r={rPith} fill={`url(#${gid}f)`} />

      {/* 4. Gomos individuais — alternância de tonalidade */}
      {Array.from({ length: N }, (_, i) => (
        <path key={i} d={seg(i)}
          fill={i % 2 === 0 ? "rgba(238,255,72,0.92)" : "rgba(208,242,18,0.85)"} />
      ))}

      {/* 5. Linhas de membrana (separam os gomos) */}
      {Array.from({ length: N }, (_, i) => {
        const m = memEnd(i);
        return (
          <line key={i} x1={cx} y1={cy} x2={m.x} y2={m.y}
            stroke="rgba(252,255,225,0.78)"
            strokeWidth={Math.max(0.5, sz * 0.016)} />
        );
      })}

      {/* 6. Anel do pith interno (aro que separa pith da polpa) */}
      <circle cx={cx} cy={cy} r={rPith}
        stroke="rgba(248,255,220,0.60)"
        strokeWidth={Math.max(0.6, sz * 0.022)} />

      {/* 7. Halo do pith externo */}
      <circle cx={cx} cy={cy} r={rRind}
        stroke="rgba(90,140,0,0.22)"
        strokeWidth={Math.max(0.5, sz * 0.016)} />

      {/* 8. Pip central */}
      <circle cx={cx} cy={cy} r={rCore * 1.5} fill="rgba(250,255,225,0.90)" />
      <circle cx={cx} cy={cy} r={rCore}        fill="#9EC000" opacity="0.97" />
      <circle cx={cx} cy={cy} r={rCore * 0.5}  fill="#D8F000" opacity="0.80" />

      {/* 9. Arco de brilho na casca (reflexo vítreo) */}
      <path
        d={`M ${cx - rOuter * 0.62} ${cy - rOuter * 0.24}
            Q ${cx - rOuter * 0.10} ${cy - rOuter * 0.82}
              ${cx + rOuter * 0.44} ${cy - rOuter * 0.25}`}
        stroke="rgba(255,255,245,0.50)"
        strokeWidth={Math.max(1.2, sz * 0.030)}
        fill="none" strokeLinecap="round" />

      {/* 10. Ponto especular brilhante */}
      <circle cx={cx - sz * 0.12} cy={cy - sz * 0.19}
        r={Math.max(1.2, sz * 0.038)}
        fill="rgba(255,255,255,0.68)" />
    </svg>
  );
}

/* Fatias de limão caindo — tema Lemonade (aespa editorial citrus) */
function AcidDecor({ theme }) {
  if (theme !== "acid") return null;

  const slices = [
    { id: 0, left: "8%",  sz: 52, dur: "22s", delay: "0s",   op: 0.28, r1: "140deg", r2: "295deg", d1: "18px",  d2: "-14px" },
    { id: 1, left: "22%", sz: 38, dur: "18s", delay: "4.5s", op: 0.24, r1: "95deg",  r2: "210deg", d1: "-22px", d2: "20px"  },
    { id: 2, left: "37%", sz: 62, dur: "25s", delay: "9s",   op: 0.22, r1: "175deg", r2: "330deg", d1: "28px",  d2: "-24px", blur: true },
    { id: 3, left: "53%", sz: 44, dur: "19s", delay: "2s",   op: 0.26, r1: "110deg", r2: "255deg", d1: "-16px", d2: "18px"  },
    { id: 4, left: "67%", sz: 35, dur: "21s", delay: "7s",   op: 0.30, r1: "155deg", r2: "280deg", d1: "24px",  d2: "-20px" },
    { id: 5, left: "79%", sz: 58, dur: "24s", delay: "13s",  op: 0.22, r1: "80deg",  r2: "200deg", d1: "-30px", d2: "26px",  blur: true },
    { id: 6, left: "91%", sz: 42, dur: "17s", delay: "5.5s", op: 0.28, r1: "120deg", r2: "245deg", d1: "20px",  d2: "-16px" },
    { id: 7, left: "44%", sz: 48, dur: "20s", delay: "16s",  op: 0.25, r1: "165deg", r2: "310deg", d1: "-26px", d2: "22px",  blur: true },
  ];

  return (
    <>
      {slices.map(s => (
        <div key={s.id} className="lemon-slice" style={{
          left: s.left,
          "--ls-op": s.op,
          "--ls-r1": s.r1,
          "--ls-r2": s.r2,
          "--ls-d1": s.d1,
          "--ls-d2": s.d2,
          animationDuration: s.dur,
          animationDelay:    s.delay,
          filter: s.blur ? "blur(0.6px)" : "none",
        }}>
          <LemonSVG sz={s.sz} />
        </div>
      ))}
    </>
  );
}

/* Sparkle stars + lip prints — tema Short n' Sweet (Sabrina Carpenter) */
function SweetDecor({ theme }) {
  const [sparkles, setSparkles] = useState([]);
  const [kisses,   setKisses]   = useState([]);
  /* ref compartilhado rastreia {t,l} de tudo que está posicionado */
  const occupied = React.useRef([]);

  const r   = (a, b) => Math.random() * (b - a) + a;
  const ri  = (a, b) => Math.floor(r(a, b + 1));
  const fs  = n => n.toFixed(1) + "s";
  const fp  = n => n.toFixed(1) + "%";

  /* Sorteia posição que não sobrepõe nenhum ocupado */
  const pick = (dist) => {
    for (let i = 0; i < 100; i++) {
      const t = r(4, 90), l = r(4, 90);
      if (occupied.current.every(p => Math.hypot(p.t - t, p.l - l) > dist))
        return { t, l };
    }
    return { t: r(4, 90), l: r(4, 90) }; // fallback sem verificação
  };

  /* Reserva posição e retorna strings CSS */
  const place = (dist) => {
    const p = pick(dist);
    occupied.current = [...occupied.current, p];
    return { top: fp(p.t), left: fp(p.l), _t: p.t, _l: p.l };
  };

  /* Libera posição de um item */
  const free = (t, l) => {
    occupied.current = occupied.current.filter(
      p => Math.hypot(p.t - t, p.l - l) > 0.15
    );
  };

  useEffect(() => {
    if (theme !== "sweet") {
      setSparkles([]); setKisses([]); occupied.current = []; return;
    }
    occupied.current = [];
    setSparkles(Array.from({ length: 10 }, (_, id) => {
      const pos = place(10);
      return { id, ...pos, size: ri(8,18), dur: fs(r(3.5,6)), delay: fs(r(1.5,12)) };
    }));
    setKisses(Array.from({ length: 5 }, (_, id) => {
      const pos = place(13);
      return { id, ...pos, rot: ri(-22,22), dur: fs(r(7,13)), delay: fs(r(3,15)) };
    }));
  }, [theme]);

  /* Ao reiniciar o ciclo (opacidade volta a 0) → nova posição aleatória */
  const nextSparkle = (id, oldT, oldL) => {
    free(oldT, oldL);
    const pos = place(10);
    setSparkles(prev => prev.map(s => s.id !== id ? s : {
      ...s, ...pos, size: ri(8,18), dur: fs(r(3.5,6)),
    }));
  };

  const nextKiss = (id, oldT, oldL) => {
    free(oldT, oldL);
    const pos = place(13);
    setKisses(prev => prev.map(k => k.id !== id ? k : {
      ...k, ...pos, rot: ri(-22,22), dur: fs(r(7,13)),
    }));
  };

  if (!sparkles.length) return null;

  return (
    <>
      {sparkles.map(s => (
        <div key={s.id} className="sweet-sparkle" style={{
          position: "fixed", top: s.top, left: s.left,
          animationDuration: s.dur, animationDelay: s.delay,
          animationFillMode: "backwards",
        }} onAnimationIteration={() => nextSparkle(s.id, s._t, s._l)}>
          <svg width={s.size * 2} height={s.size * 2} viewBox="0 0 24 24" fill="none">
            <path d="M12 0 L13.2 10.8 L24 12 L13.2 13.2 L12 24 L10.8 13.2 L0 12 L10.8 10.8 Z" fill="#E6C98D"/>
            <path d="M12 3 L12.8 11.2 L21 12 L12.8 12.8 L12 21 L11.2 12.8 L3 12 L11.2 11.2 Z" fill="#FFF2B8" opacity="0.7"/>
          </svg>
        </div>
      ))}
      {kisses.map(k => (
        <div key={k.id} className="sweet-kiss-wrap" style={{
          top: k.top, left: k.left, transform: `rotate(${k.rot}deg)`,
        }}>
          <div className="sweet-kiss" style={{
            animationDuration: k.dur, animationDelay: k.delay,
            animationFillMode: "backwards",
          }} onAnimationIteration={() => nextKiss(k.id, k._t, k._l)}>
            <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
              <path d="M2 13 Q3 4, 12 3 Q16 0, 20 5 Q24 0, 28 3 Q37 4, 38 13 Q36 23, 28 27 Q24 30, 20 27 Q16 30, 12 27 Q4 23, 2 13Z" fill="rgba(218,72,98,0.85)"/>
              <path d="M8 13 Q13 8, 20 13 Q27 8, 32 13 Q27 20, 20 20 Q13 20, 8 13Z" fill="rgba(168,38,62,0.72)"/>
              <ellipse cx="14" cy="8.5" rx="4.5" ry="2.2" fill="rgba(255,195,205,0.50)"/>
              <ellipse cx="26" cy="8"   rx="2.8" ry="1.6" fill="rgba(255,195,205,0.35)"/>
            </svg>
          </div>
        </div>
      ))}
    </>
  );
}

/* Charm SVG — coroa real, flor Cath Kidston, polaroid, laço tartan, cabine telefônica */
function FancyCharmSVG({ type, sz }) {
  if (type === 0) { // Coroa real britânica
    return (
      <svg width={sz} height={sz} viewBox="0 0 28 22" fill="none">
        <rect x="2" y="14" width="24" height="6" rx="1.5" fill="#B83048" opacity="0.82" />
        <path d="M2 14 L2 6 L9 12 L14 2 L19 12 L26 6 L26 14 Z" fill="#C03A52" opacity="0.80" />
        <circle cx="14" cy="5"  r="1.8" fill="rgba(255,215,220,0.88)" />
        <circle cx="7"  cy="11" r="1.2" fill="rgba(255,215,220,0.78)" />
        <circle cx="21" cy="11" r="1.2" fill="rgba(255,215,220,0.78)" />
        <circle cx="8"  cy="17" r="0.9" fill="rgba(255,235,238,0.65)" />
        <circle cx="14" cy="17" r="0.9" fill="rgba(255,235,238,0.65)" />
        <circle cx="20" cy="17" r="0.9" fill="rgba(255,235,238,0.65)" />
        <path d="M4 8 Q7 6 10 8" stroke="rgba(255,255,255,0.42)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 1) { // Flor Cath Kidston — floral kitsch britânico
    const petals = [0,72,144,216,288];
    return (
      <svg width={sz} height={sz} viewBox="0 0 30 30" fill="none">
        {petals.map((a, i) => (
          <ellipse key={i} cx="15" cy="6" rx="3.2" ry="7" fill="#C4889A" opacity="0.76"
            transform={`rotate(${a} 15 15)`} />
        ))}
        <circle cx="15" cy="15" r="4.2" fill="#E8B4C0" opacity="0.88" />
        <circle cx="15" cy="15" r="2.4" fill="#F8D8E0" opacity="0.90" />
        <circle cx="15" cy="15" r="1.0" fill="#D89AAA" opacity="0.80" />
        <path d="M13.5 13.5 Q15 12 16.5 13.5" stroke="rgba(255,255,255,0.45)" strokeWidth="0.7" fill="none" />
      </svg>
    );
  }
  if (type === 2) { // Moldura Polaroid
    return (
      <svg width={sz} height={sz} viewBox="0 0 26 30" fill="none">
        <rect x="1" y="1" width="24" height="28" rx="2" fill="rgba(245,241,245,0.90)" />
        <rect x="3" y="3" width="20" height="19" rx="1" fill="rgba(155,108,125,0.35)" />
        {/* micro floral no canto da foto */}
        <circle cx="5" cy="5"  r="1.2" fill="rgba(192,80,108,0.45)" />
        <circle cx="21" cy="5" r="0.9" fill="rgba(192,80,108,0.38)" />
        <rect x="7" y="24.5" width="12" height="1.8" rx="0.9" fill="rgba(130,88,100,0.38)" />
        <rect x="1" y="1" width="24" height="28" rx="2" fill="none"
          stroke="rgba(165,132,145,0.28)" strokeWidth="0.8" />
        <path d="M4 4 Q8 3 14 4" stroke="rgba(255,255,255,0.38)" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 3) { // Laço/fita tartan
    return (
      <svg width={sz} height={sz} viewBox="0 0 34 20" fill="none">
        <path d="M17 10 L4 2 Q1 4 2 6.5 L15 12 Z"  fill="#9B3040" opacity="0.78" />
        <path d="M17 10 L4 18 Q1 16 2 13.5 L15 8 Z" fill="#7A2030" opacity="0.70" />
        <path d="M17 10 L30 2 Q33 4 32 6.5 L19 12 Z"  fill="#9B3040" opacity="0.78" />
        <path d="M17 10 L30 18 Q33 16 32 13.5 L19 8 Z" fill="#7A2030" opacity="0.70" />
        {/* listras tartan */}
        <line x1="4" y1="5"  x2="15" y2="11" stroke="rgba(255,220,225,0.28)" strokeWidth="0.9" />
        <line x1="4" y1="8"  x2="15" y2="11" stroke="rgba(255,220,225,0.22)" strokeWidth="0.6" />
        <line x1="30" y1="5"  x2="19" y2="11" stroke="rgba(255,220,225,0.28)" strokeWidth="0.9" />
        <ellipse cx="17" cy="10" rx="3.8" ry="4.2" fill="#C03A50" opacity="0.88" />
        <ellipse cx="17" cy="10" rx="2.0" ry="2.2" fill="#E06075" opacity="0.65" />
      </svg>
    );
  }
  // type === 4: Cabine telefônica britânica (Big Red Box)
  return (
    <svg width={sz} height={sz} viewBox="0 0 20 30" fill="none">
      <path d="M2 6 Q2 2 10 1 Q18 2 18 6 Z" fill="#C81C2C" opacity="0.86" />
      <rect x="2" y="6" width="16" height="22" rx="1" fill="#CC2030" opacity="0.84" />
      <rect x="4"  y="8"  width="5" height="5" rx="0.5" fill="rgba(195,225,245,0.62)" />
      <rect x="11" y="8"  width="5" height="5" rx="0.5" fill="rgba(195,225,245,0.62)" />
      <rect x="4"  y="15" width="5" height="5" rx="0.5" fill="rgba(195,225,245,0.55)" />
      <rect x="11" y="15" width="5" height="5" rx="0.5" fill="rgba(195,225,245,0.55)" />
      <rect x="6"  y="22" width="8" height="5" rx="0.5" fill="rgba(175,15,22,0.55)" />
      <rect x="2" y="6" width="16" height="22" rx="1" fill="none"
        stroke="rgba(200,100,110,0.30)" strokeWidth="0.6" />
      <path d="M4 4 Q8 2 14 3" stroke="rgba(255,255,255,0.42)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* Floating fashion charms — tema Fancy That (PinkPantheress Y2K British editorial) */
function FancyDecor({ theme }) {
  if (theme !== "fancy") return null;

  const charms = [
    { id: 0,  type: 0, left: "5%",  sz: 24, dur: "24s", delay: "0s",    op: 0.34, dx1: "16px",  dx2: "-12px", r1: "18deg",  r2: "38deg"  },
    { id: 1,  type: 1, left: "16%", sz: 32, dur: "30s", delay: "5.5s",  op: 0.30, dx1: "-20px", dx2: "14px",  r1: "-15deg", r2: "-35deg" },
    { id: 2,  type: 2, left: "29%", sz: 28, dur: "22s", delay: "9.5s",  op: 0.32, dx1: "12px",  dx2: "-16px", r1: "12deg",  r2: "28deg"  },
    { id: 3,  type: 3, left: "43%", sz: 30, dur: "27s", delay: "2.5s",  op: 0.28, dx1: "-14px", dx2: "10px",  r1: "20deg",  r2: "45deg"  },
    { id: 4,  type: 4, left: "57%", sz: 22, dur: "28s", delay: "12.5s", op: 0.36, dx1: "18px",  dx2: "-13px", r1: "10deg",  r2: "22deg"  },
    { id: 5,  type: 0, left: "70%", sz: 20, dur: "21s", delay: "7.5s",  op: 0.30, dx1: "-15px", dx2: "18px",  r1: "-12deg", r2: "-28deg" },
    { id: 6,  type: 1, left: "82%", sz: 36, dur: "33s", delay: "16.5s", op: 0.26, dx1: "8px",   dx2: "-14px", r1: "8deg",   r2: "20deg"  },
    { id: 7,  type: 2, left: "92%", sz: 24, dur: "23s", delay: "4.0s",  op: 0.30, dx1: "-11px", dx2: "16px",  r1: "15deg",  r2: "35deg"  },
    { id: 8,  type: 3, left: "11%", sz: 28, dur: "26s", delay: "14.0s", op: 0.28, dx1: "16px",  dx2: "-12px", r1: "-10deg", r2: "-25deg" },
    { id: 9,  type: 4, left: "36%", sz: 20, dur: "19s", delay: "18.5s", op: 0.34, dx1: "14px",  dx2: "-10px", r1: "8deg",   r2: "18deg"  },
    { id: 10, type: 0, left: "51%", sz: 22, dur: "25s", delay: "8.0s",  op: 0.28, dx1: "-12px", dx2: "15px",  r1: "14deg",  r2: "30deg"  },
    { id: 11, type: 1, left: "65%", sz: 26, dur: "29s", delay: "11.5s", op: 0.28, dx1: "10px",  dx2: "-17px", r1: "18deg",  r2: "40deg"  },
    { id: 12, type: 3, left: "78%", sz: 32, dur: "20s", delay: "3.5s",  op: 0.26, dx1: "-18px", dx2: "12px",  r1: "-8deg",  r2: "-20deg" },
    { id: 13, type: 4, left: "23%", sz: 18, dur: "24s", delay: "19.5s", op: 0.32, dx1: "12px",  dx2: "-8px",  r1: "6deg",   r2: "15deg"  },
  ];

  return (
    <>
      <div className="fancy-grain" />
      {charms.map(c => (
        <div key={c.id} className="fancy-charm" style={{
          left: c.left,
          bottom: `-${c.sz + 20}px`,
          "--fc-op":  c.op,
          "--fc-dx1": c.dx1,
          "--fc-dx2": c.dx2,
          "--fc-r1":  c.r1,
          "--fc-r2":  c.r2,
          animationDuration: c.dur,
          animationDelay:    c.delay,
        }}>
          <FancyCharmSVG type={c.type} sz={c.sz} />
        </div>
      ))}
    </>
  );
}

/* Raios de luz + faíscas metálicas — tema Chrome (cyberpunk/mangá) */
function ChromeDecor({ theme }) {
  if (theme !== "chrome") return null;

  const streaks = [
    { id: 0,  top: "8%",  left: "12%", w: 180, angle: 18,  dur: "6.2s", delay: "0s"    },
    { id: 1,  top: "23%", left: "55%", w: 240, angle: -12, dur: "8.5s", delay: "1.4s"  },
    { id: 2,  top: "41%", left: "3%",  w: 160, angle: 22,  dur: "7.0s", delay: "3.1s"  },
    { id: 3,  top: "62%", left: "70%", w: 200, angle: -8,  dur: "9.1s", delay: "0.7s"  },
    { id: 4,  top: "80%", left: "30%", w: 140, angle: 15,  dur: "5.8s", delay: "4.5s"  },
    { id: 5,  top: "15%", left: "82%", w: 190, angle: -20, dur: "7.7s", delay: "2.2s"  },
  ];

  const sparks = [
    { id: 0,  top: "12%", left: "28%", dur: "3.2s", delay: "0.5s",  s: 11 },
    { id: 1,  top: "33%", left: "67%", dur: "4.1s", delay: "1.8s",  s: 9  },
    { id: 2,  top: "55%", left: "14%", dur: "2.8s", delay: "0.2s",  s: 13 },
    { id: 3,  top: "71%", left: "88%", dur: "5.0s", delay: "3.3s",  s: 9  },
    { id: 4,  top: "47%", left: "50%", dur: "3.6s", delay: "2.0s",  s: 11 },
    { id: 5,  top: "88%", left: "42%", dur: "4.4s", delay: "1.1s",  s: 9  },
    { id: 6,  top: "22%", left: "9%",  dur: "2.5s", delay: "4.0s",  s: 13 },
    { id: 7,  top: "64%", left: "76%", dur: "3.9s", delay: "0.9s",  s: 9  },
    { id: 8,  top: "18%", left: "95%", dur: "4.7s", delay: "2.7s",  s: 11 },
    { id: 9,  top: "79%", left: "6%",  dur: "3.3s", delay: "1.5s",  s: 9  },
  ];

  return (
    <>
      {streaks.map(s => (
        <div key={s.id} className="chrome-streak" style={{
          top: s.top,
          left: s.left,
          width: s.w,
          transform: `rotate(${s.angle}deg)`,
          animationDuration: s.dur,
          animationDelay: s.delay,
        }} />
      ))}
      {sparks.map(s => (
        <div key={s.id} className="chrome-spark" style={{
          top: s.top,
          left: s.left,
          width: s.s,
          height: s.s,
          animationDuration: s.dur,
          animationDelay: s.delay,
        }} />
      ))}
    </>
  );
}

/* Speed-lines diagonais — motion-blur da capa JUMP (BLACKPINK) */
function JumpDecor({ theme }) {
  if (theme !== "jump") return null;

  // iOS só faz autoplay com muted setado como propriedade (o atributo JSX não basta)
  const videoRef = (el) => {
    if (el) { el.muted = true; el.play().catch(() => {}); }
  };

  // Linhas horizontais finas e lentas — minimalismo da capa DEADLINE
  const streaks = [
    { id: 0, top: "16%", w: "44%", angle: 0, dur: "12s", delay: "0s",  silver: false },
    { id: 1, top: "38%", w: "36%", angle: 0, dur: "16s", delay: "5s",  silver: true  },
    { id: 2, top: "58%", w: "48%", angle: 0, dur: "14s", delay: "9s",  silver: false },
    { id: 3, top: "78%", w: "34%", angle: 0, dur: "18s", delay: "3s",  silver: true  },
  ];

  return (
    <>
      {/* Arte animada do álbum (Apple Music) — loop contínuo atrás do conteúdo */}
      <video
        ref={videoRef}
        className="jump-art-video"
        src="jump-art.mp4"
        autoPlay loop muted playsInline
        aria-hidden="true"
      />
      {streaks.map(s => (
        <div key={s.id} className={"jump-streak" + (s.silver ? " silver" : "")} style={{
          top: s.top,
          width: s.w,
          transform: `rotate(${s.angle}deg)`,
          animationDuration: s.dur,
          animationDelay: s.delay,
        }} />
      ))}
    </>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [gastosInitialTab, setGastosInitialTab] = useState("lancamentos");

  // ---------- Perfil do usuário ----------
  const [profile, setProfile] = useState(() => {
    try {
      const s = localStorage.getItem(LS_PROFILE);
      if (s) {
        const p = JSON.parse(s);
        if (p.theme === "ariana") p.theme = "petal"; // migra theme ID renomeado
        return p;
      }
    } catch (e) {}
    return null;
  });

  useEffect(() => { applyTheme(profile?.theme || "default"); }, [profile?.theme]);

  const handleThemeChange = (themeId) => {
    const updated = { ...(profile || {}), theme: themeId };
    setProfile(updated);
    try { localStorage.setItem(LS_PROFILE, JSON.stringify(updated)); } catch (e) {}
  };

  const resetProfile = () => {
    try { localStorage.removeItem(LS_PROFILE); } catch (e) {}
    setProfile(null);
  };

  // ---------- Categorias personalizadas ----------
  const [customCats, setCustomCats] = useState(() => {
    try {
      const s = localStorage.getItem(LS_CATS);
      if (s) {
        const cats = JSON.parse(s);
        cats.forEach(c => { if (!CAT_MAP[c.id]) { CATEGORIES.push(c); CAT_MAP[c.id] = c; } });
        return cats;
      }
    } catch (e) {}
    return [];
  });

  const allCats = useMemo(() => [...CATEGORIES], [customCats]);

  const addCustomCat = (cat) => {
    if (CAT_MAP[cat.id]) return;
    CATEGORIES.push(cat);
    CAT_MAP[cat.id] = cat;
    const updated = [...customCats, cat];
    setCustomCats(updated);
    try { localStorage.setItem(LS_CATS, JSON.stringify(updated)); } catch (e) {}
  };

  const deleteCustomCat = (id) => {
    const idx = CATEGORIES.findIndex(c => c.id === id);
    if (idx >= 0) { CATEGORIES.splice(idx, 1); delete CAT_MAP[id]; }
    const updated = customCats.filter(c => c.id !== id);
    setCustomCats(updated);
    try { localStorage.setItem(LS_CATS, JSON.stringify(updated)); } catch (e) {}
  };

  // ---------- Gastos ----------
  const [expenses, setExpenses] = useState(() => {
    try {
      const s = localStorage.getItem(LS_KEY);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return seedData();
  });

  // ---------- Configurações ----------
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem(LS_SET);
      if (s) {
        const parsed = JSON.parse(s);
        return { autoCat: true, glow: true, animations: true, confirmDelete: false, budget: 2000, perfLite: false, notificacoes: true, ...parsed };
      }
    } catch (e) {}
    return { autoCat: true, glow: true, animations: true, confirmDelete: false, budget: 2000, lightMode: false, perfLite: false, notificacoes: true };
  });

  // ---------- Cartões ----------
  const [cards, setCards] = useState(() => {
    try {
      const s = localStorage.getItem(LS_CARDS);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return [];
  });

  // ---------- Fatura overrides (mark as paid) ----------
  const [faturaOverrides, setFaturaOverrides] = useState(() => {
    try {
      const s = localStorage.getItem(LS_FAT);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return {};
  });

  const markFaturaPaid = (cardId, mes) => {
    const key = `${cardId}:${mes}`;
    const updated = { ...faturaOverrides, [key]: { status: "paga", paidAt: todayISO() } };
    setFaturaOverrides(updated);
    try { localStorage.setItem(LS_FAT, JSON.stringify(updated)); } catch (e) {}
    showToast("Fatura marcada como paga");
  };

  const unmarkFaturaPaid = (cardId, mes) => {
    const key = `${cardId}:${mes}`;
    const updated = { ...faturaOverrides };
    delete updated[key];
    setFaturaOverrides(updated);
    try { localStorage.setItem(LS_FAT, JSON.stringify(updated)); } catch (e) {}
    showToast("Fatura reaberta");
  };

  // Contas fixas
  const [fixas, setFixas] = useState(() => {
    try { const s = localStorage.getItem(LS_FIXAS); if (s) return JSON.parse(s); } catch(e) {}
    return [];
  });
  const addFixa = (f) => { const u = [...fixas, { ...f, id: uid() }]; setFixas(u); try { localStorage.setItem(LS_FIXAS, JSON.stringify(u)); } catch(e) {} showToast("Conta fixa adicionada"); };
  const deleteFixa = (id) => { const u = fixas.filter(f => f.id !== id); setFixas(u); try { localStorage.setItem(LS_FIXAS, JSON.stringify(u)); } catch(e) {} showToast("Removida", "trash"); };

  // Caloteiros
  const [caloteiros, setCaloteiros] = useState(() => {
    try { const s = localStorage.getItem(LS_CALOTEIROS); if (s) return JSON.parse(s); } catch(e) {}
    return [];
  });
  const addCaloteiro = (c) => { const u = [...caloteiros, { ...c, id: uid(), pago: false, parcPaga: 0 }]; setCaloteiros(u); try { localStorage.setItem(LS_CALOTEIROS, JSON.stringify(u)); } catch(e) {} showToast("Devedor adicionado"); };
  const deleteCaloteiro = (id) => { const u = caloteiros.filter(c => c.id !== id); setCaloteiros(u); try { localStorage.setItem(LS_CALOTEIROS, JSON.stringify(u)); } catch(e) {} showToast("Removido", "trash"); };
  const toggleCaloteiro = (id) => {
    const u = caloteiros.map(c => {
      if (c.id !== id) return c;
      const parcelas = c.parcelas || 1;
      if (c.pago) return { ...c, pago: false, parcPaga: 0 };
      if (parcelas > 1) {
        const newParcPaga = (c.parcPaga || 0) + 1;
        return { ...c, parcPaga: newParcPaga, pago: newParcPaga >= parcelas };
      }
      return { ...c, pago: true };
    });
    setCaloteiros(u); try { localStorage.setItem(LS_CALOTEIROS, JSON.stringify(u)); } catch(e) {}
  };

  // Empréstimos
  const [emprestimos, setEmprestimos] = useState(() => {
    try { const s = localStorage.getItem(LS_EMPRESTIMOS); if (s) return JSON.parse(s); } catch(e) {}
    return [];
  });
  const addEmprestimo = (e) => { const u = [...emprestimos, { ...e, id: uid() }]; setEmprestimos(u); try { localStorage.setItem(LS_EMPRESTIMOS, JSON.stringify(u)); } catch(e) {} showToast("Empréstimo adicionado"); };
  const deleteEmprestimo = (id) => { const u = emprestimos.filter(e => e.id !== id); setEmprestimos(u); try { localStorage.setItem(LS_EMPRESTIMOS, JSON.stringify(u)); } catch(e) {} showToast("Removido", "trash"); };
  const updateEmprestimo = (id, changes) => { const u = emprestimos.map(e => e.id === id ? { ...e, ...changes } : e); setEmprestimos(u); try { localStorage.setItem(LS_EMPRESTIMOS, JSON.stringify(u)); } catch(e) {} };

  const addCard = (card) => {
    const updated = [...cards, card];
    setCards(updated);
    try { localStorage.setItem(LS_CARDS, JSON.stringify(updated)); } catch (e) {}
  };

  const deleteCard = (id) => {
    const linked = expenses.filter(e => e.cardId === id).length;
    const doDelete = () => {
      const updated = cards.filter(c => c.id !== id);
      setCards(updated);
      try { localStorage.setItem(LS_CARDS, JSON.stringify(updated)); } catch (e) {}
      showToast("Cartão excluído", "trash");
    };
    if (linked > 0) {
      askConfirm({
        title: "Excluir cartão?",
        message: `Há ${linked} lançamento${linked > 1 ? "s" : ""} vinculado${linked > 1 ? "s" : ""}. Eles não serão removidos, mas perderão o vínculo com este cartão.`,
        confirmLabel: "Excluir mesmo assim", danger: true, onConfirm: doDelete,
      });
    } else doDelete();
  };

  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState({ msg: "", icon: "check" });
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [quick, setQuick] = useState("");

  // filtros globais (período, categoria, busca)
  const [period, setPeriod] = useState("mes-atual");
  const [cat, setCat]       = useState("all");
  const [search, setSearch] = useState("");

  // filtros de tipo/cartão ficam aqui para o FilterSheet poder ser renderizado no App
  const [tipoFilter, setTipoFilter] = useState("all");
  const [cardIdFilter, setCardIdFilter] = useState("all");
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  useEffect(() => { try { localStorage.setItem(LS_KEY,  JSON.stringify(expenses)); } catch (e) {} }, [expenses]);
  useEffect(() => { try { localStorage.setItem(LS_SET,  JSON.stringify(settings)); } catch (e) {} }, [settings]);

  useEffect(() => {
    document.body.classList.toggle("no-anim", !settings.animations);
    document.body.classList.toggle("no-glow", !settings.glow);
    document.body.classList.toggle("light-mode", !!settings.lightMode);
  }, [settings.animations, settings.glow, settings.lightMode]);

  // Notificacoes diarias
  useEffect(() => {
    if (!profile || settings.notificacoes === false) return;
    if (!('Notification' in window)) return;
    const today = new Date();
    const todayDay = today.getDate();
    const todayKey = todayISO();
    const dispararNotifs = () => {
      if (Notification.permission !== 'granted') return;
      if (localStorage.getItem('cofrinho_notif_day') === todayKey) return;
      const notifs = [];
      (cards || []).forEach(card => {
        if (card.diaFechamento === todayDay) notifs.push({ title: String.fromCodePoint(0x1F4B3) + ' Fatura fecha hoje — ' + card.nome, body: 'O período de compras do ' + card.nome + ' fecha hoje.' });
      });
      (cards || []).forEach(card => {
        const fatura = (computeFaturas([card], expenses, faturaOverrides) || []).find(f => f.total > 0 && f.status !== 'paga');
        if (!fatura) return;
        const [fy, fm] = fatura.mes.split('-').map(Number);
        const dueDate = new Date(fy, fm, card.diaVencimento);
        const diff = Math.ceil((dueDate - today) / 86400000);
        if (diff === 0) notifs.push({ title: '⚠️ Fatura vence HOJE — ' + card.nome, body: fmtBRL(fatura.total) + ' — pague hoje para evitar juros!' });
        else if (diff === 1) notifs.push({ title: '📅 Fatura vence amanhã — ' + card.nome, body: fmtBRL(fatura.total) + ' — último dia amanhã' });
      });
      (caloteiros || []).filter(c => !c.pago && c.alertaDia === todayDay).forEach(c => {
        notifs.push({ title: '🔔 Cobrar ' + c.nome + ' hoje!', body: 'Não esqueça de cobrar ' + c.nome + ' — ' + fmtBRL(c.valor) });
      });
      if (!notifs.length) return;
      localStorage.setItem('cofrinho_notif_day', todayKey);
      const sw = navigator.serviceWorker && navigator.serviceWorker.controller;
      notifs.forEach((n, i) => setTimeout(() => { try { if (sw) sw.postMessage({ type: 'SHOW_NOTIFICATION', title: n.title, body: n.body }); else new Notification(n.title, { body: n.body, icon: '/icon-192.png' }); } catch(_){} }, i * 800));
    };
    if (Notification.permission === 'granted') dispararNotifs();
    else if (Notification.permission === 'default') Notification.requestPermission().then(p => { if (p === 'granted') dispararNotifs(); });
  }, [profile, settings.notificacoes]);

  const showToast = useCallback((msg, icon = "check") => {
    setToast({ msg, icon });
    setTimeout(() => setToast({ msg: "", icon: "check" }), 2400);
  }, []);

  // Confirmação elegante (substitui window.confirm). Uso: askConfirm({ title, message, onConfirm })
  const askConfirm = useCallback((opts) => setConfirmDialog(opts), []);

  // Handlers estáveis do modal — permitem React.memo nas linhas da lista (não recriam a cada render)
  const openAdd = useCallback(() => setModal({}), []);
  const openEdit = useCallback((e) => setModal(e), []);

  // Refs com os valores mais recentes — mantêm callbacks estáveis sem depender de expenses/settings
  const expensesRef = useRef(expenses); expensesRef.current = expenses;
  const settingsRef = useRef(settings); settingsRef.current = settings;

  // Modo leve: auto (muitos dados ou aparelho fraco) OU manual (settings.perfLite)
  // perf-lite: para animações de blob/grain, reduz backdrop-filter, ativa content-visibility
  // no-decor: esconde decorações temáticas (pétalas, partículas, etc.) — SOMENTE no manual
  useEffect(() => {
    const lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
    const auto = expenses.length > 250 || lowEnd;
    document.body.classList.toggle("perf-lite", auto || !!settings.perfLite);
    document.body.classList.toggle("no-decor", !!settings.perfLite || !settings.animations);
  }, [expenses.length, settings.perfLite, settings.animations]);

  // Busca com debounce — a lista só refiltra quando o usuário para de digitar
  const debouncedSearch = useDebouncedValue(search, 200);

  // ---------- Filtragem global (sem tipo/cartão — esses ficam em GastosView) ----------
  const filtered = useMemo(() => {
    let arr = [...expenses];
    if (period === "mes-atual") {
      const now = new Date();
      const first = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      arr = arr.filter(e => e.data >= first);
    } else if (period === "mes-anterior") {
      const now = new Date();
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const firstPrev = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-01`;
      const firstCurr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      arr = arr.filter(e => e.data >= firstPrev && e.data < firstCurr);
    } else if (period !== "all") {
      const min = addDays(todayISO(), -parseInt(period));
      arr = arr.filter(e => e.data >= min);
    }
    if (cat !== "all") arr = arr.filter(e => e.categoria === cat);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      arr = arr.filter(e => e.descricao.toLowerCase().includes(q));
    }
    return arr.sort((a, b) => b.data.localeCompare(a.data) || b.valor - a.valor);
  }, [expenses, period, cat, debouncedSearch]);

  const total = useMemo(() =>
    filtered.filter(e => e.kind !== "entrada").reduce((s, e) => s + e.valor, 0),
    [filtered]);

  const byCat = useMemo(() => {
    const map = {};
    filtered.filter(e => e.kind !== "entrada").forEach(e => {
      map[e.categoria] = (map[e.categoria] || 0) + e.valor;
    });
    return allCats
      .map(c => ({ id: c.id, nome: c.nome, hex: c.hex, valor: map[c.id] || 0 }))
      .filter(c => c.valor > 0)
      .sort((a, b) => b.valor - a.valor);
  }, [filtered, allCats]);

  // ---------- Ações ----------
  const saveTransaction = (exp) => {
    const isEditing = !!modal?.id;
    if (!isEditing && exp.kind === "gasto" && exp.forma === "parcelado" && exp.parcTotal > 1) {
      // Fix rounding: base value for N-1 parcels, last absorbs remainder
      const baseVal = Math.round((exp.valor / exp.parcTotal) * 100) / 100;
      const lastVal = Math.round((exp.valor - baseVal * (exp.parcTotal - 1)) * 100) / 100;
      const grupo = uid();
      const linkedCard = exp.cardId ? cards.find(c => c.id === exp.cardId) : null;
      const parcList = Array.from({ length: exp.parcTotal }, (_, i) => {
        const parcelData = addMonths(exp.data, i);
        const parcelVal = i === exp.parcTotal - 1 ? lastVal : baseVal;
        return {
          ...exp, id: uid(), data: parcelData,
          valor: parcelVal,
          descricao: `${exp.descricao} (${i + 1}/${exp.parcTotal})`,
          parcNum: i + 1, parcGrupo: grupo,
          faturaRef: linkedCard ? calcFaturaRef(parcelData, linkedCard) : (exp.faturaRef || null),
        };
      });
      setExpenses(prev => [...parcList, ...prev]);
      setModal(null);
      showToast(`${exp.parcTotal}× de ${fmtBRL(baseVal)} adicionadas`);
    } else {
      setExpenses(prev => {
        const exists = prev.some(e => e.id === exp.id);
        return exists ? prev.map(e => e.id === exp.id ? exp : e) : [exp, ...prev];
      });
      setModal(null);
      showToast(
        isEditing
          ? (exp.kind === "entrada" ? "Entrada atualizada" : "Gasto atualizado")
          : (exp.kind === "entrada" ? "Entrada adicionada!" : "Gasto adicionado!")
      );
    }
  };

  const deleteExpense = useCallback((id) => {
    const exp = expensesRef.current.find(e => e.id === id);
    const doDelete = () => {
      setExpenses(prev => prev.filter(e => e.id !== id));
      showToast(exp?.kind === "entrada" ? "Entrada excluída" : "Gasto excluído", "trash");
    };
    if (settingsRef.current.confirmDelete) {
      askConfirm({
        title: exp?.kind === "entrada" ? "Excluir entrada?" : "Excluir gasto?",
        message: exp?.descricao ? `"${exp.descricao}" será removido permanentemente.` : "Esta ação não pode ser desfeita.",
        confirmLabel: "Excluir", danger: true, onConfirm: doDelete,
      });
    } else doDelete();
  }, [showToast, askConfirm]);

  const deleteExpenseGroup = useCallback((parcGrupo) => {
    const group = expensesRef.current.filter(e => e.parcGrupo === parcGrupo);
    if (!group.length) return;
    const doDelete = () => {
      setExpenses(prev => prev.filter(e => e.parcGrupo !== parcGrupo));
      showToast(`${group.length} parcelas excluídas`, "trash");
    };
    if (settingsRef.current.confirmDelete) {
      askConfirm({
        title: "Excluir parcelamento?",
        message: `Todas as ${group.length} parcelas deste lançamento serão removidas.`,
        confirmLabel: "Excluir tudo", danger: true, onConfirm: doDelete,
      });
    } else doDelete();
  }, [showToast, askConfirm]);

  const importExpenses = (list) => {
    if (!list.length) return;
    setExpenses(prev => [...list, ...prev]);
    // Extrato de meses anteriores ficaria oculto pelo filtro "Este mês" —
    // amplia o período para que tudo que acabou de entrar fique visível
    const now = new Date();
    const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    if (list.some(e => e.data < firstOfMonth)) setPeriod("all");
    showToast(`${list.length} lançamento${list.length > 1 ? "s" : ""} importado${list.length > 1 ? "s" : ""}`);
    setPage("gastos");
  };

  const submitQuick = () => {
    const parsed = parseQuick(quick);
    if (!parsed) { showToast("Não entendi — tente: \"Gastei R$50 com comida\""); return; }
    if (parsed.kind !== "entrada" && !settings.autoCat) parsed.categoria = "outros";
    setExpenses(prev => [parsed, ...prev]);
    setQuick("");
    showToast(
      parsed.kind === "entrada"
        ? `+${fmtBRL(parsed.valor)} entrada adicionada`
        : `+${fmtBRL(parsed.valor)} · ${CAT_MAP[parsed.categoria]?.nome || parsed.categoria}`
    );
  };

  const resetData = () => { setExpenses(seedData()); showToast("Dados de exemplo restaurados"); };

  const restoreBackup = (data) => {
    if (data.expenses) setExpenses(data.expenses);
    if (data.cards) { setCards(data.cards); try { localStorage.setItem(LS_CARDS, JSON.stringify(data.cards)); } catch (e) {} }
    if (data.fixas) { setFixas(data.fixas); try { localStorage.setItem(LS_FIXAS, JSON.stringify(data.fixas)); } catch (e) {} }
    if (data.caloteiros) { setCaloteiros(data.caloteiros); try { localStorage.setItem(LS_CALOTEIROS, JSON.stringify(data.caloteiros)); } catch (e) {} }
    if (data.emprestimos) { setEmprestimos(data.emprestimos); try { localStorage.setItem(LS_EMPRESTIMOS, JSON.stringify(data.emprestimos)); } catch (e) {} }
    showToast(`${(data.expenses || []).length} lançamentos restaurados`);
  };

  const meta = PAGE_META[page];
  const userName = profile?.name || "Luiz Ricardo";

  if (!profile) {
    return <OnboardingPage onEnter={(p) => setProfile(p)} />;
  }

  return (
    <div className="app">
      <aside className="sidebar glass">
        <div className="brand">
          <div className="brand-mark"><Ic.coins size={22} color="#06251a" /></div>
          <div>
            <div className="brand-name">Cofrinho</div>
            <div className="brand-sub">Controle de gastos</div>
          </div>
        </div>
        <nav className="nav">
          <div className="nav-label">Menu</div>
          {NAV.map(n => {
            const I = n.icon;
            return (
              <div key={n.id} className={"nav-item" + (page === n.id ? " active" : "")}
                onClick={() => setPage(n.id)}>
                <I size={19} />{n.nome}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="avatar">{userName.slice(0, 2).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main glass">
        <div className="main-scroll">
          <div key={page} className="page-enter">
            {page !== "home" && (
              <div className="page-head">
                <div>
                  <h1 className="page-title">{meta.t}</h1>
                  {meta.s && <div className="page-sub">{meta.s}</div>}
                </div>
              </div>
            )}


{page === "home" && (
              <HomeView expenses={expenses} budget={settings.budget} cards={cards} userName={userName}
                faturaOverrides={faturaOverrides}
                onAdd={openAdd} onEdit={openEdit}
                onDelete={deleteExpense} onDeleteGroup={deleteExpenseGroup}
                onGoToFaturas={() => setPage("faturas")}
                fixas={fixas} caloteiros={caloteiros}
                onGoToConfig={() => { setGastosInitialTab("fixas"); setPage("gastos"); }} />
            )}
            {page === "dashboard" && (
              <DashboardView expenses={expenses} filtered={filtered} byCat={byCat} total={total}
                onEdit={openEdit} onDelete={deleteExpense} onDeleteGroup={deleteExpenseGroup}
                onAdd={openAdd} budget={settings.budget} cards={cards} />
            )}
            {page === "gastos" && (
              <GastosView filtered={filtered} total={total} byCat={byCat}
                onEdit={openEdit} onDelete={deleteExpense} onDeleteGroup={deleteExpenseGroup}
                onAdd={openAdd} onImport={importExpenses} allCats={allCats} cards={cards}
                tipoFilter={tipoFilter} setTipoFilter={setTipoFilter}
                cardIdFilter={cardIdFilter} setCardIdFilter={setCardIdFilter}
                onOpenFilterSheet={() => setShowFilterSheet(true)}
                expenses={expenses} faturaOverrides={faturaOverrides}
                onMarkPaid={markFaturaPaid} onUnmarkPaid={unmarkFaturaPaid}
                emprestimos={emprestimos} onAddEmprestimo={addEmprestimo} onDeleteEmprestimo={deleteEmprestimo} onUpdateEmprestimo={updateEmprestimo}
                fixas={fixas} onAddFixa={addFixa} onDeleteFixa={deleteFixa}
                caloteiros={caloteiros} onAddCaloteiro={addCaloteiro} onToggleCaloteiro={toggleCaloteiro} onDeleteCaloteiro={deleteCaloteiro}
                onAddCard={addCard} onDeleteCard={deleteCard}
                initialTab={gastosInitialTab}
                {...{ period, setPeriod, cat, setCat, search, setSearch }} />
            )}
            {page === "faturas" && (
              <FaturasView
                cards={cards} expenses={expenses}
                faturaOverrides={faturaOverrides}
                onMarkPaid={markFaturaPaid}
                onUnmarkPaid={unmarkFaturaPaid}
                onEdit={openEdit}
                onDelete={deleteExpense}
                onDeleteGroup={deleteExpenseGroup}
              />
            )}
            {page === "relatorios" && (
              <RelatoriosView expenses={expenses} byCat={byCat} total={total} />
            )}
            {page === "config" && (
              <ConfigView settings={settings} setSettings={setSettings} onReset={resetData}
                allCats={allCats} onAddCat={addCustomCat} onDeleteCat={deleteCustomCat}
                cards={cards} onAddCard={addCard} onDeleteCard={deleteCard}
                currentTheme={profile?.theme || "default"} onThemeChange={handleThemeChange}
                onResetProfile={resetProfile}
                expenses={expenses} customCats={customCats}
                onRestoreBackup={restoreBackup} askConfirm={askConfirm} showToast={showToast}
                fixas={fixas} onAddFixa={addFixa} onDeleteFixa={deleteFixa}
                caloteiros={caloteiros} onAddCaloteiro={addCaloteiro} onToggleCaloteiro={toggleCaloteiro} onDeleteCaloteiro={deleteCaloteiro}
                emprestimos={emprestimos} />
            )}
          </div>
        </div>
      </main>

      <BottomNav page={page} setPage={(p) => { if (p === "gastos") setGastosInitialTab("lancamentos"); setPage(p); }} onAdd={openAdd} />

      {showFilterSheet && (
        <FilterSheet
          allCats={allCats} cards={cards}
          cat={cat} setCat={setCat}
          tipoFilter={tipoFilter} setTipoFilter={setTipoFilter}
          cardIdFilter={cardIdFilter} setCardIdFilter={setCardIdFilter}
          onClose={() => setShowFilterSheet(false)}
        />
      )}

      {modal !== null && (
        <ExpenseModal initKind={modal?.kind || "gasto"} initial={modal && modal.id ? modal : null}
          onSave={saveTransaction} onClose={() => setModal(null)} allCats={allCats} cards={cards} />
      )}
      <PetalDecor  theme={profile?.theme} />
      <AcidDecor   theme={profile?.theme} />
      <ChromeDecor theme={profile?.theme} />
      <SweetDecor  theme={profile?.theme} />
      <FancyDecor  theme={profile?.theme} />
      <JumpDecor   theme={profile?.theme} />
      {confirmDialog && (
        <ConfirmDialog
          {...confirmDialog}
          onConfirm={() => { confirmDialog.onConfirm?.(); setConfirmDialog(null); }}
          onClose={() => setConfirmDialog(null)}
        />
      )}
      <Toast msg={toast.msg} icon={toast.icon} />
    </div>
  );
}

function BottomNav({ page, setPage, onAdd }) {
  const LEFT  = [{ id: "home", icon: Ic.home }, { id: "gastos", icon: Ic.wallet }];
  const RIGHT = [{ id: "dashboard", icon: Ic.dashboard }, { id: "config", icon: Ic.person }];
  return (
    <nav className="bottom-nav">
      {LEFT.map(n => {
        const I = n.icon;
        return (
          <div key={n.id} className={"bottom-nav-item" + (page === n.id ? " active" : "")}
            onClick={() => setPage(n.id)}>
            <I size={24} />
          </div>
        );
      })}
      <button className="bottom-nav-fab" onClick={onAdd}>
        <Ic.plus size={26} />
      </button>
      {RIGHT.map(n => {
        const I = n.icon;
        return (
          <div key={n.id} className={"bottom-nav-item" + (page === n.id ? " active" : "")}
            onClick={() => setPage(n.id)}>
            <I size={24} />
          </div>
        );
      })}
    </nav>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

/* Auto-update do PWA: quando o app da tela de início volta ao primeiro plano,
   compara a versão local (?v= dos assets) com o index.html publicado.
   Se saiu versão nova → recarrega sozinho. Sem constante manual: a versão
   é lida do próprio <link> de styles.css, então o bump via sed já basta. */
(function setupAutoUpdate() {
  const readV = (s) => (String(s).match(/styles\.css\?v=(\d+)/) || [])[1];
  const link = document.querySelector('link[href*="styles.css"]');
  const current = link ? readV(link.getAttribute("href")) : null;
  if (!current) return;
  let reloading = false;
  const check = () => {
    fetch("index.html", { cache: "no-store" })
      .then(r => r.text())
      .then(html => {
        const latest = readV(html);
        if (latest && latest !== current && !reloading) {
          reloading = true;
          location.reload();
        }
      })
      .catch(() => {});
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });
  setInterval(check, 5 * 60 * 1000);
  setTimeout(check, 4000);
})();

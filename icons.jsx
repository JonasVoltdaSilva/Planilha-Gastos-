/* ============================================================
   Ícones — stroke line icons (simples, padrão UI)
   ============================================================ */
const Ic = {};

function mk(name, paths, opts = {}) {
  Ic[name] = ({ size = 20, ...p } = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={opts.sw || 1.8}
      strokeLinecap="round" strokeLinejoin="round" {...p}>
      {paths}
    </svg>
  );
}

mk("dashboard", <>
  <rect x="3" y="3" width="7" height="9" rx="1.5" />
  <rect x="14" y="3" width="7" height="5" rx="1.5" />
  <rect x="14" y="12" width="7" height="9" rx="1.5" />
  <rect x="3" y="16" width="7" height="5" rx="1.5" />
</>);

mk("wallet", <>
  <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1" />
  <path d="M3 7.5V17a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-2" />
  <path d="M20 9.5h-4a2.5 2.5 0 0 0 0 5h4a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1Z" />
  <circle cx="16" cy="12" r="0.6" fill="currentColor" />
</>);

mk("chart", <>
  <path d="M3 3v18h18" />
  <path d="M7 15l3.5-4 3 2.5L20 7" />
</>);

mk("settings", <>
  <circle cx="12" cy="12" r="3" />
  <path d="M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5" />
</>);

mk("sparkle", <>
  <path d="M12 3v4M12 17v4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M3 12h4M17 12h4M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
</>);

mk("plus", <><path d="M12 5v14M5 12h14" strokeWidth="2.1" /></>);
mk("search", <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>);
mk("trash", <>
  <path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
  <path d="M5.5 6 6.5 19a2 2 0 0 0 2 1.9h7a2 2 0 0 0 2-1.9L18.5 6" />
</>);
mk("edit", <>
  <path d="M12 20h9" />
  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
</>);
mk("check", <><path d="M20 6 9 17l-5-5" strokeWidth="2.1" /></>);
mk("calendar", <>
  <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
  <path d="M3 9h18M8 2.5v4M16 2.5v4" />
</>);
mk("trendDown", <><path d="m3 7 6 6 4-4 8 8" /><path d="M21 17v-5h-5" /></>);
mk("trendUp", <><path d="m3 17 6-6 4 4 8-8" /><path d="M21 7v5h-5" /></>);
mk("coins", <>
  <ellipse cx="9" cy="6.5" rx="6" ry="3" />
  <path d="M3 6.5v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
  <path d="M3 11.5v5c0 1.7 2.7 3 6 3 1 0 2-.1 2.8-.3" />
  <ellipse cx="17" cy="15" rx="4" ry="2.2" />
  <path d="M13 15v3c0 1.2 1.8 2.2 4 2.2s4-1 4-2.2v-3" />
</>);
mk("menu", <><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" /></>);
mk("close", <><path d="M6 6l12 12M18 6 6 18" strokeWidth="2" /></>);
mk("receipt", <>
  <path d="M5 3.5h14v17l-2.3-1.4-2.3 1.4-2.4-1.4L9.6 20.5 7.3 19.1 5 20.5Z" />
  <path d="M9 8h6M9 12h6" />
</>);
mk("download", <><path d="M12 3v12M7 11l5 5 5-5" /><path d="M5 21h14" /></>);
mk("filter", <><path d="M3 5h18l-7 8v6l-4-2v-4Z" /></>);
mk("target", <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /></>);
mk("home", <>
  <path d="M3 12L12 4l9 8" />
  <path d="M5 10v10h5v-5h4v5h5V10" />
</>);
mk("upload", <>
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="M17 8l-5-5-5 5" />
  <path d="M12 3v12" />
</>);

mk("card", <>
  <rect x="2" y="5" width="20" height="14" rx="2.5" />
  <path d="M2 10h20" />
  <path d="M6 15h3M13 15h3" />
</>);
mk("bell", <>
  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
</>);
mk("invoice", <>
  <rect x="4" y="2" width="16" height="20" rx="2" />
  <path d="M8 7h8M8 11h8M8 15h5" />
</>);
mk("chevron", <><path d="M6 9l6 6 6-6" strokeWidth="2" /></>);

window.Ic = Ic;

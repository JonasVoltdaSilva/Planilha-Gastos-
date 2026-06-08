/* ============================================================
   Ícones — Phosphor Icons (phosphoricons.com)
   Peso duotone: fill 20% + outline — profundidade sem poluição visual
   Pesos bold/regular onde a função exige mais ou menos presença
   ============================================================ */
const Ic = {};

/* n = nome Phosphor, w = weight (duotone | bold | regular) */
const PH = {
  dashboard:  { n: "squares-four",      w: "duotone" },
  wallet:     { n: "wallet",            w: "duotone" },
  chart:      { n: "chart-line",        w: "duotone" },
  settings:   { n: "gear",              w: "duotone" },
  person:     { n: "user",              w: "duotone" },
  sparkle:    { n: "sparkle",           w: "duotone" },
  plus:       { n: "plus",              w: "bold"    },
  search:     { n: "magnifying-glass",  w: "duotone" },
  trash:      { n: "trash",             w: "duotone" },
  edit:       { n: "pencil-simple",     w: "duotone" },
  check:      { n: "check",             w: "bold"    },
  calendar:   { n: "calendar",          w: "duotone" },
  trendDown:  { n: "trend-down",        w: "duotone" },
  trendUp:    { n: "trend-up",          w: "duotone" },
  coins:      { n: "coins",             w: "duotone" },
  menu:       { n: "list",              w: "bold"    },
  close:      { n: "x",                w: "bold"    },
  receipt:    { n: "receipt",           w: "duotone" },
  download:   { n: "download-simple",   w: "duotone" },
  filter:     { n: "funnel",            w: "duotone" },
  target:     { n: "target",            w: "duotone" },
  home:       { n: "house",             w: "duotone" },
  upload:     { n: "upload-simple",     w: "duotone" },
  card:       { n: "credit-card",       w: "duotone" },
  bell:       { n: "bell",              w: "duotone" },
  invoice:    { n: "file-text",         w: "duotone" },
  chevron:    { n: "caret-down",        w: "regular" },
};

Object.entries(PH).forEach(([key, { n: phName, w: weight }]) => {
  Ic[key] = ({
    size = 20,
    color,
    /* ignorar props SVG que não se aplicam a <i> */
    fill, stroke, strokeWidth, strokeLinecap, strokeLinejoin, viewBox,
    style: styleProp,
    className: cls = "",
    ...rest
  } = {}) => (
    <i
      className={`ph-${weight} ph-${phName}${cls ? " " + cls : ""}`}
      style={{
        fontSize:      size,
        color:         color || "currentColor",
        fontStyle:     "normal",
        lineHeight:    1,
        display:       "inline-flex",
        alignItems:    "center",
        justifyContent:"center",
        flexShrink:    0,
        ...styleProp,
      }}
      {...rest}
    />
  );
});

window.Ic = Ic;

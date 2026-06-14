/* ============================================================
   Build — pré-compila JSX → JS (preset-react, runtime clássico)
   Remove a necessidade do Babel Standalone no navegador.
   Uso: npm run build   (depois de editar qualquer arquivo .jsx)
   ============================================================ */
const babel = require("@babel/core");
const fs = require("fs");

// Ordem de carregamento (igual à do index.html). Escopo global compartilhado.
const FILES = ["icons", "data", "onboarding", "chart", "modal", "views", "app"];

const banner = "/* GERADO AUTOMATICAMENTE a partir de %s.jsx — não edite à mão. Rode: npm run build */\n";

let ok = 0;
for (const f of FILES) {
  const src = `${f}.jsx`;
  if (!fs.existsSync(src)) { console.error("✗ faltando:", src); process.exit(1); }
  const { code } = babel.transformFileSync(src, {
    // sourceType "script": mantém escopo global não-strict, como o navegador faz
    // com <script> clássico (leitura de globais por nome simples funciona).
    sourceType: "script",
    presets: [["@babel/preset-react", { runtime: "classic" }]],
    compact: false,
    comments: false,
  });
  // IIFE por arquivo: replica o escopo isolado que o Babel Standalone dava a cada
  // <script type="text/babel">. Sem isso, `const { useMemo } = React` repetido em
  // arquivos diferentes colide ("already declared"). O compartilhamento entre
  // arquivos continua via window.* (Object.assign(window, …)).
  const wrapped = banner.replace("%s", f) + "(function () {\n" + code + "\n})();\n";
  fs.writeFileSync(`${f}.js`, wrapped);
  console.log("✓", `${f}.jsx → ${f}.js`);
  ok++;
}
console.log(`\n${ok}/${FILES.length} arquivos compilados.`);

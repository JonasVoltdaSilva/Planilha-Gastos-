/* ============================================================
   Dados, categorias, helpers e parser de linguagem natural
   ============================================================ */

const CATEGORIES = [
  { id: "comida",     nome: "Comida",      cor: "var(--cat-comida)",     hex: "#e0a85a" },
  { id: "transporte", nome: "Transporte",  cor: "var(--cat-transporte)", hex: "#5aa3e0" },
  { id: "moradia",    nome: "Moradia",     cor: "var(--cat-moradia)",    hex: "#a98ae0" },
  { id: "lazer",      nome: "Lazer",       cor: "var(--cat-lazer)",      hex: "#5ad9a8" },
  { id: "saude",      nome: "Saúde",       cor: "var(--cat-saude)",      hex: "#e08a7a" },
  { id: "compras",    nome: "Compras",     cor: "var(--cat-compras)",    hex: "#e08ac8" },
  { id: "contas",     nome: "Contas",      cor: "var(--cat-contas)",     hex: "#5ac4d9" },
  { id: "outros",     nome: "Outros",      cor: "var(--cat-outros)",     hex: "#9aa3b0" },
];

// CAT_MAP é mutável: categorias personalizadas são adicionadas dinamicamente
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

const TIPOS = [
  { id: "pix",     nome: "PIX",     hex: "#5ad9a8" },
  { id: "debito",  nome: "Débito",  hex: "#5aa3e0" },
  { id: "credito", nome: "Crédito", hex: "#a98ae0" },
  { id: "outros",  nome: "Outros",  hex: "#9aa3b0" },
];
const TIPO_MAP = Object.fromEntries(TIPOS.map(t => [t.id, t]));

// Paleta de cores para categorias personalizadas
const CAT_PRESET_COLORS = [
  "#e05a5a", "#e09a5a", "#e0d05a", "#8ae05a",
  "#5ae0a0", "#5ab5e0", "#a05ae0", "#e05ab0",
];

const KEYWORDS = {
  comida: ["comida","almoço","almoco","jantar","lanche","café","cafe","restaurante","ifood","mercado","supermercado","padaria","pizza","hambúrguer","hamburguer","feira","açaí","acai","bar","cerveja"],
  transporte: ["transporte","uber","99","gasolina","combustível","combustivel","ônibus","onibus","metrô","metro","passagem","estacionamento","pedágio","pedagio","carro","táxi","taxi","bilhete"],
  moradia: ["aluguel","moradia","condomínio","condominio","casa","apartamento","reforma","móveis","moveis"],
  lazer: ["lazer","cinema","show","viagem","jogo","game","netflix","spotify","streaming","festa","passeio","parque","academia","hobby"],
  saude: ["saúde","saude","remédio","remedio","farmácia","farmacia","médico","medico","consulta","dentista","exame","plano","psicólogo","psicologo"],
  compras: ["compras","roupa","roupas","tênis","tenis","sapato","loja","presente","eletrônico","eletronico","celular","amazon","shopping"],
  contas: ["conta","contas","luz","água","agua","energia","internet","telefone","boleto","fatura","cartão","cartao","imposto","gás","gas","assinatura"],
};

const fmtBRL = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtBRLshort = (n) => {
  if (n >= 1000) return "R$ " + (n / 1000).toFixed(1).replace(".", ",") + "k";
  return fmtBRL(n);
};
const fmtDate = (iso) => {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
};
const fmtDateLong = (iso) => {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};
const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (iso, n) => {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const uid = () => Math.random().toString(36).slice(2, 10);

function detectCategory(text) {
  const t = text.toLowerCase();
  for (const c of CATEGORIES) {
    if (c.id === "outros") continue;
    const kws = KEYWORDS[c.id] || [];
    if (kws.some(k => t.includes(k))) return c.id;
  }
  return "outros";
}

function detectTipo(text) {
  const t = text.toLowerCase();
  if (t.includes("pix")) return "pix";
  if (t.includes("débito") || t.includes("debito") || / deb /i.test(text)) return "debito";
  if (t.includes("crédito") || t.includes("credito") || t.includes("cartão") || t.includes("cartao") || / cred /i.test(text)) return "credito";
  return "outros";
}

function parseQuick(text) {
  if (!text || !text.trim()) return null;
  const raw = text.trim();
  const m = raw.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/i);
  if (!m) return null;
  let numStr = m[1];
  if (numStr.includes(",")) numStr = numStr.replace(/\./g, "").replace(",", ".");
  const valor = parseFloat(numStr);
  if (isNaN(valor) || valor <= 0) return null;

  const categoria = detectCategory(raw);
  const tipo = detectTipo(raw);

  let desc = raw
    .replace(/gastei|paguei|comprei|gasto/gi, "")
    .replace(/r\$\s*[\d.,]+/i, "")
    .replace(/\b[\d.,]+\b/, "")
    .replace(/^\s*(com|no|na|de|em|para|pra|reais?)\s+/i, " ")
    .replace(/\s+(com|no|na|de|em)\s+/i, " ")
    .trim();
  desc = desc.replace(/\s{2,}/g, " ").trim();
  if (!desc) desc = CAT_MAP[categoria]?.nome || "Gasto";
  desc = desc.charAt(0).toUpperCase() + desc.slice(1);

  return { valor, categoria, descricao: desc, tipo };
}

// Analisa texto colado de extrato bancário
function parseStatement(text) {
  if (!text || !text.trim()) return [];
  const results = [];
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Pula cabeçalhos e linhas sem valor monetário
    if (/saldo|extrato|período|periodo|limite|agência|agencia|cpf|cnpj|data\s+desc/i.test(line)) continue;

    // Encontra valor monetário
    const amtMatch = line.match(/R?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})/i);
    if (!amtMatch) continue;

    const numStr = amtMatch[1].replace(/\./g, "").replace(",", ".");
    const valor = parseFloat(numStr);
    if (isNaN(valor) || valor <= 0 || valor > 100000) continue;

    // Pula entradas de crédito (dinheiro recebido)
    if (/\bcr\b|crédito recebido|recebimento pix|pix recebido|transferência recebida|ted recebida/i.test(line)) continue;

    // Encontra data
    const dateMatch = line.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
    let iso;
    if (dateMatch) {
      const d = dateMatch[1].padStart(2, "0");
      const mo = dateMatch[2].padStart(2, "0");
      const y = dateMatch[3]
        ? (dateMatch[3].length === 2 ? "20" + dateMatch[3] : dateMatch[3])
        : new Date().getFullYear().toString();
      iso = `${y}-${mo}-${d}`;
    } else {
      iso = todayISO();
    }

    // Monta descrição removendo data e valor
    let desc = line
      .replace(amtMatch[0], "")
      .replace(/\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/, "")
      .replace(/\s+/g, " ").trim();
    if (!desc || desc.length < 2) desc = "Gasto importado";
    if (desc.length > 80) desc = desc.slice(0, 80);

    results.push({
      id: uid(),
      data: iso,
      descricao: desc,
      categoria: detectCategory(desc),
      valor,
      tipo: detectTipo(line),
    });
  }

  return results;
}

function seedData() {
  const t = todayISO();
  const raw = [
    [0,  "Almoço no restaurante",  "comida",     38.5,   "pix"],
    [0,  "Uber para o trabalho",   "transporte",  22.9,  "debito"],
    [1,  "Supermercado da semana", "comida",     247.8,  "debito"],
    [1,  "Netflix",                "lazer",       44.9,  "credito"],
    [2,  "Farmácia — remédios",    "saude",       89.3,  "debito"],
    [3,  "Gasolina",               "transporte", 180.0,  "credito"],
    [4,  "Café da manhã",          "comida",      18.0,  "pix"],
    [5,  "Conta de luz",           "contas",     156.4,  "pix"],
    [6,  "Cinema com amigos",      "lazer",       64.0,  "credito"],
    [7,  "Tênis novo",             "compras",    329.9,  "credito"],
    [8,  "Internet fibra",         "contas",      99.9,  "debito"],
    [9,  "Jantar fora",            "comida",     112.5,  "credito"],
    [10, "Estacionamento",         "transporte",  25.0,  "pix"],
    [12, "Aluguel",                "moradia",   1450.0,  "pix"],
    [13, "Consulta dentista",      "saude",      220.0,  "pix"],
    [14, "Spotify",                "lazer",       21.9,  "credito"],
    [15, "iFood",                  "comida",      56.7,  "pix"],
    [17, "Roupas",                 "compras",    198.0,  "credito"],
    [18, "Água",                   "contas",      78.2,  "pix"],
    [20, "Padaria",                "comida",      32.4,  "pix"],
    [22, "Presente aniversário",   "compras",    145.0,  "credito"],
    [24, "Academia",               "lazer",      119.9,  "debito"],
  ];
  return raw.map(([ago, desc, cat, val, tipo]) => ({
    id: uid(),
    data: addDays(t, -ago),
    descricao: desc,
    categoria: cat,
    valor: val,
    tipo: tipo || "outros",
  })).sort((a, b) => b.data.localeCompare(a.data));
}

Object.assign(window, {
  CATEGORIES, CAT_MAP, TIPOS, TIPO_MAP, CAT_PRESET_COLORS,
  parseQuick, parseStatement, detectCategory, detectTipo,
  fmtBRL, fmtBRLshort, fmtDate, fmtDateLong,
  todayISO, addDays, uid, seedData,
});

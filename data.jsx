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

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// Palavras-chave para o parser de linguagem natural
const KEYWORDS = {
  comida: ["comida", "almoço", "almoco", "jantar", "lanche", "café", "cafe", "restaurante", "ifood", "mercado", "supermercado", "padaria", "pizza", "hambúrguer", "hamburguer", "feira", "açaí", "acai", "bar", "cerveja"],
  transporte: ["transporte", "uber", "99", "gasolina", "combustível", "combustivel", "ônibus", "onibus", "metrô", "metro", "passagem", "estacionamento", "pedágio", "pedagio", "carro", "táxi", "taxi", "bilhete"],
  moradia: ["aluguel", "moradia", "condomínio", "condominio", "casa", "apartamento", "reforma", "móveis", "moveis"],
  lazer: ["lazer", "cinema", "show", "viagem", "jogo", "game", "netflix", "spotify", "streaming", "festa", "passeio", "parque", "academia", "hobby"],
  saude: ["saúde", "saude", "remédio", "remedio", "farmácia", "farmacia", "médico", "medico", "consulta", "dentista", "exame", "plano", "psicólogo", "psicologo"],
  compras: ["compras", "roupa", "roupas", "tênis", "tenis", "sapato", "loja", "presente", "eletrônico", "eletronico", "celular", "amazon", "shopping"],
  contas: ["conta", "contas", "luz", "água", "agua", "energia", "internet", "telefone", "celular", "boleto", "fatura", "cartão", "cartao", "imposto", "gás", "gas", "assinatura"],
};

function detectCategory(text) {
  const t = text.toLowerCase();
  for (const c of CATEGORIES) {
    if (c.id === "outros") continue;
    const kws = KEYWORDS[c.id] || [];
    if (kws.some(k => t.includes(k))) return c.id;
  }
  return "outros";
}

// "Gastei R$50 com comida no almoço" -> { valor, categoria, descricao }
function parseQuick(text) {
  if (!text || !text.trim()) return null;
  const raw = text.trim();
  // captura número: R$50 / 50,90 / 50.90 / 1.250,00
  const m = raw.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/i);
  if (!m) return null;
  let numStr = m[1];
  // normaliza formato pt-BR
  if (numStr.includes(",")) {
    numStr = numStr.replace(/\./g, "").replace(",", ".");
  }
  const valor = parseFloat(numStr);
  if (isNaN(valor) || valor <= 0) return null;

  const categoria = detectCategory(raw);

  // descrição: remove "gastei", o valor, e preposições iniciais
  let desc = raw
    .replace(/gastei|paguei|comprei|gasto/gi, "")
    .replace(/r\$\s*[\d.,]+/i, "")
    .replace(/\b[\d.,]+\b/, "")
    .replace(/^\s*(com|no|na|de|em|para|pra|reais?)\s+/i, " ")
    .replace(/\s+(com|no|na|de|em)\s+/i, " ")
    .trim();
  desc = desc.replace(/\s{2,}/g, " ").trim();
  if (!desc) desc = CAT_MAP[categoria].nome;
  desc = desc.charAt(0).toUpperCase() + desc.slice(1);

  return { valor, categoria, descricao: desc };
}

const fmtBRL = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

// ---- Dados de exemplo (últimos ~25 dias) ----
function seedData() {
  const t = todayISO();
  const raw = [
    [0, "Almoço no restaurante", "comida", 38.5],
    [0, "Uber para o trabalho", "transporte", 22.9],
    [1, "Supermercado da semana", "comida", 247.8],
    [1, "Netflix", "lazer", 44.9],
    [2, "Farmácia — remédios", "saude", 89.3],
    [3, "Gasolina", "transporte", 180.0],
    [4, "Café da manhã", "comida", 18.0],
    [5, "Conta de luz", "contas", 156.4],
    [6, "Cinema com amigos", "lazer", 64.0],
    [7, "Tênis novo", "compras", 329.9],
    [8, "Internet fibra", "contas", 99.9],
    [9, "Jantar fora", "comida", 112.5],
    [10, "Estacionamento", "transporte", 25.0],
    [12, "Aluguel", "moradia", 1450.0],
    [13, "Consulta dentista", "saude", 220.0],
    [14, "Spotify", "lazer", 21.9],
    [15, "iFood", "comida", 56.7],
    [17, "Roupas", "compras", 198.0],
    [18, "Água", "contas", 78.2],
    [20, "Padaria", "comida", 32.4],
    [22, "Presente aniversário", "compras", 145.0],
    [24, "Academia", "lazer", 119.9],
  ];
  return raw.map(([ago, desc, cat, val]) => ({
    id: uid(),
    data: addDays(t, -ago),
    descricao: desc,
    categoria: cat,
    valor: val,
  })).sort((a, b) => b.data.localeCompare(a.data));
}

Object.assign(window, {
  CATEGORIES, CAT_MAP, parseQuick, detectCategory,
  fmtBRL, fmtBRLshort, fmtDate, fmtDateLong,
  todayISO, addDays, uid, seedData,
});

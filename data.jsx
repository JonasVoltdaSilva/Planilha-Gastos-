/* ============================================================
   Dados, categorias, helpers e categorização inteligente
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

const TIPOS = [
  { id: "pix",     nome: "PIX",     hex: "#5ad9a8" },
  { id: "debito",  nome: "Débito",  hex: "#5aa3e0" },
  { id: "credito", nome: "Crédito", hex: "#a98ae0" },
  { id: "outros",  nome: "Outros",  hex: "#9aa3b0" },
];
const TIPO_MAP = Object.fromEntries(TIPOS.map(t => [t.id, t]));

const CAT_PRESET_COLORS = [
  "#e05a5a", "#e09a5a", "#e0d05a", "#8ae05a",
  "#5ae0a0", "#5ab5e0", "#a05ae0", "#e05ab0",
];

/* ---- Palavras-chave expandidas com marcas e termos brasileiros ---- */
const KEYWORDS = {
  comida: [
    "comida","almoço","almoco","jantar","lanche","café","cafe","restaurante",
    "ifood","rappi","james delivery","99food","ze delivery","zé delivery",
    "aiqfome","uber eats",
    "mercado","supermercado","hortifruti","feira","mercearia","sacolão",
    "padaria","padoca","confeitaria","sorveteria","sorvete","açaí","acai",
    "pizza","hambúrguer","hamburguer","sushi","temaki","churrascaria","churrasco",
    "lanchonete","cantina","bistrô","bistro","boteco","bar","cerveja",
    "marmita","quentinha","buffet","self service",
    "mcdonalds","mc donalds","burger king","bob's","bobs","subway","kfc",
    "giraffas","habibs","habib's","outback","madero","spoleto",
    "dominos","domino's","pizza hut","papa johns",
    "cacau show","kopenhagen","starbucks","rei do mate","casa do pão",
    "carrefour","extra","pão de açúcar","panificadora",
  ],
  transporte: [
    "transporte","uber","99","99pop","cabify","blabucar",
    "gasolina","combustível","combustivel","etanol","álcool","alcool","diesel",
    "shell","petrobras","ipiranga","br mania","ale","repsol","posto",
    "ônibus","onibus","metrô","metro","trem","cptm","sptrans","brt","vlt",
    "passagem","bilhete","cartão vt","vale transporte",
    "estacionamento","pedágio","pedagio","multa trânsito",
    "táxi","taxi","mototaxi","bicicleta","patinete","scooter",
    "azul","latam","gol","passagem aérea","avião","aeroporto",
    "detran","emplacamento","ipva","seguro auto","denatran",
  ],
  moradia: [
    "aluguel","moradia","condomínio","condominio","casa","apartamento",
    "reforma","construção","tinta","material","cimento","tijolo","telha",
    "leroy merlin","leroy","sodimac","cassol","c&c","telhanorte",
    "quinto andar","loft","zap imoveis","aluguel.com",
    "eletricista","encanador","pedreiro","dedetização","faxina","limpeza",
    "jardineiro","jardinagem","porteiro","zelador",
    "iptu","condominio","taxa condominio",
  ],
  lazer: [
    "lazer","cinema","show","viagem","passeio","clube","academia",
    "netflix","spotify","amazon prime","disney","hbo","star+","globoplay",
    "paramount","apple tv","youtube premium","deezer","tidal","crunchyroll",
    "steam","epic games","playstation","xbox","nintendo","twitch",
    "ingresso","sympla","eventim","ticketmaster","bilheteria",
    "teatro","musical","exposição","expo","bienal","museu","zoológico","parque",
    "crossfit","yoga","pilates","boxe","natação","boliche","karting",
    "paintball","laser tag","escape room","adventure","trilha",
    "hotel","pousada","hostel","airbnb","booking","trivago",
    "jogo","game","dlc","assinatura gamer","psn","xbox live","gamepass",
  ],
  saude: [
    "saúde","saude","remédio","remedio","medicamento","farmácia","farmacia",
    "drogasil","droga raia","panvel","pacheco","ultrafarma","biopharma",
    "pague menos","são joão","sao joao","genix","nisfarma",
    "hospital","clínica","clinica","upa","pronto socorro","emergência",
    "médico","medico","consulta","dentista","ortodontista","pediatra",
    "fisioterapia","psicólogo","psicologo","psiquiatra","terapia",
    "nutricionista","nutrição","ortopedista","dermatologista","oftalmologista",
    "exame","raio x","ultrassom","ressonância","tomografia","mamografia",
    "unimed","amil","bradesco saude","sulamerica","notre dame","intermédica",
    "hapvida","gndi","careplus","plano de saude",
    "academia","pilates","musculação","crossfit",
    "vacina","vacinação","posto de saude",
  ],
  compras: [
    "compras","roupa","roupas","vestuário","moda","acessório",
    "tênis","tenis","sapato","sandália","bota","chinelo",
    "renner","c&a","riachuelo","marisa","zara","h&m","forever 21",
    "hering","malwee","puma","nike","adidas","mizuno","asics",
    "arezzo","schutz","melissa","anacapri","vans","converse",
    "mercado livre","shopee","shein","aliexpress","amazon","aliexpress",
    "americanas","casas bahia","magazine luiza","magalu","extra",
    "samsung","apple","lg","sony","positivo","vaio","philips","multilaser",
    "notebook","computador","monitor","tablet","celular","smartphone","fone",
    "presente","gift card","vale presente","loja","shopping",
    "ikea","tok&stok","leroy","casa show","camicado","mobly",
  ],
  contas: [
    "conta","contas","boleto","fatura","cobrança","débito automático",
    "luz","energia","enel","cpfl","cemig","coelba","celpe","eletropaulo",
    "água","agua","sabesp","cedae","saneago","embasa","copasa",
    "internet","fibra","claro","vivo","tim","oi","net","sky","directv",
    "telefone","celular","chip","plano","mensalidade telefone",
    "gás","gas","comgás","ceg","copergás",
    "condominio","aluguel","iptu","ipva","darf","ir","simples","mei",
    "cartão","cartao","anuidade","taxa","tarifa bancária",
    "adobe","canva","dropbox","google workspace","microsoft 365","icloud",
    "assinatura","plano","mensalidade","anuidade",
    "seguro","previdência","investimento","poupança",
  ],
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

const addMonths = (iso, n) => {
  const d = new Date(iso + "T12:00:00");
  const origDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(origDay, maxDay));
  return d.toISOString().slice(0, 10);
};

const FORMAS = [
  { id: "avista",    nome: "À vista" },
  { id: "parcelado", nome: "Parcelado" },
];

/* ---- Fábrica de transações — garante schema completo em todos os caminhos ---- */
function makeTransaction(fields) {
  return {
    id: uid(), data: todayISO(),
    kind: "gasto", forma: "avista",
    parcTotal: 1, parcNum: 1,
    cardId: null, faturaRef: null,
    categoria: "outros", tipo: "outros",
    descricao: "", valor: 0,
    ...fields,
  };
}

/* ---- Categorização inteligente ---- */
function detectCategory(text) {
  const t = text.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

  const scores = {};
  for (const [catId, kws] of Object.entries(KEYWORDS)) {
    let score = 0;
    for (const kw of kws) {
      const kwNorm = kw.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ");
      if (t.includes(kwNorm)) score += kwNorm.length > 5 ? 2 : 1;
    }
    if (score > 0) scores[catId] = score;
  }

  if (Object.keys(scores).length === 0) return "outros";
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
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

  const isEntrada = /\b(recebi|ganhei|recebei|recebimento|renda|salário|salario|freelance|dividendo|bônus|bonus)\b/i.test(raw);

  if (isEntrada) {
    let desc = raw
      .replace(/recebi|ganhei|recebei|recebimento|renda|salário|salario|freelance|dividendo|bônus|bonus/gi, "")
      .replace(/r\$\s*[\d.,]+/i, "")
      .replace(/\b[\d.,]+\b/, "")
      .replace(/^\s*(de|do|da|em)\s+/i, "")
      .trim().replace(/\s{2,}/g, " ").trim();
    if (!desc) desc = "Entrada";
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    return makeTransaction({ valor, descricao: desc, kind: "entrada", tipo: "outros" });
  }

  const categoria = detectCategory(raw);
  const tipo = detectTipo(raw);

  let desc = raw
    .replace(/gastei|paguei|comprei|gasto|fui no|fui na|fui em/gi, "")
    .replace(/r\$\s*[\d.,]+/i, "")
    .replace(/\b[\d.,]+\b/, "")
    .replace(/^\s*(com|no|na|de|em|para|pra|reais?)\s+/i, " ")
    .replace(/\s+(com|no|na|de|em)\s+/i, " ")
    .trim();
  desc = desc.replace(/\s{2,}/g, " ").trim();
  if (!desc) desc = CAT_MAP[categoria]?.nome || "Gasto";
  desc = desc.charAt(0).toUpperCase() + desc.slice(1);

  return makeTransaction({ valor, categoria, descricao: desc, tipo });
}

const MONTH_PT = { jan:1,fev:2,mar:3,abr:4,mai:5,jun:6,jul:7,ago:8,set:9,out:10,nov:11,dez:12 };

function parseStatement(text) {
  if (!text || !text.trim()) return [];
  const results = [];
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  const currYear = new Date().getFullYear();

  for (const line of lines) {
    // Skip metadata/header lines
    if (/^\s*$|saldo anterior|saldo final|saldo disponível|extrato|período|limite disponível|agência|agencia|cpf|cnpj|conta corrente|data\s+desc|valor\s+saldo|histórico/i.test(line)) continue;

    // Find all monetary amounts in the line (Brazilian format: 1.234,56 or 234,56)
    const allAmts = [...line.matchAll(/(?<![,\d])(\d{1,3}(?:\.\d{3})*,\d{2})(?![,\d])/g)];
    if (!allAmts.length) continue;

    // Take the first amount that's not obviously a balance (prefer leftmost)
    let chosenAmt = null;
    for (const m of allAmts) {
      const v = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
      if (!isNaN(v) && v > 0 && v <= 100000) { chosenAmt = { match: m[0], valor: v }; break; }
    }
    if (!chosenAmt) continue;

    // Skip clear income/credit lines
    if (/\bcr\b|\bcrédito\b|\bcredito\b|recebimento pix|pix recebido|transferência recebida|ted recebida|salário recebido|crédito em conta/i.test(line)) continue;

    // Parse date — supports DD/MM, DD/MM/YY, DD/MM/YYYY, DD-MM, "DD JAN", "04 JUN"
    let iso = todayISO();
    const ddmm = line.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
    const ddmon = line.match(/\b(\d{1,2})\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/i);
    if (ddmm) {
      const day = ddmm[1].padStart(2, "0");
      const mon = ddmm[2].padStart(2, "0");
      const yr = ddmm[3] ? (ddmm[3].length === 2 ? "20" + ddmm[3] : ddmm[3]) : String(currYear);
      iso = `${yr}-${mon}-${day}`;
    } else if (ddmon) {
      const day = ddmon[1].padStart(2, "0");
      const mon = String(MONTH_PT[ddmon[2].toLowerCase()]).padStart(2, "0");
      iso = `${currYear}-${mon}-${day}`;
    }

    // Clean description
    let desc = line
      .replace(chosenAmt.match, "")
      .replace(/\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/, "")
      .replace(/\b\d{1,2}\s+(?:jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/i, "")
      .replace(/\bR\$\s*/gi, "")
      .replace(/\s{2,}/g, " ").trim();
    if (!desc || desc.length < 2) desc = "Gasto importado";
    if (desc.length > 80) desc = desc.slice(0, 80);

    results.push(makeTransaction({
      data: iso,
      descricao: desc,
      categoria: detectCategory(desc),
      valor: chosenAmt.valor,
      tipo: detectTipo(line),
    }));
  }

  return results;
}

function calcFaturaRef(dataISO, card) {
  if (!card) return null;
  const d = new Date(dataISO + "T12:00:00");
  const day = d.getDate();
  const closing = card.diaFechamento || 20;
  if (day > closing) {
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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
    kind: "gasto",
    forma: "avista",
    parcTotal: 1,
    parcNum: 1,
    cardId: null,
    faturaRef: null,
  })).sort((a, b) => b.data.localeCompare(a.data));
}

const LS_FATURAS = "planilha_gastos_faturas_v1";

function formatMes(mesISO) {
  const [y, m] = mesISO.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("pt-BR", { month: "long", year: "numeric" });
}

function computeFaturas(cards, expenses, faturaOverrides) {
  const today = new Date();
  const results = [];
  for (const card of cards) {
    const cardExps = expenses.filter(e => e.cardId === card.id && e.tipo === "credito" && e.kind !== "entrada");
    const byMes = {};
    for (const exp of cardExps) {
      const ref = exp.faturaRef || calcFaturaRef(exp.data, card);
      if (!ref) continue;
      if (!byMes[ref]) byMes[ref] = [];
      byMes[ref].push(exp);
    }
    const currMes = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const nd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMes = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}`;
    if (!byMes[currMes]) byMes[currMes] = [];
    if (!byMes[nextMes]) byMes[nextMes] = [];
    for (const [mes, transacoes] of Object.entries(byMes)) {
      const [y, m] = mes.split("-").map(Number);
      const closingDay = card.diaFechamento || 20;
      const dataFechamento = `${mes}-${String(closingDay).padStart(2, "0")}`;
      const vencDate = new Date(y, m, card.diaVencimento || 5);
      const dataVencimento = vencDate.toISOString().slice(0, 10);
      const key = `${card.id}:${mes}`;
      const override = faturaOverrides?.[key];
      const status = override?.status === "paga" ? "paga"
        : today > new Date(dataFechamento + "T23:59:59") ? "fechada"
        : "aberta";
      results.push({
        id: key, cardId: card.id, card, mes,
        dataFechamento, dataVencimento, status,
        total: transacoes.reduce((s, e) => s + e.valor, 0),
        transacoes: [...transacoes].sort((a, b) => b.data.localeCompare(a.data)),
        paidAt: override?.paidAt || null,
      });
    }
  }
  return results.sort((a, b) => b.mes.localeCompare(a.mes) || a.cardId.localeCompare(b.cardId));
}

function exportToCSV(expenses) {
  const headers = ["Data","Descrição","Categoria","Tipo Pagamento","Valor","Forma","Parcela","Lançamento"];
  const rows = expenses.map(e => [
    e.data,
    `"${(e.descricao || "").replace(/"/g, '""')}"`,
    e.kind === "entrada" ? "Entrada" : (CAT_MAP[e.categoria]?.nome || e.categoria),
    TIPO_MAP[e.tipo]?.nome || e.tipo || "Outros",
    e.valor.toFixed(2).replace(".", ","),
    e.forma === "parcelado" ? "Parcelado" : "À vista",
    e.parcTotal > 1 ? `${e.parcNum}/${e.parcTotal}` : "—",
    e.kind === "entrada" ? "Entrada" : "Gasto",
  ]);
  const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `cofrinho_${todayISO()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function exportToJSON(expenses, cards, settings, customCats, fixas, caloteiros, emprestimos) {
  const data = { version: 1, exportedAt: new Date().toISOString(), expenses, cards, settings, customCats, fixas, caloteiros, emprestimos };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `backup_cofrinho_${todayISO()}.json`; a.click();
  URL.revokeObjectURL(url);
}

/* ============================================================
   RECORRÊNCIA DE CONTAS FIXAS — dias úteis
   ============================================================
   Tipos de rec:
     { type: "fixed_day",       day: 1–31 }
     { type: "nth_biz",         pos: 1–5 | "last" }
     { type: "first_biz_after", ref: 1–31 }

   Backward-compat: fixas sem .rec usam .dia como fixed_day.
   Extensível: adicione strings "YYYY-MM-DD" em HOLIDAYS ou chame addHoliday().
   ============================================================ */

const HOLIDAYS = [];
function addHoliday(isoDate) { if (!HOLIDAYS.includes(isoDate)) HOLIDAYS.push(isoDate); }

function _daysInMonth(year, month) { return new Date(year, month, 0).getDate(); }

function _isBusinessDay(year, month, day) {
  const dow = new Date(year, month - 1, day).getDay();
  if (dow === 0 || dow === 6) return false;
  const iso = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  return !HOLIDAYS.includes(iso);
}

function getNthBusinessDay(year, month, pos) {
  /* pos = 1–5 ou "last" */
  const total = _daysInMonth(year, month);
  if (pos === "last") {
    for (let d = total; d >= 1; d--) if (_isBusinessDay(year, month, d)) return d;
    return total;
  }
  let count = 0;
  for (let d = 1; d <= total; d++) {
    if (_isBusinessDay(year, month, d) && ++count === pos) return d;
  }
  return total;
}

function getFirstBusinessDayOnOrAfter(year, month, refDay) {
  const total = _daysInMonth(year, month);
  for (let d = Math.min(refDay, total); d <= total; d++) {
    if (_isBusinessDay(year, month, d)) return d;
  }
  return getNthBusinessDay(year, month, "last");
}

function resolveFixaDay(fixa, year, month) {
  const rec = fixa.rec || { type: "fixed_day", day: fixa.dia || 1 };
  switch (rec.type) {
    case "nth_biz":         return getNthBusinessDay(year, month, rec.pos);
    case "first_biz_after": return getFirstBusinessDayOnOrAfter(year, month, rec.ref);
    default:                return rec.day ?? fixa.dia ?? 1;
  }
}

function describeRec(fixa) {
  const rec = fixa.rec || { type: "fixed_day", day: fixa.dia || 1 };
  const ord = n => ["1º","2º","3º","4º","5º"][n-1] || `${n}º`;
  switch (rec.type) {
    case "nth_biz":
      return rec.pos === "last" ? "Último dia útil do mês" : `${ord(rec.pos)} dia útil do mês`;
    case "first_biz_after":
      return `1º dia útil após o dia ${rec.ref}`;
    default:
      return `Todo dia ${rec.day ?? fixa.dia ?? 1}`;
  }
}

Object.assign(window, {
  CATEGORIES, CAT_MAP, TIPOS, TIPO_MAP, CAT_PRESET_COLORS,
  FORMAS, addMonths, calcFaturaRef, makeTransaction,
  parseQuick, parseStatement, detectCategory, detectTipo,
  fmtBRL, fmtBRLshort, fmtDate, fmtDateLong,
  todayISO, addDays, uid, seedData,
  LS_FATURAS, formatMes, computeFaturas,
  exportToCSV, exportToJSON,
  HOLIDAYS, addHoliday,
  getNthBusinessDay, getFirstBusinessDayOnOrAfter,
  resolveFixaDay, describeRec,
});

/* ============================================================
   App raiz — estado, navegação, quick-add, filtros
   ============================================================ */
const { useState, useMemo, useEffect } = React;

const NAV = [
  { id: "home",      nome: "Início",    icon: Ic.home },
  { id: "dashboard", nome: "Dashboard", icon: Ic.dashboard },
  { id: "gastos",    nome: "Gastos",    icon: Ic.wallet },
  { id: "relatorios",nome: "Relatórios",icon: Ic.chart },
  { id: "config",    nome: "Config.",   icon: Ic.settings },
];

const PAGE_META = {
  home:        { t: "Início",        s: "" },
  dashboard:   { t: "Dashboard",     s: "Visão geral das suas finanças pessoais" },
  gastos:      { t: "Gastos",        s: "Sua planilha completa de lançamentos" },
  relatorios:  { t: "Relatórios",    s: "Análise da distribuição dos seus gastos" },
  config:      { t: "Configurações", s: "Personalize sua experiência" },
};

const LS_KEY  = "planilha_gastos_v1";
const LS_SET  = "planilha_gastos_settings_v1";
const LS_CATS = "planilha_gastos_cats_v1";

function App() {
  const [page, setPage] = useState("home");

  // ---------- Categorias personalizadas ----------
  const [customCats, setCustomCats] = useState(() => {
    try {
      const s = localStorage.getItem(LS_CATS);
      if (s) {
        const cats = JSON.parse(s);
        // Adiciona ao global imediatamente, antes do primeiro render
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
        return { autoCat: true, glow: true, animations: true, confirmDelete: false, budget: 2000, ...parsed };
      }
    } catch (e) {}
    return { autoCat: true, glow: true, animations: true, confirmDelete: false, budget: 2000 };
  });

  const [modal, setModal] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [quick, setQuick] = useState("");

  // filtros
  const [period, setPeriod] = useState("30");
  const [cat, setCat]       = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { try { localStorage.setItem(LS_KEY,  JSON.stringify(expenses)); } catch (e) {} }, [expenses]);
  useEffect(() => { try { localStorage.setItem(LS_SET,  JSON.stringify(settings)); } catch (e) {} }, [settings]);

  useEffect(() => {
    document.body.classList.toggle("no-anim", !settings.animations);
    document.body.classList.toggle("no-glow", !settings.glow);
  }, [settings.animations, settings.glow]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2400); };

  // ---------- Filtragem ----------
  const filtered = useMemo(() => {
    let arr = [...expenses];
    if (period !== "all") {
      const min = addDays(todayISO(), -parseInt(period));
      arr = arr.filter(e => e.data >= min);
    }
    if (cat !== "all") arr = arr.filter(e => e.categoria === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(e => e.descricao.toLowerCase().includes(q));
    }
    return arr.sort((a, b) => b.data.localeCompare(a.data) || b.valor - a.valor);
  }, [expenses, period, cat, search]);

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
    if (exp.kind === "gasto" && exp.forma === "parcelado" && exp.parcTotal > 1) {
      const parcelVal = Math.round((exp.valor / exp.parcTotal) * 100) / 100;
      const grupo = uid();
      const parcList = Array.from({ length: exp.parcTotal }, (_, i) => ({
        ...exp, id: uid(), data: addMonths(exp.data, i),
        valor: parcelVal,
        descricao: `${exp.descricao} (${i + 1}/${exp.parcTotal})`,
        parcNum: i + 1, parcGrupo: grupo,
      }));
      setExpenses(prev => [...parcList, ...prev]);
      setModal(null);
      showToast(`${exp.parcTotal}× de ${fmtBRL(parcelVal)} adicionadas`);
    } else {
      setExpenses(prev => {
        const exists = prev.some(e => e.id === exp.id);
        return exists ? prev.map(e => e.id === exp.id ? exp : e) : [exp, ...prev];
      });
      setModal(null);
      showToast(modal?.id
        ? (exp.kind === "entrada" ? "Entrada atualizada" : "Gasto atualizado")
        : (exp.kind === "entrada" ? "Entrada adicionada!" : "Gasto adicionado!"));
    }
  };

  const deleteExpense = (id) => {
    const exp = expenses.find(e => e.id === id);
    if (settings.confirmDelete && !window.confirm("Excluir este lançamento?")) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast(exp?.kind === "entrada" ? "Entrada excluída" : "Gasto excluído");
  };

  const importExpenses = (list) => {
    if (!list.length) return;
    setExpenses(prev => [...list, ...prev]);
    showToast(`${list.length} gasto${list.length > 1 ? "s" : ""} importado${list.length > 1 ? "s" : ""}`);
    setPage("gastos");
  };

  const submitQuick = () => {
    const parsed = parseQuick(quick);
    if (!parsed) { showToast("Não entendi — tente: \"Gastei R$50 com comida\""); return; }
    const exp = { id: uid(), data: todayISO(), kind: "gasto", forma: "avista", parcTotal: 1, parcNum: 1, ...parsed };
    if (!settings.autoCat) exp.categoria = "outros";
    setExpenses(prev => [exp, ...prev]);
    setQuick("");
    showToast(`+ ${fmtBRL(parsed.valor)} · ${CAT_MAP[exp.categoria]?.nome || exp.categoria}`);
  };

  const resetData = () => { setExpenses(seedData()); showToast("Dados de exemplo restaurados"); };

  const meta = PAGE_META[page];

  return (
    <div className="app">
      <aside className="sidebar glass">
        <div className="brand">
          <div className="brand-mark"><Ic.coins size={22} color="#06251a" /></div>
          <div>
            <div className="brand-name">Cofrinho do Luiz</div>
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
            <div className="avatar">LR</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Luiz Ricardo</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main glass">
        <div className="main-scroll">
          {page !== "home" && (
            <div className="page-head">
              <div>
                <h1 className="page-title">{meta.t}</h1>
                {meta.s && <div className="page-sub">{meta.s}</div>}
              </div>
            </div>
          )}

          {(page === "dashboard" || page === "gastos") && (
            <div className="quick glass">
              <Ic.sparkle size={20} />
              <input value={quick} onChange={(e) => setQuick(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitQuick()}
                placeholder='Adição rápida — ex.: "Gastei R$50 com comida no almoço"' />
              <button className="btn btn-primary" onClick={submitQuick}><Ic.plus size={17} />Lançar</button>
            </div>
          )}

          {page === "home" && (
            <HomeView expenses={expenses} budget={settings.budget}
              onAdd={() => setModal({})} onEdit={(e) => setModal(e)} onDelete={deleteExpense} />
          )}
          {page === "dashboard" && (
            <DashboardView expenses={expenses} filtered={filtered} byCat={byCat} total={total}
              onEdit={(e) => setModal(e)} onDelete={deleteExpense} onAdd={() => setModal({})}
              budget={settings.budget} />
          )}
          {page === "gastos" && (
            <GastosView filtered={filtered} total={total} byCat={byCat}
              onEdit={(e) => setModal(e)} onDelete={deleteExpense} onAdd={() => setModal({})}
              onImport={importExpenses} allCats={allCats}
              {...{ period, setPeriod, cat, setCat, search, setSearch }} />
          )}
          {page === "relatorios" && (
            <RelatoriosView expenses={expenses} byCat={byCat} total={total} />
          )}
          {page === "config" && (
            <ConfigView settings={settings} setSettings={setSettings} onReset={resetData}
              allCats={allCats} onAddCat={addCustomCat} onDeleteCat={deleteCustomCat} />
          )}
        </div>
      </main>

      <BottomNav page={page} setPage={setPage} />

      {fabOpen && <div className="fab-overlay" onClick={() => setFabOpen(false)} />}
      {fabOpen && (
        <div className="fab-sheet">
          <div className="fab-action fab-action-entrada"
            onClick={() => { setFabOpen(false); setModal({ kind: "entrada" }); }}>
            <Ic.trendUp size={16} />Entrada
          </div>
          <div className="fab-action fab-action-gasto"
            onClick={() => { setFabOpen(false); setModal({ kind: "gasto" }); }}>
            <Ic.receipt size={16} />Gasto
          </div>
        </div>
      )}
      <button className={"fab" + (fabOpen ? " open" : "")} onClick={() => setFabOpen(v => !v)}>
        <Ic.plus size={28} />
      </button>

      {modal !== null && (
        <ExpenseModal initKind={modal?.kind || "gasto"} initial={modal && modal.id ? modal : null}
          onSave={saveTransaction} onClose={() => setModal(null)} allCats={allCats} />
      )}
      <Toast msg={toast} />
    </div>
  );
}

function BottomNav({ page, setPage }) {
  return (
    <nav className="bottom-nav">
      {NAV.map(n => {
        const I = n.icon;
        return (
          <div key={n.id} className={"bottom-nav-item" + (page === n.id ? " active" : "")}
            onClick={() => setPage(n.id)}>
            <I size={22} />
            <span>{n.nome}</span>
          </div>
        );
      })}
    </nav>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

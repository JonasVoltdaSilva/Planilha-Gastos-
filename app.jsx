/* ============================================================
   App raiz — estado, navegação, quick-add, filtros
   ============================================================ */
const { useState, useMemo, useEffect } = React;

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

function App() {
  const [page, setPage] = useState("home");

  // ---------- Perfil do usuário ----------
  const [profile, setProfile] = useState(() => {
    try {
      const s = localStorage.getItem(LS_PROFILE);
      if (s) return JSON.parse(s);
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
        return { autoCat: true, glow: true, animations: true, confirmDelete: false, budget: 2000, ...parsed };
      }
    } catch (e) {}
    return { autoCat: true, glow: true, animations: true, confirmDelete: false, budget: 2000 };
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

  const addCard = (card) => {
    const updated = [...cards, card];
    setCards(updated);
    try { localStorage.setItem(LS_CARDS, JSON.stringify(updated)); } catch (e) {}
  };

  const deleteCard = (id) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    try { localStorage.setItem(LS_CARDS, JSON.stringify(updated)); } catch (e) {}
  };

  const [modal, setModal] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [toast, setToast] = useState({ msg: "", icon: "check" });
  const [quick, setQuick] = useState("");

  // filtros globais (período, categoria, busca)
  const [period, setPeriod] = useState("30");
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
  }, [settings.animations, settings.glow]);

  const showToast = (msg, icon = "check") => {
    setToast({ msg, icon });
    setTimeout(() => setToast({ msg: "", icon: "check" }), 2400);
  };

  // ---------- Filtragem global (sem tipo/cartão — esses ficam em GastosView) ----------
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
    const isEditing = !!modal?.id;
    if (exp.kind === "gasto" && exp.forma === "parcelado" && exp.parcTotal > 1) {
      const parcelVal = Math.round((exp.valor / exp.parcTotal) * 100) / 100;
      const grupo = uid();
      const linkedCard = exp.cardId ? cards.find(c => c.id === exp.cardId) : null;
      const parcList = Array.from({ length: exp.parcTotal }, (_, i) => {
        const parcelData = addMonths(exp.data, i);
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
      showToast(`${exp.parcTotal}× de ${fmtBRL(parcelVal)} adicionadas`);
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

  const deleteExpense = (id) => {
    const exp = expenses.find(e => e.id === id);
    if (settings.confirmDelete && !window.confirm("Excluir este lançamento?")) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast(exp?.kind === "entrada" ? "Entrada excluída" : "Gasto excluído", "trash");
  };

  const deleteExpenseGroup = (parcGrupo) => {
    const group = expenses.filter(e => e.parcGrupo === parcGrupo);
    if (!group.length) return;
    if (settings.confirmDelete && !window.confirm(`Excluir todas as ${group.length} parcelas?`)) return;
    setExpenses(prev => prev.filter(e => e.parcGrupo !== parcGrupo));
    showToast(`${group.length} parcelas excluídas`, "trash");
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
            <div className="avatar">{userName.slice(0, 2).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
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
                placeholder='Adição rápida — ex.: "Gastei R$50 com comida" ou "Recebi R$1500 salário"' />
              <button className="btn btn-primary" onClick={submitQuick}><Ic.plus size={17} />Lançar</button>
            </div>
          )}

          {page === "home" && (
            <HomeView expenses={expenses} budget={settings.budget} cards={cards} userName={userName}
              onAdd={() => setModal({})} onEdit={(e) => setModal(e)}
              onDelete={deleteExpense} onDeleteGroup={deleteExpenseGroup} />
          )}
          {page === "dashboard" && (
            <DashboardView expenses={expenses} filtered={filtered} byCat={byCat} total={total}
              onEdit={(e) => setModal(e)} onDelete={deleteExpense} onDeleteGroup={deleteExpenseGroup}
              onAdd={() => setModal({})} budget={settings.budget} cards={cards} />
          )}
          {page === "gastos" && (
            <GastosView filtered={filtered} total={total} byCat={byCat}
              onEdit={(e) => setModal(e)} onDelete={deleteExpense} onDeleteGroup={deleteExpenseGroup}
              onAdd={() => setModal({})} onImport={importExpenses} allCats={allCats} cards={cards}
              tipoFilter={tipoFilter} setTipoFilter={setTipoFilter}
              cardIdFilter={cardIdFilter} setCardIdFilter={setCardIdFilter}
              onOpenFilterSheet={() => setShowFilterSheet(true)}
              {...{ period, setPeriod, cat, setCat, search, setSearch }} />
          )}
          {page === "faturas" && (
            <FaturasView
              cards={cards} expenses={expenses}
              faturaOverrides={faturaOverrides}
              onMarkPaid={markFaturaPaid}
              onUnmarkPaid={unmarkFaturaPaid}
              onEdit={(e) => setModal(e)}
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
              onResetProfile={resetProfile} />
          )}
        </div>
      </main>

      <BottomNav page={page} setPage={setPage} />

      {showFilterSheet && (
        <FilterSheet
          allCats={allCats} cards={cards}
          cat={cat} setCat={setCat}
          tipoFilter={tipoFilter} setTipoFilter={setTipoFilter}
          cardIdFilter={cardIdFilter} setCardIdFilter={setCardIdFilter}
          onClose={() => setShowFilterSheet(false)}
        />
      )}

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
          onSave={saveTransaction} onClose={() => setModal(null)} allCats={allCats} cards={cards} />
      )}
      <Toast msg={toast.msg} icon={toast.icon} />
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

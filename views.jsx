/* ============================================================
   Views: Dashboard · Gastos · Relatórios · Configurações
   ============================================================ */
const { useState: useS, useMemo: useM } = React;

/* ---------- Barra de orçamento com semáforo ---------- */
function BudgetBar({ total, budget }) {
  if (!budget || budget <= 0) return null;
  const pct = Math.min((total / budget) * 100, 100);
  const color = pct < 60 ? "var(--accent-mint)" : pct < 85 ? "#e0c85a" : "var(--cat-saude)";
  const status = pct < 60 ? "Dentro do orçamento" : pct < 85 ? "Atenção — chegando perto" : "Perto do limite!";
  return (
    <div className="budget-bar-wrap">
      <div className="budget-bar-labels">
        <span style={{ color: "var(--text-mid)", fontSize: 12.5, fontWeight: 600 }}>
          {fmtBRL(total)} <span style={{ color: "var(--text-lo)" }}>/ {fmtBRL(budget)}</span>
        </span>
        <span style={{ color, fontWeight: 700, fontSize: 13 }}>{Math.round(pct)}%</span>
      </div>
      <div className="budget-bar-track">
        <div className="budget-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div style={{ color, fontSize: 12, fontWeight: 600, marginTop: 5 }}>{status}</div>
    </div>
  );
}

/* ---------- Tabela de gastos ---------- */
function ExpenseTable({ rows, onEdit, onDelete }) {
  if (rows.length === 0) {
    return (
      <div className="empty">
        <Ic.receipt size={40} />
        <div style={{ fontWeight: 600, color: "var(--text-mid)" }}>Nenhum gasto encontrado</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>Adicione um gasto ou ajuste os filtros.</div>
      </div>
    );
  }
  return (
    <div className="expense-list">
      {rows.map(e => {
        const c = CAT_MAP[e.categoria] || CAT_MAP["outros"];
        const t = TIPO_MAP[e.tipo] || TIPO_MAP["outros"];
        return (
          <div className="expense-row" key={e.id} style={{ "--row-accent": c.hex }}>
            <div className="expense-accent" />
            <div className="expense-main">
              <div className="expense-info">
                <span className="expense-desc">{e.descricao}</span>
                <div className="expense-meta">
                  <span className="expense-date">{fmtDate(e.data)}</span>
                  <span className="exp-tag" style={{ background: c.hex + "22", color: c.hex, borderColor: c.hex + "44" }}>
                    {c.nome}
                  </span>
                  <span className="exp-tag" style={{ background: t.hex + "22", color: t.hex, borderColor: t.hex + "44" }}>
                    {t.nome}
                  </span>
                </div>
              </div>
              <div className="expense-right">
                <span className="expense-val">{fmtBRL(e.valor)}</span>
                <div className="row-actions">
                  <button className="icon-btn" title="Editar" onClick={() => onEdit(e)}><Ic.edit size={15} /></button>
                  <button className="icon-btn danger" title="Excluir" onClick={() => onDelete(e.id)}><Ic.trash size={15} /></button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Filtros ---------- */
function Filters({ period, setPeriod, cat, setCat, search, setSearch, allCats }) {
  const cats = allCats || CATEGORIES;
  return (
    <div className="filters">
      <div className="field" style={{ flex: 1, minWidth: 180 }}>
        <input className="input" style={{ width: "100%", paddingLeft: 36 }}
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar descrição..." />
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-lo)", display: "flex" }}>
          <Ic.search size={16} />
        </span>
      </div>
      <div className="field sel">
        <select className="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="all">Todo período</option>
        </select>
      </div>
      <div className="field sel">
        <select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">Todas categorias</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>
    </div>
  );
}

/* ---------- Stat card ---------- */
function Stat({ icon, label, value, meta, metaDir, accent }) {
  const I = icon;
  return (
    <div className="stat glass">
      <div className="stat-label"><I size={15} />{label}</div>
      <div className={"stat-value" + (accent ? " accent" : "")}>{value}</div>
      {meta && (
        <div className={"stat-meta" + (metaDir ? " " + metaDir : "")}>
          {metaDir === "up" && <Ic.trendUp size={14} />}
          {metaDir === "down" && <Ic.trendDown size={14} />}
          {meta}
        </div>
      )}
    </div>
  );
}

/* ---------- Modal de importação de extrato (texto + PDF) ---------- */
function BankImportModal({ onImport, onClose }) {
  const [tab, setTab] = useS("text");
  const [text, setText] = useS("");
  const [preview, setPreview] = useS(null);
  const [selected, setSelected] = useS(new Set());
  const [pdfLoading, setPdfLoading] = useS(false);
  const [pdfName, setPdfName] = useS("");

  const runAnalysis = (raw) => {
    const results = parseStatement(raw);
    setPreview(results);
    setSelected(new Set(results.map((_, i) => i)));
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfName(file.name);
    setPdfLoading(true);
    try {
      const lib = window.pdfjsLib;
      if (!lib) throw new Error("PDF.js não carregado");
      const buf = await file.arrayBuffer();
      const pdf = await lib.getDocument({ data: buf }).promise;
      let full = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const pg = await pdf.getPage(i);
        const ct = await pg.getTextContent();
        full += ct.items.map(it => it.str).join(" ") + "\n";
      }
      runAnalysis(full);
    } catch (err) {
      alert("Não foi possível ler o PDF. Tente colar o texto manualmente.");
      setPdfName("");
    }
    setPdfLoading(false);
  };

  const toggleRow = (i) => {
    setSelected(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  const doImport = () => {
    onImport(preview.filter((_, i) => selected.has(i)));
    onClose();
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal glass modal-wide">
        {!preview ? (
          <>
            <h3>Importar extrato bancário</h3>
            <div className="import-tabs">
              <div className={"import-tab" + (tab === "text" ? " on" : "")} onClick={() => setTab("text")}>
                <Ic.edit size={15} />Colar texto
              </div>
              <div className={"import-tab" + (tab === "pdf" ? " on" : "")} onClick={() => setTab("pdf")}>
                <Ic.upload size={15} />Enviar PDF
              </div>
            </div>

            {tab === "text" ? (
              <>
                <p style={{ color: "var(--text-mid)", fontSize: 13.5, marginBottom: 16 }}>
                  Cole o texto do seu extrato. O app detecta e categoriza as transações automaticamente.
                </p>
                <textarea className="import-textarea"
                  value={text} onChange={e => setText(e.target.value)}
                  placeholder={"02/06 PIX MERCADO LIVRE R$150,00\n02/06 DÉBITO UBER R$22,90\n03/06 AMAZON R$89,99\n..."} />
                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                  <button className="btn btn-primary" onClick={() => runAnalysis(text)} disabled={!text.trim()}>
                    <Ic.search size={17} />Analisar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: "var(--text-mid)", fontSize: 13.5, marginBottom: 16 }}>
                  Envie o PDF do extrato bancário. O app extrai e categoriza as transações automaticamente.
                </p>
                <label className="pdf-upload-area">
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} style={{ display: "none" }} />
                  {pdfLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div className="pdf-spinner" />
                      <span style={{ color: "var(--text-mid)", fontSize: 13 }}>Lendo PDF...</span>
                    </div>
                  ) : pdfName ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <Ic.receipt size={30} style={{ color: "var(--accent-mint)" }} />
                      <span style={{ color: "var(--text-hi)", fontWeight: 600, fontSize: 14 }}>{pdfName}</span>
                      <span style={{ color: "var(--text-lo)", fontSize: 12 }}>Clique para trocar o arquivo</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                      <Ic.upload size={34} style={{ color: "var(--text-lo)" }} />
                      <span style={{ color: "var(--text-mid)", fontSize: 14, fontWeight: 600 }}>Selecionar PDF do extrato</span>
                      <span style={{ color: "var(--text-lo)", fontSize: 12 }}>Toque para escolher o arquivo</span>
                    </div>
                  )}
                </label>
                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                </div>
              </>
            )}
          </>
        ) : preview.length === 0 ? (
          <>
            <h3>Nenhuma transação encontrada</h3>
            <p style={{ color: "var(--text-mid)", fontSize: 13.5, marginBottom: 16 }}>
              Não identifiquei transações. Tente outro formato ou cole o texto manualmente.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setPreview(null); setPdfName(""); }}>Tentar novamente</button>
              <button className="btn btn-primary" onClick={onClose}>Fechar</button>
            </div>
          </>
        ) : (
          <>
            <h3>{preview.length} transações detectadas</h3>
            <p style={{ color: "var(--text-mid)", fontSize: 13, marginBottom: 14 }}>
              Selecione as que deseja importar ({selected.size} selecionadas).
            </p>
            <div className="import-preview">
              {preview.map((e, i) => {
                const c = CAT_MAP[e.categoria] || CAT_MAP["outros"];
                const t = TIPO_MAP[e.tipo] || TIPO_MAP["outros"];
                const on = selected.has(i);
                return (
                  <div key={i} className={"import-row" + (on ? " sel" : "")} onClick={() => toggleRow(i)}>
                    <div className={"import-check" + (on ? " on" : "")}>{on ? "✓" : ""}</div>
                    <div className="import-date">{fmtDate(e.data)}</div>
                    <div className="import-desc">{e.descricao}</div>
                    <div className="import-tags">
                      <span className="exp-tag" style={{ background: c.hex + "22", color: c.hex, borderColor: c.hex + "44" }}>{c.nome}</span>
                      <span className="exp-tag" style={{ background: t.hex + "22", color: t.hex, borderColor: t.hex + "44" }}>{t.nome}</span>
                    </div>
                    <div className="import-val">{fmtBRL(e.valor)}</div>
                  </div>
                );
              })}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setPreview(null); setPdfName(""); }}>Voltar</button>
              <button className="btn btn-primary" onClick={doImport} disabled={selected.size === 0}>
                <Ic.download size={17} />Importar {selected.size}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   HOME / INÍCIO
   ============================================================ */
function HomeView({ expenses, budget, onAdd, onEdit, onDelete }) {
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthExp = expenses.filter(e => e.data && e.data.startsWith(monthStr));
  const monthTotal = monthExp.reduce((s, e) => s + e.valor, 0);
  const todayTotal = expenses.filter(e => e.data === todayISO()).reduce((s, e) => s + e.valor, 0);
  const pct = budget > 0 ? Math.min((monthTotal / budget) * 100, 100) : 0;
  const budgetColor = budget <= 0 ? "var(--accent-mint)"
    : pct < 60 ? "var(--accent-mint)"
    : pct < 85 ? "#e0c85a"
    : "var(--cat-saude)";
  const h = now.getHours();
  const greeting = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const recent = [...expenses].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 6);
  const monthName = now.toLocaleString("pt-BR", { month: "long" });

  return (
    <>
      <div className="home-hero glass">
        <div className="home-hero-top">
          <div>
            <div className="home-greeting">{greeting}, <strong>Luiz Ricardo</strong>!</div>
            <div className="home-date">{fmtDateLong(todayISO())}</div>
          </div>
          <button className="btn btn-primary" onClick={onAdd}>
            <Ic.plus size={18} />Novo gasto
          </button>
        </div>

        <div className="home-stats-row">
          <div className="home-stat-block">
            <div className="home-stat-label">Gasto em {monthName}</div>
            <div className="home-stat-value" style={{ color: "var(--accent-mint)" }}>{fmtBRL(monthTotal)}</div>
            <div className="home-stat-meta">{monthExp.length} lançamentos</div>
          </div>
          {budget > 0 && (
            <div className="home-stat-block">
              <div className="home-stat-label">Restante</div>
              <div className="home-stat-value" style={{ color: budgetColor }}>{fmtBRL(Math.max(0, budget - monthTotal))}</div>
              <div className="home-stat-meta" style={{ color: budgetColor }}>{Math.round(pct)}% usado</div>
            </div>
          )}
          <div className="home-stat-block">
            <div className="home-stat-label">Gastos hoje</div>
            <div className="home-stat-value">{fmtBRL(todayTotal)}</div>
            <div className="home-stat-meta">hoje</div>
          </div>
        </div>

        {budget > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 12, color: "var(--text-lo)" }}>
              <span>Orçamento mensal</span>
              <span style={{ color: budgetColor, fontWeight: 700 }}>{fmtBRL(monthTotal)} / {fmtBRL(budget)}</span>
            </div>
            <div className="budget-bar-track">
              <div className="budget-bar-fill" style={{ width: `${pct}%`, background: budgetColor }} />
            </div>
          </div>
        )}
      </div>

      {recent.length > 0 ? (
        <div className="panel glass">
          <div className="panel-head">
            <div className="panel-title">Últimos lançamentos</div>
          </div>
          <ExpenseTable rows={recent} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ) : (
        <div className="panel glass">
          <div className="empty" style={{ padding: "44px 20px" }}>
            <Ic.coins size={40} />
            <div style={{ fontWeight: 600, color: "var(--text-mid)", marginTop: 14 }}>Nenhum gasto registrado</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Toque em "Novo gasto" para começar.</div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function DashboardView({ expenses, filtered, byCat, total, onEdit, onDelete, onAdd, budget }) {
  const count = filtered.length;
  const media = count ? total / count : 0;
  const topCat = byCat[0];

  return (
    <>
      <div className="stats">
        <Stat icon={Ic.coins} label="Total no período" value={fmtBRL(total)} accent meta={`${count} lançamentos`} />
        <Stat icon={Ic.receipt} label="Ticket médio" value={fmtBRL(media)} meta="por lançamento" />
        <Stat icon={Ic.target} label="Maior categoria"
          value={topCat ? topCat.nome : "—"} meta={topCat ? fmtBRL(topCat.valor) : ""} />
        <Stat icon={Ic.calendar} label="Gasto hoje"
          value={fmtBRL(expenses.filter(e => e.data === todayISO()).reduce((s, e) => s + e.valor, 0))}
          meta={fmtDateLong(todayISO())} />
      </div>

      <div className="grid-2">
        <div className="panel glass">
          <div className="panel-head">
            <div className="panel-title">Lançamentos recentes</div>
            <button className="btn btn-primary" onClick={onAdd}><Ic.plus size={17} />Adicionar</button>
          </div>
          <ExpenseTable rows={filtered.slice(0, 8)} onEdit={onEdit} onDelete={onDelete} />
        </div>

        <div className="panel glass">
          <div className="panel-head"><div className="panel-title">Distribuição</div></div>
          {total > 0
            ? <>
                <Donut data={byCat} total={total} budget={budget} />
                <BudgetBar total={total} budget={budget} />
              </>
            : <div className="empty"><Ic.chart size={40} />Sem dados no período</div>
          }
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1fr", marginTop: 16 }}>
        <div className="panel glass">
          <div className="panel-head"><div className="panel-title">Gastos dos últimos 7 dias</div></div>
          <WeekBars expenses={expenses} />
        </div>
      </div>
    </>
  );
}

/* ============================================================
   GASTOS
   ============================================================ */
function GastosView({ filtered, total, byCat, onEdit, onDelete, onAdd, onImport,
  period, setPeriod, cat, setCat, search, setSearch, allCats }) {
  const [showImport, setShowImport] = useS(false);
  return (
    <>
      {showImport && <BankImportModal onImport={onImport} onClose={() => setShowImport(false)} />}
      <div className="panel glass" style={{ marginBottom: 16 }}>
        <div className="panel-head" style={{ flexWrap: "wrap", gap: 10 }}>
          <Filters {...{ period, setPeriod, cat, setCat, search, setSearch, allCats }} />
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button className="btn btn-ghost" onClick={() => setShowImport(true)}>
              <Ic.download size={17} />Extrato
            </button>
            <button className="btn btn-primary" onClick={onAdd}><Ic.plus size={17} />Adicionar</button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16, padding: "0 2px" }}>
          <span style={{ color: "var(--text-mid)", fontSize: 13.5, fontWeight: 600 }}>Total filtrado</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--accent-mint)", fontVariantNumeric: "tabular-nums" }}>{fmtBRL(total)}</span>
          <span style={{ color: "var(--text-lo)", fontSize: 13 }}>· {filtered.length} lançamentos</span>
        </div>
        <ExpenseTable rows={filtered} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </>
  );
}

/* ============================================================
   RELATÓRIOS
   ============================================================ */
function RelatoriosView({ expenses, byCat, total }) {
  const maxCat = byCat[0]?.valor || 1;
  return (
    <>
      <div className="grid-2">
        <div className="panel glass">
          <div className="panel-head"><div className="panel-title">Por categoria</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {byCat.filter(c => c.valor > 0).map(c => (
              <div key={c.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13.5 }}>
                  <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="dot" style={{ background: c.hex }} />{c.nome}
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{fmtBRL(c.valor)}</span>
                </div>
                <div style={{ height: 9, borderRadius: 20, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 20, width: `${(c.valor / maxCat) * 100}%`,
                    background: c.hex, transition: "width 0.7s ease", boxShadow: `0 0 10px ${c.hex}66` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel glass">
          <div className="panel-head"><div className="panel-title">Composição</div></div>
          {total > 0 ? <Donut data={byCat} total={total} /> : <div className="empty">Sem dados</div>}
        </div>
      </div>
      <div className="grid-2" style={{ gridTemplateColumns: "1fr", marginTop: 16 }}>
        <div className="panel glass">
          <div className="panel-head"><div className="panel-title">Evolução — últimos 7 dias</div></div>
          <WeekBars expenses={expenses} />
        </div>
      </div>
    </>
  );
}

/* ============================================================
   CONFIGURAÇÕES
   ============================================================ */
function ConfigView({ settings, setSettings, onReset, allCats, onAddCat, onDeleteCat }) {
  const toggle = (k) => setSettings(s => ({ ...s, [k]: !s[k] }));
  const baseCatIds = new Set(["comida","transporte","moradia","lazer","saude","compras","contas","outros"]);

  const [newCatName, setNewCatName] = useS("");
  const [newCatColor, setNewCatColor] = useS(CAT_PRESET_COLORS[0]);
  const [budgetInput, setBudgetInput] = useS(String(settings.budget || ""));

  const submitCat = () => {
    const nome = newCatName.trim();
    if (!nome) return;
    const id = nome.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") + "_" + uid().slice(0,4);
    onAddCat({ id, nome, hex: newCatColor, cor: newCatColor });
    setNewCatName("");
  };

  const saveBudget = () => {
    const v = parseFloat(budgetInput.replace(",", "."));
    setSettings(s => ({ ...s, budget: isNaN(v) ? 0 : v }));
  };

  const rows = [
    ["autoCat", "Categorização automática", "Detecta a categoria pela descrição do gasto."],
    ["glow", "Efeitos de iluminação", "Brilho sutil em cards e inputs (glassmorphism)."],
    ["animations", "Animações de fundo", "Movimento suave do gradiente ambiente."],
    ["confirmDelete", "Confirmar exclusão", "Pede confirmação antes de excluir um gasto."],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="grid-2" style={{ gridTemplateColumns: "1.2fr 1fr", alignItems: "start" }}>
        {/* Preferências */}
        <div className="panel glass">
          <div className="panel-head"><div className="panel-title">Preferências</div></div>
          <div className="set-list">
            {rows.map(([k, t, d]) => (
              <div className="set-row" key={k}>
                <div className="set-info"><div className="t">{t}</div><div className="d">{d}</div></div>
                <div className={"switch" + (settings[k] ? " on" : "")} onClick={() => toggle(k)} />
              </div>
            ))}
          </div>
        </div>

        {/* Conta & Orçamento */}
        <div className="panel glass">
          <div className="panel-head"><div className="panel-title">Conta & dados</div></div>
          <div className="set-row">
            <div className="set-info"><div className="t">Moeda</div><div className="d">Real brasileiro (BRL)</div></div>
            <span className="exp-tag" style={{ color: "var(--cat-saude)", borderColor: "var(--cat-saude)44", background: "var(--cat-saude)22" }}>R$</span>
          </div>
          <div className="set-row" style={{ flexWrap: "wrap", gap: 10 }}>
            <div className="set-info">
              <div className="t">Orçamento mensal</div>
              <div className="d">Teto de gastos para os alertas de cor</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input className="form-input" style={{ width: 110, textAlign: "right", padding: "10px 12px" }}
                type="number" min="0" value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                onBlur={saveBudget}
                onKeyDown={e => e.key === "Enter" && saveBudget()}
                placeholder="2000" />
            </div>
          </div>
          <div className="set-row">
            <div className="set-info"><div className="t">Restaurar exemplo</div><div className="d">Recarrega os dados de demonstração</div></div>
            <button className="btn btn-ghost" style={{ padding: "10px 14px" }} onClick={onReset}>Restaurar</button>
          </div>
        </div>
      </div>

      {/* Categorias */}
      <div className="panel glass">
        <div className="panel-head"><div className="panel-title">Categorias</div></div>
        <div className="cat-grid">
          {allCats.map(c => (
            <div className="cat-item" key={c.id}>
              <span className="dot" style={{ background: c.hex, width: 10, height: 10 }} />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{c.nome}</span>
              {!baseCatIds.has(c.id) && (
                <button className="icon-btn danger" style={{ width: 28, height: 28, opacity: 0.7 }}
                  onClick={() => onDeleteCat(c.id)}>
                  <Ic.trash size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="cat-add-form">
          <input className="form-input" style={{ flex: 1 }}
            value={newCatName} onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitCat()}
            placeholder="Nome da nova categoria" />
          <div className="color-palette">
            {CAT_PRESET_COLORS.map(hex => (
              <div key={hex} className={"color-dot" + (newCatColor === hex ? " on" : "")}
                style={{ background: hex }}
                onClick={() => setNewCatColor(hex)} />
            ))}
          </div>
          <button className="btn btn-primary" style={{ padding: "10px 16px" }} onClick={submitCat}>
            <Ic.plus size={16} />Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  HomeView, DashboardView, GastosView, RelatoriosView, ConfigView,
  ExpenseTable, Filters, Stat, BudgetBar, BankImportModal,
});

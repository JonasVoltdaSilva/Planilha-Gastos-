/* ============================================================
   Views: Dashboard · Gastos · Relatórios · Configurações
   ============================================================ */
const { useState: useS, useMemo: useM } = React;

/* ---------- Agrupamento cronológico ---------- */
function groupExpensesByDate(rows) {
  const today = todayISO();
  const yesterday = addDays(today, -1);
  const weekStart = addDays(today, -6);
  const prevWeekStart = addDays(today, -13);
  const currYear = new Date().getFullYear();
  const groupMap = new Map();
  const order = [];
  for (const e of rows) {
    let label;
    if (e.data === today) label = "Hoje";
    else if (e.data === yesterday) label = "Ontem";
    else if (e.data >= weekStart) label = "Esta semana";
    else if (e.data >= prevWeekStart) label = "Semana passada";
    else {
      const d = new Date(e.data + "T12:00:00");
      const m = d.toLocaleString("pt-BR", { month: "long" });
      const y = d.getFullYear();
      const cap = m.charAt(0).toUpperCase() + m.slice(1);
      label = y === currYear ? cap : `${cap} de ${y}`;
    }
    if (!groupMap.has(label)) { groupMap.set(label, []); order.push(label); }
    groupMap.get(label).push(e);
  }
  return order.map(label => ({ label, rows: groupMap.get(label) }));
}

/* ---------- Lista agrupada por período ---------- */
function GroupedExpenseList({ rows, onEdit, onDelete, onDeleteGroup, cards }) {
  if (!rows || rows.length === 0) return null;
  const groups = groupExpensesByDate(rows);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {groups.map(({ label, rows: gr }) => {
        const total = gr.filter(e => e.kind !== "entrada").reduce((s, e) => s + e.valor, 0);
        return (
          <div key={label}>
            <div className="group-header">
              <span className="group-header-label">{label}</span>
              {total > 0 && <span className="group-header-total">−{fmtBRLshort(total)}</span>}
            </div>
            <ExpenseTable rows={gr} onEdit={onEdit} onDelete={onDelete}
              onDeleteGroup={onDeleteGroup} cards={cards} emptyText="" />
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Empty state acolhedor ---------- */
function EmptyState({ title, text, onAdd, icon }) {
  const I = icon || Ic.coins;
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><I size={46} /></div>
      <div className="empty-state-title">{title || "Nada por aqui ainda"}</div>
      <div className="empty-state-text">{text || "Adicione sua primeira transação tocando no botão abaixo."}</div>
      {onAdd && (
        <button className="btn btn-primary empty-state-btn" onClick={onAdd}>
          <Ic.plus size={17} />Adicionar transação
        </button>
      )}
    </div>
  );
}

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
function ExpenseTable({ rows, onEdit, onDelete, onDeleteGroup, cards, emptyText }) {
  if (rows.length === 0) {
    return (
      <div className="empty">
        <Ic.receipt size={40} />
        <div style={{ fontWeight: 600, color: "var(--text-mid)" }}>{emptyText || "Nenhum lançamento encontrado"}</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>Adicione um lançamento ou ajuste os filtros.</div>
      </div>
    );
  }
  return (
    <div className="expense-list">
      {rows.map(e => {
        const isEntrada = e.kind === "entrada";
        const c = isEntrada
          ? { hex: "#5ad9a8", nome: "Entrada" }
          : (CAT_MAP[e.categoria] || CAT_MAP["outros"]);
        const t = TIPO_MAP[e.tipo] || TIPO_MAP["outros"];
        const linkedCard = e.cardId && cards ? cards.find(cd => cd.id === e.cardId) : null;
        return (
          <div className="expense-row" key={e.id} style={{ "--row-accent": c.hex }}>
            <div className="expense-accent" />
            <div className="expense-main">
              <div className="expense-info">
                <span className="expense-desc">{e.descricao}</span>
                <div className="expense-meta">
                  <span className="expense-date">{fmtDate(e.data)}</span>
                  {isEntrada ? (
                    <span className="exp-tag" style={{ background: "rgba(90,217,168,0.15)", color: "var(--accent-mint)", borderColor: "rgba(90,217,168,0.3)" }}>
                      Entrada
                    </span>
                  ) : (
                    <span className="exp-tag" style={{ background: c.hex + "22", color: c.hex, borderColor: c.hex + "44" }}>
                      {c.nome}
                    </span>
                  )}
                  {!isEntrada && (
                    <span className="exp-tag" style={{ background: t.hex + "22", color: t.hex, borderColor: t.hex + "44" }}>
                      {t.nome}
                    </span>
                  )}
                  {linkedCard && (
                    <span className="exp-tag" style={{ background: linkedCard.cor + "22", color: linkedCard.cor, borderColor: linkedCard.cor + "44" }}>
                      <Ic.card size={10} />{linkedCard.nome}
                    </span>
                  )}
                </div>
              </div>
              <div className="expense-right">
                <span className="expense-val" style={isEntrada ? { color: "var(--accent-mint)" } : {}}>
                  {isEntrada ? "+" : ""}{fmtBRL(e.valor)}
                </span>
                <div className="row-actions">
                  <button className="icon-btn" title="Editar" onClick={() => onEdit(e)}><Ic.edit size={15} /></button>
                  {e.parcGrupo && onDeleteGroup && (
                    <button className="icon-btn" title={`Excluir todas as ${e.parcTotal} parcelas`}
                      style={{ fontSize: 9, gap: 2 }}
                      onClick={() => onDeleteGroup(e.parcGrupo)}>
                      <Ic.trash size={13} /><span style={{ fontSize: 9, lineHeight: 1 }}>×{e.parcTotal}</span>
                    </button>
                  )}
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

/* ---------- Filtros (legado, mantido para compatibilidade) ---------- */
function Filters({ period, setPeriod, cat, setCat, search, setSearch, allCats }) {
  const cats = allCats || CATEGORIES;
  return (
    <div className="filters">
      <div className="field" style={{ flex: 1, minWidth: 0 }}>
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

/* ---------- FilterSheet — modal com chips de filtro avançado ---------- */
function FilterSheet({ allCats, cards, cat, setCat, tipoFilter, setTipoFilter, cardIdFilter, setCardIdFilter, onClose }) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal glass">
        <div className="modal-handle" />
        <h3>Filtros avançados</h3>

        <div className="filter-section">
          <div className="filter-section-title">Categoria</div>
          <div className="filter-chips">
            <button type="button" className={"filter-chip" + (cat === "all" ? " on" : "")}
              style={{ "--chip-color": "var(--text-mid)" }} onClick={() => setCat("all")}>
              Todas
            </button>
            {(allCats || CATEGORIES).map(c => (
              <button key={c.id} type="button" className={"filter-chip" + (cat === c.id ? " on" : "")}
                style={{ "--chip-color": c.hex }} onClick={() => setCat(c.id)}>
                <span className="dot" style={{ background: c.hex }} />{c.nome}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-section-title">Tipo de pagamento</div>
          <div className="filter-chips">
            <button type="button" className={"filter-chip" + (tipoFilter === "all" ? " on" : "")}
              style={{ "--chip-color": "var(--text-mid)" }} onClick={() => setTipoFilter("all")}>
              Todos
            </button>
            {TIPOS.map(t => (
              <button key={t.id} type="button" className={"filter-chip" + (tipoFilter === t.id ? " on" : "")}
                style={{ "--chip-color": t.hex }} onClick={() => setTipoFilter(t.id)}>
                {t.nome}
              </button>
            ))}
          </div>
        </div>

        {cards && cards.length > 0 && (
          <div className="filter-section">
            <div className="filter-section-title">Cartão</div>
            <div className="filter-chips">
              <button type="button" className={"filter-chip" + (cardIdFilter === "all" ? " on" : "")}
                style={{ "--chip-color": "var(--text-mid)" }} onClick={() => setCardIdFilter("all")}>
                Todos
              </button>
              {cards.map(c => (
                <button key={c.id} type="button" className={"filter-chip" + (cardIdFilter === c.id ? " on" : "")}
                  style={{ "--chip-color": c.cor || "var(--accent-mint)" }} onClick={() => setCardIdFilter(c.id)}>
                  <Ic.card size={13} />{c.nome}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => { setCat("all"); setTipoFilter("all"); setCardIdFilter("all"); }}>
            Limpar
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            <Ic.check size={17} />Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- FilterBar — barra de busca + período + botão filtros ---------- */
function FilterBar({ period, setPeriod, cat, setCat, search, setSearch, tipoFilter, setTipoFilter,
  cardIdFilter, setCardIdFilter, allCats, cards, onOpenSheet }) {
  const activeCount = (cat !== "all" ? 1 : 0) + (tipoFilter !== "all" ? 1 : 0) + (cardIdFilter !== "all" ? 1 : 0);
  const cats = allCats || CATEGORIES;

  return (
    <>
      <div className="filter-bar">
        <div className="field" style={{ flex: 1, minWidth: 0 }}>
          <input className="input" style={{ width: "100%", paddingLeft: 36 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar descrição..." />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-lo)", display: "flex" }}>
            <Ic.search size={16} />
          </span>
        </div>
        <div className="field sel">
          <select className="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="mes-atual">Este mês</option>
            <option value="mes-anterior">Mês passado</option>
            <option value="7">7 dias</option>
            <option value="14">14 dias</option>
            <option value="30">30 dias</option>
            <option value="all">Todo período</option>
          </select>
        </div>
        <button className={"btn btn-ghost filter-btn" + (activeCount > 0 ? " active" : "")} onClick={onOpenSheet}>
          <Ic.filter size={16} />Filtros
          {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
        </button>
      </div>
      {activeCount > 0 && (
        <div className="active-filters">
          {cat !== "all" && (() => {
            const c = cats.find(x => x.id === cat);
            return c ? (
              <button className="active-chip" style={{ "--chip-color": c.hex }} onClick={() => setCat("all")}>
                <span className="dot" style={{ background: c.hex }} />{c.nome} ×
              </button>
            ) : null;
          })()}
          {tipoFilter !== "all" && (() => {
            const t = TIPOS.find(x => x.id === tipoFilter);
            return t ? (
              <button className="active-chip" style={{ "--chip-color": t.hex }} onClick={() => setTipoFilter("all")}>
                {t.nome} ×
              </button>
            ) : null;
          })()}
          {cardIdFilter !== "all" && cards && (() => {
            const c = cards.find(x => x.id === cardIdFilter);
            return c ? (
              <button className="active-chip" style={{ "--chip-color": c.cor || "var(--accent-mint)" }} onClick={() => setCardIdFilter("all")}>
                <Ic.card size={11} />{c.nome} ×
              </button>
            ) : null;
          })()}
          <button className="active-chip active-chip-clear"
            onClick={() => { setCat("all"); setTipoFilter("all"); setCardIdFilter("all"); }}>
            Limpar tudo
          </button>
        </div>
      )}
    </>
  );
}

/* ---------- RecRuleEditor — seletor genérico de recorrência ---------- */
function RecRuleEditor({ label, value, onChange }) {
  const type = (value && value.type) || "fixed_day";
  const bStyle = (t) => ({
    flex: 1, padding: "6px 4px", borderRadius: "var(--radius-sm)",
    fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "center",
    background: type === t ? "var(--accent-mint-soft)" : "rgba(255,255,255,0.05)",
    border: `1px solid ${type === t ? "var(--accent-mint)" : "var(--glass-border)"}`,
    color: type === t ? "var(--accent-mint)" : "var(--text-mid)",
    transition: "all 0.15s",
  });
  const merge = (patch) => onChange({ ...(value || {}), type, ...patch });
  return (
    <div>
      {label && (
        <div style={{ fontSize: 11, color: "var(--text-lo)", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </div>
      )}
      <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
        {[["fixed_day","Dia fixo"],["nth_biz","N-ésimo útil"],["first_biz_after","Útil após data"]].map(([v,l]) => (
          <button key={v} type="button" style={bStyle(v)}
            onClick={() => onChange({ ...(value || {}), type: v })}>{l}</button>
        ))}
      </div>
      {type === "fixed_day" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--text-mid)", flexShrink: 0 }}>Todo dia</span>
          <input className="form-input" type="number" min="1" max="31" style={{ width: 72 }}
            value={value?.day ?? 1}
            onChange={e => merge({ day: parseInt(e.target.value) || 1 })} />
          <span style={{ fontSize: 13, color: "var(--text-lo)" }}>do mês</span>
        </div>
      )}
      {type === "nth_biz" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select className="select" style={{ flex: 1 }}
            value={String(value?.pos ?? "1")}
            onChange={e => merge({ pos: e.target.value === "last" ? "last" : parseInt(e.target.value) })}>
            {["1","2","3","4","5"].map(n => <option key={n} value={n}>{n}º dia útil</option>)}
            <option value="last">Último dia útil</option>
          </select>
          <span style={{ fontSize: 13, color: "var(--text-lo)", flexShrink: 0 }}>do mês</span>
        </div>
      )}
      {type === "first_biz_after" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--text-mid)", flexShrink: 0 }}>1º útil após o dia</span>
          <input className="form-input" type="number" min="1" max="31" style={{ width: 72 }}
            value={value?.ref ?? 5}
            onChange={e => merge({ ref: parseInt(e.target.value) || 1 })} />
        </div>
      )}
    </div>
  );
}

/* ---------- CardManager — CRUD de cartões ---------- */
const CARD_COLORS = ["#a98ae0", "#5aa3e0", "#5ad9a8", "#e0a85a", "#e08a7a", "#e08ac8", "#5ac4d9", "#9aa3b0"];

function CardManager({ cards, onAddCard, onDeleteCard }) {
  const [name, setName] = useS("");
  const [recFechamento, setRecFechamento] = useS({ type: "fixed_day", day: 20 });
  const [recVencimento, setRecVencimento] = useS({ type: "fixed_day", day: 5 });
  const [cor, setCor] = useS(CARD_COLORS[0]);

  const submit = () => {
    const nome = name.trim();
    if (!nome) return;
    const diaFech = recFechamento.type === "fixed_day" ? (recFechamento.day || 20) : 1;
    const diaVenc = recVencimento.type === "fixed_day" ? (recVencimento.day || 5) : 1;
    onAddCard({ id: uid(), nome, diaFechamento: diaFech, diaVencimento: diaVenc, recFechamento, recVencimento, cor });
    setName("");
    setRecFechamento({ type: "fixed_day", day: 20 });
    setRecVencimento({ type: "fixed_day", day: 5 });
  };

  return (
    <div className="panel glass">
      <div className="panel-head"><div className="panel-title">Cartões de crédito</div></div>
      {cards.length > 0 && (
        <div className="card-list">
          {cards.map(c => {
            const rFech = c.recFechamento || { type: "fixed_day", day: c.diaFechamento || 20 };
            const rVenc = c.recVencimento || { type: "fixed_day", day: c.diaVencimento || 5 };
            const dFech = window.describeRecRule ? window.describeRecRule(rFech) : `Dia ${c.diaFechamento || 20}`;
            const dVenc = window.describeRecRule ? window.describeRecRule(rVenc) : `Dia ${c.diaVencimento || 5}`;
            return (
              <div className="card-item" key={c.id}>
                <span className="card-color-dot" style={{ background: c.cor }} />
                <Ic.card size={16} style={{ color: c.cor, flexShrink: 0 }} />
                <span style={{ flex: 1, fontWeight: 600, fontSize: 13.5 }}>{c.nome}</span>
                <span className="exp-tag" style={{ background: c.cor + "22", color: c.cor, borderColor: c.cor + "44" }}>
                  fecha {dFech}
                </span>
                <span className="exp-tag" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-mid)", borderColor: "var(--glass-border)" }}>
                  vence {dVenc}
                </span>
                <button className="icon-btn danger" onClick={() => onDeleteCard(c.id)}><Ic.trash size={14} /></button>
              </div>
            );
          })}
        </div>
      )}
      <div className="card-add-form">
        <input className="form-input" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Nome do cartão (ex.: Nubank, Inter)" />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <RecRuleEditor label="Fechamento" value={recFechamento} onChange={setRecFechamento} />
          <RecRuleEditor label="Vencimento" value={recVencimento} onChange={setRecVencimento} />
        </div>
        <div>
          <div className="form-label" style={{ marginBottom: 6 }}>Cor</div>
          <div className="color-palette" style={{ paddingTop: 4 }}>
            {CARD_COLORS.map(hex => (
              <div key={hex} className={"color-dot" + (cor === hex ? " on" : "")}
                style={{ background: hex }} onClick={() => setCor(hex)} />
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={submit}><Ic.plus size={16} />Adicionar cartão</button>
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
    /* detecta OFX/CSV colado como texto também */
    const results = window.parseImportFile("", raw);
    setPreview(results);
    setSelected(new Set(results.map((_, i) => i)));
  };

  const setResults = (results) => {
    setPreview(results);
    setSelected(new Set(results.map((_, i) => i)));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfName(file.name);
    setPdfLoading(true);
    try {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      if (ext === "pdf") {
        const lib = window.pdfjsLib;
        if (!lib) throw new Error("PDF.js não carregado");
        const buf = await file.arrayBuffer();
        const pdf = await lib.getDocument({ data: buf }).promise;
        let full = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const pg = await pdf.getPage(i);
          const ct = await pg.getTextContent();
          /* Reconstrói as linhas reais pela coordenada Y de cada fragmento.
             Antes a página inteira virava uma linha só — o parser não achava nada. */
          const rowsByY = new Map();
          for (const it of ct.items) {
            if (!it.str || !it.str.trim()) continue;
            const y = Math.round(it.transform[5] / 3) * 3;
            if (!rowsByY.has(y)) rowsByY.set(y, []);
            rowsByY.get(y).push(it);
          }
          const lines = [...rowsByY.entries()]
            .sort((a, b) => b[0] - a[0])
            .map(([, items]) => items
              .sort((a, b) => a.transform[4] - b.transform[4])
              .map(i2 => i2.str).join(" "));
          full += lines.join("\n") + "\n";
        }
        setResults(parseStatement(full));
      } else {
        const txt = await file.text();
        setResults(window.parseImportFile(file.name, txt));
      }
    } catch (err) {
      alert("Não foi possível ler o arquivo. Tente colar o texto manualmente.");
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
                <Ic.upload size={15} />Arquivo
              </div>
            </div>

            {tab === "text" ? (
              <>
                <p style={{ color: "var(--text-mid)", fontSize: 13.5, marginBottom: 16 }}>
                  Cole o texto do extrato (Bradesco, Itaú, Santander, Nubank, Inter…). O app detecta datas, valores e categoriza automaticamente.
                </p>
                <textarea className="import-textarea"
                  value={text} onChange={e => setText(e.target.value)}
                  placeholder={"Formatos aceitos:\n02/06 PIX MERCADO LIVRE 150,00\n04/06/2025 DÉBITO UBER 22,90\n04 JUN RESTAURANTE XPTO 45,00\nAMAZON 89,99\n..."} />
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
                  Envie o extrato em <strong>OFX</strong>, <strong>CSV</strong> ou <strong>PDF</strong>.
                  O OFX é o mais preciso — escolha esse formato no app do banco se disponível.
                </p>
                <label className="pdf-upload-area">
                  <input type="file" accept=".pdf,.ofx,.csv,.txt,application/pdf" onChange={handleFileUpload} style={{ display: "none" }} />
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
                      <span style={{ color: "var(--text-mid)", fontSize: 14, fontWeight: 600 }}>Selecionar arquivo do extrato</span>
                      <span style={{ color: "var(--text-lo)", fontSize: 12 }}>OFX · CSV · PDF · TXT</span>
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
                const isEnt = e.kind === "entrada";
                const c = CAT_MAP[e.categoria] || CAT_MAP["outros"];
                const t = TIPO_MAP[e.tipo] || TIPO_MAP["outros"];
                const on = selected.has(i);
                return (
                  <div key={i} className={"import-row" + (on ? " sel" : "")} onClick={() => toggleRow(i)}>
                    <div className={"import-check" + (on ? " on" : "")}>{on ? "✓" : ""}</div>
                    <div className="import-date">{fmtDate(e.data)}</div>
                    <div className="import-desc">{e.descricao}</div>
                    <div className="import-tags">
                      {isEnt ? (
                        <span className="exp-tag" style={{ background: "rgba(90,217,168,0.15)", color: "var(--accent-mint)", borderColor: "rgba(90,217,168,0.3)" }}>Entrada</span>
                      ) : (
                        <span className="exp-tag" style={{ background: c.hex + "22", color: c.hex, borderColor: c.hex + "44" }}>{c.nome}</span>
                      )}
                      {!isEnt && <span className="exp-tag" style={{ background: t.hex + "22", color: t.hex, borderColor: t.hex + "44" }}>{t.nome}</span>}
                    </div>
                    <div className="import-val" style={isEnt ? { color: "var(--accent-mint)" } : {}}>{isEnt ? "+" : ""}{fmtBRL(e.valor)}</div>
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
function HomeView({ expenses, budget, onAdd, onEdit, onDelete, onDeleteGroup, cards, userName, faturaOverrides, onGoToFaturas, fixas, caloteiros, onGoToConfig }) {
  const [showNotifs, setShowNotifs] = useS(false);
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthExp = expenses.filter(e => e.data && e.data.startsWith(monthStr));
  const monthGastos = monthExp.filter(e => e.kind !== "entrada").reduce((s, e) => s + e.valor, 0);
  const monthEntradas = monthExp.filter(e => e.kind === "entrada").reduce((s, e) => s + e.valor, 0);
  const saldo = (budget || 0) - monthGastos + monthEntradas;
  const pct = budget > 0 ? Math.min((monthGastos / budget) * 100, 100) : 0;
  const budgetColor = budget <= 0 ? "var(--accent-mint)"
    : pct < 60 ? "var(--accent-mint)"
    : pct < 85 ? "#e0c85a"
    : "var(--cat-saude)";
  const h = now.getHours();
  const greeting = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const recent = [...monthExp].filter(e => e.kind !== "entrada").sort((a, b) => b.data.localeCompare(a.data));
  const monthName = now.toLocaleString("pt-BR", { month: "long" });
  const todayDay = now.getDate();

  const pendingFaturas = useM(() => {
    if (!cards || cards.length === 0) return [];
    return computeFaturas(cards, expenses, faturaOverrides || {})
      .filter(f => f.status !== "paga" && f.total > 0);
  }, [cards, expenses, faturaOverrides]);

  const pendingCaloteiros = (caloteiros || []).filter(c => !c.pago);
  const totalCaloteiros = pendingCaloteiros.reduce((s, c) => s + c.valor, 0);
  const totalFixas = (fixas || []).reduce((s, f) => s + f.valor, 0);

  const notifications = useM(() => {
    const list = [];
    // Faturas próximas do vencimento — agrupadas em uma única notificação
    const fatVencendo = [];
    (cards || []).forEach(c => {
      // computeFaturas already applies faturaOverrides → status "paga" is already reflected
      const fatura = computeFaturas([c], expenses, faturaOverrides || {})
        .find(f => f.total > 0 && f.status !== "paga");
      if (!fatura) return;
      const [fy, fm] = fatura.mes.split("-").map(Number);
      const dueDate = new Date(fy, fm, c.diaVencimento); // month after billing month
      const diff = Math.ceil((dueDate - now) / 86400000);
      if (diff >= 0 && diff <= 7) fatVencendo.push({ diff, total: fatura.total });
    });
    if (fatVencendo.length > 0) {
      const totalFat = fatVencendo.reduce((s, f) => s + f.total, 0);
      const minDiff = Math.min(...fatVencendo.map(f => f.diff));
      const urgente = minDiff <= 1;
      const detalhe = minDiff === 0 ? "vence hoje!" : `vence em ${minDiff} dia${minDiff === 1 ? "" : "s"}`;
      list.push({ id: "fat-all", urgente,
        texto: `${fatVencendo.length} fatura${fatVencendo.length !== 1 ? "s" : ""} pendente${fatVencendo.length !== 1 ? "s" : ""} · ${fmtBRL(totalFat)}`,
        detalhe });
    }
    // Devedores com alerta no dia
    (caloteiros || []).filter(c => !c.pago && c.alertaDia).forEach(c => {
      const diff = c.alertaDia - todayDay;
      if (diff >= -1 && diff <= 3) {
        const detalhe = diff === 0 ? "cobrar hoje!" : diff === 1 ? "cobrar amanhã" : diff === -1 ? "era ontem" : `cobrar em ${diff} dias`;
        list.push({ id: `cal-${c.id}`, urgente: diff <= 0,
          texto: `Cobrar ${c.nome}`,
          detalhe: `${detalhe} · ${fmtBRL(c.valor)}` });
      }
    });
    return list;
  }, [cards, expenses, faturaOverrides, caloteiros, monthStr, todayDay]);

  return (
    <>
      {showNotifs && notifications.length > 0 && ReactDOM.createPortal(
        <>
          <div className="notif-overlay" onClick={() => setShowNotifs(false)} />
          <div className="notif-panel glass">
            <div className="notif-panel-head">
              <div className="notif-panel-title-row">
                <div className="notif-panel-icon"><Ic.bell size={15} /></div>
                <span>Alertas</span>
              </div>
              <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => setShowNotifs(false)}>
                <Ic.close size={14} />
              </button>
            </div>
            <div className="notif-list">
              {notifications.map(n => (
                <div key={n.id} className={"notif-item" + (n.urgente ? " urgente" : "")}>
                  <div className={"notif-item-dot" + (n.urgente ? " urgente" : "")} />
                  <div className="notif-item-body">
                    <div className="notif-item-text">{n.texto}</div>
                    <div className="notif-item-sub">{n.detalhe}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}

      <div className="home-hero glass">
        <div className="home-hero-top">
          <div>
            <div className="home-greeting">{greeting}, <strong>{userName || "Luiz Ricardo"}</strong>!</div>
            <div className="home-date">{fmtDateLong(todayISO())}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {notifications.length > 0 && (
              <button className="notif-bell-btn" onClick={() => setShowNotifs(s => !s)} title="Alertas">
                <Ic.bell size={17} />
                <span className="notif-badge">{notifications.length}</span>
              </button>
            )}
            <button className="btn btn-primary btn-desktop-only" onClick={onAdd}>
              <Ic.plus size={18} />Novo lançamento
            </button>
          </div>
        </div>

        {/* Hero balance */}
        <div className="home-balance">
          <div className="home-balance-label">Saldo disponível</div>
          <div className="home-balance-value" style={{ color: saldo >= 0 ? "var(--accent-mint)" : "#e08a7a" }}>
            {saldo < 0 && "−"}{fmtBRL(Math.abs(saldo))}
          </div>
        </div>

        {/* 2×2 stat grid */}
        <div className="home-stats-grid">
          <div className="home-stat-card">
            <div className="home-stat-card-label">Gastos em {monthName}</div>
            <div className="home-stat-card-value" style={{ color: "#e08a7a" }}>{fmtBRL(monthGastos)}</div>
            <div className="home-stat-card-meta">{monthExp.filter(e => e.kind !== "entrada").length} lançamentos</div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-card-label">Entradas do mês</div>
            <div className="home-stat-card-value" style={{ color: "var(--accent-mint)" }}>{fmtBRL(monthEntradas)}</div>
            <div className="home-stat-card-meta">{monthExp.filter(e => e.kind === "entrada").length} entradas</div>
          </div>
          {budget > 0 && (
            <div className="home-stat-card home-stat-card-wide">
              <div className="home-stat-card-label">Orçamento</div>
              <div className="home-stat-card-value" style={{ color: budgetColor }}>{Math.round(pct)}%</div>
              <div className="home-stat-card-meta">{fmtBRL(monthGastos)} / {fmtBRL(budget)}</div>
            </div>
          )}
        </div>

        {budget > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="budget-bar-track">
              <div className="budget-bar-fill" style={{ width: `${pct}%`, background: budgetColor }} />
            </div>
          </div>
        )}
      </div>

      {/* Últimas compras */}
      {recent.length > 0 && (
        <div className="panel glass">
          <div className="panel-head">
            <div className="panel-title">Últimas compras</div>
          </div>
          <ExpenseTable rows={recent.slice(0, 5)} onEdit={onEdit} onDelete={onDelete} onDeleteGroup={onDeleteGroup} cards={cards} />
        </div>
      )}
    </>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function DashboardView({ expenses, filtered, byCat, total, onEdit, onDelete, onDeleteGroup, onAdd, budget, cards }) {
  const gastos = filtered.filter(e => e.kind !== "entrada");
  const entradas = filtered.filter(e => e.kind === "entrada");
  const count = gastos.length;
  const media = count ? total / count : 0;
  const topCat = byCat[0];
  const entradasTotal = entradas.reduce((s, e) => s + e.valor, 0);
  const saldo = entradasTotal - total;
  const savingsRate = entradasTotal > 0 ? Math.round((saldo / entradasTotal) * 100) : null;

  return (
    <>
      <div className="stats">
        <Stat icon={Ic.coins} label="Gastos no período" value={fmtBRL(total)} accent meta={`${count} lançamentos`} />
        <Stat icon={Ic.trendUp} label="Entradas no período" value={fmtBRL(entradasTotal)}
          meta={`${entradas.length} entr${entradas.length === 1 ? "ada" : "adas"}`} />
        <Stat icon={Ic.receipt} label="Ticket médio" value={fmtBRL(media)} meta="por gasto" />
        <Stat icon={Ic.target} label="Saldo do período"
          value={fmtBRL(Math.abs(saldo))}
          meta={savingsRate !== null ? `${savingsRate >= 0 ? "+" : ""}${savingsRate}% da renda` : (saldo >= 0 ? "positivo" : "negativo")}
          metaDir={saldo >= 0 ? "down" : "up"} />
      </div>

      <div className="grid-2">
        <div className="panel glass">
          <div className="panel-head">
            <div className="panel-title">Lançamentos recentes</div>
            <button className="btn btn-primary btn-desktop-only" onClick={onAdd}><Ic.plus size={17} />Adicionar</button>
          </div>
          <ExpenseTable rows={filtered.slice(0, 8)} onEdit={onEdit} onDelete={onDelete} onDeleteGroup={onDeleteGroup} cards={cards} />
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

    </>
  );
}

function EmprestimosSection({ emprestimos, onAdd, onDelete, onUpdate }) {
  const [form, setForm] = useS({ show: false, nome: "", valor: "", parcelas: "1", parcPaga: "0", tipo: "dado", obs: "" });

  const pending = (emprestimos || []).filter(e => e.parcPaga < e.parcelas);
  const done = (emprestimos || []).filter(e => e.parcPaga >= e.parcelas);

  const totalDado = pending.filter(e => e.tipo === "dado").reduce((s, e) => s + e.valor, 0);
  const totalRecebido = pending.filter(e => e.tipo === "recebido").reduce((s, e) => s + e.valor, 0);

  const submit = () => {
    const valor = parseFloat(form.valor.replace(",", "."));
    if (!form.nome.trim() || isNaN(valor) || valor <= 0) return;
    onAdd({ nome: form.nome.trim(), valor, parcelas: parseInt(form.parcelas) || 1, parcPaga: 0, tipo: form.tipo, obs: form.obs, data: todayISO() });
    setForm({ show: false, nome: "", valor: "", parcelas: "1", parcPaga: "0", tipo: "dado", obs: "" });
  };

  return (
    <div className="panel glass" style={{ marginTop: 16 }}>
      <div className="panel-head">
        <div className="panel-title"><Ic.coins size={17} />Empréstimos</div>
        <button className="btn btn-ghost" style={{ padding: "7px 12px", minHeight: 0, fontSize: 12 }}
          onClick={() => setForm(f => ({ ...f, show: !f.show }))}>
          {form.show ? "Cancelar" : <><Ic.plus size={14} />Novo</>}
        </button>
      </div>

      {(totalDado > 0 || totalRecebido > 0) && (
        <div style={{ display: "flex", gap: 16, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--glass-border)", flexWrap: "wrap" }}>
          {totalDado > 0 && <div><div style={{ fontSize: 11, color: "var(--text-lo)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Emprestado</div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#e08a7a" }}>{fmtBRL(totalDado)}</div></div>}
          {totalRecebido > 0 && <div><div style={{ fontSize: 11, color: "var(--text-lo)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Recebido</div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--accent-mint)" }}>{fmtBRL(totalRecebido)}</div></div>}
        </div>
      )}

      {form.show && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, padding: 14, background: "rgba(255,255,255,0.04)", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)" }}>
          <div className="tipo-picker">
            {[["dado","Emprestei"],["recebido","Peguei emprestado"]].map(([v,l]) => (
              <button key={v} type="button" className={"tipo-opt" + (form.tipo === v ? " on" : "")}
                style={{ "--tipo-hex": v === "dado" ? "#e08a7a" : "var(--accent-mint)" }}
                onClick={() => setForm(f => ({ ...f, tipo: v }))}>{l}</button>
            ))}
          </div>
          <input className="form-input" placeholder="Nome da pessoa" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
          <div style={{ display: "flex", gap: 8 }}>
            <input className="form-input" placeholder="Valor (R$)" type="number" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} style={{ flex: 2 }} />
            <input className="form-input" placeholder="Parcelas" type="number" min="1" value={form.parcelas} onChange={e => setForm(f => ({ ...f, parcelas: e.target.value }))} style={{ flex: 1 }} />
          </div>
          <input className="form-input" placeholder="Observação (opcional)" value={form.obs} onChange={e => setForm(f => ({ ...f, obs: e.target.value }))} />
          <button className="btn btn-primary" onClick={submit}>Adicionar empréstimo</button>
        </div>
      )}

      {pending.length === 0 && done.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-lo)", fontSize: 13, padding: "20px 0" }}>Nenhum empréstimo registrado</div>
      )}

      {[...pending, ...done].map(e => {
        const pct = e.parcelas > 0 ? Math.min(e.parcPaga / e.parcelas, 1) : 0;
        const quitado = e.parcPaga >= e.parcelas;
        const color = e.tipo === "dado" ? "#e08a7a" : "var(--accent-mint)";
        return (
          <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--glass-border)", opacity: quitado ? 0.55 : 1 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
                {e.nome}
                <span style={{ fontSize: 11, color: "var(--text-lo)", fontWeight: 400, marginLeft: 6 }}>{e.tipo === "dado" ? "emprestei" : "peguei"}</span>
              </div>
              {e.obs && <div style={{ fontSize: 12, color: "var(--text-lo)", marginBottom: 5 }}>{e.obs}</div>}
              {e.parcelas > 1 && (
                <div style={{ fontSize: 12, color: "var(--text-mid)", fontWeight: 600, marginBottom: 5 }}>
                  {fmtBRL(Math.round((e.valor / e.parcelas) * 100) / 100)}<span style={{ fontWeight: 400, color: "var(--text-lo)" }}>/parcela</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct * 100}%`, background: color, borderRadius: 999, transition: "width 0.4s" }} />
                </div>
                <span style={{ fontSize: 11, color: "var(--text-lo)", flexShrink: 0 }}>{e.parcPaga}/{e.parcelas}</span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color, marginBottom: 6 }}>{fmtBRL(e.valor)}</div>
              <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                {!quitado && <button className="icon-btn" title="Marcar parcela paga" style={{ width: 28, height: 28 }} onClick={() => onUpdate(e.id, { parcPaga: e.parcPaga + 1 })}><Ic.check size={13} /></button>}
                <button className="icon-btn danger" style={{ width: 28, height: 28 }} onClick={() => onDelete(e.id)}><Ic.trash size={13} /></button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FixasSection({ fixas, onAdd, onDelete, allCats }) {
  const BLANK = { show: false, nome: "", valor: "", catId: "contas", rec: { type: "fixed_day", day: 1 } };
  const [form, setForm] = useS(BLANK);
  const total = (fixas || []).reduce((s, f) => s + f.valor, 0);

  const submit = () => {
    const valor = parseFloat(form.valor.replace(",", "."));
    if (!form.nome.trim() || isNaN(valor) || valor <= 0) return;
    const rec = form.rec;
    const dia = rec.type === "fixed_day" ? (rec.day || 1) : 1;
    onAdd({ nome: form.nome.trim(), valor, dia, catId: form.catId, rec });
    setForm(BLANK);
  };

  return (
    <div className="panel glass">
      <div className="panel-head">
        <div className="panel-title"><Ic.receipt size={17} />Contas fixas</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {total > 0 && <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-mid)" }}>{fmtBRL(total)}/mês</span>}
          <button className="btn btn-ghost" style={{ padding: "7px 12px", minHeight: 0, fontSize: 12 }}
            onClick={() => setForm(p => ({ ...p, show: !p.show }))}>
            {form.show ? "Cancelar" : <><Ic.plus size={14} />Adicionar</>}
          </button>
        </div>
      </div>

      {form.show && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, padding: 14, background: "rgba(255,255,255,0.04)", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)" }}>
          <input className="form-input" placeholder="Nome (ex: Netflix, Aluguel)"
            value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
          <input className="form-input" placeholder="Valor (R$)" type="number"
            value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} />
          <RecRuleEditor label="Recorrência" value={form.rec}
            onChange={rec => setForm(p => ({ ...p, rec }))} />
          <select className="select" value={form.catId} onChange={e => setForm(p => ({ ...p, catId: e.target.value }))}>
            {(allCats || CATEGORIES).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <button className="btn btn-primary" onClick={submit}>Adicionar conta fixa</button>
        </div>
      )}

      {(fixas || []).length === 0 && !form.show && (
        <div style={{ textAlign: "center", color: "var(--text-lo)", fontSize: 13, padding: "16px 0" }}>Nenhuma conta fixa cadastrada</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {(fixas || []).map(f => {
          const cat = CAT_MAP[f.catId] || CAT_MAP["outros"];
          const recDesc = typeof window.describeRec === "function"
            ? window.describeRec(f) : `Todo dia ${f.dia}`;
          return (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", borderBottom: "1px solid var(--glass-border)" }}>
              <span className="exp-tag" style={{ background: cat.hex + "22", color: cat.hex, borderColor: cat.hex + "44", flexShrink: 0 }}>{cat.nome}</span>
              <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{f.nome}</div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>{fmtBRL(f.valor)}</div>
                <div style={{ fontSize: 11, color: "var(--text-lo)" }}>{recDesc}</div>
              </div>
              <button className="icon-btn danger" style={{ width: 28, height: 28, flexShrink: 0 }} onClick={() => onDelete(f.id)}><Ic.trash size={13} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CaloteirosSection({ caloteiros, onAdd, onDelete, onToggle }) {
  const [form, setForm] = useS({ show: false, nome: "", valor: "", descricao: "", parcelas: "1", alertaDia: "" });
  const pending = (caloteiros || []).filter(c => !c.pago);
  const paid = (caloteiros || []).filter(c => c.pago);
  const totalPending = pending.reduce((s, c) => s + c.valor, 0);
  const today = new Date().getDate();

  const formValor = parseFloat(form.valor.replace(",", "."));
  const formParc = parseInt(form.parcelas) || 1;
  const formValorParc = formParc > 1 && !isNaN(formValor) && formValor > 0
    ? Math.round((formValor / formParc) * 100) / 100 : null;

  const submit = () => {
    if (!form.nome.trim() || isNaN(formValor) || formValor <= 0) return;
    onAdd({
      nome: form.nome.trim(), valor: formValor, descricao: form.descricao,
      parcelas: formParc, alertaDia: form.alertaDia ? parseInt(form.alertaDia) : null,
      data: todayISO()
    });
    setForm({ show: false, nome: "", valor: "", descricao: "", parcelas: "1", alertaDia: "" });
  };

  return (
    <div className="panel glass">
      <div className="panel-head">
        <div className="panel-title"><Ic.coins size={17} />A receber</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {totalPending > 0 && <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#e0c85a" }}>{fmtBRL(totalPending)}</span>}
          <button className="btn btn-ghost" style={{ padding: "7px 12px", minHeight: 0, fontSize: 12 }}
            onClick={() => setForm(f => ({ ...f, show: !f.show }))}>
            {form.show ? "Cancelar" : <><Ic.plus size={14} />Adicionar</>}
          </button>
        </div>
      </div>

      {form.show && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, padding: 14, background: "rgba(255,255,255,0.04)", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)" }}>
          <input className="form-input" placeholder="Nome do devedor" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
          <div style={{ display: "flex", gap: 8 }}>
            <input className="form-input" placeholder="Valor total (R$)" type="number" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} style={{ flex: 2 }} />
            <input className="form-input" placeholder="Parcelas" type="number" min="1" value={form.parcelas} onChange={e => setForm(f => ({ ...f, parcelas: e.target.value }))} style={{ flex: 1 }} title="Nº de parcelas (1 = à vista)" />
          </div>
          {formValorParc && (
            <div style={{ fontSize: 12, color: "var(--accent-mint)", fontWeight: 600, padding: "2px 0" }}>
              Parcela: {fmtBRL(formValorParc)} × {formParc}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <input className="form-input" placeholder="Motivo (opcional)" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} style={{ flex: 2 }} />
            <input className="form-input" placeholder="Dia alerta" type="number" min="1" max="31" value={form.alertaDia} onChange={e => setForm(f => ({ ...f, alertaDia: e.target.value }))} style={{ flex: 1 }} title="Dia do mês para lembrar de cobrar" />
          </div>
          {form.alertaDia && <div style={{ fontSize: 11, color: "var(--text-lo)" }}>🔔 Alerta todo dia {form.alertaDia} do mês</div>}
          <button className="btn btn-primary" onClick={submit}>Adicionar devedor</button>
        </div>
      )}

      {(caloteiros || []).length === 0 && !form.show && (
        <div style={{ textAlign: "center", color: "var(--text-lo)", fontSize: 13, padding: "16px 0" }}>Nenhum devedor registrado 🎉</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {[...pending, ...paid].map(c => {
          const parcelas = c.parcelas || 1;
          const parcPaga = c.parcPaga || 0;
          const parcelado = parcelas > 1;
          const pct = parcelado ? parcPaga / parcelas : (c.pago ? 1 : 0);
          const valorParc = parcelado ? Math.round((c.valor / parcelas) * 100) / 100 : null;
          const diff = c.alertaDia ? c.alertaDia - today : null;
          const alertaLabel = !c.pago && diff !== null
            ? diff === 0 ? "hoje" : diff === 1 ? "amanhã" : diff === -1 ? "ontem" : diff > 1 && diff <= 3 ? `em ${diff} dias` : null
            : null;
          return (
            <div key={c.id} style={{ padding: "11px 4px", borderBottom: "1px solid var(--glass-border)", opacity: c.pago ? 0.5 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className={"icon-btn" + (c.pago ? " active" : "")}
                  style={{ width: 28, height: 28, flexShrink: 0, borderColor: c.pago ? "var(--accent-mint)" : "var(--glass-border)", color: c.pago ? "var(--accent-mint)" : "var(--text-lo)" }}
                  title={c.pago ? "Reabrir" : parcelado ? `Marcar parcela ${parcPaga + 1}/${parcelas}` : "Marcar como recebido"}
                  onClick={() => onToggle(c.id)}>
                  <Ic.check size={13} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, textDecoration: c.pago ? "line-through" : "none", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {c.nome}
                    {alertaLabel && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: alertaLabel === "hoje" ? "#e0c85a22" : "rgba(255,255,255,0.06)", color: alertaLabel === "hoje" ? "#e0c85a" : "var(--text-mid)", border: `1px solid ${alertaLabel === "hoje" ? "#e0c85a44" : "var(--glass-border)"}` }}>
                        🔔 {alertaLabel}
                      </span>
                    )}
                  </div>
                  {c.descricao && <div style={{ fontSize: 12, color: "var(--text-lo)", marginTop: 1 }}>{c.descricao}</div>}
                  {parcelado && (
                    <div style={{ fontSize: 12, color: "var(--text-mid)", fontWeight: 600, marginTop: 2 }}>
                      {fmtBRL(valorParc)}<span style={{ fontWeight: 400, color: "var(--text-lo)" }}>/parcela · {parcPaga}/{parcelas} pagas</span>
                    </div>
                  )}
                  {c.alertaDia && !alertaLabel && !c.pago && (
                    <div style={{ fontSize: 11, color: "var(--text-lo)", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                      <Ic.bell size={10} /> cobrar todo dia {c.alertaDia}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: c.pago ? "var(--text-lo)" : "#e0c85a" }}>{fmtBRL(c.valor)}</div>
                  {parcelado && !c.pago && <div style={{ fontSize: 11, color: "var(--text-lo)", marginTop: 1 }}>{parcelas - parcPaga} restantes</div>}
                </div>
                <button className="icon-btn danger" style={{ width: 28, height: 28, flexShrink: 0 }} onClick={() => onDelete(c.id)}><Ic.trash size={13} /></button>
              </div>
              {parcelado && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, paddingLeft: 38 }}>
                  <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct * 100}%`, background: "#e0c85a", borderRadius: 999, transition: "width 0.4s" }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   GASTOS
   ============================================================ */
function GastosView({ filtered, total, byCat, onEdit, onDelete, onDeleteGroup, onAdd, onImport,
  period, setPeriod, cat, setCat, search, setSearch, allCats, cards,
  tipoFilter, setTipoFilter, cardIdFilter, setCardIdFilter, onOpenFilterSheet,
  expenses, faturaOverrides, onMarkPaid, onUnmarkPaid,
  emprestimos, onAddEmprestimo, onDeleteEmprestimo, onUpdateEmprestimo,
  fixas, onAddFixa, onDeleteFixa, caloteiros, onAddCaloteiro, onToggleCaloteiro, onDeleteCaloteiro,
  onAddCard, onDeleteCard,
  initialTab }) {
  const [showImport, setShowImport] = useS(false);
  const [kindFilter, setKindFilter] = useS("all");
  const [tab, setTab] = useS(initialTab || "lancamentos");

  const localFiltered = useM(() => {
    let arr = [...filtered];
    if (tipoFilter !== "all") arr = arr.filter(e => e.tipo === tipoFilter);
    if (cardIdFilter !== "all") arr = arr.filter(e => e.cardId === cardIdFilter);
    return arr;
  }, [filtered, tipoFilter, cardIdFilter]);

  const gastosTotal = useM(() => localFiltered.filter(e => e.kind !== "entrada").reduce((s, e) => s + e.valor, 0), [localFiltered]);
  const entradasTotal = useM(() => localFiltered.filter(e => e.kind === "entrada").reduce((s, e) => s + e.valor, 0), [localFiltered]);

  const displayRows = useM(() => {
    if (kindFilter === "gastos") return localFiltered.filter(e => e.kind !== "entrada");
    if (kindFilter === "entradas") return localFiltered.filter(e => e.kind === "entrada");
    return localFiltered;
  }, [localFiltered, kindFilter]);

  return (
    <>
      {showImport && ReactDOM.createPortal(
        <BankImportModal onImport={onImport} onClose={() => setShowImport(false)} />,
        document.body
      )}

      {/* Tab switcher */}
      <div className="gastos-tabs">
        <button className={"gastos-tab" + (tab === "lancamentos" ? " on" : "")} onClick={() => setTab("lancamentos")}>
          <Ic.wallet size={14} />Gastos
        </button>
        <button className={"gastos-tab" + (tab === "cartoes" ? " on" : "")} onClick={() => setTab("cartoes")}>
          <Ic.card size={14} />Cartões
        </button>
        <button className={"gastos-tab" + (tab === "faturas" ? " on" : "")} onClick={() => setTab("faturas")}>
          <Ic.invoice size={14} />Faturas
        </button>
        <button className={"gastos-tab" + (tab === "fixas" ? " on" : "")} onClick={() => setTab("fixas")}>
          <Ic.receipt size={14} />Fixas
        </button>
        <button className={"gastos-tab" + (tab === "emprestimos" ? " on" : "")} onClick={() => setTab("emprestimos")}>
          <Ic.coins size={14} />Emprést.
        </button>
      </div>

      {tab === "lancamentos" && (
        <div className="panel glass" style={{ marginBottom: 16 }}>
          <div className="panel-head" style={{ gap: 10, flexDirection: "column", alignItems: "stretch" }}>
            <FilterBar
              period={period} setPeriod={setPeriod}
              cat={cat} setCat={setCat}
              search={search} setSearch={setSearch}
              tipoFilter={tipoFilter} setTipoFilter={setTipoFilter}
              cardIdFilter={cardIdFilter} setCardIdFilter={setCardIdFilter}
              allCats={allCats} cards={cards}
              onOpenSheet={onOpenFilterSheet}
            />
            <div className="gastos-actions">
              <button className="btn btn-ghost" onClick={() => setShowImport(true)}>
                <Ic.download size={17} />Extrato
              </button>
              <button className="btn btn-ghost" title="Exportar CSV" onClick={() => exportToCSV(displayRows)}>
                <Ic.upload size={17} />CSV
              </button>
              <button className="btn btn-primary" onClick={onAdd}><Ic.plus size={17} />Adicionar</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {[["all", "Todos"], ["gastos", "Gastos"], ["entradas", "Entradas"]].map(([k, l]) => (
              <button key={k} type="button"
                className={"tipo-opt" + (kindFilter === k ? " on" : "")}
                style={{ "--tipo-hex": k === "entradas" ? "var(--accent-mint)" : k === "gastos" ? "#e08a7a" : "var(--text-mid)" }}
                onClick={() => setKindFilter(k)}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16, padding: "0 2px", flexWrap: "wrap" }}>
            <span style={{ color: "var(--text-mid)", fontSize: 13.5, fontWeight: 600 }}>Gastos</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#e08a7a", fontVariantNumeric: "tabular-nums" }}>−{fmtBRL(gastosTotal)}</span>
            {entradasTotal > 0 && (
              <>
                <span style={{ color: "var(--text-lo)", fontSize: 13 }}>·</span>
                <span style={{ color: "var(--text-mid)", fontSize: 13.5, fontWeight: 600 }}>Entradas</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--accent-mint)", fontVariantNumeric: "tabular-nums" }}>+{fmtBRL(entradasTotal)}</span>
              </>
            )}
            <span style={{ color: "var(--text-lo)", fontSize: 13 }}>· {displayRows.length} lançamentos</span>
          </div>
          {displayRows.length === 0 ? (
            <EmptyState
              title={kindFilter === "entradas" ? "Nenhuma entrada" : kindFilter === "gastos" ? "Nenhum gasto" : "Histórico vazio"}
              text={search || cat !== "all" ? "Tente ajustar os filtros." : "Toque no + para registrar sua primeira transação."}
            />
          ) : (
            <GroupedExpenseList rows={displayRows} onEdit={onEdit} onDelete={onDelete}
              onDeleteGroup={onDeleteGroup} cards={cards} />
          )}
        </div>
      )}

      {tab === "cartoes" && (
        <CardManager cards={cards || []} onAddCard={onAddCard} onDeleteCard={onDeleteCard} />
      )}

      {tab === "faturas" && (
        <FaturasView
          cards={cards} expenses={expenses}
          faturaOverrides={faturaOverrides}
          onMarkPaid={onMarkPaid} onUnmarkPaid={onUnmarkPaid}
          onEdit={onEdit} onDelete={onDelete} onDeleteGroup={onDeleteGroup}
        />
      )}

      {tab === "fixas" && (
        <>
          <FixasSection fixas={fixas} onAdd={onAddFixa} onDelete={onDeleteFixa} allCats={allCats} />
          <div style={{ marginTop: 16 }}>
            <CaloteirosSection caloteiros={caloteiros} onAdd={onAddCaloteiro} onDelete={onDeleteCaloteiro} onToggle={onToggleCaloteiro} />
          </div>
        </>
      )}
      {tab === "emprestimos" && (
        <EmprestimosSection
          emprestimos={emprestimos}
          onAdd={onAddEmprestimo}
          onDelete={onDeleteEmprestimo}
          onUpdate={onUpdateEmprestimo}
        />
      )}
    </>
  );
}

/* ============================================================
   RELATÓRIOS
   ============================================================ */
function RelatoriosView({ expenses, byCat, total }) {
  const maxCat = byCat[0]?.valor || 1;

  const monthlyData = useM(() => {
    const now = new Date();
    return Array.from({ length: 4 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const gastos = expenses
        .filter(e => e.data.startsWith(mStr) && e.kind !== "entrada")
        .reduce((s, e) => s + e.valor, 0);
      const entradas = expenses
        .filter(e => e.data.startsWith(mStr) && e.kind === "entrada")
        .reduce((s, e) => s + e.valor, 0);
      return { label: d.toLocaleString("pt-BR", { month: "short" }), gastos, entradas, mStr };
    });
  }, [expenses]);

  const topExpenses = useM(() =>
    [...expenses].filter(e => e.kind !== "entrada").sort((a, b) => b.valor - a.valor).slice(0, 5),
    [expenses]);

  const maxMonth = Math.max(...monthlyData.map(m => m.gastos), 1);

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
            {byCat.length === 0 && <div className="empty" style={{ padding: "24px 0" }}>Sem dados no período</div>}
          </div>
        </div>
        <div className="panel glass">
          <div className="panel-head"><div className="panel-title">Composição</div></div>
          {total > 0 ? <Donut data={byCat} total={total} /> : <div className="empty">Sem dados</div>}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="panel glass">
          <div className="panel-head"><div className="panel-title">Comparativo mensal</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {monthlyData.map(m => (
              <div key={m.mStr}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, textTransform: "capitalize", color: "var(--text-mid)" }}>{m.label}</span>
                  <div style={{ display: "flex", gap: 10 }}>
                    {m.entradas > 0 && (
                      <span style={{ color: "var(--accent-mint)", fontWeight: 600, fontSize: 12 }}>+{fmtBRLshort(m.entradas)}</span>
                    )}
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: m.gastos > 0 ? "#e08a7a" : "var(--text-lo)" }}>
                      {m.gastos > 0 ? `−${fmtBRLshort(m.gastos)}` : "—"}
                    </span>
                  </div>
                </div>
                <div style={{ height: 8, borderRadius: 20, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 20,
                    width: `${(m.gastos / maxMonth) * 100}%`,
                    background: "linear-gradient(90deg, #e08a7a, #e05a5a)",
                    transition: "width 0.7s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel glass">
          <div className="panel-head"><div className="panel-title">Maiores gastos</div></div>
          {topExpenses.length === 0 ? (
            <div className="empty" style={{ padding: "24px 0" }}>Sem dados</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {topExpenses.map((e, i) => {
                const c = CAT_MAP[e.categoria] || CAT_MAP["outros"];
                return (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                    borderBottom: i < topExpenses.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-lo)", minWidth: 18, textAlign: "center" }}>
                      #{i + 1}
                    </span>
                    <span className="dot" style={{ background: c.hex, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: "var(--text-mid)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.descricao}
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "#e08a7a", flexShrink: 0 }}>
                      {fmtBRL(e.valor)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1fr", marginTop: 16 }}>
        <div className="panel glass">
          <div className="panel-head"><div className="panel-title">Evolução — últimos 7 dias</div></div>
          <WeekBars expenses={expenses} />
        </div>
      </div>

      {/* Resumo financeiro mensal */}
      <div className="panel glass" style={{ marginTop: 16 }}>
        <div className="panel-head"><div className="panel-title">Resumo mensal — últimos 4 meses</div></div>
        <div style={{ display: "grid", gap: 12 }}>
          {monthlyData.map(m => {
            const net = m.entradas - m.gastos;
            const rate = m.entradas > 0 ? Math.round((net / m.entradas) * 100) : null;
            const rateColor = rate === null ? "var(--text-lo)" : rate >= 20 ? "var(--accent-mint)" : rate >= 0 ? "#e0c85a" : "var(--cat-saude)";
            return (
              <div key={m.mStr} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ minWidth: 38, fontSize: 13, fontWeight: 600, color: "var(--text-lo)", textTransform: "capitalize" }}>{m.label}</div>
                <div style={{ flex: 1, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {m.entradas > 0 && (
                    <span style={{ fontSize: 13, color: "var(--accent-mint)", fontWeight: 600 }}>+{fmtBRL(m.entradas)}</span>
                  )}
                  {m.gastos > 0 && (
                    <span style={{ fontSize: 13, color: "#e08a7a", fontWeight: 600 }}>−{fmtBRL(m.gastos)}</span>
                  )}
                  {m.gastos === 0 && m.entradas === 0 && (
                    <span style={{ fontSize: 13, color: "var(--text-lo)" }}>Sem dados</span>
                  )}
                </div>
                {rate !== null && (
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: rateColor }}>{rate >= 0 ? "+" : ""}{rate}%</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-lo)" }}>poupança</div>
                  </div>
                )}
                {rate === null && m.gastos > 0 && (
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e08a7a" }}>−{fmtBRL(m.gastos)}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-lo)" }}>só gastos</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   THEME SHEET — Bottom Sheet premium para seleção de temas
   ============================================================ */
const { useEffect: useEffTS, useRef: useRefTS } = React;

const TS_CATS = [
  { id: "padrao", label: "Padrão", ids: ["default","dark","rose","orange"] },
  { id: "neon",   label: "Neon",   ids: ["blue","purple"] },
  { id: "albuns", label: "Álbuns", ids: ["petal","chrome","sweet","fancy"] },
  { id: "kpop",   label: "K-pop",  ids: ["acid"] },
];

const LIGHT_THEMES = new Set(["petal","sweet","fancy"]);

function ThemePreview({ theme, active }) {
  const isLight = LIGHT_THEMES.has(theme.id);
  const [a, b] = theme.colors;
  return (
    <div className={"ts-prev" + (isLight ? " ts-prev-light" : "")}>
      {/* mini balance */}
      <div className="ts-prev-balance" style={{ color: a }}>R$ 2.840</div>
      {/* progress bars */}
      <div className="ts-prev-bars">
        {[["68%", 0.9], ["42%", 0.65], ["85%", 0.5]].map(([w, op], i) => (
          <div key={i} className="ts-prev-bar-row">
            <div className="ts-prev-bar-bg">
              <div className="ts-prev-bar-fill" style={{
                width: w,
                background: `linear-gradient(90deg, ${a}, ${b})`,
                opacity: op,
              }} />
            </div>
            <div className="ts-prev-bar-val" style={{ color: a }}>{["R$ 420","R$ 190","R$ 890"][i]}</div>
          </div>
        ))}
      </div>
      {/* mini card strip */}
      <div className="ts-prev-card" style={{ background: `linear-gradient(135deg, ${a}22, ${b}33)`, borderColor: `${a}44` }}>
        <div className="ts-prev-card-dot" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} />
        <div className="ts-prev-card-lines">
          <div className="ts-prev-card-line" />
          <div className="ts-prev-card-line" style={{ width: "55%" }} />
        </div>
        {active && <div className="ts-pill">Ativo</div>}
      </div>
      {/* gradient overlay — subtle depth */}
      <div className="ts-prev-overlay" style={{ background: `linear-gradient(180deg, transparent 40%, ${isLight ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.18)"} 100%)` }} />
    </div>
  );
}

function ThemeSheet({ open, onClose, currentTheme, onSelect }) {
  const [tab, setTab] = useS("padrao");
  const sheetRef = useRefTS(null);
  const dragStartY = useRefTS(null);
  const dragCurrentY = useRefTS(null);

  /* reset tab whenever sheet opens */
  useEffTS(() => {
    if (open) {
      /* find which category contains current theme */
      const cat = TS_CATS.find(c => c.ids.includes(currentTheme)) || TS_CATS[0];
      setTab(cat.id);
    }
  }, [open]);

  /* swipe-to-close on handle */
  const onTouchStart = (e) => { dragStartY.current = e.touches[0].clientY; dragCurrentY.current = 0; };
  const onTouchMove  = (e) => {
    const dy = e.touches[0].clientY - dragStartY.current;
    dragCurrentY.current = dy;
    if (dy > 0 && sheetRef.current) sheetRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onTouchEnd   = () => {
    if (sheetRef.current) sheetRef.current.style.transform = "";
    if (dragCurrentY.current > 90) onClose();
  };

  /* lock body scroll when open */
  useEffTS(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const currentCat = TS_CATS.find(c => c.id === tab) || TS_CATS[0];
  const themes = (window.THEMES || []).filter(t => currentCat.ids.includes(t.id));

  return (
    <>
      {/* overlay */}
      <div className={"ts-overlay" + (open ? " ts-open" : "")} onClick={onClose} />

      {/* sheet */}
      <div
        ref={sheetRef}
        className={"ts-sheet glass" + (open ? " ts-open" : "")}
        role="dialog"
        aria-modal="true"
        aria-label="Selecionar tema visual"
      >
        {/* drag handle */}
        <div className="ts-handle-wrap"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}>
          <div className="ts-handle" />
        </div>

        {/* header */}
        <div className="ts-head">
          <span className="ts-head-title">Tema Visual</span>
          <button className="ts-close-btn" onClick={onClose} aria-label="Fechar">
            <Ic.close size={18} />
          </button>
        </div>

        {/* category tabs */}
        <div className="ts-tabs" role="tablist">
          {TS_CATS.map(c => (
            <button
              key={c.id}
              role="tab"
              aria-selected={tab === c.id}
              className={"ts-tab" + (tab === c.id ? " on" : "") + (c.ids.length === 0 ? " ts-tab-empty" : "")}
              onClick={() => c.ids.length > 0 && setTab(c.id)}
            >
              {c.label}
              {c.ids.length === 0 && <span className="ts-tab-badge">Em breve</span>}
            </button>
          ))}
        </div>

        {/* theme cards */}
        <div className="ts-body">
          {themes.length === 0 ? (
            <div className="ts-empty">Novos temas em breve ✨</div>
          ) : (
            <div className="ts-grid">
              {themes.map(t => {
                const isActive = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={"ts-card" + (isActive ? " ts-active" : "")}
                    onClick={() => { onSelect(t.id); onClose(); }}
                    aria-pressed={isActive}
                  >
                    {isActive && <div className="ts-badge"><Ic.check size={11} />Ativo</div>}
                    <ThemePreview theme={t} active={isActive} />
                    <div className="ts-card-name">{t.nome}</div>
                    <div className="ts-mini-swatch"
                      style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   CONFIGURAÇÕES
   ============================================================ */
function ConfigView({ settings, setSettings, onReset, allCats, onAddCat, onDeleteCat, cards, onAddCard, onDeleteCard, currentTheme, onThemeChange, onResetProfile, expenses, customCats, onRestoreBackup, fixas, onAddFixa, onDeleteFixa, caloteiros, onAddCaloteiro, onToggleCaloteiro, onDeleteCaloteiro, emprestimos }) {
  const toggle = (k) => setSettings(s => ({ ...s, [k]: !s[k] }));
  const baseCatIds = new Set(["comida","transporte","moradia","lazer","saude","compras","contas","outros"]);

  const [newCatName, setNewCatName] = useS("");
  const [newCatColor, setNewCatColor] = useS(CAT_PRESET_COLORS[0]);
  const [budgetInput, setBudgetInput] = useS(String(settings.budget || ""));
  const [themeSheetOpen, setThemeSheetOpen] = useS(false);

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
    ["lightMode", "Tema claro", "Alterna para fundo branco com maior luminosidade."],
    ["autoCat", "Categorização automática", "Detecta a categoria pela descrição do gasto."],
    ["glow", "Efeitos de iluminação", "Brilho sutil em cards e inputs (glassmorphism)."],
    ["animations", "Animações de fundo", "Movimento suave do gradiente ambiente."],
    ["confirmDelete", "Confirmar exclusão", "Pede confirmação antes de excluir um gasto."],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Tema visual — row que abre o Bottom Sheet */}
      {(() => {
        const activeT = (window.THEMES || []).find(t => t.id === currentTheme) || { nome: "—", colors: ["#5ad9a8","#5aa3e0"] };
        return (
          <>
            <div className="panel glass">
              <div className="panel-head"><div className="panel-title">Tema visual</div></div>
              <button className="set-row set-row-btn" onClick={() => setThemeSheetOpen(true)}>
                <div className="set-info">
                  <div className="t">{activeT.nome}</div>
                  <div className="d">Toque para explorar e trocar o tema</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="ts-mini-swatch"
                    style={{ background: `linear-gradient(135deg, ${activeT.colors[0]}, ${activeT.colors[1]})` }} />
                  <Ic.chevron size={18} style={{ opacity: 0.5, transform: "rotate(-90deg)" }} />
                </div>
              </button>
            </div>
            <ThemeSheet
              open={themeSheetOpen}
              onClose={() => setThemeSheetOpen(false)}
              currentTheme={currentTheme}
              onSelect={onThemeChange}
            />
          </>
        );
      })()}

      <div className="grid-2 config-grid">
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
          <div className="set-row">
            <div className="set-info"><div className="t">Redefinir perfil</div><div className="d">Volta à tela de personalização inicial</div></div>
            <button className="btn btn-ghost" style={{ padding: "10px 14px", color: "var(--cat-saude)" }} onClick={onResetProfile}>Redefinir</button>
          </div>
        </div>
      </div>

      {/* Backup & Exportação */}
      <div className="panel glass">
        <div className="panel-head"><div className="panel-title">Backup & Exportação</div></div>
        <div className="set-list">
          <div className="set-row">
            <div className="set-info">
              <div className="t">Exportar CSV</div>
              <div className="d">Baixa todos os lançamentos em formato de planilha</div>
            </div>
            <button className="btn btn-ghost" style={{ padding: "10px 14px", whiteSpace: "nowrap" }}
              onClick={() => exportToCSV(expenses || [])}>
              <Ic.upload size={15} />Exportar
            </button>
          </div>
          <div className="set-row">
            <div className="set-info">
              <div className="t">Backup completo (JSON)</div>
              <div className="d">Salva lançamentos e cartões para restauração futura</div>
            </div>
            <button className="btn btn-ghost" style={{ padding: "10px 14px", whiteSpace: "nowrap" }}
              onClick={() => exportToJSON(expenses || [], cards || [], settings, customCats || [], fixas || [], caloteiros || [], emprestimos || [])}>
              <Ic.download size={15} />Baixar
            </button>
          </div>
          <div className="set-row">
            <div className="set-info">
              <div className="t">Restaurar backup</div>
              <div className="d">Importa um arquivo de backup .json gerado por este app</div>
            </div>
            <label className="btn btn-ghost" style={{ padding: "10px 14px", cursor: "pointer", whiteSpace: "nowrap" }}>
              <Ic.upload size={15} />Importar
              <input type="file" accept="application/json,.json" style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const data = JSON.parse(ev.target.result);
                      if (!Array.isArray(data.expenses)) throw new Error("Formato inválido");
                      if (window.confirm(`Restaurar ${data.expenses.length} lançamentos? Isso substituirá todos os dados atuais.`)) {
                        onRestoreBackup(data);
                      }
                    } catch { alert("Arquivo inválido ou corrompido."); }
                  };
                  reader.readAsText(file);
                  e.target.value = "";
                }} />
            </label>
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

/* ============================================================
   FATURAS
   ============================================================ */
function FaturaCard({ fatura, onMarkPaid, onUnmarkPaid, onEdit, onDelete, onDeleteGroup }) {
  const [expanded, setExpanded] = useS(fatura.status === "aberta");

  const statusColor = fatura.status === "aberta" ? "var(--accent-mint)"
    : fatura.status === "fechada" ? "#e0c85a"
    : "var(--text-lo)";
  const statusLabel = fatura.status === "aberta" ? "Em aberto"
    : fatura.status === "fechada" ? "Fechada"
    : "Paga";

  return (
    <div className={"panel glass fatura-card" + (fatura.status === "aberta" ? " fatura-destaque" : "")}>
      <div className="fatura-header" onClick={() => setExpanded(v => !v)}>
        <div style={{ flex: 1 }}>
          <div className="fatura-mes">{formatMes(fatura.mes)}</div>
          <div className="fatura-dates">
            <Ic.calendar size={11} />
            Fecha {fmtDate(fatura.dataFechamento)} · Vence {fmtDate(fatura.dataVencimento)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div className="fatura-total" style={fatura.status === "paga" ? { color: "var(--text-lo)" } : {}}>
            {fmtBRL(fatura.total)}
          </div>
          <span className="exp-tag"
            style={{ color: statusColor, borderColor: statusColor + "44", background: statusColor + "18" }}>
            {statusLabel}
          </span>
        </div>
        <div className={"fatura-chevron" + (expanded ? " expanded" : "")}>
          <Ic.chevron size={18} />
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--glass-border)" }}>
          {fatura.status !== "paga" ? (
            <div style={{ marginBottom: 14 }}>
              <button className="btn btn-ghost" style={{ fontSize: 13, padding: "8px 14px", minHeight: 38 }}
                onClick={(e) => { e.stopPropagation(); onMarkPaid(); }}>
                <Ic.check size={15} />Marcar como paga
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: "var(--text-lo)", display: "flex", alignItems: "center", gap: 5 }}>
                <Ic.check size={13} />Paga em {fmtDate(fatura.paidAt)}
              </span>
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px", minHeight: 34 }}
                onClick={(e) => { e.stopPropagation(); onUnmarkPaid(); }}>
                Reabrir
              </button>
            </div>
          )}
          {fatura.transacoes.length > 0 ? (
            <ExpenseTable rows={fatura.transacoes} onEdit={onEdit} onDelete={onDelete}
              onDeleteGroup={onDeleteGroup} cards={[fatura.card]} />
          ) : (
            <div style={{ color: "var(--text-lo)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
              Sem transações nesta fatura
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FaturasView({ cards, expenses, faturaOverrides, onMarkPaid, onUnmarkPaid, onEdit, onDelete, onDeleteGroup }) {
  const [selectedCardId, setSelectedCardId] = useS(cards?.[0]?.id || null);

  const selectedCard = useM(() => cards?.find(c => c.id === selectedCardId), [cards, selectedCardId]);

  const faturas = useM(() => {
    if (!cards || cards.length === 0) return [];
    const all = computeFaturas(cards, expenses, faturaOverrides);
    return selectedCardId ? all.filter(f => f.cardId === selectedCardId) : all;
  }, [cards, expenses, faturaOverrides, selectedCardId]);

  const totalAberto = useM(() =>
    faturas.filter(f => f.status === "aberta").reduce((s, f) => s + f.total, 0), [faturas]);

  const totalFechado = useM(() =>
    faturas.filter(f => f.status === "fechada").reduce((s, f) => s + f.total, 0), [faturas]);

  if (!cards || cards.length === 0) {
    return (
      <div className="panel glass">
        <div className="empty" style={{ padding: "44px 20px" }}>
          <Ic.card size={40} />
          <div style={{ fontWeight: 600, color: "var(--text-mid)", marginTop: 14 }}>Nenhum cartão cadastrado</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>
            Adicione um cartão acima para começar a registrar faturas.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Seletor de cartão + resumo */}
      <div className="panel glass" style={{ marginBottom: 16 }}>
        <div className="tipo-picker">
          {cards.map(c => (
            <button key={c.id} type="button"
              className={"tipo-opt" + (selectedCardId === c.id ? " on" : "")}
              style={{ "--tipo-hex": c.cor || "var(--accent-mint)" }}
              onClick={() => setSelectedCardId(c.id)}>
              <Ic.card size={14} />{c.nome}
            </button>
          ))}
        </div>
        {selectedCard && (
          <div style={{ display: "flex", gap: 24, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--glass-border)", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-lo)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Fechamento</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {window.describeRecRule
                  ? window.describeRecRule(selectedCard.recFechamento || { type: "fixed_day", day: selectedCard.diaFechamento || 20 })
                  : selectedCard.diaFechamento}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-lo)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Vencimento</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {window.describeRecRule
                  ? window.describeRecRule(selectedCard.recVencimento || { type: "fixed_day", day: selectedCard.diaVencimento || 5 })
                  : selectedCard.diaVencimento}
              </div>
            </div>
            {totalAberto > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "var(--text-lo)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Em aberto</div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "var(--accent-mint)" }}>{fmtBRL(totalAberto)}</div>
              </div>
            )}
            {totalFechado > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "var(--text-lo)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>A pagar</div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#e0c85a" }}>{fmtBRL(totalFechado)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lista de faturas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {faturas.map(f => (
          <FaturaCard key={f.id} fatura={f}
            onMarkPaid={() => onMarkPaid(f.cardId, f.mes)}
            onUnmarkPaid={() => onUnmarkPaid(f.cardId, f.mes)}
            onEdit={onEdit} onDelete={onDelete} onDeleteGroup={onDeleteGroup} />
        ))}
      </div>

      {faturas.length === 0 && (
        <div className="panel glass" style={{ marginTop: 0 }}>
          <div className="empty" style={{ padding: "44px 20px" }}>
            <Ic.receipt size={40} />
            <div style={{ fontWeight: 600, color: "var(--text-mid)", marginTop: 14 }}>Sem transações no crédito</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              Adicione gastos com Crédito vinculados a "{selectedCard?.nome}" para ver as faturas.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Object.assign(window, {
  HomeView, DashboardView, GastosView, RelatoriosView, ConfigView, FaturasView, FaturaCard,
  ExpenseTable, GroupedExpenseList, FilterBar, FilterSheet, CardManager, Stat, BudgetBar,
  BankImportModal, EmptyState,
});

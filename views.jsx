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
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="90">90 dias</option>
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

/* ---------- CardManager — CRUD de cartões ---------- */
const CARD_COLORS = ["#a98ae0", "#5aa3e0", "#5ad9a8", "#e0a85a", "#e08a7a", "#e08ac8", "#5ac4d9", "#9aa3b0"];

function CardManager({ cards, onAddCard, onDeleteCard }) {
  const [name, setName] = useS("");
  const [fechamento, setFechamento] = useS("20");
  const [vencimento, setVencimento] = useS("5");
  const [cor, setCor] = useS(CARD_COLORS[0]);

  const submit = () => {
    const nome = name.trim();
    if (!nome) return;
    const fech = Math.max(1, Math.min(31, parseInt(fechamento) || 20));
    const venc = Math.max(1, Math.min(31, parseInt(vencimento) || 5));
    onAddCard({ id: uid(), nome, diaFechamento: fech, diaVencimento: venc, cor });
    setName("");
  };

  return (
    <div className="panel glass">
      <div className="panel-head"><div className="panel-title">Cartões de crédito</div></div>
      {cards.length > 0 && (
        <div className="card-list">
          {cards.map(c => (
            <div className="card-item" key={c.id}>
              <span className="card-color-dot" style={{ background: c.cor }} />
              <Ic.card size={16} style={{ color: c.cor, flexShrink: 0 }} />
              <span style={{ flex: 1, fontWeight: 600, fontSize: 13.5 }}>{c.nome}</span>
              <span className="exp-tag" style={{ background: c.cor + "22", color: c.cor, borderColor: c.cor + "44" }}>
                fecha {c.diaFechamento}
              </span>
              <span className="exp-tag" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-mid)", borderColor: "var(--glass-border)" }}>
                vence {c.diaVencimento}
              </span>
              <button className="icon-btn danger" onClick={() => onDeleteCard(c.id)}><Ic.trash size={14} /></button>
            </div>
          ))}
        </div>
      )}
      <div className="card-add-form">
        <input className="form-input" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Nome do cartão (ex.: Nubank, Inter)" />
        <div className="card-form-row">
          <div>
            <div className="form-label" style={{ marginBottom: 6 }}>Dia fechamento</div>
            <input className="form-input" inputMode="numeric" value={fechamento}
              onChange={e => setFechamento(e.target.value.replace(/\D/g, ""))}
              placeholder="20" />
          </div>
          <div>
            <div className="form-label" style={{ marginBottom: 6 }}>Dia vencimento</div>
            <input className="form-input" inputMode="numeric" value={vencimento}
              onChange={e => setVencimento(e.target.value.replace(/\D/g, ""))}
              placeholder="5" />
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
function HomeView({ expenses, budget, onAdd, onEdit, onDelete, onDeleteGroup, cards, userName }) {
  const now = new Date();
  const todayDay = now.getDate();
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
  const recent = [...expenses].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 6);
  const monthName = now.toLocaleString("pt-BR", { month: "long" });

  const dueAlerts = (cards || []).map(c => {
    const today = new Date();
    const vencDay = c.diaVencimento;
    const dueDate = new Date(today.getFullYear(), today.getMonth(), vencDay);
    if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1);
    const diffDays = Math.ceil((dueDate - today) / 86400000);
    return { ...c, diffDays };
  }).filter(c => c.diffDays >= 0 && c.diffDays <= 7);

  return (
    <>
      {dueAlerts.map(c => (
        <div key={c.id} className="due-alert">
          <Ic.bell size={16} />
          Fatura do <strong>{c.nome}</strong> vence dia {c.diaVencimento} — {c.diffDays === 0 ? "hoje!" : `em ${c.diffDays} dia${c.diffDays === 1 ? "" : "s"}`}
        </div>
      ))}

      <div className="home-hero glass">
        <div className="home-hero-top">
          <div>
            <div className="home-greeting">{greeting}, <strong>{userName || "Luiz Ricardo"}</strong>!</div>
            <div className="home-date">{fmtDateLong(todayISO())}</div>
          </div>
          <button className="btn btn-primary btn-desktop-only" onClick={onAdd}>
            <Ic.plus size={18} />Novo lançamento
          </button>
        </div>

        <div className="home-stats-row">
          <div className="home-stat-block">
            <div className="home-stat-label">Gasto em {monthName}</div>
            <div className="home-stat-value" style={{ color: "#e08a7a" }}>{fmtBRL(monthGastos)}</div>
            <div className="home-stat-meta">{monthExp.filter(e => e.kind !== "entrada").length} lançamentos</div>
          </div>
          <div className="home-stat-block">
            <div className="home-stat-label">Saldo disponível</div>
            <div className="home-stat-value" style={{ color: saldo >= 0 ? "var(--accent-mint)" : "#e08a7a" }}>{fmtBRL(saldo)}</div>
            <div className="home-stat-meta" style={{ color: budgetColor }}>
              {budget > 0 ? `${Math.round(pct)}% do orçamento usado` : `${monthEntradas > 0 ? "+" + fmtBRL(monthEntradas) : "sem entradas"}`}
            </div>
          </div>
          <div className="home-stat-block">
            <div className="home-stat-label">Entradas do mês</div>
            <div className="home-stat-value" style={{ color: "var(--accent-mint)" }}>{fmtBRL(monthEntradas)}</div>
            <div className="home-stat-meta">{monthExp.filter(e => e.kind === "entrada").length} entradas</div>
          </div>
        </div>

        {budget > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 12, color: "var(--text-lo)" }}>
              <span>Orçamento mensal</span>
              <span style={{ color: budgetColor, fontWeight: 700 }}>{fmtBRL(monthGastos)} / {fmtBRL(budget)}</span>
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
          <ExpenseTable rows={recent} onEdit={onEdit} onDelete={onDelete} onDeleteGroup={onDeleteGroup} cards={cards} />
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
function DashboardView({ expenses, filtered, byCat, total, onEdit, onDelete, onDeleteGroup, onAdd, budget, cards }) {
  const gastos = filtered.filter(e => e.kind !== "entrada");
  const entradas = filtered.filter(e => e.kind === "entrada");
  const count = gastos.length;
  const media = count ? total / count : 0;
  const topCat = byCat[0];
  const entradasTotal = entradas.reduce((s, e) => s + e.valor, 0);

  return (
    <>
      <div className="stats">
        <Stat icon={Ic.coins} label="Gastos no período" value={fmtBRL(total)} accent meta={`${count} lançamentos`} />
        <Stat icon={Ic.trendUp} label="Entradas no período" value={fmtBRL(entradasTotal)}
          meta={`${entradas.length} entr${entradas.length === 1 ? "ada" : "adas"}`} />
        <Stat icon={Ic.receipt} label="Ticket médio" value={fmtBRL(media)} meta="por gasto" />
        <Stat icon={Ic.target} label="Maior categoria"
          value={topCat ? topCat.nome : "—"} meta={topCat ? fmtBRL(topCat.valor) : ""} />
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

/* ============================================================
   GASTOS
   ============================================================ */
function GastosView({ filtered, total, byCat, onEdit, onDelete, onDeleteGroup, onAdd, onImport,
  period, setPeriod, cat, setCat, search, setSearch, allCats, cards }) {
  const [showImport, setShowImport] = useS(false);
  const [showFilterSheet, setShowFilterSheet] = useS(false);
  const [kindFilter, setKindFilter] = useS("all");
  const [tipoFilter, setTipoFilter] = useS("all");
  const [cardIdFilter, setCardIdFilter] = useS("all");

  // Aplica filtros locais de tipo/cartão sobre o filtered global (período+cat+busca)
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

  const emptyText = kindFilter === "entradas" ? "Nenhuma entrada encontrada"
    : kindFilter === "gastos" ? "Nenhum gasto encontrado"
    : "Nenhum lançamento encontrado";

  return (
    <>
      {showImport && <BankImportModal onImport={onImport} onClose={() => setShowImport(false)} />}
      {showFilterSheet && (
        <FilterSheet
          allCats={allCats} cards={cards}
          cat={cat} setCat={setCat}
          tipoFilter={tipoFilter} setTipoFilter={setTipoFilter}
          cardIdFilter={cardIdFilter} setCardIdFilter={setCardIdFilter}
          onClose={() => setShowFilterSheet(false)}
        />
      )}
      <div className="panel glass" style={{ marginBottom: 16 }}>
        <div className="panel-head" style={{ gap: 10, flexDirection: "column", alignItems: "stretch" }}>
          <FilterBar
            period={period} setPeriod={setPeriod}
            cat={cat} setCat={setCat}
            search={search} setSearch={setSearch}
            tipoFilter={tipoFilter} setTipoFilter={setTipoFilter}
            cardIdFilter={cardIdFilter} setCardIdFilter={setCardIdFilter}
            allCats={allCats} cards={cards}
            onOpenSheet={() => setShowFilterSheet(true)}
          />
          <div className="gastos-actions">
            <button className="btn btn-ghost" onClick={() => setShowImport(true)}>
              <Ic.download size={17} />Extrato
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
        <ExpenseTable rows={displayRows} onEdit={onEdit} onDelete={onDelete} onDeleteGroup={onDeleteGroup}
          cards={cards} emptyText={emptyText} />
      </div>
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
    </>
  );
}

/* ============================================================
   CONFIGURAÇÕES
   ============================================================ */
function ConfigView({ settings, setSettings, onReset, allCats, onAddCat, onDeleteCat, cards, onAddCard, onDeleteCard, currentTheme, onThemeChange, onResetProfile }) {
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

      {/* Tema visual */}
      <div className="panel glass">
        <div className="panel-head"><div className="panel-title">Tema visual</div></div>
        <div className="onb-theme-grid">
          {(window.THEMES || []).map(t => (
            <button key={t.id} type="button"
              className={"onb-theme-opt" + (currentTheme === t.id ? " on" : "")}
              onClick={() => onThemeChange(t.id)}>
              <div className="onb-theme-swatch"
                style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}>
                {currentTheme === t.id && <Ic.check size={14} />}
              </div>
              <span>{t.nome}</span>
            </button>
          ))}
        </div>
      </div>

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

      {/* Cartões de crédito */}
      <CardManager cards={cards || []} onAddCard={onAddCard} onDeleteCard={onDeleteCard} />

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
  ExpenseTable, FilterBar, FilterSheet, CardManager, Stat, BudgetBar, BankImportModal,
});

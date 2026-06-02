/* ============================================================
   Views: Dashboard · Gastos · Relatórios · Configurações
   ============================================================ */
const { useState: useS, useMemo: useM } = React;

/* ---------- Tabela de gastos reutilizável ---------- */
function ExpenseTable({ rows, onEdit, onDelete, compact }) {
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
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th className="col-hide">Categoria</th>
            <th className="right">Valor</th>
            <th className="right" style={{ width: 90 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(e => {
            const c = CAT_MAP[e.categoria];
            return (
              <tr key={e.id}>
                <td className="cell-date">{fmtDate(e.data)}</td>
                <td className="cell-desc">
                  {e.descricao}
                  <span className="col-show-tag" style={{ display: "none" }}></span>
                </td>
                <td className="col-hide">
                  <span className="tag">
                    <span className="dot" style={{ background: c.hex }} />
                    {c.nome}
                  </span>
                </td>
                <td className="right cell-val">{fmtBRL(e.valor)}</td>
                <td className="right">
                  <div className="row-actions">
                    <button className="icon-btn" title="Editar" onClick={() => onEdit(e)}><Ic.edit size={15} /></button>
                    <button className="icon-btn danger" title="Excluir" onClick={() => onDelete(e.id)}><Ic.trash size={15} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Filtros ---------- */
function Filters({ period, setPeriod, cat, setCat, search, setSearch }) {
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
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
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

/* ============================================================
   DASHBOARD
   ============================================================ */
function DashboardView({ expenses, filtered, byCat, total, onEdit, onDelete, onAdd }) {
  const now = total;
  const count = filtered.length;
  const media = count ? total / count : 0;
  const topCat = byCat[0];

  return (
    <>
      <div className="stats">
        <Stat icon={Ic.coins} label="Total no período" value={fmtBRL(total)} accent
          meta={`${count} lançamentos`} />
        <Stat icon={Ic.receipt} label="Ticket médio" value={fmtBRL(media)}
          meta="por lançamento" />
        <Stat icon={Ic.target} label="Maior categoria"
          value={topCat ? topCat.nome : "—"}
          meta={topCat ? fmtBRL(topCat.valor) : ""} />
        <Stat icon={Ic.calendar} label="Gasto hoje"
          value={fmtBRL(expenses.filter(e => e.data === todayISO()).reduce((s, e) => s + e.valor, 0))}
          meta={fmtDateLong(todayISO())} />
      </div>

      <div className="grid-2">
        <div className="panel glass">
          <div className="panel-head">
            <div className="panel-title">Lançamentos recentes</div>
            <button className="btn btn-primary" onClick={onAdd}><Ic.plus size={17} />Adicionar gasto</button>
          </div>
          <ExpenseTable rows={filtered.slice(0, 8)} onEdit={onEdit} onDelete={onDelete} />
        </div>

        <div className="panel glass">
          <div className="panel-head">
            <div className="panel-title">Distribuição</div>
          </div>
          {total > 0
            ? <Donut data={byCat} total={total} />
            : <div className="empty"><Ic.chart size={40} />Sem dados no período</div>}
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
   GASTOS (planilha completa)
   ============================================================ */
function GastosView({ filtered, total, byCat, onEdit, onDelete, onAdd,
  period, setPeriod, cat, setCat, search, setSearch }) {
  return (
    <>
      <div className="panel glass" style={{ marginBottom: 16 }}>
        <div className="panel-head" style={{ flexWrap: "wrap" }}>
          <Filters {...{ period, setPeriod, cat, setCat, search, setSearch }} />
          <button className="btn btn-primary" onClick={onAdd}><Ic.plus size={17} />Adicionar gasto</button>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16, padding: "0 2px" }}>
          <span style={{ color: "var(--text-mid)", fontSize: 13.5, fontWeight: 600 }}>Total filtrado</span>
          <span className="cell-val" style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--accent-mint)" }}>{fmtBRL(total)}</span>
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
                  <span className="cell-val">{fmtBRL(c.valor)}</span>
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
function ConfigView({ settings, setSettings, onReset }) {
  const toggle = (k) => setSettings(s => ({ ...s, [k]: !s[k] }));
  const rows = [
    ["autoCat", "Categorização automática", "Detecta a categoria pela descrição do gasto."],
    ["glow", "Efeitos de iluminação", "Brilho sutil em cards e inputs (glassmorphism)."],
    ["animations", "Animações de fundo", "Movimento suave do gradiente ambiente."],
    ["confirmDelete", "Confirmar exclusão", "Pede confirmação antes de excluir um gasto."],
  ];
  return (
    <div className="grid-2" style={{ gridTemplateColumns: "1.3fr 1fr", alignItems: "start" }}>
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
      <div className="panel glass">
        <div className="panel-head"><div className="panel-title">Conta & dados</div></div>
        <div className="set-row"><div className="set-info"><div className="t">Moeda</div><div className="d">Real brasileiro (BRL)</div></div>
          <span className="tag"><span className="dot" style={{ background: "var(--cat-saude)" }} />R$</span></div>
        <div className="set-row"><div className="set-info"><div className="t">Orçamento mensal</div><div className="d">Meta de gastos do mês</div></div>
          <span className="cell-val" style={{ fontFamily: "var(--font-display)" }}>R$ 4.000</span></div>
        <div className="set-row"><div className="set-info"><div className="t">Restaurar exemplo</div><div className="d">Recarrega os dados de demonstração</div></div>
          <button className="btn btn-ghost" onClick={onReset}>Restaurar</button></div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardView, GastosView, RelatoriosView, ConfigView, ExpenseTable, Filters, Stat });

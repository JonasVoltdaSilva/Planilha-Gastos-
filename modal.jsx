/* ============================================================
   Modal de gasto / entrada — esforço mínimo + seção avançada
   ============================================================ */
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

const BASE_CAT_IDS = ["comida","transporte","moradia","lazer","saude","compras","contas","outros"];

function ExpenseModal({ initial, initKind, onSave, onClose, allCats, cards }) {
  const cats = allCats || CATEGORIES;
  const defaultKind = initial?.kind || initKind || "gasto";
  const isEdit = !!initial?.id;

  const [kind, setKind]           = useStateM(defaultKind);
  const [data, setData]           = useStateM(initial?.data || todayISO());
  const [descricao, setDescricao] = useStateM(initial?.descricao || "");
  const [categoria, setCategoria] = useStateM(initial?.categoria || "comida");
  const [valor, setValor]         = useStateM(initial?.valor != null ? String(initial.valor).replace(".", ",") : "");
  const [tipo, setTipo]           = useStateM(initial?.tipo || "outros");
  const [parcelado, setParcelado] = useStateM(initial?.forma === "parcelado");
  const [parcelas, setParcelas]   = useStateM(initial?.parcTotal > 1 ? String(initial.parcTotal) : "2");
  const [cardId, setCardId]       = useStateM(initial?.cardId || null);
  const [err, setErr]             = useStateM("");

  const hasAdvancedData = isEdit && (
    initial?.tipo !== "outros" || initial?.cardId || initial?.forma === "parcelado" || initial?.data !== todayISO()
  );
  const [showAdv, setShowAdv] = useStateM(hasAdvancedData);
  const advRef = useRefM(null);

  const toggleAdv = () => {
    setShowAdv(v => {
      const next = !v;
      if (next) {
        setTimeout(() => {
          if (advRef.current && modalBodyRef.current) {
            advRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 60);
      }
      return next;
    });
  };

  const [swipeY, setSwipeY] = useStateM(0);
  const swipeStart = useRefM(null);
  const modalBodyRef = useRefM(null);
  const onDragStart = (e) => { swipeStart.current = e.touches[0].clientY; };
  const onDragMove = (e) => {
    if (swipeStart.current === null) return;
    const diff = e.touches[0].clientY - swipeStart.current;
    if (diff > 0) setSwipeY(diff);
  };
  const onDragEnd = () => {
    if (swipeY > 80) onClose();
    else setSwipeY(0);
    swipeStart.current = null;
  };

  useEffectM(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [touchedCat, setTouchedCat] = useStateM(!!initial);
  const onDesc = (v) => {
    setDescricao(v);
    if (kind === "gasto" && !touchedCat && v.trim().length > 2) {
      const det = detectCategory(v);
      if (det !== "outros") setCategoria(det);
    }
  };
  const onTipo = (t) => { setTipo(t); if (t !== "credito") setParcelado(false); };

  const parcNum = parseInt(parcelas) || 0;
  const numVal = parseFloat(valor.replace(/\./g, "").replace(",", "."));
  const parcelVal = parcNum >= 2 && !isNaN(numVal) && numVal > 0
    ? Math.round((numVal / parcNum) * 100) / 100 : 0;

  const selectedCard = cards && cardId ? cards.find(c => c.id === cardId) : null;
  const faturaHint = kind === "gasto" && tipo === "credito" && selectedCard && data
    ? (() => {
        const ref = calcFaturaRef(data, selectedCard);
        if (!ref) return null;
        return new Date(ref + "-01T12:00:00").toLocaleString("pt-BR", { month: "long", year: "numeric" });
      })()
    : null;

  const advDot = tipo !== "outros" || cardId || parcelado || data !== todayISO();

  const submit = () => {
    const num = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    if (!descricao.trim()) return setErr("Adicione uma descrição.");
    if (isNaN(num) || num <= 0) return setErr("Informe um valor válido.");
    const forma = tipo === "credito" && parcelado ? "parcelado" : "avista";
    if (kind === "gasto" && forma === "parcelado" && (parcNum < 2 || parcNum > 60))
      return setErr("Informe parcelas entre 2 e 60.");
    onSave({
      id: initial?.id || uid(), data, descricao: descricao.trim(), categoria, valor: num,
      tipo, kind, forma: kind === "gasto" ? forma : "avista",
      parcTotal: kind === "gasto" && forma === "parcelado" ? parcNum : 1,
      parcNum: 1,
      cardId: kind === "gasto" && (tipo === "credito" || tipo === "debito") ? (cardId || null) : null,
      faturaRef: kind === "gasto" && tipo === "credito" && selectedCard ? calcFaturaRef(data, selectedCard) : null,
    });
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal glass"
        style={swipeY > 0 ? { transform: `translateY(${swipeY}px)`, transition: "none" } : undefined}>

        {/* Handle: único ponto de drag-to-dismiss, fora do scroll */}
        <div className="modal-handle"
          onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd} />

        {/* Container scrollável — ref aqui para o scrollIntoView funcionar */}
        <div ref={modalBodyRef} className="modal-inner-scroll">
        <h3>{isEdit ? (kind === "entrada" ? "Editar entrada" : "Editar gasto") : "Novo lançamento"}</h3>

        {!isEdit && (
          <div className="kind-picker">
            <button type="button" className={"kind-opt gasto" + (kind === "gasto" ? " on" : "")}
              onClick={() => setKind("gasto")}><Ic.receipt size={15} />Gasto</button>
            <button type="button" className={"kind-opt entrada" + (kind === "entrada" ? " on" : "")}
              onClick={() => setKind("entrada")}><Ic.trendUp size={15} />Entrada</button>
          </div>
        )}

        <div className="form-grid">
          {/* ── VALOR: campo hero ── */}
          <div className="form-row">
            <label className="form-label">Valor (R$)</label>
            <input className="form-input modal-valor-input" inputMode="decimal" autoFocus
              value={valor} onChange={(e) => setValor(e.target.value.replace(/[^\d.,]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="0,00" />
          </div>

          {/* ── DESCRIÇÃO ── */}
          <div className="form-row">
            <label className="form-label">Descrição</label>
            <input className="form-input" value={descricao} onChange={(e) => onDesc(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={kind === "entrada" ? "Ex.: Salário, Freelance..." : "Ex.: Almoço, Uber..."} />
          </div>

          {/* ── CATEGORIA (apenas gastos, 8 macros) ── */}
          {kind === "gasto" && (
            <div className="form-row">
              <label className="form-label">Categoria</label>
              <div className="cat-picker">
                {cats.map(c => (
                  <button key={c.id} type="button"
                    className={"cat-opt" + (categoria === c.id ? " on" : "")}
                    onClick={() => { setCategoria(c.id); setTouchedCat(true); }}>
                    <span className="dot" style={{ background: c.hex }} />{c.nome}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── AVANÇADO (colapsável) ── */}
          <button type="button" className={"modal-adv-toggle" + (advDot ? " has-data" : "")}
            onClick={toggleAdv}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: showAdv ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
              {showAdv ? "Menos opções" : "Mais opções"}
            </span>
            {advDot && <span className="modal-adv-dot" />}
          </button>

          {showAdv && (
            <>
              <div ref={advRef} className="form-row">
                <label className="form-label">Data</label>
                <input className="form-input form-input-date" type="date" value={data}
                  onChange={(e) => setData(e.target.value)} />
              </div>

              {kind === "gasto" && (
                <>
                  <div className="form-row">
                    <label className="form-label">Como pagou?</label>
                    <div className="tipo-picker">
                      {TIPOS.map(t => (
                        <button key={t.id} type="button"
                          className={"tipo-opt" + (tipo === t.id ? " on" : "")}
                          style={{ "--tipo-hex": t.hex }} onClick={() => onTipo(t.id)}>
                          {t.nome}
                        </button>
                      ))}
                    </div>
                  </div>

                  {tipo === "credito" && (
                    <>
                      <div className="form-row">
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div className={"switch" + (parcelado ? " on" : "")} onClick={() => setParcelado(v => !v)} />
                          <label className="form-label" style={{ margin: 0, cursor: "pointer" }}
                            onClick={() => setParcelado(v => !v)}>Parcelado</label>
                        </div>
                      </div>
                      {parcelado && (
                        <div className="form-row">
                          <label className="form-label">Número de parcelas</label>
                          <input className="form-input" inputMode="numeric" value={parcelas}
                            onChange={(e) => setParcelas(e.target.value.replace(/\D/g, ""))}
                            placeholder="Ex.: 3" style={{ maxWidth: 120 }} />
                          {parcNum >= 2 && parcelVal > 0 && (
                            <div className="parc-preview">{parcNum}× de {fmtBRL(parcelVal)} · total {fmtBRL(numVal)}</div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {(tipo === "credito" || tipo === "debito") && cards && cards.length > 0 && (
                    <div className="form-row">
                      <label className="form-label">Cartão</label>
                      <div className="tipo-picker">
                        <button type="button" className={"tipo-opt" + (!cardId ? " on" : "")}
                          style={{ "--tipo-hex": "var(--text-mid)" }} onClick={() => setCardId(null)}>
                          Nenhum
                        </button>
                        {cards.map(card => (
                          <button key={card.id} type="button"
                            className={"tipo-opt" + (cardId === card.id ? " on" : "")}
                            style={{ "--tipo-hex": card.cor || "var(--accent-mint)" }}
                            onClick={() => setCardId(card.id)}>
                            <Ic.card size={13} />{card.nome}
                          </button>
                        ))}
                      </div>
                      {tipo === "credito" && faturaHint && (
                        <div style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                          <Ic.receipt size={12} />Fatura de {faturaHint}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {err && <div style={{ color: "var(--cat-saude)", fontSize: 13, fontWeight: 600 }}>{err}</div>}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={submit}>
            <Ic.check size={17} />
            {isEdit ? "Salvar" : kind === "entrada" ? "Adicionar entrada" : "Adicionar"}
          </button>
        </div>
        </div>{/* fim modal-inner-scroll */}
      </div>
    </div>
  );
}

function Toast({ msg, icon }) {
  if (!msg) return null;
  const MAP = {
    check: { I: Ic.check, cls: "toast-success" },
    trash: { I: Ic.trash, cls: "toast-neutral" },
    error: { I: Ic.close, cls: "toast-error" },
    info:  { I: Ic.bell,  cls: "toast-info" },
  };
  const { I, cls } = MAP[icon] || MAP.check;
  return (
    <div className={"toast " + cls} role="status" aria-live="polite">
      <span className="toast-icon"><I size={17} /></span>
      <span className="toast-msg">{msg}</span>
    </div>
  );
}

/* Diálogo de confirmação elegante — substitui window.confirm nativo */
function ConfirmDialog({ title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", danger = false, onConfirm, onClose }) {
  useEffectM(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const I = danger ? Ic.trash : Ic.check;
  return (
    <div className="modal-overlay confirm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="confirm-dialog glass" role="alertdialog" aria-modal="true">
        <div className={"confirm-icon" + (danger ? " danger" : "")}><I size={24} /></div>
        <h3 className="confirm-title">{title}</h3>
        {message && <p className="confirm-message">{message}</p>}
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onClose}>{cancelLabel}</button>
          <button className={"btn " + (danger ? "btn-danger" : "btn-primary")} onClick={onConfirm} autoFocus>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ExpenseModal, Toast, ConfirmDialog });

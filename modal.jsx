/* ============================================================
   Modal de gasto / entrada (adicionar / editar) + Toast
   ============================================================ */
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

function ExpenseModal({ initial, initKind, onSave, onClose, allCats, cards }) {
  const cats = allCats || CATEGORIES;
  const defaultKind = initial?.kind || initKind || "gasto";
  const isEdit = !!initial?.id;

  const [kind, setKind] = useStateM(defaultKind);
  const [data, setData] = useStateM(initial?.data || todayISO());
  const [descricao, setDescricao] = useStateM(initial?.descricao || "");
  const [categoria, setCategoria] = useStateM(initial?.categoria || cats[0]?.id || "comida");
  const [valor, setValor] = useStateM(initial?.valor != null ? String(initial.valor).replace(".", ",") : "");
  const [tipo, setTipo] = useStateM(initial?.tipo || "outros");
  const [forma, setForma] = useStateM(initial?.forma || "avista");
  const [parcelas, setParcelas] = useStateM(initial?.parcTotal > 1 ? String(initial.parcTotal) : "2");
  const [cardId, setCardId] = useStateM(initial?.cardId || null);
  const [err, setErr] = useStateM("");

  // Swipe down to close
  const [swipeY, setSwipeY] = useStateM(0);
  const swipeStart = useRefM(null);
  const modalBodyRef = useRefM(null);

  const onDragStart = (e) => {
    swipeStart.current = e.touches[0].clientY;
  };
  const onDragMove = (e) => {
    if (swipeStart.current === null) return;
    // Only dismiss-swipe when modal content is scrolled to top
    if (modalBodyRef.current && modalBodyRef.current.scrollTop > 4) return;
    const diff = e.touches[0].clientY - swipeStart.current;
    if (diff > 0) setSwipeY(diff);
  };
  const onDragEnd = () => {
    if (swipeY > 80) {
      onClose();
    } else {
      setSwipeY(0);
    }
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

  const parcNum = parseInt(parcelas) || 0;
  const numVal = parseFloat(valor.replace(/\./g, "").replace(",", "."));
  const parcelVal = parcNum >= 2 && !isNaN(numVal) && numVal > 0
    ? Math.round((numVal / parcNum) * 100) / 100
    : 0;

  const submit = () => {
    const num = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    if (!descricao.trim()) return setErr("Adicione uma descrição.");
    if (isNaN(num) || num <= 0) return setErr("Informe um valor válido.");
    if (kind === "gasto" && forma === "parcelado" && (parcNum < 2 || parcNum > 60))
      return setErr("Informe parcelas entre 2 e 60.");
    const selectedCard = cards && cardId ? cards.find(c => c.id === cardId) : null;
    onSave({
      id: initial?.id || uid(),
      data,
      descricao: descricao.trim(),
      categoria,
      valor: num,
      tipo,
      kind,
      forma: kind === "gasto" ? forma : "avista",
      parcTotal: kind === "gasto" && forma === "parcelado" ? parcNum : 1,
      parcNum: 1,
      cardId: kind === "gasto" && tipo === "credito" ? (cardId || null) : null,
      faturaRef: kind === "gasto" && tipo === "credito" && selectedCard ? calcFaturaRef(data, selectedCard) : null,
    });
  };

  const dragging = swipeY > 0;

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={modalBodyRef}
        className="modal glass"
        style={dragging ? { transform: `translateY(${swipeY}px)`, transition: "none" } : undefined}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
      >
        {/* Drag handle — visible on mobile as swipe indicator */}
        <div className="modal-handle" />

        <h3>{isEdit ? (kind === "entrada" ? "Editar entrada" : "Editar gasto") : "Novo lançamento"}</h3>

        {!isEdit && (
          <div className="kind-picker">
            <button type="button"
              className={"kind-opt gasto" + (kind === "gasto" ? " on" : "")}
              onClick={() => setKind("gasto")}>
              <Ic.receipt size={15} />Gasto
            </button>
            <button type="button"
              className={"kind-opt entrada" + (kind === "entrada" ? " on" : "")}
              onClick={() => setKind("entrada")}>
              <Ic.trendUp size={15} />Entrada
            </button>
          </div>
        )}

        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Descrição</label>
            <input className="form-input" autoFocus value={descricao}
              onChange={(e) => onDesc(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={kind === "entrada" ? "Ex.: Salário, Freelance..." : "Ex.: Almoço no restaurante"} />
          </div>
          <div className="form-row two">
            <div className="form-row">
              <label className="form-label">Data</label>
              <input className="form-input form-input-date" type="date" value={data}
                onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="form-row">
              <label className="form-label">Valor (R$)</label>
              <input className="form-input" inputMode="decimal" value={valor}
                onChange={(e) => setValor(e.target.value.replace(/[^\d.,]/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="0,00" />
            </div>
          </div>

          {kind === "gasto" && (
            <>
              <div className="form-row">
                <label className="form-label">Forma de pagamento</label>
                <div className="tipo-picker">
                  {FORMAS.map(f => (
                    <button key={f.id} type="button"
                      className={"tipo-opt" + (forma === f.id ? " on" : "")}
                      style={{ "--tipo-hex": "var(--accent-mint)" }}
                      onClick={() => setForma(f.id)}>
                      {f.nome}
                    </button>
                  ))}
                </div>
              </div>

              {forma === "parcelado" && (
                <div className="form-row">
                  <label className="form-label">Número de parcelas</label>
                  <input className="form-input" inputMode="numeric" value={parcelas}
                    onChange={(e) => setParcelas(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="Ex.: 3" style={{ maxWidth: 120 }} />
                  {parcNum >= 2 && parcelVal > 0 && (
                    <div className="parc-preview">
                      {parcNum}× de {fmtBRL(parcelVal)} · total {fmtBRL(numVal)}
                    </div>
                  )}
                </div>
              )}

              <div className="form-row">
                <label className="form-label">Tipo de pagamento</label>
                <div className="tipo-picker">
                  {TIPOS.map(t => (
                    <button key={t.id} type="button"
                      className={"tipo-opt" + (tipo === t.id ? " on" : "")}
                      style={{ "--tipo-hex": t.hex }}
                      onClick={() => setTipo(t.id)}>
                      {t.nome}
                    </button>
                  ))}
                </div>
              </div>
              {tipo === "credito" && cards && cards.length > 0 && (
                <div className="form-row">
                  <label className="form-label">Cartão de crédito</label>
                  <div className="tipo-picker">
                    <button type="button"
                      className={"tipo-opt" + (!cardId ? " on" : "")}
                      style={{ "--tipo-hex": "var(--text-mid)" }}
                      onClick={() => setCardId(null)}>
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
                </div>
              )}
              <div className="form-row">
                <label className="form-label">Categoria</label>
                <div className="cat-picker">
                  {cats.map(c => (
                    <button key={c.id} type="button"
                      className={"cat-opt" + (categoria === c.id ? " on" : "")}
                      onClick={() => { setCategoria(c.id); setTouchedCat(true); }}>
                      <span className="dot" style={{ background: c.hex }} />
                      {c.nome}
                    </button>
                  ))}
                </div>
              </div>
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
      </div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="toast">
      <Ic.check size={18} />{msg}
    </div>
  );
}

Object.assign(window, { ExpenseModal, Toast });

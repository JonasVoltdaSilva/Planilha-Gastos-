/* ============================================================
   Modal de gasto (adicionar / editar) + Toast
   ============================================================ */
const { useState: useStateM, useEffect: useEffectM } = React;

function ExpenseModal({ initial, onSave, onClose, allCats }) {
  const cats = allCats || CATEGORIES;
  const [data, setData] = useStateM(initial?.data || todayISO());
  const [descricao, setDescricao] = useStateM(initial?.descricao || "");
  const [categoria, setCategoria] = useStateM(initial?.categoria || cats[0]?.id || "comida");
  const [valor, setValor] = useStateM(initial?.valor != null ? String(initial.valor).replace(".", ",") : "");
  const [tipo, setTipo] = useStateM(initial?.tipo || "outros");
  const [err, setErr] = useStateM("");

  useEffectM(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [touchedCat, setTouchedCat] = useStateM(!!initial);
  const onDesc = (v) => {
    setDescricao(v);
    if (!touchedCat && v.trim().length > 2) {
      const det = detectCategory(v);
      if (det !== "outros") setCategoria(det);
    }
  };

  const submit = () => {
    const num = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    if (!descricao.trim()) return setErr("Adicione uma descrição.");
    if (isNaN(num) || num <= 0) return setErr("Informe um valor válido.");
    onSave({ id: initial?.id || uid(), data, descricao: descricao.trim(), categoria, valor: num, tipo });
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal glass">
        <h3>{initial ? "Editar gasto" : "Novo gasto"}</h3>
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Descrição</label>
            <input className="form-input" autoFocus value={descricao}
              onChange={(e) => onDesc(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Ex.: Almoço no restaurante" />
          </div>
          <div className="form-row two">
            <div className="form-row">
              <label className="form-label">Data</label>
              <input className="form-input" type="date" value={data}
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
          {err && <div style={{ color: "var(--cat-saude)", fontSize: 13, fontWeight: 600 }}>{err}</div>}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={submit}>
            <Ic.check size={17} />{initial ? "Salvar" : "Adicionar"}
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

/* GERADO AUTOMATICAMENTE a partir de modal.jsx — não edite à mão. Rode: npm run build */
(function () {
const {
  useState: useStateM,
  useEffect: useEffectM,
  useRef: useRefM
} = React;
const BASE_CAT_IDS = ["comida", "transporte", "moradia", "lazer", "saude", "compras", "contas", "outros"];
function ExpenseModal({
  initial,
  initKind,
  onSave,
  onClose,
  allCats,
  cards
}) {
  const cats = allCats || CATEGORIES;
  const defaultKind = initial?.kind || initKind || "gasto";
  const isEdit = !!initial?.id;
  const [kind, setKind] = useStateM(defaultKind);
  const [data, setData] = useStateM(initial?.data || todayISO());
  const [descricao, setDescricao] = useStateM(initial?.descricao || "");
  const [categoria, setCategoria] = useStateM(initial?.categoria || "comida");
  const [valor, setValor] = useStateM(initial?.valor != null ? String(initial.valor).replace(".", ",") : "");
  const [tipo, setTipo] = useStateM(initial?.tipo || "outros");
  const [parcelado, setParcelado] = useStateM(initial?.forma === "parcelado");
  const [parcelas, setParcelas] = useStateM(initial?.parcTotal > 1 ? String(initial.parcTotal) : "2");
  const [cardId, setCardId] = useStateM(initial?.cardId || null);
  const [err, setErr] = useStateM("");
  const hasAdvancedData = isEdit && (initial?.tipo !== "outros" || initial?.cardId || initial?.forma === "parcelado" || initial?.data !== todayISO());
  const [showAdv, setShowAdv] = useStateM(hasAdvancedData);
  const advRef = useRefM(null);
  const toggleAdv = () => {
    setShowAdv(v => {
      const next = !v;
      if (next) {
        setTimeout(() => {
          if (advRef.current && modalBodyRef.current) {
            advRef.current.scrollIntoView({
              behavior: "smooth",
              block: "nearest"
            });
          }
        }, 60);
      }
      return next;
    });
  };
  const [swipeY, setSwipeY] = useStateM(0);
  const swipeStart = useRefM(null);
  const modalBodyRef = useRefM(null);
  const onDragStart = e => {
    swipeStart.current = e.touches[0].clientY;
  };
  const onDragMove = e => {
    if (swipeStart.current === null) return;
    const diff = e.touches[0].clientY - swipeStart.current;
    if (diff > 0) setSwipeY(diff);
  };
  const onDragEnd = () => {
    if (swipeY > 80) onClose();else setSwipeY(0);
    swipeStart.current = null;
  };
  useEffectM(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const [touchedCat, setTouchedCat] = useStateM(!!initial);
  const onDesc = v => {
    setDescricao(v);
    if (kind === "gasto" && !touchedCat && v.trim().length > 2) {
      const det = detectCategory(v);
      if (det !== "outros") setCategoria(det);
    }
  };
  const onTipo = t => {
    setTipo(t);
    if (t !== "credito") setParcelado(false);
  };
  const parcNum = parseInt(parcelas) || 0;
  const numVal = parseFloat(valor.replace(/\./g, "").replace(",", "."));
  const parcelVal = parcNum >= 2 && !isNaN(numVal) && numVal > 0 ? Math.round(numVal / parcNum * 100) / 100 : 0;
  const selectedCard = cards && cardId ? cards.find(c => c.id === cardId) : null;
  const faturaHint = kind === "gasto" && tipo === "credito" && selectedCard && data ? (() => {
    const ref = calcFaturaRef(data, selectedCard);
    if (!ref) return null;
    return new Date(ref + "-01T12:00:00").toLocaleString("pt-BR", {
      month: "long",
      year: "numeric"
    });
  })() : null;
  const advDot = tipo !== "outros" || cardId || parcelado || data !== todayISO();
  const submit = () => {
    const num = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    if (!descricao.trim()) return setErr("Adicione uma descrição.");
    if (isNaN(num) || num <= 0) return setErr("Informe um valor válido.");
    const forma = tipo === "credito" && parcelado ? "parcelado" : "avista";
    if (kind === "gasto" && forma === "parcelado" && (parcNum < 2 || parcNum > 60)) return setErr("Informe parcelas entre 2 e 60.");
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
      cardId: kind === "gasto" && (tipo === "credito" || tipo === "debito") ? cardId || null : null,
      faturaRef: kind === "gasto" && tipo === "credito" && selectedCard ? calcFaturaRef(data, selectedCard) : null
    });
  };
  return React.createElement("div", {
    className: "modal-overlay",
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose();
    }
  }, React.createElement("div", {
    className: "modal glass",
    style: swipeY > 0 ? {
      transform: `translateY(${swipeY}px)`,
      transition: "none"
    } : undefined
  }, React.createElement("div", {
    className: "modal-handle",
    onTouchStart: onDragStart,
    onTouchMove: onDragMove,
    onTouchEnd: onDragEnd
  }), React.createElement("div", {
    ref: modalBodyRef,
    className: "modal-inner-scroll"
  }, React.createElement("h3", null, isEdit ? kind === "entrada" ? "Editar entrada" : "Editar gasto" : "Novo lançamento"), !isEdit && React.createElement("div", {
    className: "kind-picker"
  }, React.createElement("button", {
    type: "button",
    className: "kind-opt gasto" + (kind === "gasto" ? " on" : ""),
    onClick: () => setKind("gasto")
  }, React.createElement(Ic.receipt, {
    size: 15
  }), "Gasto"), React.createElement("button", {
    type: "button",
    className: "kind-opt entrada" + (kind === "entrada" ? " on" : ""),
    onClick: () => setKind("entrada")
  }, React.createElement(Ic.trendUp, {
    size: 15
  }), "Entrada")), React.createElement("div", {
    className: "form-grid"
  }, React.createElement("div", {
    className: "form-row"
  }, React.createElement("label", {
    className: "form-label"
  }, "Valor (R$)"), React.createElement("input", {
    className: "form-input modal-valor-input",
    inputMode: "decimal",
    autoFocus: true,
    value: valor,
    onChange: e => setValor(e.target.value.replace(/[^\d.,]/g, "")),
    onKeyDown: e => e.key === "Enter" && submit(),
    placeholder: "0,00"
  })), React.createElement("div", {
    className: "form-row"
  }, React.createElement("label", {
    className: "form-label"
  }, "Descri\xE7\xE3o"), React.createElement("input", {
    className: "form-input",
    value: descricao,
    onChange: e => onDesc(e.target.value),
    onKeyDown: e => e.key === "Enter" && submit(),
    placeholder: kind === "entrada" ? "Ex.: Salário, Freelance..." : "Ex.: Almoço, Uber..."
  })), kind === "gasto" && React.createElement("div", {
    className: "form-row"
  }, React.createElement("label", {
    className: "form-label"
  }, "Categoria"), React.createElement("div", {
    className: "cat-picker"
  }, cats.map(c => React.createElement("button", {
    key: c.id,
    type: "button",
    className: "cat-opt" + (categoria === c.id ? " on" : ""),
    onClick: () => {
      setCategoria(c.id);
      setTouchedCat(true);
    }
  }, React.createElement("span", {
    className: "dot",
    style: {
      background: c.hex
    }
  }), c.nome)))), React.createElement("button", {
    type: "button",
    className: "modal-adv-toggle" + (advDot ? " has-data" : ""),
    onClick: toggleAdv
  }, React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    style: {
      transform: showAdv ? "rotate(180deg)" : "none",
      transition: "transform 0.2s"
    }
  }, React.createElement("path", {
    d: "M6 9l6 6 6-6"
  })), showAdv ? "Menos opções" : "Mais opções"), advDot && React.createElement("span", {
    className: "modal-adv-dot"
  })), showAdv && React.createElement(React.Fragment, null, React.createElement("div", {
    ref: advRef,
    className: "form-row"
  }, React.createElement("label", {
    className: "form-label"
  }, "Data"), React.createElement("input", {
    className: "form-input form-input-date",
    type: "date",
    value: data,
    onChange: e => setData(e.target.value)
  })), kind === "gasto" && React.createElement(React.Fragment, null, React.createElement("div", {
    className: "form-row"
  }, React.createElement("label", {
    className: "form-label"
  }, "Como pagou?"), React.createElement("div", {
    className: "tipo-picker"
  }, TIPOS.map(t => React.createElement("button", {
    key: t.id,
    type: "button",
    className: "tipo-opt" + (tipo === t.id ? " on" : ""),
    style: {
      "--tipo-hex": t.hex
    },
    onClick: () => onTipo(t.id)
  }, t.nome)))), tipo === "credito" && React.createElement(React.Fragment, null, React.createElement("div", {
    className: "form-row"
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, React.createElement("div", {
    className: "switch" + (parcelado ? " on" : ""),
    onClick: () => setParcelado(v => !v)
  }), React.createElement("label", {
    className: "form-label",
    style: {
      margin: 0,
      cursor: "pointer"
    },
    onClick: () => setParcelado(v => !v)
  }, "Parcelado"))), parcelado && React.createElement("div", {
    className: "form-row"
  }, React.createElement("label", {
    className: "form-label"
  }, "N\xFAmero de parcelas"), React.createElement("input", {
    className: "form-input",
    inputMode: "numeric",
    value: parcelas,
    onChange: e => setParcelas(e.target.value.replace(/\D/g, "")),
    placeholder: "Ex.: 3",
    style: {
      maxWidth: 120
    }
  }), parcNum >= 2 && parcelVal > 0 && React.createElement("div", {
    className: "parc-preview"
  }, parcNum, "\xD7 de ", fmtBRL(parcelVal), " \xB7 total ", fmtBRL(numVal)))), (tipo === "credito" || tipo === "debito") && cards && cards.length > 0 && React.createElement("div", {
    className: "form-row"
  }, React.createElement("label", {
    className: "form-label"
  }, "Cart\xE3o"), React.createElement("div", {
    className: "tipo-picker"
  }, React.createElement("button", {
    type: "button",
    className: "tipo-opt" + (!cardId ? " on" : ""),
    style: {
      "--tipo-hex": "var(--text-mid)"
    },
    onClick: () => setCardId(null)
  }, "Nenhum"), cards.map(card => React.createElement("button", {
    key: card.id,
    type: "button",
    className: "tipo-opt" + (cardId === card.id ? " on" : ""),
    style: {
      "--tipo-hex": card.cor || "var(--accent-mint)"
    },
    onClick: () => setCardId(card.id)
  }, React.createElement(Ic.card, {
    size: 13
  }), card.nome))), tipo === "credito" && faturaHint && React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mid)",
      marginTop: 6,
      display: "flex",
      alignItems: "center",
      gap: 5
    }
  }, React.createElement(Ic.receipt, {
    size: 12
  }), "Fatura de ", faturaHint)))), err && React.createElement("div", {
    style: {
      color: "var(--cat-saude)",
      fontSize: 13,
      fontWeight: 600
    }
  }, err)), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("button", {
    className: "btn btn-ghost",
    onClick: onClose
  }, "Cancelar"), React.createElement("button", {
    className: "btn btn-primary",
    onClick: submit
  }, React.createElement(Ic.check, {
    size: 17
  }), isEdit ? "Salvar" : kind === "entrada" ? "Adicionar entrada" : "Adicionar")))));
}
function Toast({
  msg,
  icon
}) {
  if (!msg) return null;
  const MAP = {
    check: {
      I: Ic.check,
      cls: "toast-success"
    },
    trash: {
      I: Ic.trash,
      cls: "toast-neutral"
    },
    error: {
      I: Ic.close,
      cls: "toast-error"
    },
    info: {
      I: Ic.bell,
      cls: "toast-info"
    }
  };
  const {
    I,
    cls
  } = MAP[icon] || MAP.check;
  return React.createElement("div", {
    className: "toast " + cls,
    role: "status",
    "aria-live": "polite"
  }, React.createElement("span", {
    className: "toast-icon"
  }, React.createElement(I, {
    size: 17
  })), React.createElement("span", {
    className: "toast-msg"
  }, msg));
}
function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onClose
}) {
  useEffectM(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose();else if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const I = danger ? Ic.trash : Ic.check;
  return React.createElement("div", {
    className: "modal-overlay confirm-overlay",
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose();
    }
  }, React.createElement("div", {
    className: "confirm-dialog glass",
    role: "alertdialog",
    "aria-modal": "true"
  }, React.createElement("div", {
    className: "confirm-icon" + (danger ? " danger" : "")
  }, React.createElement(I, {
    size: 24
  })), React.createElement("h3", {
    className: "confirm-title"
  }, title), message && React.createElement("p", {
    className: "confirm-message"
  }, message), React.createElement("div", {
    className: "confirm-actions"
  }, React.createElement("button", {
    className: "btn btn-ghost",
    onClick: onClose
  }, cancelLabel), React.createElement("button", {
    className: "btn " + (danger ? "btn-danger" : "btn-primary"),
    onClick: onConfirm,
    autoFocus: true
  }, confirmLabel))));
}
Object.assign(window, {
  ExpenseModal,
  Toast,
  ConfirmDialog
});
})();

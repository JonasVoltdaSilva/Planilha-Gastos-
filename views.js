/* GERADO AUTOMATICAMENTE a partir de views.jsx — não edite à mão. Rode: npm run build */
(function () {
const {
  useState: useS,
  useMemo: useM
} = React;
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
    if (e.data === today) label = "Hoje";else if (e.data === yesterday) label = "Ontem";else if (e.data >= weekStart) label = "Esta semana";else if (e.data >= prevWeekStart) label = "Semana passada";else {
      const d = new Date(e.data + "T12:00:00");
      const m = d.toLocaleString("pt-BR", {
        month: "long"
      });
      const y = d.getFullYear();
      const cap = m.charAt(0).toUpperCase() + m.slice(1);
      label = y === currYear ? cap : `${cap} de ${y}`;
    }
    if (!groupMap.has(label)) {
      groupMap.set(label, []);
      order.push(label);
    }
    groupMap.get(label).push(e);
  }
  return order.map(label => ({
    label,
    rows: groupMap.get(label)
  }));
}
function GroupedExpenseList({
  rows,
  onEdit,
  onDelete,
  onDeleteGroup,
  cards
}) {
  if (!rows || rows.length === 0) return null;
  const groups = groupExpensesByDate(rows);
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, groups.map(({
    label,
    rows: gr
  }) => {
    const total = gr.filter(e => e.kind !== "entrada").reduce((s, e) => s + e.valor, 0);
    return React.createElement("div", {
      key: label
    }, React.createElement("div", {
      className: "group-header"
    }, React.createElement("span", {
      className: "group-header-label"
    }, label), total > 0 && React.createElement("span", {
      className: "group-header-total"
    }, "\u2212", fmtBRLshort(total))), React.createElement(ExpenseTable, {
      rows: gr,
      onEdit: onEdit,
      onDelete: onDelete,
      onDeleteGroup: onDeleteGroup,
      cards: cards,
      emptyText: ""
    }));
  }));
}
function EmptyState({
  title,
  text,
  onAdd,
  icon
}) {
  const I = icon || Ic.coins;
  return React.createElement("div", {
    className: "empty-state"
  }, React.createElement("div", {
    className: "empty-state-icon"
  }, React.createElement(I, {
    size: 46
  })), React.createElement("div", {
    className: "empty-state-title"
  }, title || "Nada por aqui ainda"), React.createElement("div", {
    className: "empty-state-text"
  }, text || "Adicione sua primeira transação tocando no botão abaixo."), onAdd && React.createElement("button", {
    className: "btn btn-primary empty-state-btn",
    onClick: onAdd
  }, React.createElement(Ic.plus, {
    size: 17
  }), "Adicionar transa\xE7\xE3o"));
}
function BudgetBar({
  total,
  budget
}) {
  if (!budget || budget <= 0) return null;
  const pct = Math.min(total / budget * 100, 100);
  const color = pct < 60 ? "var(--accent-mint)" : pct < 85 ? "#e0c85a" : "var(--cat-saude)";
  const status = pct < 60 ? "Dentro do orçamento" : pct < 85 ? "Atenção — chegando perto" : "Perto do limite!";
  return React.createElement("div", {
    className: "budget-bar-wrap"
  }, React.createElement("div", {
    className: "budget-bar-labels"
  }, React.createElement("span", {
    style: {
      color: "var(--text-mid)",
      fontSize: 12.5,
      fontWeight: 600
    }
  }, fmtBRL(total), " ", React.createElement("span", {
    style: {
      color: "var(--text-lo)"
    }
  }, "/ ", fmtBRL(budget))), React.createElement("span", {
    style: {
      color,
      fontWeight: 700,
      fontSize: 13
    }
  }, Math.round(pct), "%")), React.createElement("div", {
    className: "budget-bar-track"
  }, React.createElement("div", {
    className: "budget-bar-fill",
    style: {
      width: `${pct}%`,
      background: color
    }
  })), React.createElement("div", {
    style: {
      color,
      fontSize: 12,
      fontWeight: 600,
      marginTop: 5
    }
  }, status));
}
function ExpenseTable({
  rows,
  onEdit,
  onDelete,
  onDeleteGroup,
  cards,
  emptyText
}) {
  if (rows.length === 0) {
    return React.createElement("div", {
      className: "empty"
    }, React.createElement(Ic.receipt, {
      size: 40
    }), React.createElement("div", {
      style: {
        fontWeight: 600,
        color: "var(--text-mid)"
      }
    }, emptyText || "Nenhum lançamento encontrado"), React.createElement("div", {
      style: {
        fontSize: 13,
        marginTop: 4
      }
    }, "Adicione um lan\xE7amento ou ajuste os filtros."));
  }
  return React.createElement("div", {
    className: "expense-list"
  }, rows.map(e => {
    const isEntrada = e.kind === "entrada";
    const c = isEntrada ? {
      hex: "#5ad9a8",
      nome: "Entrada"
    } : CAT_MAP[e.categoria] || CAT_MAP["outros"];
    const t = TIPO_MAP[e.tipo] || TIPO_MAP["outros"];
    const linkedCard = e.cardId && cards ? cards.find(cd => cd.id === e.cardId) : null;
    return React.createElement("div", {
      className: "expense-row",
      key: e.id,
      style: {
        "--row-accent": c.hex
      }
    }, React.createElement("div", {
      className: "expense-accent"
    }), React.createElement("div", {
      className: "expense-main"
    }, React.createElement("div", {
      className: "expense-info"
    }, React.createElement("span", {
      className: "expense-desc"
    }, e.descricao), React.createElement("div", {
      className: "expense-meta"
    }, React.createElement("span", {
      className: "expense-date"
    }, fmtDate(e.data)), isEntrada ? React.createElement("span", {
      className: "exp-tag",
      style: {
        background: "rgba(90,217,168,0.15)",
        color: "var(--accent-mint)",
        borderColor: "rgba(90,217,168,0.3)"
      }
    }, "Entrada") : React.createElement("span", {
      className: "exp-tag",
      style: {
        background: c.hex + "22",
        color: c.hex,
        borderColor: c.hex + "44"
      }
    }, c.nome), !isEntrada && React.createElement("span", {
      className: "exp-tag",
      style: {
        background: t.hex + "22",
        color: t.hex,
        borderColor: t.hex + "44"
      }
    }, t.nome), linkedCard && React.createElement("span", {
      className: "exp-tag",
      style: {
        background: linkedCard.cor + "22",
        color: linkedCard.cor,
        borderColor: linkedCard.cor + "44"
      }
    }, React.createElement(Ic.card, {
      size: 10
    }), linkedCard.nome))), React.createElement("div", {
      className: "expense-right"
    }, React.createElement("span", {
      className: "expense-val",
      style: isEntrada ? {
        color: "var(--accent-mint)"
      } : {}
    }, isEntrada ? "+" : "", fmtBRL(e.valor)), React.createElement("div", {
      className: "row-actions"
    }, React.createElement("button", {
      className: "icon-btn",
      title: "Editar",
      onClick: () => onEdit(e)
    }, React.createElement(Ic.edit, {
      size: 15
    })), e.parcGrupo && onDeleteGroup && React.createElement("button", {
      className: "icon-btn",
      title: `Excluir todas as ${e.parcTotal} parcelas`,
      style: {
        fontSize: 9,
        gap: 2
      },
      onClick: () => onDeleteGroup(e.parcGrupo)
    }, React.createElement(Ic.trash, {
      size: 13
    }), React.createElement("span", {
      style: {
        fontSize: 9,
        lineHeight: 1
      }
    }, "\xD7", e.parcTotal)), React.createElement("button", {
      className: "icon-btn danger",
      title: "Excluir",
      onClick: () => onDelete(e.id)
    }, React.createElement(Ic.trash, {
      size: 15
    }))))));
  }));
}
function Filters({
  period,
  setPeriod,
  cat,
  setCat,
  search,
  setSearch,
  allCats
}) {
  const cats = allCats || CATEGORIES;
  return React.createElement("div", {
    className: "filters"
  }, React.createElement("div", {
    className: "field",
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("input", {
    className: "input",
    style: {
      width: "100%",
      paddingLeft: 36
    },
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: "Buscar descri\xE7\xE3o..."
  }), React.createElement("span", {
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--text-lo)",
      display: "flex"
    }
  }, React.createElement(Ic.search, {
    size: 16
  }))), React.createElement("div", {
    className: "field sel"
  }, React.createElement("select", {
    className: "select",
    value: period,
    onChange: e => setPeriod(e.target.value)
  }, React.createElement("option", {
    value: "7"
  }, "\xDAltimos 7 dias"), React.createElement("option", {
    value: "30"
  }, "\xDAltimos 30 dias"), React.createElement("option", {
    value: "90"
  }, "\xDAltimos 90 dias"), React.createElement("option", {
    value: "all"
  }, "Todo per\xEDodo"))), React.createElement("div", {
    className: "field sel"
  }, React.createElement("select", {
    className: "select",
    value: cat,
    onChange: e => setCat(e.target.value)
  }, React.createElement("option", {
    value: "all"
  }, "Todas categorias"), cats.map(c => React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.nome)))));
}
function FilterSheet({
  allCats,
  cards,
  cat,
  setCat,
  tipoFilter,
  setTipoFilter,
  cardIdFilter,
  setCardIdFilter,
  onClose
}) {
  return React.createElement("div", {
    className: "modal-overlay",
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose();
    }
  }, React.createElement("div", {
    className: "modal glass"
  }, React.createElement("div", {
    className: "modal-handle"
  }), React.createElement("h3", null, "Filtros avan\xE7ados"), React.createElement("div", {
    className: "filter-section"
  }, React.createElement("div", {
    className: "filter-section-title"
  }, "Categoria"), React.createElement("div", {
    className: "filter-chips"
  }, React.createElement("button", {
    type: "button",
    className: "filter-chip" + (cat === "all" ? " on" : ""),
    style: {
      "--chip-color": "var(--text-mid)"
    },
    onClick: () => setCat("all")
  }, "Todas"), (allCats || CATEGORIES).map(c => React.createElement("button", {
    key: c.id,
    type: "button",
    className: "filter-chip" + (cat === c.id ? " on" : ""),
    style: {
      "--chip-color": c.hex
    },
    onClick: () => setCat(c.id)
  }, React.createElement("span", {
    className: "dot",
    style: {
      background: c.hex
    }
  }), c.nome)))), React.createElement("div", {
    className: "filter-section"
  }, React.createElement("div", {
    className: "filter-section-title"
  }, "Tipo de pagamento"), React.createElement("div", {
    className: "filter-chips"
  }, React.createElement("button", {
    type: "button",
    className: "filter-chip" + (tipoFilter === "all" ? " on" : ""),
    style: {
      "--chip-color": "var(--text-mid)"
    },
    onClick: () => setTipoFilter("all")
  }, "Todos"), TIPOS.map(t => React.createElement("button", {
    key: t.id,
    type: "button",
    className: "filter-chip" + (tipoFilter === t.id ? " on" : ""),
    style: {
      "--chip-color": t.hex
    },
    onClick: () => setTipoFilter(t.id)
  }, t.nome)))), cards && cards.length > 0 && React.createElement("div", {
    className: "filter-section"
  }, React.createElement("div", {
    className: "filter-section-title"
  }, "Cart\xE3o"), React.createElement("div", {
    className: "filter-chips"
  }, React.createElement("button", {
    type: "button",
    className: "filter-chip" + (cardIdFilter === "all" ? " on" : ""),
    style: {
      "--chip-color": "var(--text-mid)"
    },
    onClick: () => setCardIdFilter("all")
  }, "Todos"), cards.map(c => React.createElement("button", {
    key: c.id,
    type: "button",
    className: "filter-chip" + (cardIdFilter === c.id ? " on" : ""),
    style: {
      "--chip-color": c.cor || "var(--accent-mint)"
    },
    onClick: () => setCardIdFilter(c.id)
  }, React.createElement(Ic.card, {
    size: 13
  }), c.nome)))), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => {
      setCat("all");
      setTipoFilter("all");
      setCardIdFilter("all");
    }
  }, "Limpar"), React.createElement("button", {
    className: "btn btn-primary",
    onClick: onClose
  }, React.createElement(Ic.check, {
    size: 17
  }), "Fechar"))));
}
function FilterBar({
  period,
  setPeriod,
  cat,
  setCat,
  search,
  setSearch,
  tipoFilter,
  setTipoFilter,
  cardIdFilter,
  setCardIdFilter,
  allCats,
  cards,
  onOpenSheet
}) {
  const activeCount = (cat !== "all" ? 1 : 0) + (tipoFilter !== "all" ? 1 : 0) + (cardIdFilter !== "all" ? 1 : 0);
  const cats = allCats || CATEGORIES;
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "filter-bar"
  }, React.createElement("div", {
    className: "field",
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("input", {
    className: "input",
    style: {
      width: "100%",
      paddingLeft: 36
    },
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: "Buscar descri\xE7\xE3o..."
  }), React.createElement("span", {
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--text-lo)",
      display: "flex"
    }
  }, React.createElement(Ic.search, {
    size: 16
  }))), React.createElement("div", {
    className: "field sel"
  }, React.createElement("select", {
    className: "select",
    value: period,
    onChange: e => setPeriod(e.target.value)
  }, React.createElement("option", {
    value: "mes-atual"
  }, "Este m\xEAs"), React.createElement("option", {
    value: "mes-anterior"
  }, "M\xEAs passado"), React.createElement("option", {
    value: "7"
  }, "7 dias"), React.createElement("option", {
    value: "14"
  }, "14 dias"), React.createElement("option", {
    value: "30"
  }, "30 dias"), React.createElement("option", {
    value: "all"
  }, "Todo per\xEDodo"))), React.createElement("button", {
    className: "btn btn-ghost filter-btn" + (activeCount > 0 ? " active" : ""),
    onClick: onOpenSheet
  }, React.createElement(Ic.filter, {
    size: 16
  }), "Filtros", activeCount > 0 && React.createElement("span", {
    className: "filter-badge"
  }, activeCount))), activeCount > 0 && React.createElement("div", {
    className: "active-filters"
  }, cat !== "all" && (() => {
    const c = cats.find(x => x.id === cat);
    return c ? React.createElement("button", {
      className: "active-chip",
      style: {
        "--chip-color": c.hex
      },
      onClick: () => setCat("all")
    }, React.createElement("span", {
      className: "dot",
      style: {
        background: c.hex
      }
    }), c.nome, " \xD7") : null;
  })(), tipoFilter !== "all" && (() => {
    const t = TIPOS.find(x => x.id === tipoFilter);
    return t ? React.createElement("button", {
      className: "active-chip",
      style: {
        "--chip-color": t.hex
      },
      onClick: () => setTipoFilter("all")
    }, t.nome, " \xD7") : null;
  })(), cardIdFilter !== "all" && cards && (() => {
    const c = cards.find(x => x.id === cardIdFilter);
    return c ? React.createElement("button", {
      className: "active-chip",
      style: {
        "--chip-color": c.cor || "var(--accent-mint)"
      },
      onClick: () => setCardIdFilter("all")
    }, React.createElement(Ic.card, {
      size: 11
    }), c.nome, " \xD7") : null;
  })(), React.createElement("button", {
    className: "active-chip active-chip-clear",
    onClick: () => {
      setCat("all");
      setTipoFilter("all");
      setCardIdFilter("all");
    }
  }, "Limpar tudo")));
}
function RecRuleEditor({
  label,
  value,
  onChange
}) {
  const type = value && value.type || "fixed_day";
  const bStyle = t => ({
    flex: 1,
    padding: "6px 4px",
    borderRadius: "var(--radius-sm)",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
    background: type === t ? "var(--accent-mint-soft)" : "rgba(255,255,255,0.05)",
    border: `1px solid ${type === t ? "var(--accent-mint)" : "var(--glass-border)"}`,
    color: type === t ? "var(--accent-mint)" : "var(--text-mid)",
    transition: "all 0.15s"
  });
  const merge = patch => onChange({
    ...(value || {}),
    type,
    ...patch
  });
  return React.createElement("div", null, label && React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-lo)",
      marginBottom: 5,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.06em"
    }
  }, label), React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      marginBottom: 7
    }
  }, [["fixed_day", "Dia fixo"], ["nth_biz", "N-ésimo útil"], ["first_biz_after", "Útil após data"]].map(([v, l]) => React.createElement("button", {
    key: v,
    type: "button",
    style: bStyle(v),
    onClick: () => onChange({
      ...(value || {}),
      type: v
    })
  }, l))), type === "fixed_day" && React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-mid)",
      flexShrink: 0
    }
  }, "Todo dia"), React.createElement("input", {
    className: "form-input",
    type: "number",
    min: "1",
    max: "31",
    style: {
      width: 72
    },
    value: value?.day ?? 1,
    onChange: e => merge({
      day: parseInt(e.target.value) || 1
    })
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-lo)"
    }
  }, "do m\xEAs")), type === "nth_biz" && React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, React.createElement("select", {
    className: "select",
    style: {
      flex: 1
    },
    value: String(value?.pos ?? "1"),
    onChange: e => merge({
      pos: e.target.value === "last" ? "last" : parseInt(e.target.value)
    })
  }, ["1", "2", "3", "4", "5"].map(n => React.createElement("option", {
    key: n,
    value: n
  }, n, "\xBA dia \xFAtil")), React.createElement("option", {
    value: "last"
  }, "\xDAltimo dia \xFAtil")), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-lo)",
      flexShrink: 0
    }
  }, "do m\xEAs")), type === "first_biz_after" && React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-mid)",
      flexShrink: 0
    }
  }, "1\xBA \xFAtil ap\xF3s o dia"), React.createElement("input", {
    className: "form-input",
    type: "number",
    min: "1",
    max: "31",
    style: {
      width: 72
    },
    value: value?.ref ?? 5,
    onChange: e => merge({
      ref: parseInt(e.target.value) || 1
    })
  })));
}
const CARD_COLORS = ["#a98ae0", "#5aa3e0", "#5ad9a8", "#e0a85a", "#e08a7a", "#e08ac8", "#5ac4d9", "#9aa3b0"];
function CardManager({
  cards,
  onAddCard,
  onDeleteCard
}) {
  const [name, setName] = useS("");
  const [recFechamento, setRecFechamento] = useS({
    type: "fixed_day",
    day: 20
  });
  const [recVencimento, setRecVencimento] = useS({
    type: "fixed_day",
    day: 5
  });
  const [cor, setCor] = useS(CARD_COLORS[0]);
  const submit = () => {
    const nome = name.trim();
    if (!nome) return;
    const diaFech = recFechamento.type === "fixed_day" ? recFechamento.day || 20 : 1;
    const diaVenc = recVencimento.type === "fixed_day" ? recVencimento.day || 5 : 1;
    onAddCard({
      id: uid(),
      nome,
      diaFechamento: diaFech,
      diaVencimento: diaVenc,
      recFechamento,
      recVencimento,
      cor
    });
    setName("");
    setRecFechamento({
      type: "fixed_day",
      day: 20
    });
    setRecVencimento({
      type: "fixed_day",
      day: 5
    });
  };
  return React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Cart\xF5es de cr\xE9dito")), cards.length > 0 && React.createElement("div", {
    className: "card-list"
  }, cards.map(c => {
    const rFech = c.recFechamento || {
      type: "fixed_day",
      day: c.diaFechamento || 20
    };
    const rVenc = c.recVencimento || {
      type: "fixed_day",
      day: c.diaVencimento || 5
    };
    const dFech = window.describeRecRule ? window.describeRecRule(rFech) : `Dia ${c.diaFechamento || 20}`;
    const dVenc = window.describeRecRule ? window.describeRecRule(rVenc) : `Dia ${c.diaVencimento || 5}`;
    return React.createElement("div", {
      className: "card-item",
      key: c.id
    }, React.createElement("span", {
      className: "card-color-dot",
      style: {
        background: c.cor
      }
    }), React.createElement(Ic.card, {
      size: 16,
      style: {
        color: c.cor,
        flexShrink: 0
      }
    }), React.createElement("span", {
      style: {
        flex: 1,
        fontWeight: 600,
        fontSize: 13.5
      }
    }, c.nome), React.createElement("span", {
      className: "exp-tag",
      style: {
        background: c.cor + "22",
        color: c.cor,
        borderColor: c.cor + "44"
      }
    }, "fecha ", dFech), React.createElement("span", {
      className: "exp-tag",
      style: {
        background: "rgba(255,255,255,0.05)",
        color: "var(--text-mid)",
        borderColor: "var(--glass-border)"
      }
    }, "vence ", dVenc), React.createElement("button", {
      className: "icon-btn danger",
      onClick: () => onDeleteCard(c.id)
    }, React.createElement(Ic.trash, {
      size: 14
    })));
  })), React.createElement("div", {
    className: "card-add-form"
  }, React.createElement("input", {
    className: "form-input",
    value: name,
    onChange: e => setName(e.target.value),
    onKeyDown: e => e.key === "Enter" && submit(),
    placeholder: "Nome do cart\xE3o (ex.: Nubank, Inter)"
  }), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, React.createElement(RecRuleEditor, {
    label: "Fechamento",
    value: recFechamento,
    onChange: setRecFechamento
  }), React.createElement(RecRuleEditor, {
    label: "Vencimento",
    value: recVencimento,
    onChange: setRecVencimento
  })), React.createElement("div", null, React.createElement("div", {
    className: "form-label",
    style: {
      marginBottom: 6
    }
  }, "Cor"), React.createElement("div", {
    className: "color-palette",
    style: {
      paddingTop: 4
    }
  }, CARD_COLORS.map(hex => React.createElement("div", {
    key: hex,
    className: "color-dot" + (cor === hex ? " on" : ""),
    style: {
      background: hex
    },
    onClick: () => setCor(hex)
  })))), React.createElement("button", {
    className: "btn btn-primary",
    onClick: submit
  }, React.createElement(Ic.plus, {
    size: 16
  }), "Adicionar cart\xE3o")));
}
function Stat({
  icon,
  label,
  value,
  meta,
  metaDir,
  accent
}) {
  const I = icon;
  return React.createElement("div", {
    className: "stat glass"
  }, React.createElement("div", {
    className: "stat-label"
  }, React.createElement(I, {
    size: 15
  }), label), React.createElement("div", {
    className: "stat-value" + (accent ? " accent" : "")
  }, value), meta && React.createElement("div", {
    className: "stat-meta" + (metaDir ? " " + metaDir : "")
  }, metaDir === "up" && React.createElement(Ic.trendUp, {
    size: 14
  }), metaDir === "down" && React.createElement(Ic.trendDown, {
    size: 14
  }), meta));
}
function BankImportModal({
  onImport,
  onClose
}) {
  const [tab, setTab] = useS("text");
  const [text, setText] = useS("");
  const [preview, setPreview] = useS(null);
  const [selected, setSelected] = useS(new Set());
  const [pdfLoading, setPdfLoading] = useS(false);
  const [pdfName, setPdfName] = useS("");
  const [importErr, setImportErr] = useS("");
  const runAnalysis = raw => {
    const results = window.parseImportFile("", raw);
    setPreview(results);
    setSelected(new Set(results.map((_, i) => i)));
  };
  const setResults = results => {
    setPreview(results);
    setSelected(new Set(results.map((_, i) => i)));
  };
  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setImportErr("");
    setPdfName(file.name);
    setPdfLoading(true);
    try {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      if (ext === "pdf") {
        const lib = window.pdfjsLib;
        if (!lib) throw new Error("PDF.js não carregado");
        const buf = await file.arrayBuffer();
        const pdf = await lib.getDocument({
          data: buf
        }).promise;
        let full = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const pg = await pdf.getPage(i);
          const ct = await pg.getTextContent();
          const rowsByY = new Map();
          for (const it of ct.items) {
            if (!it.str || !it.str.trim()) continue;
            const y = Math.round(it.transform[5] / 3) * 3;
            if (!rowsByY.has(y)) rowsByY.set(y, []);
            rowsByY.get(y).push(it);
          }
          const lines = [...rowsByY.entries()].sort((a, b) => b[0] - a[0]).map(([, items]) => {
            items.sort((a, b) => a.transform[4] - b.transform[4]);
            let ln = "",
              endX = null;
            for (const it of items) {
              const x = it.transform[4];
              if (endX !== null && x - endX > 1.0) ln += " ";
              ln += it.str;
              endX = x + (it.width || 0);
            }
            return ln;
          });
          full += lines.join("\n") + "\n";
        }
        setResults(parseStatement(full));
      } else {
        const txt = await file.text();
        setResults(window.parseImportFile(file.name, txt));
      }
    } catch (err) {
      setImportErr("Não foi possível ler o arquivo. Tente outro formato ou cole o texto manualmente.");
      setPdfName("");
    }
    setPdfLoading(false);
  };
  const toggleRow = i => {
    setSelected(s => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };
  const doImport = () => {
    onImport(preview.filter((_, i) => selected.has(i)));
    onClose();
  };
  return React.createElement("div", {
    className: "modal-overlay",
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose();
    }
  }, React.createElement("div", {
    className: "modal glass modal-wide"
  }, !preview ? React.createElement(React.Fragment, null, React.createElement("h3", null, "Importar extrato banc\xE1rio"), React.createElement("div", {
    className: "import-tabs"
  }, React.createElement("div", {
    className: "import-tab" + (tab === "text" ? " on" : ""),
    onClick: () => setTab("text")
  }, React.createElement(Ic.edit, {
    size: 15
  }), "Colar texto"), React.createElement("div", {
    className: "import-tab" + (tab === "pdf" ? " on" : ""),
    onClick: () => setTab("pdf")
  }, React.createElement(Ic.upload, {
    size: 15
  }), "Arquivo")), tab === "text" ? React.createElement(React.Fragment, null, React.createElement("p", {
    style: {
      color: "var(--text-mid)",
      fontSize: 13.5,
      marginBottom: 16
    }
  }, "Cole o texto do extrato (Bradesco, Ita\xFA, Santander, Nubank, Inter\u2026). O app detecta datas, valores e categoriza automaticamente."), React.createElement("textarea", {
    className: "import-textarea",
    value: text,
    onChange: e => setText(e.target.value),
    placeholder: "Formatos aceitos:\n02/06 PIX MERCADO LIVRE 150,00\n04/06/2025 DÉBITO UBER 22,90\n04 JUN RESTAURANTE XPTO 45,00\nAMAZON 89,99\n..."
  }), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("button", {
    className: "btn btn-ghost",
    onClick: onClose
  }, "Cancelar"), React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => runAnalysis(text),
    disabled: !text.trim()
  }, React.createElement(Ic.search, {
    size: 17
  }), "Analisar"))) : React.createElement(React.Fragment, null, React.createElement("p", {
    style: {
      color: "var(--text-mid)",
      fontSize: 13.5,
      marginBottom: 16
    }
  }, "Envie o extrato em ", React.createElement("strong", null, "OFX"), ", ", React.createElement("strong", null, "CSV"), " ou ", React.createElement("strong", null, "PDF"), ". O OFX \xE9 o mais preciso \u2014 escolha esse formato no app do banco se dispon\xEDvel."), React.createElement("label", {
    className: "pdf-upload-area"
  }, React.createElement("input", {
    type: "file",
    onChange: handleFileUpload,
    style: {
      display: "none"
    }
  }), pdfLoading ? React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12
    }
  }, React.createElement("div", {
    className: "pdf-spinner"
  }), React.createElement("span", {
    style: {
      color: "var(--text-mid)",
      fontSize: 13
    }
  }, "Lendo PDF...")) : pdfName ? React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8
    }
  }, React.createElement(Ic.receipt, {
    size: 30,
    style: {
      color: "var(--accent-mint)"
    }
  }), React.createElement("span", {
    style: {
      color: "var(--text-hi)",
      fontWeight: 600,
      fontSize: 14
    }
  }, pdfName), React.createElement("span", {
    style: {
      color: "var(--text-lo)",
      fontSize: 12
    }
  }, "Clique para trocar o arquivo")) : React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10
    }
  }, React.createElement(Ic.upload, {
    size: 34,
    style: {
      color: "var(--text-lo)"
    }
  }), React.createElement("span", {
    style: {
      color: "var(--text-mid)",
      fontSize: 14,
      fontWeight: 600
    }
  }, "Selecionar arquivo do extrato"), React.createElement("span", {
    style: {
      color: "var(--text-lo)",
      fontSize: 12
    }
  }, "OFX \xB7 CSV \xB7 PDF \xB7 TXT"))), importErr && React.createElement("div", {
    className: "import-err"
  }, React.createElement(Ic.close, {
    size: 14
  }), importErr), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("button", {
    className: "btn btn-ghost",
    onClick: onClose
  }, "Cancelar")))) : preview.length === 0 ? React.createElement(React.Fragment, null, React.createElement("h3", null, "Nenhuma transa\xE7\xE3o encontrada"), React.createElement("p", {
    style: {
      color: "var(--text-mid)",
      fontSize: 13.5,
      marginBottom: 16
    }
  }, "N\xE3o identifiquei transa\xE7\xF5es. Tente outro formato ou cole o texto manualmente."), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => {
      setPreview(null);
      setPdfName("");
    }
  }, "Tentar novamente"), React.createElement("button", {
    className: "btn btn-primary",
    onClick: onClose
  }, "Fechar"))) : React.createElement(React.Fragment, null, React.createElement("h3", null, preview.length, " transa\xE7\xF5es detectadas"), React.createElement("p", {
    style: {
      color: "var(--text-mid)",
      fontSize: 13,
      marginBottom: 14
    }
  }, "Selecione as que deseja importar (", selected.size, " selecionadas)."), React.createElement("div", {
    className: "import-preview"
  }, preview.map((e, i) => {
    const isEnt = e.kind === "entrada";
    const c = CAT_MAP[e.categoria] || CAT_MAP["outros"];
    const t = TIPO_MAP[e.tipo] || TIPO_MAP["outros"];
    const on = selected.has(i);
    return React.createElement("div", {
      key: i,
      className: "import-row" + (on ? " sel" : ""),
      onClick: () => toggleRow(i)
    }, React.createElement("div", {
      className: "import-check" + (on ? " on" : "")
    }, on ? "✓" : ""), React.createElement("div", {
      className: "import-date"
    }, fmtDate(e.data)), React.createElement("div", {
      className: "import-desc"
    }, e.descricao), React.createElement("div", {
      className: "import-tags"
    }, isEnt ? React.createElement("span", {
      className: "exp-tag",
      style: {
        background: "rgba(90,217,168,0.15)",
        color: "var(--accent-mint)",
        borderColor: "rgba(90,217,168,0.3)"
      }
    }, "Entrada") : React.createElement("span", {
      className: "exp-tag",
      style: {
        background: c.hex + "22",
        color: c.hex,
        borderColor: c.hex + "44"
      }
    }, c.nome), !isEnt && React.createElement("span", {
      className: "exp-tag",
      style: {
        background: t.hex + "22",
        color: t.hex,
        borderColor: t.hex + "44"
      }
    }, t.nome)), React.createElement("div", {
      className: "import-val",
      style: isEnt ? {
        color: "var(--accent-mint)"
      } : {}
    }, isEnt ? "+" : "", fmtBRL(e.valor)));
  })), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => {
      setPreview(null);
      setPdfName("");
    }
  }, "Voltar"), React.createElement("button", {
    className: "btn btn-primary",
    onClick: doImport,
    disabled: selected.size === 0
  }, React.createElement(Ic.download, {
    size: 17
  }), "Importar ", selected.size)))));
}
function HomeView({
  expenses,
  budget,
  onAdd,
  onEdit,
  onDelete,
  onDeleteGroup,
  cards,
  userName,
  faturaOverrides,
  onGoToFaturas,
  fixas,
  caloteiros,
  onGoToConfig
}) {
  const [showNotifs, setShowNotifs] = useS(false);
  const [monthOffset, setMonthOffset] = useS(0);
  const now = new Date();
  const selDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const isCurrentMonth = monthOffset === 0;
  const monthStr = `${selDate.getFullYear()}-${String(selDate.getMonth() + 1).padStart(2, "0")}`;
  const monthExp = expenses.filter(e => e.data && e.data.startsWith(monthStr));
  const monthGastos = monthExp.filter(e => e.kind !== "entrada").reduce((s, e) => s + e.valor, 0);
  const monthEntradas = monthExp.filter(e => e.kind === "entrada").reduce((s, e) => s + e.valor, 0);
  const saldo = (budget || 0) - monthGastos + monthEntradas;
  const pct = budget > 0 ? Math.min(monthGastos / budget * 100, 100) : 0;
  const budgetColor = budget <= 0 ? "var(--accent-mint)" : pct < 60 ? "var(--accent-mint)" : pct < 85 ? "#e0c85a" : "var(--cat-saude)";
  const h = now.getHours();
  const greeting = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const recent = [...monthExp].filter(e => e.kind !== "entrada").sort((a, b) => b.data.localeCompare(a.data));
  const monthName = selDate.toLocaleString("pt-BR", {
    month: "long"
  });
  const monthLabel = monthName.charAt(0).toUpperCase() + monthName.slice(1) + (selDate.getFullYear() !== now.getFullYear() ? ` ${selDate.getFullYear()}` : "");
  const todayDay = now.getDate();
  const pendingFaturas = useM(() => {
    if (!cards || cards.length === 0) return [];
    return computeFaturas(cards, expenses, faturaOverrides || {}).filter(f => f.status !== "paga" && f.total > 0);
  }, [cards, expenses, faturaOverrides]);
  const pendingCaloteiros = (caloteiros || []).filter(c => !c.pago);
  const totalCaloteiros = pendingCaloteiros.reduce((s, c) => s + c.valor, 0);
  const totalFixas = (fixas || []).reduce((s, f) => s + f.valor, 0);
  const notifications = useM(() => {
    const list = [];
    const fatVencendo = [];
    (cards || []).forEach(c => {
      const fatura = computeFaturas([c], expenses, faturaOverrides || {}).find(f => f.total > 0 && f.status !== "paga");
      if (!fatura) return;
      const [fy, fm] = fatura.mes.split("-").map(Number);
      const dueDate = new Date(fy, fm, c.diaVencimento);
      const diff = Math.ceil((dueDate - now) / 86400000);
      if (diff >= 0 && diff <= 7) fatVencendo.push({
        diff,
        total: fatura.total
      });
    });
    if (fatVencendo.length > 0) {
      const totalFat = fatVencendo.reduce((s, f) => s + f.total, 0);
      const minDiff = Math.min(...fatVencendo.map(f => f.diff));
      const urgente = minDiff <= 1;
      const detalhe = minDiff === 0 ? "vence hoje!" : `vence em ${minDiff} dia${minDiff === 1 ? "" : "s"}`;
      list.push({
        id: "fat-all",
        urgente,
        texto: `${fatVencendo.length} fatura${fatVencendo.length !== 1 ? "s" : ""} pendente${fatVencendo.length !== 1 ? "s" : ""} · ${fmtBRL(totalFat)}`,
        detalhe
      });
    }
    (caloteiros || []).filter(c => !c.pago && c.alertaDia).forEach(c => {
      const diff = c.alertaDia - todayDay;
      if (diff >= -1 && diff <= 3) {
        const detalhe = diff === 0 ? "cobrar hoje!" : diff === 1 ? "cobrar amanhã" : diff === -1 ? "era ontem" : `cobrar em ${diff} dias`;
        list.push({
          id: `cal-${c.id}`,
          urgente: diff <= 0,
          texto: `Cobrar ${c.nome}`,
          detalhe: `${detalhe} · ${fmtBRL(c.valor)}`
        });
      }
    });
    return list;
  }, [cards, expenses, faturaOverrides, caloteiros, monthStr, todayDay]);
  return React.createElement(React.Fragment, null, showNotifs && notifications.length > 0 && ReactDOM.createPortal(React.createElement(React.Fragment, null, React.createElement("div", {
    className: "notif-overlay",
    onClick: () => setShowNotifs(false)
  }), React.createElement("div", {
    className: "notif-panel glass"
  }, React.createElement("div", {
    className: "notif-panel-head"
  }, React.createElement("div", {
    className: "notif-panel-title-row"
  }, React.createElement("div", {
    className: "notif-panel-icon"
  }, React.createElement(Ic.bell, {
    size: 15
  })), React.createElement("span", null, "Alertas")), React.createElement("button", {
    className: "icon-btn",
    style: {
      width: 32,
      height: 32
    },
    onClick: () => setShowNotifs(false)
  }, React.createElement(Ic.close, {
    size: 14
  }))), React.createElement("div", {
    className: "notif-list"
  }, notifications.map(n => React.createElement("div", {
    key: n.id,
    className: "notif-item" + (n.urgente ? " urgente" : "")
  }, React.createElement("div", {
    className: "notif-item-dot" + (n.urgente ? " urgente" : "")
  }), React.createElement("div", {
    className: "notif-item-body"
  }, React.createElement("div", {
    className: "notif-item-text"
  }, n.texto), React.createElement("div", {
    className: "notif-item-sub"
  }, n.detalhe))))))), document.body), React.createElement("div", {
    className: "home-hero glass"
  }, React.createElement("div", {
    className: "home-hero-top"
  }, React.createElement("div", null, React.createElement("div", {
    className: "home-greeting"
  }, greeting, ", ", React.createElement("strong", null, userName || "Luiz Ricardo"), "!"), React.createElement("div", {
    className: "home-date"
  }, fmtDateLong(todayISO()))), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, notifications.length > 0 && React.createElement("button", {
    className: "notif-bell-btn",
    onClick: () => setShowNotifs(s => !s),
    title: "Alertas"
  }, React.createElement(Ic.bell, {
    size: 17
  }), React.createElement("span", {
    className: "notif-badge"
  }, notifications.length)), React.createElement("button", {
    className: "btn btn-primary btn-desktop-only",
    onClick: onAdd
  }, React.createElement(Ic.plus, {
    size: 18
  }), "Novo lan\xE7amento"))), React.createElement("div", {
    className: "home-month-nav"
  }, React.createElement("button", {
    className: "home-month-arrow",
    onClick: () => setMonthOffset(o => o - 1),
    title: "M\xEAs anterior"
  }, "\u2039"), React.createElement("button", {
    className: "home-month-label",
    onClick: () => setMonthOffset(0),
    title: isCurrentMonth ? "Mês atual" : "Voltar para o mês atual"
  }, monthLabel, !isCurrentMonth && React.createElement("span", {
    className: "home-month-hoje"
  }, "voltar a hoje")), React.createElement("button", {
    className: "home-month-arrow",
    disabled: isCurrentMonth,
    onClick: () => setMonthOffset(o => Math.min(0, o + 1)),
    title: "Pr\xF3ximo m\xEAs"
  }, "\u203A")), React.createElement("div", {
    className: "home-balance"
  }, React.createElement("div", {
    className: "home-balance-label"
  }, isCurrentMonth ? "Saldo disponível" : `Saldo de ${monthLabel}`), React.createElement("div", {
    className: "home-balance-value",
    style: {
      color: saldo >= 0 ? "var(--accent-mint)" : "#e08a7a"
    }
  }, saldo < 0 && "−", fmtBRL(Math.abs(saldo)))), React.createElement("div", {
    className: "home-stats-grid"
  }, React.createElement("div", {
    className: "home-stat-card"
  }, React.createElement("div", {
    className: "home-stat-card-label"
  }, "Gastos em ", monthName), React.createElement("div", {
    className: "home-stat-card-value",
    style: {
      color: "#e08a7a"
    }
  }, fmtBRL(monthGastos)), React.createElement("div", {
    className: "home-stat-card-meta"
  }, monthExp.filter(e => e.kind !== "entrada").length, " lan\xE7amentos")), React.createElement("div", {
    className: "home-stat-card"
  }, React.createElement("div", {
    className: "home-stat-card-label"
  }, "Entradas do m\xEAs"), React.createElement("div", {
    className: "home-stat-card-value",
    style: {
      color: "var(--accent-mint)"
    }
  }, fmtBRL(monthEntradas)), React.createElement("div", {
    className: "home-stat-card-meta"
  }, monthExp.filter(e => e.kind === "entrada").length, " entradas")), budget > 0 && React.createElement("div", {
    className: "home-stat-card home-stat-card-wide"
  }, React.createElement("div", {
    className: "home-stat-card-label"
  }, "Or\xE7amento"), React.createElement("div", {
    className: "home-stat-card-value",
    style: {
      color: budgetColor
    }
  }, Math.round(pct), "%"), React.createElement("div", {
    className: "home-stat-card-meta"
  }, fmtBRL(monthGastos), " / ", fmtBRL(budget)))), budget > 0 && React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, React.createElement("div", {
    className: "budget-bar-track"
  }, React.createElement("div", {
    className: "budget-bar-fill",
    style: {
      width: `${pct}%`,
      background: budgetColor
    }
  })))), recent.length > 0 && React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, isCurrentMonth ? "Últimas compras" : `Compras de ${monthLabel}`)), React.createElement(ExpenseTable, {
    rows: recent.slice(0, 5),
    onEdit: onEdit,
    onDelete: onDelete,
    onDeleteGroup: onDeleteGroup,
    cards: cards
  })));
}
function DashboardView({
  expenses,
  filtered,
  byCat,
  total,
  onEdit,
  onDelete,
  onDeleteGroup,
  onAdd,
  budget,
  cards
}) {
  const gastos = filtered.filter(e => e.kind !== "entrada");
  const entradas = filtered.filter(e => e.kind === "entrada");
  const count = gastos.length;
  const media = count ? total / count : 0;
  const topCat = byCat[0];
  const entradasTotal = entradas.reduce((s, e) => s + e.valor, 0);
  const saldo = entradasTotal - total;
  const savingsRate = entradasTotal > 0 ? Math.round(saldo / entradasTotal * 100) : null;
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "stats"
  }, React.createElement(Stat, {
    icon: Ic.coins,
    label: "Gastos no per\xEDodo",
    value: fmtBRL(total),
    accent: true,
    meta: `${count} lançamentos`
  }), React.createElement(Stat, {
    icon: Ic.trendUp,
    label: "Entradas no per\xEDodo",
    value: fmtBRL(entradasTotal),
    meta: `${entradas.length} entr${entradas.length === 1 ? "ada" : "adas"}`
  }), React.createElement(Stat, {
    icon: Ic.receipt,
    label: "Ticket m\xE9dio",
    value: fmtBRL(media),
    meta: "por gasto"
  }), React.createElement(Stat, {
    icon: Ic.target,
    label: "Saldo do per\xEDodo",
    value: fmtBRL(Math.abs(saldo)),
    meta: savingsRate !== null ? `${savingsRate >= 0 ? "+" : ""}${savingsRate}% da renda` : saldo >= 0 ? "positivo" : "negativo",
    metaDir: saldo >= 0 ? "down" : "up"
  })), React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Lan\xE7amentos recentes"), React.createElement("button", {
    className: "btn btn-primary btn-desktop-only",
    onClick: onAdd
  }, React.createElement(Ic.plus, {
    size: 17
  }), "Adicionar")), React.createElement(ExpenseTable, {
    rows: filtered.slice(0, 8),
    onEdit: onEdit,
    onDelete: onDelete,
    onDeleteGroup: onDeleteGroup,
    cards: cards
  })), React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Distribui\xE7\xE3o")), total > 0 ? React.createElement(React.Fragment, null, React.createElement(Donut, {
    data: byCat,
    total: total,
    budget: budget
  }), React.createElement(BudgetBar, {
    total: total,
    budget: budget
  })) : React.createElement("div", {
    className: "empty"
  }, React.createElement(Ic.chart, {
    size: 40
  }), "Sem dados no per\xEDodo"))));
}
function EmprestimosSection({
  emprestimos,
  onAdd,
  onDelete,
  onUpdate
}) {
  const [form, setForm] = useS({
    show: false,
    nome: "",
    valor: "",
    parcelas: "1",
    parcPaga: "0",
    tipo: "dado",
    obs: ""
  });
  const pending = (emprestimos || []).filter(e => e.parcPaga < e.parcelas);
  const done = (emprestimos || []).filter(e => e.parcPaga >= e.parcelas);
  const totalDado = pending.filter(e => e.tipo === "dado").reduce((s, e) => s + e.valor, 0);
  const totalRecebido = pending.filter(e => e.tipo === "recebido").reduce((s, e) => s + e.valor, 0);
  const submit = () => {
    const valor = parseFloat(form.valor.replace(",", "."));
    if (!form.nome.trim() || isNaN(valor) || valor <= 0) return;
    onAdd({
      nome: form.nome.trim(),
      valor,
      parcelas: parseInt(form.parcelas) || 1,
      parcPaga: 0,
      tipo: form.tipo,
      obs: form.obs,
      data: todayISO()
    });
    setForm({
      show: false,
      nome: "",
      valor: "",
      parcelas: "1",
      parcPaga: "0",
      tipo: "dado",
      obs: ""
    });
  };
  return React.createElement("div", {
    className: "panel glass",
    style: {
      marginTop: 16
    }
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, React.createElement(Ic.coins, {
    size: 17
  }), "Empr\xE9stimos"), React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      padding: "7px 12px",
      minHeight: 0,
      fontSize: 12
    },
    onClick: () => setForm(f => ({
      ...f,
      show: !f.show
    }))
  }, form.show ? "Cancelar" : React.createElement(React.Fragment, null, React.createElement(Ic.plus, {
    size: 14
  }), "Novo"))), (totalDado > 0 || totalRecebido > 0) && React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      marginBottom: 14,
      paddingBottom: 14,
      borderBottom: "1px solid var(--glass-border)",
      flexWrap: "wrap"
    }
  }, totalDado > 0 && React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-lo)",
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      marginBottom: 3
    }
  }, "Emprestado"), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 18,
      color: "#e08a7a"
    }
  }, fmtBRL(totalDado))), totalRecebido > 0 && React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-lo)",
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      marginBottom: 3
    }
  }, "Recebido"), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 18,
      color: "var(--accent-mint)"
    }
  }, fmtBRL(totalRecebido)))), form.show && React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 16,
      padding: 14,
      background: "rgba(255,255,255,0.04)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--glass-border)"
    }
  }, React.createElement("div", {
    className: "tipo-picker"
  }, [["dado", "Emprestei"], ["recebido", "Peguei emprestado"]].map(([v, l]) => React.createElement("button", {
    key: v,
    type: "button",
    className: "tipo-opt" + (form.tipo === v ? " on" : ""),
    style: {
      "--tipo-hex": v === "dado" ? "#e08a7a" : "var(--accent-mint)"
    },
    onClick: () => setForm(f => ({
      ...f,
      tipo: v
    }))
  }, l))), React.createElement("input", {
    className: "form-input",
    placeholder: "Nome da pessoa",
    value: form.nome,
    onChange: e => setForm(f => ({
      ...f,
      nome: e.target.value
    }))
  }), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement("input", {
    className: "form-input",
    placeholder: "Valor (R$)",
    type: "number",
    value: form.valor,
    onChange: e => setForm(f => ({
      ...f,
      valor: e.target.value
    })),
    style: {
      flex: 2
    }
  }), React.createElement("input", {
    className: "form-input",
    placeholder: "Parcelas",
    type: "number",
    min: "1",
    value: form.parcelas,
    onChange: e => setForm(f => ({
      ...f,
      parcelas: e.target.value
    })),
    style: {
      flex: 1
    }
  })), React.createElement("input", {
    className: "form-input",
    placeholder: "Observa\xE7\xE3o (opcional)",
    value: form.obs,
    onChange: e => setForm(f => ({
      ...f,
      obs: e.target.value
    }))
  }), React.createElement("button", {
    className: "btn btn-primary",
    onClick: submit
  }, "Adicionar empr\xE9stimo")), pending.length === 0 && done.length === 0 && React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--text-lo)",
      fontSize: 13,
      padding: "20px 0"
    }
  }, "Nenhum empr\xE9stimo registrado"), [...pending, ...done].map(e => {
    const pct = e.parcelas > 0 ? Math.min(e.parcPaga / e.parcelas, 1) : 0;
    const quitado = e.parcPaga >= e.parcelas;
    const color = e.tipo === "dado" ? "#e08a7a" : "var(--accent-mint)";
    return React.createElement("div", {
      key: e.id,
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid var(--glass-border)",
        opacity: quitado ? 0.55 : 1
      }
    }, React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        marginBottom: 3
      }
    }, e.nome, React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--text-lo)",
        fontWeight: 400,
        marginLeft: 6
      }
    }, e.tipo === "dado" ? "emprestei" : "peguei")), e.obs && React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-lo)",
        marginBottom: 5
      }
    }, e.obs), e.parcelas > 1 && React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-mid)",
        fontWeight: 600,
        marginBottom: 5
      }
    }, fmtBRL(Math.round(e.valor / e.parcelas * 100) / 100), React.createElement("span", {
      style: {
        fontWeight: 400,
        color: "var(--text-lo)"
      }
    }, "/parcela")), React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, React.createElement("div", {
      style: {
        flex: 1,
        height: 4,
        background: "rgba(255,255,255,0.08)",
        borderRadius: 999,
        overflow: "hidden"
      }
    }, React.createElement("div", {
      style: {
        height: "100%",
        width: `${pct * 100}%`,
        background: color,
        borderRadius: 999,
        transition: "width 0.4s"
      }
    })), React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--text-lo)",
        flexShrink: 0
      }
    }, e.parcPaga, "/", e.parcelas))), React.createElement("div", {
      style: {
        textAlign: "right",
        flexShrink: 0
      }
    }, React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 15,
        color,
        marginBottom: 6
      }
    }, fmtBRL(e.valor)), React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        justifyContent: "flex-end"
      }
    }, !quitado && React.createElement("button", {
      className: "icon-btn",
      title: "Marcar parcela paga",
      style: {
        width: 28,
        height: 28
      },
      onClick: () => onUpdate(e.id, {
        parcPaga: e.parcPaga + 1
      })
    }, React.createElement(Ic.check, {
      size: 13
    })), React.createElement("button", {
      className: "icon-btn danger",
      style: {
        width: 28,
        height: 28
      },
      onClick: () => onDelete(e.id)
    }, React.createElement(Ic.trash, {
      size: 13
    })))));
  }));
}
function FixasSection({
  fixas,
  onAdd,
  onDelete,
  allCats
}) {
  const BLANK = {
    show: false,
    nome: "",
    valor: "",
    catId: "contas",
    rec: {
      type: "fixed_day",
      day: 1
    }
  };
  const [form, setForm] = useS(BLANK);
  const total = (fixas || []).reduce((s, f) => s + f.valor, 0);
  const submit = () => {
    const valor = parseFloat(form.valor.replace(",", "."));
    if (!form.nome.trim() || isNaN(valor) || valor <= 0) return;
    const rec = form.rec;
    const dia = rec.type === "fixed_day" ? rec.day || 1 : 1;
    onAdd({
      nome: form.nome.trim(),
      valor,
      dia,
      catId: form.catId,
      rec
    });
    setForm(BLANK);
  };
  return React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, React.createElement(Ic.receipt, {
    size: 17
  }), "Contas fixas"), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, total > 0 && React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 14,
      color: "var(--text-mid)"
    }
  }, fmtBRL(total), "/m\xEAs"), React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      padding: "7px 12px",
      minHeight: 0,
      fontSize: 12
    },
    onClick: () => setForm(p => ({
      ...p,
      show: !p.show
    }))
  }, form.show ? "Cancelar" : React.createElement(React.Fragment, null, React.createElement(Ic.plus, {
    size: 14
  }), "Adicionar")))), form.show && React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 16,
      padding: 14,
      background: "rgba(255,255,255,0.04)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--glass-border)"
    }
  }, React.createElement("input", {
    className: "form-input",
    placeholder: "Nome (ex: Netflix, Aluguel)",
    value: form.nome,
    onChange: e => setForm(p => ({
      ...p,
      nome: e.target.value
    }))
  }), React.createElement("input", {
    className: "form-input",
    placeholder: "Valor (R$)",
    type: "number",
    value: form.valor,
    onChange: e => setForm(p => ({
      ...p,
      valor: e.target.value
    }))
  }), React.createElement(RecRuleEditor, {
    label: "Recorr\xEAncia",
    value: form.rec,
    onChange: rec => setForm(p => ({
      ...p,
      rec
    }))
  }), React.createElement("select", {
    className: "select",
    value: form.catId,
    onChange: e => setForm(p => ({
      ...p,
      catId: e.target.value
    }))
  }, (allCats || CATEGORIES).map(c => React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.nome))), React.createElement("button", {
    className: "btn btn-primary",
    onClick: submit
  }, "Adicionar conta fixa")), (fixas || []).length === 0 && !form.show && React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--text-lo)",
      fontSize: 13,
      padding: "16px 0"
    }
  }, "Nenhuma conta fixa cadastrada"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, (fixas || []).map(f => {
    const cat = CAT_MAP[f.catId] || CAT_MAP["outros"];
    const recDesc = typeof window.describeRec === "function" ? window.describeRec(f) : `Todo dia ${f.dia}`;
    return React.createElement("div", {
      key: f.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 4px",
        borderBottom: "1px solid var(--glass-border)"
      }
    }, React.createElement("span", {
      className: "exp-tag",
      style: {
        background: cat.hex + "22",
        color: cat.hex,
        borderColor: cat.hex + "44",
        flexShrink: 0
      }
    }, cat.nome), React.createElement("div", {
      style: {
        flex: 1,
        fontWeight: 600,
        fontSize: 14
      }
    }, f.nome), React.createElement("div", {
      style: {
        flexShrink: 0,
        textAlign: "right"
      }
    }, React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 14
      }
    }, fmtBRL(f.valor)), React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--text-lo)"
      }
    }, recDesc)), React.createElement("button", {
      className: "icon-btn danger",
      style: {
        width: 28,
        height: 28,
        flexShrink: 0
      },
      onClick: () => onDelete(f.id)
    }, React.createElement(Ic.trash, {
      size: 13
    })));
  })));
}
function CaloteirosSection({
  caloteiros,
  onAdd,
  onDelete,
  onToggle
}) {
  const [form, setForm] = useS({
    show: false,
    nome: "",
    valor: "",
    descricao: "",
    parcelas: "1",
    alertaDia: ""
  });
  const pending = (caloteiros || []).filter(c => !c.pago);
  const paid = (caloteiros || []).filter(c => c.pago);
  const totalPending = pending.reduce((s, c) => s + c.valor, 0);
  const today = new Date().getDate();
  const formValor = parseFloat(form.valor.replace(",", "."));
  const formParc = parseInt(form.parcelas) || 1;
  const formValorParc = formParc > 1 && !isNaN(formValor) && formValor > 0 ? Math.round(formValor / formParc * 100) / 100 : null;
  const submit = () => {
    if (!form.nome.trim() || isNaN(formValor) || formValor <= 0) return;
    onAdd({
      nome: form.nome.trim(),
      valor: formValor,
      descricao: form.descricao,
      parcelas: formParc,
      alertaDia: form.alertaDia ? parseInt(form.alertaDia) : null,
      data: todayISO()
    });
    setForm({
      show: false,
      nome: "",
      valor: "",
      descricao: "",
      parcelas: "1",
      alertaDia: ""
    });
  };
  return React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, React.createElement(Ic.coins, {
    size: 17
  }), "A receber"), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, totalPending > 0 && React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 14,
      color: "#e0c85a"
    }
  }, fmtBRL(totalPending)), React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      padding: "7px 12px",
      minHeight: 0,
      fontSize: 12
    },
    onClick: () => setForm(f => ({
      ...f,
      show: !f.show
    }))
  }, form.show ? "Cancelar" : React.createElement(React.Fragment, null, React.createElement(Ic.plus, {
    size: 14
  }), "Adicionar")))), form.show && React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 16,
      padding: 14,
      background: "rgba(255,255,255,0.04)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--glass-border)"
    }
  }, React.createElement("input", {
    className: "form-input",
    placeholder: "Nome do devedor",
    value: form.nome,
    onChange: e => setForm(f => ({
      ...f,
      nome: e.target.value
    }))
  }), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement("input", {
    className: "form-input",
    placeholder: "Valor total (R$)",
    type: "number",
    value: form.valor,
    onChange: e => setForm(f => ({
      ...f,
      valor: e.target.value
    })),
    style: {
      flex: 2
    }
  }), React.createElement("input", {
    className: "form-input",
    placeholder: "Parcelas",
    type: "number",
    min: "1",
    value: form.parcelas,
    onChange: e => setForm(f => ({
      ...f,
      parcelas: e.target.value
    })),
    style: {
      flex: 1
    },
    title: "N\xBA de parcelas (1 = \xE0 vista)"
  })), formValorParc && React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--accent-mint)",
      fontWeight: 600,
      padding: "2px 0"
    }
  }, "Parcela: ", fmtBRL(formValorParc), " \xD7 ", formParc), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement("input", {
    className: "form-input",
    placeholder: "Motivo (opcional)",
    value: form.descricao,
    onChange: e => setForm(f => ({
      ...f,
      descricao: e.target.value
    })),
    style: {
      flex: 2
    }
  }), React.createElement("input", {
    className: "form-input",
    placeholder: "Dia alerta",
    type: "number",
    min: "1",
    max: "31",
    value: form.alertaDia,
    onChange: e => setForm(f => ({
      ...f,
      alertaDia: e.target.value
    })),
    style: {
      flex: 1
    },
    title: "Dia do m\xEAs para lembrar de cobrar"
  })), form.alertaDia && React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-lo)"
    }
  }, "\uD83D\uDD14 Alerta todo dia ", form.alertaDia, " do m\xEAs"), React.createElement("button", {
    className: "btn btn-primary",
    onClick: submit
  }, "Adicionar devedor")), (caloteiros || []).length === 0 && !form.show && React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--text-lo)",
      fontSize: 13,
      padding: "16px 0"
    }
  }, "Nenhum devedor registrado \uD83C\uDF89"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, [...pending, ...paid].map(c => {
    const parcelas = c.parcelas || 1;
    const parcPaga = c.parcPaga || 0;
    const parcelado = parcelas > 1;
    const pct = parcelado ? parcPaga / parcelas : c.pago ? 1 : 0;
    const valorParc = parcelado ? Math.round(c.valor / parcelas * 100) / 100 : null;
    const diff = c.alertaDia ? c.alertaDia - today : null;
    const alertaLabel = !c.pago && diff !== null ? diff === 0 ? "hoje" : diff === 1 ? "amanhã" : diff === -1 ? "ontem" : diff > 1 && diff <= 3 ? `em ${diff} dias` : null : null;
    return React.createElement("div", {
      key: c.id,
      style: {
        padding: "11px 4px",
        borderBottom: "1px solid var(--glass-border)",
        opacity: c.pago ? 0.5 : 1
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, React.createElement("button", {
      className: "icon-btn" + (c.pago ? " active" : ""),
      style: {
        width: 28,
        height: 28,
        flexShrink: 0,
        borderColor: c.pago ? "var(--accent-mint)" : "var(--glass-border)",
        color: c.pago ? "var(--accent-mint)" : "var(--text-lo)"
      },
      title: c.pago ? "Reabrir" : parcelado ? `Marcar parcela ${parcPaga + 1}/${parcelas}` : "Marcar como recebido",
      onClick: () => onToggle(c.id)
    }, React.createElement(Ic.check, {
      size: 13
    })), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        textDecoration: c.pago ? "line-through" : "none",
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap"
      }
    }, c.nome, alertaLabel && React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 99,
        background: alertaLabel === "hoje" ? "#e0c85a22" : "rgba(255,255,255,0.06)",
        color: alertaLabel === "hoje" ? "#e0c85a" : "var(--text-mid)",
        border: `1px solid ${alertaLabel === "hoje" ? "#e0c85a44" : "var(--glass-border)"}`
      }
    }, "\uD83D\uDD14 ", alertaLabel)), c.descricao && React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-lo)",
        marginTop: 1
      }
    }, c.descricao), parcelado && React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-mid)",
        fontWeight: 600,
        marginTop: 2
      }
    }, fmtBRL(valorParc), React.createElement("span", {
      style: {
        fontWeight: 400,
        color: "var(--text-lo)"
      }
    }, "/parcela \xB7 ", parcPaga, "/", parcelas, " pagas")), c.alertaDia && !alertaLabel && !c.pago && React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--text-lo)",
        marginTop: 2,
        display: "flex",
        alignItems: "center",
        gap: 3
      }
    }, React.createElement(Ic.bell, {
      size: 10
    }), " cobrar todo dia ", c.alertaDia)), React.createElement("div", {
      style: {
        textAlign: "right",
        flexShrink: 0
      }
    }, React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 14,
        color: c.pago ? "var(--text-lo)" : "#e0c85a"
      }
    }, fmtBRL(c.valor)), parcelado && !c.pago && React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--text-lo)",
        marginTop: 1
      }
    }, parcelas - parcPaga, " restantes")), React.createElement("button", {
      className: "icon-btn danger",
      style: {
        width: 28,
        height: 28,
        flexShrink: 0
      },
      onClick: () => onDelete(c.id)
    }, React.createElement(Ic.trash, {
      size: 13
    }))), parcelado && React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
        paddingLeft: 38
      }
    }, React.createElement("div", {
      style: {
        flex: 1,
        height: 3,
        background: "rgba(255,255,255,0.08)",
        borderRadius: 999,
        overflow: "hidden"
      }
    }, React.createElement("div", {
      style: {
        height: "100%",
        width: `${pct * 100}%`,
        background: "#e0c85a",
        borderRadius: 999,
        transition: "width 0.4s"
      }
    }))));
  })));
}
function GastosView({
  filtered,
  total,
  byCat,
  onEdit,
  onDelete,
  onDeleteGroup,
  onAdd,
  onImport,
  period,
  setPeriod,
  cat,
  setCat,
  search,
  setSearch,
  allCats,
  cards,
  tipoFilter,
  setTipoFilter,
  cardIdFilter,
  setCardIdFilter,
  onOpenFilterSheet,
  expenses,
  faturaOverrides,
  onMarkPaid,
  onUnmarkPaid,
  emprestimos,
  onAddEmprestimo,
  onDeleteEmprestimo,
  onUpdateEmprestimo,
  fixas,
  onAddFixa,
  onDeleteFixa,
  caloteiros,
  onAddCaloteiro,
  onToggleCaloteiro,
  onDeleteCaloteiro,
  onAddCard,
  onDeleteCard,
  initialTab
}) {
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
  return React.createElement(React.Fragment, null, showImport && ReactDOM.createPortal(React.createElement(BankImportModal, {
    onImport: onImport,
    onClose: () => setShowImport(false)
  }), document.body), React.createElement("div", {
    className: "gastos-tabs"
  }, React.createElement("button", {
    className: "gastos-tab" + (tab === "lancamentos" ? " on" : ""),
    onClick: () => setTab("lancamentos")
  }, React.createElement(Ic.wallet, {
    size: 14
  }), "Gastos"), React.createElement("button", {
    className: "gastos-tab" + (tab === "cartoes" ? " on" : ""),
    onClick: () => setTab("cartoes")
  }, React.createElement(Ic.card, {
    size: 14
  }), "Cart\xF5es"), React.createElement("button", {
    className: "gastos-tab" + (tab === "faturas" ? " on" : ""),
    onClick: () => setTab("faturas")
  }, React.createElement(Ic.invoice, {
    size: 14
  }), "Faturas"), React.createElement("button", {
    className: "gastos-tab" + (tab === "fixas" ? " on" : ""),
    onClick: () => setTab("fixas")
  }, React.createElement(Ic.receipt, {
    size: 14
  }), "Fixas"), React.createElement("button", {
    className: "gastos-tab" + (tab === "emprestimos" ? " on" : ""),
    onClick: () => setTab("emprestimos")
  }, React.createElement(Ic.coins, {
    size: 14
  }), "Empr\xE9st.")), tab === "lancamentos" && React.createElement("div", {
    className: "panel glass",
    style: {
      marginBottom: 16
    }
  }, React.createElement("div", {
    className: "panel-head",
    style: {
      gap: 10,
      flexDirection: "column",
      alignItems: "stretch"
    }
  }, React.createElement(FilterBar, {
    period: period,
    setPeriod: setPeriod,
    cat: cat,
    setCat: setCat,
    search: search,
    setSearch: setSearch,
    tipoFilter: tipoFilter,
    setTipoFilter: setTipoFilter,
    cardIdFilter: cardIdFilter,
    setCardIdFilter: setCardIdFilter,
    allCats: allCats,
    cards: cards,
    onOpenSheet: onOpenFilterSheet
  }), React.createElement("div", {
    className: "gastos-actions"
  }, React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setShowImport(true)
  }, React.createElement(Ic.download, {
    size: 17
  }), "Extrato"), React.createElement("button", {
    className: "btn btn-ghost",
    title: "Exportar CSV",
    onClick: () => exportToCSV(displayRows)
  }, React.createElement(Ic.upload, {
    size: 17
  }), "CSV"), React.createElement("button", {
    className: "btn btn-primary",
    onClick: onAdd
  }, React.createElement(Ic.plus, {
    size: 17
  }), "Adicionar"))), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 14,
      flexWrap: "wrap"
    }
  }, [["all", "Todos"], ["gastos", "Gastos"], ["entradas", "Entradas"]].map(([k, l]) => React.createElement("button", {
    key: k,
    type: "button",
    className: "tipo-opt" + (kindFilter === k ? " on" : ""),
    style: {
      "--tipo-hex": k === "entradas" ? "var(--accent-mint)" : k === "gastos" ? "#e08a7a" : "var(--text-mid)"
    },
    onClick: () => setKindFilter(k)
  }, l))), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      marginBottom: 16,
      padding: "0 2px",
      flexWrap: "wrap"
    }
  }, React.createElement("span", {
    style: {
      color: "var(--text-mid)",
      fontSize: 13.5,
      fontWeight: 600
    }
  }, "Gastos"), React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 22,
      fontWeight: 700,
      color: "#e08a7a",
      fontVariantNumeric: "tabular-nums"
    }
  }, "\u2212", fmtBRL(gastosTotal)), entradasTotal > 0 && React.createElement(React.Fragment, null, React.createElement("span", {
    style: {
      color: "var(--text-lo)",
      fontSize: 13
    }
  }, "\xB7"), React.createElement("span", {
    style: {
      color: "var(--text-mid)",
      fontSize: 13.5,
      fontWeight: 600
    }
  }, "Entradas"), React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 22,
      fontWeight: 700,
      color: "var(--accent-mint)",
      fontVariantNumeric: "tabular-nums"
    }
  }, "+", fmtBRL(entradasTotal))), React.createElement("span", {
    style: {
      color: "var(--text-lo)",
      fontSize: 13
    }
  }, "\xB7 ", displayRows.length, " lan\xE7amentos")), displayRows.length === 0 ? React.createElement(EmptyState, {
    title: kindFilter === "entradas" ? "Nenhuma entrada" : kindFilter === "gastos" ? "Nenhum gasto" : "Histórico vazio",
    text: search || cat !== "all" ? "Tente ajustar os filtros." : "Toque no + para registrar sua primeira transação."
  }) : React.createElement(GroupedExpenseList, {
    rows: displayRows,
    onEdit: onEdit,
    onDelete: onDelete,
    onDeleteGroup: onDeleteGroup,
    cards: cards
  })), tab === "cartoes" && React.createElement(CardManager, {
    cards: cards || [],
    onAddCard: onAddCard,
    onDeleteCard: onDeleteCard
  }), tab === "faturas" && React.createElement(FaturasView, {
    cards: cards,
    expenses: expenses,
    faturaOverrides: faturaOverrides,
    onMarkPaid: onMarkPaid,
    onUnmarkPaid: onUnmarkPaid,
    onEdit: onEdit,
    onDelete: onDelete,
    onDeleteGroup: onDeleteGroup
  }), tab === "fixas" && React.createElement(React.Fragment, null, React.createElement(FixasSection, {
    fixas: fixas,
    onAdd: onAddFixa,
    onDelete: onDeleteFixa,
    allCats: allCats
  }), React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, React.createElement(CaloteirosSection, {
    caloteiros: caloteiros,
    onAdd: onAddCaloteiro,
    onDelete: onDeleteCaloteiro,
    onToggle: onToggleCaloteiro
  }))), tab === "emprestimos" && React.createElement(EmprestimosSection, {
    emprestimos: emprestimos,
    onAdd: onAddEmprestimo,
    onDelete: onDeleteEmprestimo,
    onUpdate: onUpdateEmprestimo
  }));
}
function RelatoriosView({
  expenses,
  byCat,
  total
}) {
  const maxCat = byCat[0]?.valor || 1;
  const monthlyData = useM(() => {
    const now = new Date();
    return Array.from({
      length: 4
    }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const gastos = expenses.filter(e => e.data.startsWith(mStr) && e.kind !== "entrada").reduce((s, e) => s + e.valor, 0);
      const entradas = expenses.filter(e => e.data.startsWith(mStr) && e.kind === "entrada").reduce((s, e) => s + e.valor, 0);
      return {
        label: d.toLocaleString("pt-BR", {
          month: "short"
        }),
        gastos,
        entradas,
        mStr
      };
    });
  }, [expenses]);
  const topExpenses = useM(() => [...expenses].filter(e => e.kind !== "entrada").sort((a, b) => b.valor - a.valor).slice(0, 5), [expenses]);
  const maxMonth = Math.max(...monthlyData.map(m => m.gastos), 1);
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Por categoria")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, byCat.filter(c => c.valor > 0).map(c => React.createElement("div", {
    key: c.id
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 7,
      fontSize: 13.5
    }
  }, React.createElement("span", {
    style: {
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, React.createElement("span", {
    className: "dot",
    style: {
      background: c.hex
    }
  }), c.nome), React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600
    }
  }, fmtBRL(c.valor))), React.createElement("div", {
    style: {
      height: 9,
      borderRadius: 20,
      background: "rgba(255,255,255,0.07)",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      height: "100%",
      borderRadius: 20,
      width: `${c.valor / maxCat * 100}%`,
      background: c.hex,
      transition: "width 0.7s ease",
      boxShadow: `0 0 10px ${c.hex}66`
    }
  })))), byCat.length === 0 && React.createElement("div", {
    className: "empty",
    style: {
      padding: "24px 0"
    }
  }, "Sem dados no per\xEDodo"))), React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Composi\xE7\xE3o")), total > 0 ? React.createElement(Donut, {
    data: byCat,
    total: total
  }) : React.createElement("div", {
    className: "empty"
  }, "Sem dados"))), React.createElement("div", {
    className: "grid-2",
    style: {
      marginTop: 16
    }
  }, React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Comparativo mensal")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, monthlyData.map(m => React.createElement("div", {
    key: m.mStr
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6,
      fontSize: 13
    }
  }, React.createElement("span", {
    style: {
      fontWeight: 600,
      textTransform: "capitalize",
      color: "var(--text-mid)"
    }
  }, m.label), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, m.entradas > 0 && React.createElement("span", {
    style: {
      color: "var(--accent-mint)",
      fontWeight: 600,
      fontSize: 12
    }
  }, "+", fmtBRLshort(m.entradas)), React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      color: m.gastos > 0 ? "#e08a7a" : "var(--text-lo)"
    }
  }, m.gastos > 0 ? `−${fmtBRLshort(m.gastos)}` : "—"))), React.createElement("div", {
    style: {
      height: 8,
      borderRadius: 20,
      background: "rgba(255,255,255,0.07)",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      height: "100%",
      borderRadius: 20,
      width: `${m.gastos / maxMonth * 100}%`,
      background: "linear-gradient(90deg, #e08a7a, #e05a5a)",
      transition: "width 0.7s ease"
    }
  })))))), React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Maiores gastos")), topExpenses.length === 0 ? React.createElement("div", {
    className: "empty",
    style: {
      padding: "24px 0"
    }
  }, "Sem dados") : React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 0
    }
  }, topExpenses.map((e, i) => {
    const c = CAT_MAP[e.categoria] || CAT_MAP["outros"];
    return React.createElement("div", {
      key: e.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: i < topExpenses.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none"
      }
    }, React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: "var(--text-lo)",
        minWidth: 18,
        textAlign: "center"
      }
    }, "#", i + 1), React.createElement("span", {
      className: "dot",
      style: {
        background: c.hex,
        flexShrink: 0
      }
    }), React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 13,
        color: "var(--text-mid)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, e.descricao), React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 13.5,
        color: "#e08a7a",
        flexShrink: 0
      }
    }, fmtBRL(e.valor)));
  })))), React.createElement("div", {
    className: "grid-2",
    style: {
      gridTemplateColumns: "1fr",
      marginTop: 16
    }
  }, React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Evolu\xE7\xE3o \u2014 \xFAltimos 7 dias")), React.createElement(WeekBars, {
    expenses: expenses
  }))), React.createElement("div", {
    className: "panel glass",
    style: {
      marginTop: 16
    }
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Resumo mensal \u2014 \xFAltimos 4 meses")), React.createElement("div", {
    style: {
      display: "grid",
      gap: 12
    }
  }, monthlyData.map(m => {
    const net = m.entradas - m.gastos;
    const rate = m.entradas > 0 ? Math.round(net / m.entradas * 100) : null;
    const rateColor = rate === null ? "var(--text-lo)" : rate >= 20 ? "var(--accent-mint)" : rate >= 0 ? "#e0c85a" : "var(--cat-saude)";
    return React.createElement("div", {
      key: m.mStr,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }
    }, React.createElement("div", {
      style: {
        minWidth: 38,
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-lo)",
        textTransform: "capitalize"
      }
    }, m.label), React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        gap: 16,
        flexWrap: "wrap"
      }
    }, m.entradas > 0 && React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--accent-mint)",
        fontWeight: 600
      }
    }, "+", fmtBRL(m.entradas)), m.gastos > 0 && React.createElement("span", {
      style: {
        fontSize: 13,
        color: "#e08a7a",
        fontWeight: 600
      }
    }, "\u2212", fmtBRL(m.gastos)), m.gastos === 0 && m.entradas === 0 && React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--text-lo)"
      }
    }, "Sem dados")), rate !== null && React.createElement("div", {
      style: {
        textAlign: "right",
        flexShrink: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 800,
        color: rateColor
      }
    }, rate >= 0 ? "+" : "", rate, "%"), React.createElement("div", {
      style: {
        fontSize: 10.5,
        color: "var(--text-lo)"
      }
    }, "poupan\xE7a")), rate === null && m.gastos > 0 && React.createElement("div", {
      style: {
        textAlign: "right",
        flexShrink: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: "#e08a7a"
      }
    }, "\u2212", fmtBRL(m.gastos)), React.createElement("div", {
      style: {
        fontSize: 10.5,
        color: "var(--text-lo)"
      }
    }, "s\xF3 gastos")));
  }))));
}
const {
  useEffect: useEffTS,
  useRef: useRefTS
} = React;
const TS_CATS = [{
  id: "padrao",
  label: "Padrão",
  ids: ["default", "dark", "rose", "orange"]
}, {
  id: "neon",
  label: "Neon",
  ids: ["blue", "purple"]
}, {
  id: "albuns",
  label: "Álbuns",
  ids: ["petal", "chrome", "sweet", "fancy"]
}, {
  id: "kpop",
  label: "K-pop",
  ids: ["acid"]
}];
const LIGHT_THEMES = new Set(["petal", "sweet", "fancy"]);
function ThemePreview({
  theme,
  active
}) {
  const isLight = LIGHT_THEMES.has(theme.id);
  const [a, b] = theme.colors;
  return React.createElement("div", {
    className: "ts-prev" + (isLight ? " ts-prev-light" : "")
  }, React.createElement("div", {
    className: "ts-prev-balance",
    style: {
      color: a
    }
  }, "R$ 2.840"), React.createElement("div", {
    className: "ts-prev-bars"
  }, [["68%", 0.9], ["42%", 0.65], ["85%", 0.5]].map(([w, op], i) => React.createElement("div", {
    key: i,
    className: "ts-prev-bar-row"
  }, React.createElement("div", {
    className: "ts-prev-bar-bg"
  }, React.createElement("div", {
    className: "ts-prev-bar-fill",
    style: {
      width: w,
      background: `linear-gradient(90deg, ${a}, ${b})`,
      opacity: op
    }
  })), React.createElement("div", {
    className: "ts-prev-bar-val",
    style: {
      color: a
    }
  }, ["R$ 420", "R$ 190", "R$ 890"][i])))), React.createElement("div", {
    className: "ts-prev-card",
    style: {
      background: `linear-gradient(135deg, ${a}22, ${b}33)`,
      borderColor: `${a}44`
    }
  }, React.createElement("div", {
    className: "ts-prev-card-dot",
    style: {
      background: `linear-gradient(135deg, ${a}, ${b})`
    }
  }), React.createElement("div", {
    className: "ts-prev-card-lines"
  }, React.createElement("div", {
    className: "ts-prev-card-line"
  }), React.createElement("div", {
    className: "ts-prev-card-line",
    style: {
      width: "55%"
    }
  })), active && React.createElement("div", {
    className: "ts-pill"
  }, "Ativo")), React.createElement("div", {
    className: "ts-prev-overlay",
    style: {
      background: `linear-gradient(180deg, transparent 40%, ${isLight ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.18)"} 100%)`
    }
  }));
}
function ThemeSheet({
  open,
  onClose,
  currentTheme,
  onSelect
}) {
  const [tab, setTab] = useS("padrao");
  const sheetRef = useRefTS(null);
  const dragStartY = useRefTS(null);
  const dragCurrentY = useRefTS(null);
  useEffTS(() => {
    if (open) {
      const cat = TS_CATS.find(c => c.ids.includes(currentTheme)) || TS_CATS[0];
      setTab(cat.id);
    }
  }, [open]);
  const onTouchStart = e => {
    dragStartY.current = e.touches[0].clientY;
    dragCurrentY.current = 0;
  };
  const onTouchMove = e => {
    const dy = e.touches[0].clientY - dragStartY.current;
    dragCurrentY.current = dy;
    if (dy > 0 && sheetRef.current) sheetRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onTouchEnd = () => {
    if (sheetRef.current) sheetRef.current.style.transform = "";
    if (dragCurrentY.current > 90) onClose();
  };
  useEffTS(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const currentCat = TS_CATS.find(c => c.id === tab) || TS_CATS[0];
  const themes = (window.THEMES || []).filter(t => currentCat.ids.includes(t.id));
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "ts-overlay" + (open ? " ts-open" : ""),
    onClick: onClose
  }), React.createElement("div", {
    ref: sheetRef,
    className: "ts-sheet glass" + (open ? " ts-open" : ""),
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Selecionar tema visual"
  }, React.createElement("div", {
    className: "ts-handle-wrap",
    onTouchStart: onTouchStart,
    onTouchMove: onTouchMove,
    onTouchEnd: onTouchEnd
  }, React.createElement("div", {
    className: "ts-handle"
  })), React.createElement("div", {
    className: "ts-head"
  }, React.createElement("span", {
    className: "ts-head-title"
  }, "Tema Visual"), React.createElement("button", {
    className: "ts-close-btn",
    onClick: onClose,
    "aria-label": "Fechar"
  }, React.createElement(Ic.close, {
    size: 18
  }))), React.createElement("div", {
    className: "ts-tabs",
    role: "tablist"
  }, TS_CATS.map(c => React.createElement("button", {
    key: c.id,
    role: "tab",
    "aria-selected": tab === c.id,
    className: "ts-tab" + (tab === c.id ? " on" : "") + (c.ids.length === 0 ? " ts-tab-empty" : ""),
    onClick: () => c.ids.length > 0 && setTab(c.id)
  }, c.label, c.ids.length === 0 && React.createElement("span", {
    className: "ts-tab-badge"
  }, "Em breve")))), React.createElement("div", {
    className: "ts-body"
  }, themes.length === 0 ? React.createElement("div", {
    className: "ts-empty"
  }, "Novos temas em breve \u2728") : React.createElement("div", {
    className: "ts-grid"
  }, themes.map(t => {
    const isActive = currentTheme === t.id;
    return React.createElement("button", {
      key: t.id,
      type: "button",
      className: "ts-card" + (isActive ? " ts-active" : ""),
      onClick: () => {
        onSelect(t.id);
        onClose();
      },
      "aria-pressed": isActive
    }, isActive && React.createElement("div", {
      className: "ts-badge"
    }, React.createElement(Ic.check, {
      size: 11
    }), "Ativo"), React.createElement(ThemePreview, {
      theme: t,
      active: isActive
    }), React.createElement("div", {
      className: "ts-card-name"
    }, t.nome), React.createElement("div", {
      className: "ts-mini-swatch",
      style: {
        background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`
      }
    }));
  })))));
}
function ConfigView({
  settings,
  setSettings,
  onReset,
  allCats,
  onAddCat,
  onDeleteCat,
  cards,
  onAddCard,
  onDeleteCard,
  currentTheme,
  onThemeChange,
  onResetProfile,
  expenses,
  customCats,
  onRestoreBackup,
  askConfirm,
  showToast,
  fixas,
  onAddFixa,
  onDeleteFixa,
  caloteiros,
  onAddCaloteiro,
  onToggleCaloteiro,
  onDeleteCaloteiro,
  emprestimos
}) {
  const toggle = k => setSettings(s => ({
    ...s,
    [k]: !s[k]
  }));
  const baseCatIds = new Set(["comida", "transporte", "moradia", "lazer", "saude", "compras", "contas", "outros"]);
  const [newCatName, setNewCatName] = useS("");
  const [newCatColor, setNewCatColor] = useS(CAT_PRESET_COLORS[0]);
  const [budgetInput, setBudgetInput] = useS(String(settings.budget || ""));
  const [themeSheetOpen, setThemeSheetOpen] = useS(false);
  const submitCat = () => {
    const nome = newCatName.trim();
    if (!nome) return;
    const id = nome.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") + "_" + uid().slice(0, 4);
    onAddCat({
      id,
      nome,
      hex: newCatColor,
      cor: newCatColor
    });
    setNewCatName("");
  };
  const saveBudget = () => {
    const v = parseFloat(budgetInput.replace(",", "."));
    setSettings(s => ({
      ...s,
      budget: isNaN(v) ? 0 : v
    }));
  };
  const rows = [["lightMode", "Tema claro", "Alterna para fundo branco com maior luminosidade."], ["autoCat", "Categorização automática", "Detecta a categoria pela descrição do gasto."], ["glow", "Efeitos de iluminação", "Brilho sutil em cards e inputs (glassmorphism)."], ["animations", "Animações de fundo", "Movimento suave do gradiente ambiente."], ["confirmDelete", "Confirmar exclusão", "Pede confirmação antes de excluir um gasto."]];
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, (() => {
    const activeT = (window.THEMES || []).find(t => t.id === currentTheme) || {
      nome: "—",
      colors: ["#5ad9a8", "#5aa3e0"]
    };
    return React.createElement(React.Fragment, null, React.createElement("div", {
      className: "panel glass"
    }, React.createElement("div", {
      className: "panel-head"
    }, React.createElement("div", {
      className: "panel-title"
    }, "Tema visual")), React.createElement("button", {
      className: "set-row set-row-btn",
      onClick: () => setThemeSheetOpen(true)
    }, React.createElement("div", {
      className: "set-info"
    }, React.createElement("div", {
      className: "t"
    }, activeT.nome), React.createElement("div", {
      className: "d"
    }, "Toque para explorar e trocar o tema")), React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, React.createElement("div", {
      className: "ts-mini-swatch",
      style: {
        background: `linear-gradient(135deg, ${activeT.colors[0]}, ${activeT.colors[1]})`
      }
    }), React.createElement(Ic.chevron, {
      size: 18,
      style: {
        opacity: 0.5,
        transform: "rotate(-90deg)"
      }
    })))), React.createElement(ThemeSheet, {
      open: themeSheetOpen,
      onClose: () => setThemeSheetOpen(false),
      currentTheme: currentTheme,
      onSelect: onThemeChange
    }));
  })(), React.createElement("div", {
    className: "grid-2 config-grid"
  }, React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Prefer\xEAncias")), React.createElement("div", {
    className: "set-list"
  }, rows.map(([k, t, d]) => React.createElement("div", {
    className: "set-row",
    key: k
  }, React.createElement("div", {
    className: "set-info"
  }, React.createElement("div", {
    className: "t"
  }, t), React.createElement("div", {
    className: "d"
  }, d)), React.createElement("div", {
    className: "switch" + (settings[k] ? " on" : ""),
    onClick: () => toggle(k)
  }))))), React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Conta & dados")), React.createElement("div", {
    className: "set-row"
  }, React.createElement("div", {
    className: "set-info"
  }, React.createElement("div", {
    className: "t"
  }, "Moeda"), React.createElement("div", {
    className: "d"
  }, "Real brasileiro (BRL)")), React.createElement("span", {
    className: "exp-tag",
    style: {
      color: "var(--cat-saude)",
      borderColor: "var(--cat-saude)44",
      background: "var(--cat-saude)22"
    }
  }, "R$")), React.createElement("div", {
    className: "set-row",
    style: {
      flexWrap: "wrap",
      gap: 10
    }
  }, React.createElement("div", {
    className: "set-info"
  }, React.createElement("div", {
    className: "t"
  }, "Or\xE7amento mensal"), React.createElement("div", {
    className: "d"
  }, "Teto de gastos para os alertas de cor")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, React.createElement("input", {
    className: "form-input",
    style: {
      width: 110,
      textAlign: "right",
      padding: "10px 12px"
    },
    type: "number",
    min: "0",
    value: budgetInput,
    onChange: e => setBudgetInput(e.target.value),
    onBlur: saveBudget,
    onKeyDown: e => e.key === "Enter" && saveBudget(),
    placeholder: "2000"
  }))), React.createElement("div", {
    className: "set-row"
  }, React.createElement("div", {
    className: "set-info"
  }, React.createElement("div", {
    className: "t"
  }, "Restaurar exemplo"), React.createElement("div", {
    className: "d"
  }, "Recarrega os dados de demonstra\xE7\xE3o")), React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      padding: "10px 14px"
    },
    onClick: onReset
  }, "Restaurar")), React.createElement("div", {
    className: "set-row"
  }, React.createElement("div", {
    className: "set-info"
  }, React.createElement("div", {
    className: "t"
  }, "Redefinir perfil"), React.createElement("div", {
    className: "d"
  }, "Volta \xE0 tela de personaliza\xE7\xE3o inicial")), React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      padding: "10px 14px",
      color: "var(--cat-saude)"
    },
    onClick: onResetProfile
  }, "Redefinir")))), React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Backup & Exporta\xE7\xE3o")), React.createElement("div", {
    className: "set-list"
  }, React.createElement("div", {
    className: "set-row"
  }, React.createElement("div", {
    className: "set-info"
  }, React.createElement("div", {
    className: "t"
  }, "Exportar CSV"), React.createElement("div", {
    className: "d"
  }, "Baixa todos os lan\xE7amentos em formato de planilha")), React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      padding: "10px 14px",
      whiteSpace: "nowrap"
    },
    onClick: () => exportToCSV(expenses || [])
  }, React.createElement(Ic.upload, {
    size: 15
  }), "Exportar")), React.createElement("div", {
    className: "set-row"
  }, React.createElement("div", {
    className: "set-info"
  }, React.createElement("div", {
    className: "t"
  }, "Backup completo (JSON)"), React.createElement("div", {
    className: "d"
  }, "Salva lan\xE7amentos e cart\xF5es para restaura\xE7\xE3o futura")), React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      padding: "10px 14px",
      whiteSpace: "nowrap"
    },
    onClick: () => exportToJSON(expenses || [], cards || [], settings, customCats || [], fixas || [], caloteiros || [], emprestimos || [])
  }, React.createElement(Ic.download, {
    size: 15
  }), "Baixar")), React.createElement("div", {
    className: "set-row"
  }, React.createElement("div", {
    className: "set-info"
  }, React.createElement("div", {
    className: "t"
  }, "Restaurar backup"), React.createElement("div", {
    className: "d"
  }, "Importa um arquivo de backup .json gerado por este app")), React.createElement("label", {
    className: "btn btn-ghost",
    style: {
      padding: "10px 14px",
      cursor: "pointer",
      whiteSpace: "nowrap"
    }
  }, React.createElement(Ic.upload, {
    size: 15
  }), "Importar", React.createElement("input", {
    type: "file",
    accept: "application/json,.json",
    style: {
      display: "none"
    },
    onChange: e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!Array.isArray(data.expenses)) throw new Error("Formato inválido");
          askConfirm({
            title: "Restaurar backup?",
            message: `${data.expenses.length} lançamentos serão importados e substituirão todos os dados atuais. Esta ação não pode ser desfeita.`,
            confirmLabel: "Restaurar",
            danger: true,
            onConfirm: () => onRestoreBackup(data)
          });
        } catch {
          showToast("Arquivo inválido ou corrompido", "error");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    }
  }))))), React.createElement("div", {
    className: "panel glass"
  }, React.createElement("div", {
    className: "panel-head"
  }, React.createElement("div", {
    className: "panel-title"
  }, "Categorias")), React.createElement("div", {
    className: "cat-grid"
  }, allCats.map(c => React.createElement("div", {
    className: "cat-item",
    key: c.id
  }, React.createElement("span", {
    className: "dot",
    style: {
      background: c.hex,
      width: 10,
      height: 10
    }
  }), React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: 600
    }
  }, c.nome), !baseCatIds.has(c.id) && React.createElement("button", {
    className: "icon-btn danger",
    style: {
      width: 28,
      height: 28,
      opacity: 0.7
    },
    onClick: () => onDeleteCat(c.id)
  }, React.createElement(Ic.trash, {
    size: 13
  }))))), React.createElement("div", {
    className: "cat-add-form"
  }, React.createElement("input", {
    className: "form-input",
    style: {
      flex: 1
    },
    value: newCatName,
    onChange: e => setNewCatName(e.target.value),
    onKeyDown: e => e.key === "Enter" && submitCat(),
    placeholder: "Nome da nova categoria"
  }), React.createElement("div", {
    className: "color-palette"
  }, CAT_PRESET_COLORS.map(hex => React.createElement("div", {
    key: hex,
    className: "color-dot" + (newCatColor === hex ? " on" : ""),
    style: {
      background: hex
    },
    onClick: () => setNewCatColor(hex)
  }))), React.createElement("button", {
    className: "btn btn-primary",
    style: {
      padding: "10px 16px"
    },
    onClick: submitCat
  }, React.createElement(Ic.plus, {
    size: 16
  }), "Adicionar"))));
}
function FaturaCard({
  fatura,
  onMarkPaid,
  onUnmarkPaid,
  onEdit,
  onDelete,
  onDeleteGroup
}) {
  const [expanded, setExpanded] = useS(fatura.status === "aberta");
  const statusColor = fatura.status === "aberta" ? "var(--accent-mint)" : fatura.status === "fechada" ? "#e0c85a" : "var(--text-lo)";
  const statusLabel = fatura.status === "aberta" ? "Em aberto" : fatura.status === "fechada" ? "Fechada" : "Paga";
  return React.createElement("div", {
    className: "panel glass fatura-card" + (fatura.status === "aberta" ? " fatura-destaque" : "")
  }, React.createElement("div", {
    className: "fatura-header",
    onClick: () => setExpanded(v => !v)
  }, React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("div", {
    className: "fatura-mes"
  }, formatMes(fatura.mes)), React.createElement("div", {
    className: "fatura-dates"
  }, React.createElement(Ic.calendar, {
    size: 11
  }), "Fecha ", fmtDate(fatura.dataFechamento), " \xB7 Vence ", fmtDate(fatura.dataVencimento))), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 6
    }
  }, React.createElement("div", {
    className: "fatura-total",
    style: fatura.status === "paga" ? {
      color: "var(--text-lo)"
    } : {}
  }, fmtBRL(fatura.total)), React.createElement("span", {
    className: "exp-tag",
    style: {
      color: statusColor,
      borderColor: statusColor + "44",
      background: statusColor + "18"
    }
  }, statusLabel)), React.createElement("div", {
    className: "fatura-chevron" + (expanded ? " expanded" : "")
  }, React.createElement(Ic.chevron, {
    size: 18
  }))), expanded && React.createElement("div", {
    style: {
      marginTop: 16,
      paddingTop: 16,
      borderTop: "1px solid var(--glass-border)"
    }
  }, fatura.status !== "paga" ? React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      fontSize: 13,
      padding: "8px 14px",
      minHeight: 38
    },
    onClick: e => {
      e.stopPropagation();
      onMarkPaid();
    }
  }, React.createElement(Ic.check, {
    size: 15
  }), "Marcar como paga")) : React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 14,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: "var(--text-lo)",
      display: "flex",
      alignItems: "center",
      gap: 5
    }
  }, React.createElement(Ic.check, {
    size: 13
  }), "Paga em ", fmtDate(fatura.paidAt)), React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      fontSize: 12,
      padding: "6px 12px",
      minHeight: 34
    },
    onClick: e => {
      e.stopPropagation();
      onUnmarkPaid();
    }
  }, "Reabrir")), fatura.transacoes.length > 0 ? React.createElement(ExpenseTable, {
    rows: fatura.transacoes,
    onEdit: onEdit,
    onDelete: onDelete,
    onDeleteGroup: onDeleteGroup,
    cards: [fatura.card]
  }) : React.createElement("div", {
    style: {
      color: "var(--text-lo)",
      fontSize: 13,
      textAlign: "center",
      padding: "16px 0"
    }
  }, "Sem transa\xE7\xF5es nesta fatura")));
}
function FaturasView({
  cards,
  expenses,
  faturaOverrides,
  onMarkPaid,
  onUnmarkPaid,
  onEdit,
  onDelete,
  onDeleteGroup
}) {
  const [selectedCardId, setSelectedCardId] = useS(cards?.[0]?.id || null);
  const selectedCard = useM(() => cards?.find(c => c.id === selectedCardId), [cards, selectedCardId]);
  const faturas = useM(() => {
    if (!cards || cards.length === 0) return [];
    const all = computeFaturas(cards, expenses, faturaOverrides);
    return selectedCardId ? all.filter(f => f.cardId === selectedCardId) : all;
  }, [cards, expenses, faturaOverrides, selectedCardId]);
  const totalAberto = useM(() => faturas.filter(f => f.status === "aberta").reduce((s, f) => s + f.total, 0), [faturas]);
  const totalFechado = useM(() => faturas.filter(f => f.status === "fechada").reduce((s, f) => s + f.total, 0), [faturas]);
  if (!cards || cards.length === 0) {
    return React.createElement("div", {
      className: "panel glass"
    }, React.createElement("div", {
      className: "empty",
      style: {
        padding: "44px 20px"
      }
    }, React.createElement(Ic.card, {
      size: 40
    }), React.createElement("div", {
      style: {
        fontWeight: 600,
        color: "var(--text-mid)",
        marginTop: 14
      }
    }, "Nenhum cart\xE3o cadastrado"), React.createElement("div", {
      style: {
        fontSize: 13,
        marginTop: 6
      }
    }, "Adicione um cart\xE3o acima para come\xE7ar a registrar faturas.")));
  }
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "panel glass",
    style: {
      marginBottom: 16
    }
  }, React.createElement("div", {
    className: "tipo-picker"
  }, cards.map(c => React.createElement("button", {
    key: c.id,
    type: "button",
    className: "tipo-opt" + (selectedCardId === c.id ? " on" : ""),
    style: {
      "--tipo-hex": c.cor || "var(--accent-mint)"
    },
    onClick: () => setSelectedCardId(c.id)
  }, React.createElement(Ic.card, {
    size: 14
  }), c.nome))), selectedCard && React.createElement("div", {
    style: {
      display: "flex",
      gap: 24,
      marginTop: 14,
      paddingTop: 14,
      borderTop: "1px solid var(--glass-border)",
      flexWrap: "wrap"
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-lo)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: 4
    }
  }, "Fechamento"), React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, window.describeRecRule ? window.describeRecRule(selectedCard.recFechamento || {
    type: "fixed_day",
    day: selectedCard.diaFechamento || 20
  }) : selectedCard.diaFechamento)), React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-lo)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: 4
    }
  }, "Vencimento"), React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, window.describeRecRule ? window.describeRecRule(selectedCard.recVencimento || {
    type: "fixed_day",
    day: selectedCard.diaVencimento || 5
  }) : selectedCard.diaVencimento)), totalAberto > 0 && React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-lo)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: 4
    }
  }, "Em aberto"), React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 17,
      color: "var(--accent-mint)"
    }
  }, fmtBRL(totalAberto))), totalFechado > 0 && React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-lo)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: 4
    }
  }, "A pagar"), React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 17,
      color: "#e0c85a"
    }
  }, fmtBRL(totalFechado))))), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, faturas.map(f => React.createElement(FaturaCard, {
    key: f.id,
    fatura: f,
    onMarkPaid: () => onMarkPaid(f.cardId, f.mes),
    onUnmarkPaid: () => onUnmarkPaid(f.cardId, f.mes),
    onEdit: onEdit,
    onDelete: onDelete,
    onDeleteGroup: onDeleteGroup
  }))), faturas.length === 0 && React.createElement("div", {
    className: "panel glass",
    style: {
      marginTop: 0
    }
  }, React.createElement("div", {
    className: "empty",
    style: {
      padding: "44px 20px"
    }
  }, React.createElement(Ic.receipt, {
    size: 40
  }), React.createElement("div", {
    style: {
      fontWeight: 600,
      color: "var(--text-mid)",
      marginTop: 14
    }
  }, "Sem transa\xE7\xF5es no cr\xE9dito"), React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 6
    }
  }, "Adicione gastos com Cr\xE9dito vinculados a \"", selectedCard?.nome, "\" para ver as faturas."))));
}
Object.assign(window, {
  HomeView,
  DashboardView,
  GastosView,
  RelatoriosView,
  ConfigView,
  FaturasView,
  FaturaCard,
  ExpenseTable,
  GroupedExpenseList,
  FilterBar,
  FilterSheet,
  CardManager,
  Stat,
  BudgetBar,
  BankImportModal,
  EmptyState
});
})();

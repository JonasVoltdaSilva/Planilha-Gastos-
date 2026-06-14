/* GERADO AUTOMATICAMENTE a partir de chart.jsx — não edite à mão. Rode: npm run build */
(function () {
const {
  useMemo
} = React;
function Donut({
  data,
  total,
  budget
}) {
  const R = 80,
    SW = 26,
    C = 2 * Math.PI * R;
  let offset = 0;
  const segs = data.filter(d => d.valor > 0);
  const pct = budget > 0 ? total / budget * 100 : 0;
  const budgetColor = budget <= 0 ? "rgba(255,255,255,0.06)" : pct < 60 ? "oklch(0.78 0.12 165 / 0.18)" : pct < 85 ? "oklch(0.82 0.15 80 / 0.18)" : "oklch(0.74 0.13 20 / 0.22)";
  return React.createElement("div", {
    className: "donut-wrap"
  }, React.createElement("div", {
    className: "donut"
  }, React.createElement("svg", {
    width: "200",
    height: "200",
    viewBox: "0 0 200 200",
    style: {
      display: "block",
      background: "transparent"
    }
  }, React.createElement("circle", {
    cx: "100",
    cy: "100",
    r: "67",
    fill: "rgba(10,17,30,0.6)"
  }), React.createElement("circle", {
    cx: "100",
    cy: "100",
    r: R,
    fill: "none",
    stroke: budgetColor,
    strokeWidth: SW
  }), segs.map(d => {
    const frac = d.valor / total;
    const len = frac * C;
    const el = React.createElement("circle", {
      key: d.id,
      cx: "100",
      cy: "100",
      r: R,
      fill: "none",
      stroke: d.hex,
      strokeWidth: SW,
      strokeLinecap: "round",
      strokeDasharray: `${Math.max(len - 2, 0)} ${C}`,
      strokeDashoffset: -offset,
      transform: "rotate(-90 100 100)",
      style: {
        transition: "stroke-dasharray 0.7s ease",
        filter: `drop-shadow(0 0 6px ${d.hex}55)`
      }
    });
    offset += len;
    return el;
  })), React.createElement("div", {
    className: "donut-center"
  }, React.createElement("div", {
    className: "lab"
  }, "Total"), React.createElement("div", {
    className: "val"
  }, fmtBRLshort(total)), budget > 0 && React.createElement("div", {
    className: "donut-pct",
    style: {
      color: pct < 60 ? "var(--accent-mint)" : pct < 85 ? "#e0c85a" : "var(--cat-saude)"
    }
  }, Math.round(pct), "%"))), React.createElement("div", {
    className: "legend"
  }, segs.slice(0, 6).map(d => React.createElement("div", {
    className: "legend-row",
    key: d.id
  }, React.createElement("span", {
    className: "dot",
    style: {
      background: d.hex
    }
  }), React.createElement("span", {
    className: "nm"
  }, d.nome), React.createElement("span", {
    className: "amt"
  }, fmtBRL(d.valor)), React.createElement("span", {
    className: "pc"
  }, Math.round(d.valor / total * 100), "%")))));
}
function WeekBars({
  expenses
}) {
  const days = useMemo(() => {
    const arr = [];
    const t = todayISO();
    for (let i = 6; i >= 0; i--) {
      const iso = addDays(t, -i);
      const total = expenses.filter(e => e.data === iso && e.kind !== "entrada").reduce((s, e) => s + e.valor, 0);
      const d = new Date(iso + "T12:00:00");
      arr.push({
        iso,
        total,
        lab: d.toLocaleDateString("pt-BR", {
          weekday: "short"
        }).slice(0, 3)
      });
    }
    return arr;
  }, [expenses]);
  const max = Math.max(...days.map(d => d.total), 1);
  return React.createElement("div", {
    className: "bars"
  }, days.map(d => React.createElement("div", {
    className: "bar-col",
    key: d.iso
  }, React.createElement("div", {
    className: "bar-val"
  }, d.total > 0 ? fmtBRLshort(d.total) : "—"), React.createElement("div", {
    className: "bar",
    style: {
      height: `${Math.max(d.total / max * 100, 3)}%`
    }
  }), React.createElement("div", {
    className: "bar-lab"
  }, d.lab))));
}
Object.assign(window, {
  Donut,
  WeekBars
});
})();

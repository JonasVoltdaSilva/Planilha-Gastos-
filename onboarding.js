/* GERADO AUTOMATICAMENTE a partir de onboarding.jsx — não edite à mão. Rode: npm run build */
(function () {
const {
  useState: useStateOnb,
  useEffect: useEffectOnb
} = React;
const THEMES = [{
  id: "default",
  nome: "Verde + Azul",
  colors: ["#5ad9a8", "#5aa3e0"]
}, {
  id: "rose",
  nome: "Rosa",
  colors: ["#e06fa0", "#e04a6a"]
}, {
  id: "blue",
  nome: "Azul Neon",
  colors: ["#5ab5e8", "#3a8fff"]
}, {
  id: "purple",
  nome: "Roxo",
  colors: ["#b98ae8", "#7a5ae0"]
}, {
  id: "dark",
  nome: "Neutro",
  colors: ["#8a96a8", "#5a6878"]
}, {
  id: "orange",
  nome: "Âmbar",
  colors: ["#e8b85a", "#e07a3a"]
}, {
  id: "petal",
  nome: "Petal",
  colors: ["#d8d4ce", "#1a1a1a"]
}, {
  id: "acid",
  nome: "Lemonade",
  colors: ["#AFFF00", "#F4FF4D"]
}, {
  id: "chrome",
  nome: "Whiplash",
  colors: ["#D0DCF0", "#040408"]
}, {
  id: "sweet",
  nome: "Short n' Sweet",
  colors: ["#F5CBA1", "#B85040"]
}, {
  id: "fancy",
  nome: "Fancy That",
  colors: ["#CC2030", "#9B8FA3"]
}];
const LS_PROFILE = "planilha_gastos_profile_v1";
function applyTheme(themeId) {
  THEMES.forEach(t => document.body.classList.remove(`theme-${t.id}`));
  if (themeId && themeId !== "default") {
    document.body.classList.add(`theme-${themeId}`);
  }
}
function OnboardingPage({
  onEnter
}) {
  const [name, setNameOnb] = useStateOnb("");
  const [theme, setTheme] = useStateOnb("default");
  const [error, setError] = useStateOnb("");
  const [exiting, setExiting] = useStateOnb(false);
  const selectedTheme = THEMES.find(t => t.id === theme) || THEMES[0];
  useEffectOnb(() => {
    applyTheme(theme);
  }, [theme]);
  const handleEnter = () => {
    if (!name.trim()) {
      setError("Digite seu nome para continuar.");
      return;
    }
    setExiting(true);
    const profile = {
      name: name.trim(),
      theme
    };
    try {
      localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
    } catch (e) {}
    setTimeout(() => onEnter(profile), 380);
  };
  return React.createElement("div", {
    className: "onb-overlay" + (exiting ? " onb-exit" : "")
  }, React.createElement("div", {
    className: "onb-card glass"
  }, React.createElement("div", {
    className: "onb-header"
  }, React.createElement("div", {
    className: "brand-mark onb-icon"
  }, React.createElement(Ic.coins, {
    size: 28,
    color: "#fff"
  })), React.createElement("div", null, React.createElement("div", {
    className: "onb-app-name"
  }, "Cofrinho"), React.createElement("div", {
    className: "onb-app-sub"
  }, "Controle de gastos pessoais"))), React.createElement("div", {
    className: "onb-welcome"
  }, React.createElement("h2", null, "Boas-vindas! \uD83D\uDC4B"), React.createElement("p", null, "Personalize sua experi\xEAncia antes de entrar.")), React.createElement("div", {
    className: "form-row"
  }, React.createElement("label", {
    className: "form-label"
  }, "Seu nome"), React.createElement("input", {
    className: "form-input",
    autoFocus: true,
    value: name,
    onChange: e => {
      setNameOnb(e.target.value);
      setError("");
    },
    onKeyDown: e => e.key === "Enter" && handleEnter(),
    placeholder: "Como posso te chamar?"
  }), error && React.createElement("div", {
    className: "onb-error"
  }, error)), React.createElement("div", {
    className: "form-row"
  }, React.createElement("label", {
    className: "form-label"
  }, "Tema visual"), React.createElement("div", {
    className: "onb-theme-grid"
  }, THEMES.map(t => React.createElement("button", {
    key: t.id,
    type: "button",
    className: "onb-theme-opt" + (theme === t.id ? " on" : ""),
    onClick: () => setTheme(t.id)
  }, React.createElement("div", {
    className: "onb-theme-swatch",
    style: {
      background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`
    }
  }, theme === t.id && React.createElement(Ic.check, {
    size: 14
  })), React.createElement("span", null, t.nome))))), React.createElement("div", {
    className: "onb-mini-preview",
    style: {
      "--prev-a": selectedTheme.colors[0],
      "--prev-b": selectedTheme.colors[1]
    }
  }, React.createElement("div", {
    className: "onb-preview-bar"
  }), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, [["62%", "R$ 420,00"], ["40%", "R$ 89,90"], ["75%", "R$ 1.450"]].map(([w, v]) => React.createElement("div", {
    key: v,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, React.createElement("div", {
    style: {
      height: 7,
      flex: 1,
      borderRadius: 999,
      background: "rgba(255,255,255,0.1)"
    }
  }, React.createElement("div", {
    style: {
      height: "100%",
      width: w,
      borderRadius: 999,
      background: `linear-gradient(90deg, var(--prev-a), var(--prev-b))`,
      opacity: 0.7
    }
  })), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 12,
      fontWeight: 700,
      color: "var(--prev-a)",
      minWidth: 70,
      textAlign: "right"
    }
  }, v))))), React.createElement("button", {
    className: "btn btn-primary onb-enter-btn",
    onClick: handleEnter
  }, "Entrar no sistema ", React.createElement(Ic.trendUp, {
    size: 18
  }))));
}
window.THEMES = THEMES;
window.LS_PROFILE = LS_PROFILE;
window.applyTheme = applyTheme;
window.OnboardingPage = OnboardingPage;
})();

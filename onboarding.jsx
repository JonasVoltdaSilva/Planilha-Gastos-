/* ============================================================
   Onboarding / Front Page — personalização inicial do usuário
   ============================================================ */
const { useState: useStateOnb, useEffect: useEffectOnb } = React;

const THEMES = [
  { id: "default", nome: "Verde + Azul", colors: ["#5ad9a8", "#5aa3e0"] },
  { id: "rose",    nome: "Rosa",          colors: ["#e06fa0", "#e04a6a"] },
  { id: "blue",    nome: "Azul Neon",     colors: ["#5ab5e8", "#3a8fff"] },
  { id: "purple",  nome: "Roxo",          colors: ["#b98ae8", "#7a5ae0"] },
  { id: "dark",    nome: "Neutro",        colors: ["#8a96a8", "#5a6878"] },
  { id: "orange",  nome: "Âmbar",         colors: ["#e8b85a", "#e07a3a"] },
  { id: "petal",   nome: "Petal",          colors: ["#d8d4ce", "#1a1a1a"] },
  { id: "acid",    nome: "Lemonade",        colors: ["#AFFF00", "#F4FF4D"] },
  { id: "chrome",  nome: "Whiplash",        colors: ["#D0DCF0", "#040408"] },
  { id: "sweet",   nome: "Short n' Sweet", colors: ["#F8D6DD", "#E6C98D"] },
  { id: "fancy",   nome: "Fancy That",      colors: ["#CC2030", "#9B8FA3"] },
];

const LS_PROFILE = "planilha_gastos_profile_v1";

function applyTheme(themeId) {
  THEMES.forEach(t => document.body.classList.remove(`theme-${t.id}`));
  if (themeId && themeId !== "default") {
    document.body.classList.add(`theme-${themeId}`);
  }
}

function OnboardingPage({ onEnter }) {
  const [name, setNameOnb] = useStateOnb("");
  const [theme, setTheme] = useStateOnb("default");
  const [error, setError] = useStateOnb("");
  const [exiting, setExiting] = useStateOnb(false);

  const selectedTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  useEffectOnb(() => { applyTheme(theme); }, [theme]);

  const handleEnter = () => {
    if (!name.trim()) { setError("Digite seu nome para continuar."); return; }
    setExiting(true);
    const profile = { name: name.trim(), theme };
    try { localStorage.setItem(LS_PROFILE, JSON.stringify(profile)); } catch (e) {}
    setTimeout(() => onEnter(profile), 380);
  };

  return (
    <div className={"onb-overlay" + (exiting ? " onb-exit" : "")}>
      <div className="onb-card glass">

        {/* Header */}
        <div className="onb-header">
          <div className="brand-mark onb-icon">
            <Ic.coins size={28} color="#fff" />
          </div>
          <div>
            <div className="onb-app-name">Cofrinho</div>
            <div className="onb-app-sub">Controle de gastos pessoais</div>
          </div>
        </div>

        {/* Welcome */}
        <div className="onb-welcome">
          <h2>Boas-vindas! 👋</h2>
          <p>Personalize sua experiência antes de entrar.</p>
        </div>

        {/* Nome */}
        <div className="form-row">
          <label className="form-label">Seu nome</label>
          <input
            className="form-input"
            autoFocus
            value={name}
            onChange={e => { setNameOnb(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleEnter()}
            placeholder="Como posso te chamar?"
          />
          {error && <div className="onb-error">{error}</div>}
        </div>

        {/* Tema */}
        <div className="form-row">
          <label className="form-label">Tema visual</label>
          <div className="onb-theme-grid">
            {THEMES.map(t => (
              <button key={t.id} type="button"
                className={"onb-theme-opt" + (theme === t.id ? " on" : "")}
                onClick={() => setTheme(t.id)}>
                <div className="onb-theme-swatch"
                  style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}>
                  {theme === t.id && <Ic.check size={14} />}
                </div>
                <span>{t.nome}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview mini */}
        <div className="onb-mini-preview" style={{
          "--prev-a": selectedTheme.colors[0],
          "--prev-b": selectedTheme.colors[1],
        }}>
          <div className="onb-preview-bar" />
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[["62%", "R$ 420,00"], ["40%", "R$ 89,90"], ["75%", "R$ 1.450"]].map(([w, v]) => (
              <div key={v} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ height: 7, flex: 1, borderRadius: 999, background: "rgba(255,255,255,0.1)" }}>
                  <div style={{ height: "100%", width: w, borderRadius: 999, background: `linear-gradient(90deg, var(--prev-a), var(--prev-b))`, opacity: 0.7 }} />
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: "var(--prev-a)", minWidth: 70, textAlign: "right" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão entrar */}
        <button className="btn btn-primary onb-enter-btn" onClick={handleEnter}>
          Entrar no sistema <Ic.trendUp size={18} />
        </button>
      </div>
    </div>
  );
}

window.THEMES = THEMES;
window.LS_PROFILE = LS_PROFILE;
window.applyTheme = applyTheme;
window.OnboardingPage = OnboardingPage;

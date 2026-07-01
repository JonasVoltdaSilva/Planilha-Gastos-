# Planilha Gastos — Cofrinho

App de controle de gastos pessoais em React (JSX puro, sem bundler). PWA com localStorage.

## Arquivos principais
- `index.html` — entry point, carrega todos os scripts via CDN
- `app.jsx` — App raiz, estado global, navegação
- `views.jsx` — Todas as views (Home, Dashboard, Gastos, Relatórios, Config)
- `modal.jsx` — Modal de adicionar/editar transação
- `data.jsx` — Dados, categorias, helpers de data e formatação
- `chart.jsx` — Gráfico donut (distribuição por categoria)
- `icons.jsx` — Ícones SVG
- `onboarding.jsx` — Tela de onboarding/perfil
- `styles.css` — Estilos globais, temas, animações

## Stack
- React 18 via CDN (sem Node.js, sem bundler)
- JSX compilado via Babel Standalone no browser
- PWA com Service Worker (`sw.js`) e manifest
- Dados persistidos via localStorage

## Agentes disponíveis (toolkit)

### Desenvolvimento
- Use `~/.claude/plugins/claude-code-toolkit/agents/core-development/frontend-architect.md` para arquitetura de componentes
- Use `~/.claude/plugins/claude-code-toolkit/agents/core-development/ui-designer.md` para UI/UX e design system
- Use `~/.claude/plugins/claude-code-toolkit/agents/language-experts/react-specialist.md` para padrões React

### Qualidade
- Use `~/.claude/plugins/claude-code-toolkit/agents/quality-assurance/code-reviewer.md` para revisão de código
- Use `~/.claude/plugins/claude-code-toolkit/agents/quality-assurance/performance-engineer.md` para otimização
- Use `~/.claude/plugins/claude-code-toolkit/agents/quality-assurance/accessibility-specialist.md` para acessibilidade

### Pesquisa
- Use `~/.claude/plugins/claude-code-toolkit/agents/research-analysis/research-analyst.md` para pesquisa técnica

## Skills disponíveis

- `react-patterns` — Padrões de hooks, estado, componentes
- `frontend-excellence` — Performance, bundle, acessibilidade
- `performance-optimization` — Otimização de renderização
- `security-hardening` — Segurança no frontend
- `tdd-mastery` — Testes
- `accessibility-wcag` — WCAG 2.2

## Convenções do projeto

- Sem TypeScript — JavaScript puro com JSX
- Sem imports/exports — tudo em escopo global via `<script>`
- Formatação: 2 espaços, aspas duplas nos atributos JSX
- Nomes de funções: PascalCase para componentes, camelCase para funções utilitárias
- Sem comentários de código, exceto quando o motivo for não óbvio

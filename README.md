# Central Preparação Monitor

Sistema de monitoramento em tempo real para eventos de emergência em Portugal.

## Funcionalidades

- 🔥 **Incêndios**: Monitoramento de incêndios ativos via API Fogos.pt
- ⛈️ **Avisos Meteorológicos**: Alertas meteorológicos do IPMA
- 🌍 **Sismos**: Dados sísmicos em tempo real do IPMA
- 📍 **Alertas de Proximidade**: Notificações baseadas na localização do usuário
- 📊 **Gráficos Históricos**: Estatísticas de eventos por hora
- 🗺️ **Mapa Interativo**: Visualização geográfica dos eventos

## Tecnologias

- PWA (Progressive Web App) compatível
- HTML5, CSS3, JavaScript (Vanilla)
- APIs oficiais: Fogos.pt e IPMA
- Service Worker para funcionamento offline
- Geolocalização para alertas de proximidade

## Uso

1. **GitHub Pages**: O site está configurado para deploy automático no GitHub Pages
2. **Local**: Abra `index.html` em qualquer navegador moderno
3. **Servidor**: Use qualquer servidor HTTP estático

```bash
# Exemplo com Python
python3 -m http.server 8000

# Exemplo com Node.js
npx serve .
```

## APIs Integradas

- **Fogos.pt**: `https://api.fogos.pt/v2/incidents/search`
- **IPMA Avisos**: `https://api.ipma.pt/open-data/forecast/warnings/warnings_www.json`
- **IPMA Sismos**: `https://api.ipma.pt/open-data/earthquake/earthquake.json`

## Estrutura

```
/
├── index.html          # Interface principal
├── api.js             # Funções de API e dados mock
├── service-worker.js  # Service Worker para PWA
├── manifest.json      # Manifesto PWA
├── tornado.svg        # Ícone da aplicação
└── README.md          # Documentação
```

## Recursos

- ✅ Responsivo (mobile-first)
- ✅ Funciona offline (dados em cache)
- ✅ Atualizações automáticas a cada 5 minutos
- ✅ Geolocalização para alertas personalizados
- ✅ Interface em português
- ✅ Indicadores visuais de status

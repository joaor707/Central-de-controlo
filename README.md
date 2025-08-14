# Central Preparação Monitor

Sistema de monitorização de emergências em tempo real para Portugal, incluindo incêndios, tempestades e sismos.

## 🌐 Site Funcional

**Acesse o sistema aqui:** [https://joaor707.github.io/central-preparacao-monitor/](https://joaor707.github.io/central-preparacao-monitor/)

## 📋 Funcionalidades

- **Mapa Interativo**: Visualização geográfica em tempo real dos eventos
- **Painel de Monitorização**: Resumo estatístico dos eventos ativos
- **Histórico de Eventos**: Lista detalhada dos últimos eventos (24h)
- **Dados Reais**: Integração com APIs oficiais

### Fontes de Dados

- **Incêndios**: fogos.pt (via allorigins.win)
- **Tempestades**: IPMA - Instituto Português do Mar e da Atmosfera
- **Sismos Portugal**: IPMA - Catálogo Sísmico
- **Sismos Mundiais**: USGS - United States Geological Survey (Magnitude ≥ 5.0)

## 🚀 Como Usar

1. Acesse o link do site funcional
2. Visualize os eventos no mapa interativo
3. Consulte o painel de monitorização para estatísticas
4. Veja o histórico de eventos na parte inferior da página
5. Use o botão "Atualizar Dados" para obter informações mais recentes

## 💻 Desenvolvimento Local

### Pré-requisitos

- Navegador web moderno
- Servidor HTTP local (opcional, mas recomendado)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/joaor707/central-preparacao-monitor.git
cd central-preparacao-monitor
```

2. Inicie um servidor local:
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (se tiver npx)
npx serve .

# PHP
php -S localhost:8000
```

3. Acesse `http://localhost:8000` no navegador

### Estrutura do Projeto

```
├── index.html          # Página principal com mapa interativo
├── painel.js          # Painel de monitorização e histórico
├── README.md          # Documentação
├── manifest.json      # Configuração PWA
└── service-worker.js  # Service Worker para cache
```

## 🔧 Deploy

### GitHub Pages (Recomendado)

1. Faça push do código para o repositório GitHub
2. Vá em Settings → Pages
3. Selecione "Deploy from a branch"
4. Escolha "main" branch
5. O site estará disponível em `https://username.github.io/repository-name/`

### Outros Serviços

- **Netlify**: Arraste a pasta do projeto para netlify.com/drop
- **Vercel**: Conecte o repositório GitHub
- **Firebase Hosting**: Use `firebase deploy`

## 📊 Limitações Conhecidas

- **CORS**: Algumas APIs podem ter restrições CORS, sendo necessário uso de proxy
- **Rate Limiting**: APIs podem ter limites de requisições por minuto
- **Dados**: Dependente da disponibilidade das APIs externas

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapas**: Leaflet.js
- **APIs**: IPMA, USGS, fogos.pt
- **Proxy CORS**: allorigins.win

## 📄 Licença

Projeto open source para fins educacionais e de utilidade pública.

---

**Última atualização**: Agosto 2025

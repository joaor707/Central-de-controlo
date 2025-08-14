document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector('.container');
    if (!container) return;

    // Array para armazenar eventos recentes
    let eventosRecentes = [];

    const painel = document.createElement('div');
    painel.style.marginTop = "32px";
    painel.style.padding = "24px";
    painel.style.background = "#f0f4ff";
    painel.style.borderRadius = "8px";
    painel.style.boxShadow = "0 2px 12px rgba(0,24,64,0.06)";
    painel.style.fontSize = "1.1rem";

    painel.innerHTML = `
        <h2>Painel de Monitorização</h2>
        <div style="display: flex; gap: 28px; flex-wrap: wrap;">
            <div>
                <h3 style="margin:0;color:#c0392b;">Incêndios</h3>
                <p>Ativos: <span id="incendios">?</span></p>
                <p>Localizações: <span id="locIncendios">...</span></p>
            </div>
            <div>
                <h3 style="margin:0;color:#2980b9;">Tempestades</h3>
                <p>Estado: <span id="tempestades">?</span></p>
                <p>Localizações: <span id="locTempestades">...</span></p>
            </div>
            <div>
                <h3 style="margin:0;color:#8e44ad;">Terremotos</h3>
                <p>Últimos 24h: <span id="terremotos">?</span></p>
                <p>Localizações: <span id="locTerremotos">...</span></p>
            </div>
        </div>
        <button id="atualizar" style="margin-top:24px;padding:10px 20px;font-size:1rem;">Atualizar Dados</button>
        <div id="ultimaAtualizacao" style="margin-top:12px;font-size:0.9rem;color:#333;"></div>
    `;

    container.appendChild(painel);

    // Função para adicionar eventos ao histórico
    function addEventosToHistory(eventos) {
        if (!Array.isArray(eventos)) return;
        
        eventos.forEach(evento => {
            // Evitar duplicatas baseadas no tipo, local e data
            const eventoExistente = eventosRecentes.find(e => 
                e.tipo === evento.tipo && 
                e.local === evento.local && 
                Math.abs(new Date(e.data) - new Date(evento.data)) < 60000 // 1 minuto de diferença
            );
            
            if (!eventoExistente) {
                eventosRecentes.push(evento);
            }
        });
        
        // Manter apenas os últimos 50 eventos
        eventosRecentes = eventosRecentes
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 50);
        
        // Atualizar o histórico na página
        updateHistoricoEventos();
    }

    // Função para atualizar o histórico de eventos na página
    function updateHistoricoEventos() {
        const historicoDiv = document.getElementById('historico-eventos-lista');
        if (!historicoDiv) return;
        
        if (eventosRecentes.length === 0) {
            historicoDiv.innerHTML = '<p style="color:#666;">Nenhum evento recente registado.</p>';
            return;
        }
        
        const eventosHTML = eventosRecentes.slice(0, 20).map(evento => {
            const dataFormatada = new Date(evento.data).toLocaleString('pt-PT');
            let descricao = `${evento.local}`;
            
            if (evento.magnitude) {
                descricao += ` (Magnitude: ${evento.magnitude})`;
            }
            if (evento.precipitacao && evento.vento) {
                descricao += ` (Precipitação: ${evento.precipitacao}%, Vento: ${evento.vento} km/h)`;
            }
            if (evento.titulo) {
                descricao = `${evento.titulo} - ${descricao}`;
            }
            
            const corTipo = {
                'Incêndio': '#c0392b',
                'Tempestade': '#2980b9',
                'Sismo Portugal': '#8e44ad',
                'Sismo Mundial': '#e67e22'
            };
            
            return `
                <div style="padding:12px; border-left:4px solid ${corTipo[evento.tipo] || '#333'}; margin-bottom:10px; background:#fff; border-radius:4px;">
                    <div style="font-weight:bold; color:${corTipo[evento.tipo] || '#333'};">${evento.tipo}</div>
                    <div style="margin:4px 0;">${descricao}</div>
                    <div style="font-size:0.9em; color:#666;">${dataFormatada}</div>
                </div>
            `;
        }).join('');
        
        historicoDiv.innerHTML = eventosHTML;
    }

    // Sismos (IPMA e USGS, dados reais)
    async function fetchSismos() {
        try {
            let sismos = [];
            
            // Sismos Portugal (IPMA)
            const resIPMA = await fetch('https://www.ipma.pt/resources.www/geofisica/sismicidade/catalogo_sismico.json');
            const dataIPMA = await resIPMA.json();
            const hoje = new Date();
            const sismosPortugal = dataIPMA.filter(sismo => {
                const sismoData = new Date(sismo.data);
                return (hoje - sismoData) < 1000 * 60 * 60 * 24;
            });
            
            sismosPortugal.forEach(sismo => {
                sismos.push({
                    tipo: 'Sismo Portugal',
                    local: sismo.local || 'Desconhecido',
                    data: new Date(sismo.data),
                    magnitude: sismo.magnitude
                });
            });
            
            // Sismos Mundiais (USGS)
            try {
                const resUSGS = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/5.0_day.geojson");
                const dataUSGS = await resUSGS.json();
                dataUSGS.features.forEach(eq => {
                    sismos.push({
                        tipo: 'Sismo Mundial',
                        local: eq.properties.place,
                        data: new Date(eq.properties.time),
                        magnitude: eq.properties.mag
                    });
                });
            } catch (e) {
                console.log("Erro ao buscar sismos USGS:", e);
            }
            
            document.getElementById("terremotos").textContent = sismos.length;
            document.getElementById("locTerremotos").textContent = sismos.map(s => s.local).slice(0, 3).join(", ") + (sismos.length > 3 ? "..." : "") || 'Nenhuma';
            
            // Adicionar aos eventos recentes
            addEventosToHistory(sismos);
        } catch (e) {
            document.getElementById("terremotos").textContent = "Erro";
            document.getElementById("locTerremotos").textContent = "Erro ao buscar";
            // Ainda assim, atualizar o histórico mesmo em caso de erro
            addEventosToHistory([]);
        }
    }

    // Incêndios (Fogos.pt via allorigins.win)
    async function fetchIncendios() {
        try {
            const url = "https://api.allorigins.win/get?url=" + encodeURIComponent("https://fogos.pt/");
            const res = await fetch(url);
            const data = await res.json();
            const html = data.contents;
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
            const cards = tempDiv.querySelectorAll('.fire-card');
            
            let incendiosAtivos = [];
            cards.forEach(card => {
                const titulo = card.querySelector('.fire-title')?.textContent?.trim();
                const local = card.querySelector('.fire-location')?.textContent?.trim();
                if (titulo && local) {
                    incendiosAtivos.push({ titulo, local, data: new Date(), tipo: 'Incêndio' });
                }
            });

            document.getElementById("incendios").textContent = incendiosAtivos.length;
            document.getElementById("locIncendios").textContent = incendiosAtivos.map(f => f.local).join(", ") || 'Nenhuma';
            
            // Adicionar aos eventos recentes
            addEventosToHistory(incendiosAtivos);
        } catch (e) {
            document.getElementById("incendios").textContent = "Erro";
            document.getElementById("locIncendios").textContent = "Erro ao buscar";
            // Ainda assim, atualizar o histórico mesmo em caso de erro
            addEventosToHistory([]);
        }
    }

    // Tempestades (IPMA, Lisboa)
    async function fetchTempestades() {
        try {
            const res = await fetch('https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/1110600.json');
            const data = await res.json();
            const hojeStr = new Date().toISOString().slice(0, 10);
            const today = Array.isArray(data.data) ? data.data.find(d => d.forecastDate === hojeStr) : null;
            
            let tempestades = [];
            if (today && (today.precipitaProb > 70 || today.windSpeed > 40)) {
                tempestades.push({
                    tipo: 'Tempestade',
                    local: 'Lisboa',
                    data: new Date(),
                    precipitacao: today.precipitaProb,
                    vento: today.windSpeed
                });
                document.getElementById("tempestades").textContent = "Ativa em Lisboa";
                document.getElementById("locTempestades").textContent = `Precipitação: ${today.precipitaProb}%, Vento: ${today.windSpeed} km/h`;
            } else {
                document.getElementById("tempestades").textContent = "Sem alertas";
                document.getElementById("locTempestades").textContent = "Condições normais";
            }
            
            // Adicionar aos eventos recentes
            addEventosToHistory(tempestades);
        } catch (e) {
            document.getElementById("tempestades").textContent = "Erro";
            document.getElementById("locTempestades").textContent = "Erro ao buscar";
            // Ainda assim, atualizar o histórico mesmo em caso de erro
            addEventosToHistory([]);
        }
    }

    async function atualizarPainel() {
        fetchIncendios();
        fetchSismos();
        fetchTempestades();
        document.getElementById("ultimaAtualizacao").textContent = "Última atualização: " + new Date().toLocaleString("pt-PT");
        
        // Inicializar histórico se ainda não foi inicializado
        setTimeout(() => {
            updateHistoricoEventos();
        }, 1000); // Aguardar um pouco para que as chamadas API tenham chance de completar
    }

    document.getElementById("atualizar").onclick = atualizarPainel;

    // Atualiza ao carregar
    atualizarPainel();
});
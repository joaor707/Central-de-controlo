document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector('.container');
    if (!container) return;

    // LocalStorage keys for history
    const STORAGE_KEYS = {
        INCENDIOS: 'monitor_incendios_history',
        SISMOS: 'monitor_sismos_history', 
        TEMPESTADES: 'monitor_tempestades_history'
    };

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
        <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;">
            <button id="atualizar" style="padding:10px 20px;font-size:1rem;">Atualizar Dados</button>
            <button id="verHistorico" style="padding:10px 20px;font-size:1rem;background:#8e44ad;color:white;border:none;border-radius:4px;">Ver Histórico</button>
        </div>
        <div id="ultimaAtualizacao" style="margin-top:12px;font-size:0.9rem;color:#333;"></div>
    `;

    container.appendChild(painel);

    // History modal
    const modal = document.createElement('div');
    modal.id = 'historicoModal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
    `;
    
    modal.innerHTML = `
        <div style="
            background-color: white;
            margin: 5% auto;
            padding: 20px;
            border-radius: 8px;
            width: 90%;
            max-width: 800px;
            max-height: 80%;
            overflow-y: auto;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">Histórico de Eventos</h2>
                <button id="fecharModal" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                ">×</button>
            </div>
            <div id="conteudoHistorico"></div>
        </div>
    `;
    
    document.body.appendChild(modal);

    // Helper functions for LocalStorage
    function salvarEvento(tipo, evento) {
        try {
            const key = STORAGE_KEYS[tipo];
            if (!key) return;
            
            let historico = JSON.parse(localStorage.getItem(key) || '[]');
            evento.timestamp = new Date().toISOString();
            evento.id = Date.now() + Math.random();
            
            historico.unshift(evento);
            // Keep only last 50 events
            historico = historico.slice(0, 50);
            
            localStorage.setItem(key, JSON.stringify(historico));
        } catch (e) {
            console.log('Erro ao salvar evento:', e);
        }
    }

    function obterHistorico(tipo) {
        try {
            const key = STORAGE_KEYS[tipo];
            if (!key) return [];
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            console.log('Erro ao obter histórico:', e);
            return [];
        }
    }

    function mostrarMensagemErro(elementId, locElementId, mensagem) {
        document.getElementById(elementId).textContent = "Erro";
        document.getElementById(locElementId).textContent = mensagem;
        document.getElementById(elementId).style.color = "#dc3545";
        document.getElementById(locElementId).style.color = "#dc3545";
    }

    function mostrarMensagemSemDados(elementId, locElementId, tipoEvento) {
        document.getElementById(elementId).textContent = "0";
        document.getElementById(locElementId).textContent = `Sem dados de ${tipoEvento} no momento`;
        document.getElementById(elementId).style.color = "#6c757d";
        document.getElementById(locElementId).style.color = "#6c757d";
    }

    function resetarEstiloElemento(elementId, locElementId) {
        document.getElementById(elementId).style.color = "";
        document.getElementById(locElementId).style.color = "";
    }

    // Sismos (IPMA, dados reais)
    async function fetchSismos() {
        try {
            resetarEstiloElemento("terremotos", "locTerremotos");
            
            const res = await fetch('https://www.ipma.pt/resources.www/geofisica/sismicidade/catalogo_sismico.json');
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const data = await res.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Formato de dados inválido');
            }
            
            const hoje = new Date();
            const ultimos24h = data.filter(sismo => {
                const sismoData = new Date(sismo.data);
                return (hoje - sismoData) < 1000 * 60 * 60 * 24;
            });
            
            if (ultimos24h.length === 0) {
                mostrarMensagemSemDados("terremotos", "locTerremotos", "sismos");
            } else {
                document.getElementById("terremotos").textContent = ultimos24h.length;
                document.getElementById("locTerremotos").textContent = ultimos24h.map(s => s.local || 'Local desconhecido').join(", ");
                
                // Salvar eventos no histórico
                ultimos24h.forEach(sismo => {
                    salvarEvento('SISMOS', {
                        tipo: 'Sismo Portugal',
                        local: sismo.local || 'Local desconhecido',
                        magnitude: sismo.magnitude,
                        data: sismo.data,
                        latitude: sismo.latitude,
                        longitude: sismo.longitude
                    });
                });
            }
        } catch (e) {
            console.log("Erro ao buscar sismos IPMA:", e);
            mostrarMensagemErro("terremotos", "locTerremotos", "Erro ao buscar dados do IPMA");
        }
    }

    // Incêndios (usar o scraping existente como fallback)
    async function fetchIncendios() {
        try {
            resetarEstiloElemento("incendios", "locIncendios");
            
            // Tentar usar o mesmo método do index.html
            const url = "https://api.allorigins.win/get?url=" + encodeURIComponent("https://fogos.pt/");
            const res = await fetch(url);
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const data = await res.json();
            
            if (!data.contents) {
                throw new Error('Dados não disponíveis');
            }
            
            const html = data.contents;
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
            const cards = tempDiv.querySelectorAll('.fire-card');
            
            if (cards.length === 0) {
                mostrarMensagemSemDados("incendios", "locIncendios", "incêndios");
            } else {
                const incendios = [];
                cards.forEach(card => {
                    const titulo = card.querySelector('.fire-title')?.textContent?.trim();
                    const local = card.querySelector('.fire-location')?.textContent?.trim();
                    if (titulo && local) {
                        incendios.push({ titulo, local });
                        
                        // Salvar no histórico
                        salvarEvento('INCENDIOS', {
                            tipo: 'Incêndio Ativo',
                            titulo: titulo,
                            local: local
                        });
                    }
                });
                
                document.getElementById("incendios").textContent = incendios.length;
                document.getElementById("locIncendios").textContent = incendios.map(i => i.local).join(", ");
            }
        } catch (e) {
            console.log("Erro ao buscar incêndios:", e);
            mostrarMensagemErro("incendios", "locIncendios", "Erro ao buscar dados de fogos.pt");
        }
    }

    // Tempestades (IPMA)
    async function fetchTempestades() {
        try {
            resetarEstiloElemento("tempestades", "locTempestades");
            
            const res = await fetch('https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/1110600.json');
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const data = await res.json();
            
            if (!data.data || !Array.isArray(data.data)) {
                throw new Error('Formato de dados inválido');
            }
            
            const hojeStr = new Date().toISOString().slice(0, 10);
            const today = data.data.find(d => d.forecastDate === hojeStr);
            
            if (!today) {
                mostrarMensagemSemDados("tempestades", "locTempestades", "tempestades");
            } else if (today.precipitaProb > 70 || today.windSpeed > 40) {
                document.getElementById("tempestades").textContent = "Alerta";
                document.getElementById("locTempestades").textContent = `Lisboa - Precipitação: ${today.precipitaProb}%, Vento: ${today.windSpeed} km/h`;
                
                // Salvar no histórico
                salvarEvento('TEMPESTADES', {
                    tipo: 'Tempestade/Alerta Meteorológico',
                    local: 'Lisboa',
                    precipitacao: today.precipitaProb,
                    vento: today.windSpeed,
                    data: hojeStr
                });
            } else {
                document.getElementById("tempestades").textContent = "Normal";
                document.getElementById("locTempestades").textContent = `Lisboa - Condições normais`;
            }
        } catch (e) {
            console.log("Erro ao buscar tempestades IPMA:", e);
            mostrarMensagemErro("tempestades", "locTempestades", "Erro ao buscar dados meteorológicos");
        }
    }

    async function atualizarPainel() {
        document.getElementById("atualizar").textContent = "Atualizando...";
        document.getElementById("atualizar").disabled = true;
        
        await Promise.all([
            fetchIncendios(),
            fetchSismos(), 
            fetchTempestades()
        ]);
        
        document.getElementById("ultimaAtualizacao").textContent = "Última atualização: " + new Date().toLocaleString("pt-PT");
        document.getElementById("atualizar").textContent = "Atualizar Dados";
        document.getElementById("atualizar").disabled = false;
    }

    function mostrarHistorico() {
        const incendios = obterHistorico('INCENDIOS');
        const sismos = obterHistorico('SISMOS');
        const tempestades = obterHistorico('TEMPESTADES');
        
        const conteudo = document.getElementById('conteudoHistorico');
        
        let html = '<div style="display: flex; gap: 20px; flex-wrap: wrap;">';
        
        // Incêndios
        html += '<div style="flex: 1; min-width: 250px;">';
        html += '<h3 style="color: #c0392b; margin-top: 0;">🔥 Incêndios</h3>';
        if (incendios.length === 0) {
            html += '<p style="color: #6c757d;">Nenhum incêndio registado</p>';
        } else {
            incendios.slice(0, 10).forEach(evento => {
                html += `<div style="background: #fff3cd; padding: 8px; margin: 5px 0; border-radius: 4px; border-left: 4px solid #c0392b;">
                    <strong>${evento.titulo || evento.tipo}</strong><br>
                    <small>${evento.local}</small><br>
                    <small style="color: #6c757d;">${new Date(evento.timestamp).toLocaleString('pt-PT')}</small>
                </div>`;
            });
        }
        html += '</div>';
        
        // Sismos
        html += '<div style="flex: 1; min-width: 250px;">';
        html += '<h3 style="color: #8e44ad; margin-top: 0;">🌍 Sismos</h3>';
        if (sismos.length === 0) {
            html += '<p style="color: #6c757d;">Nenhum sismo registado</p>';
        } else {
            sismos.slice(0, 10).forEach(evento => {
                html += `<div style="background: #e7e3ff; padding: 8px; margin: 5px 0; border-radius: 4px; border-left: 4px solid #8e44ad;">
                    <strong>${evento.tipo}</strong><br>
                    <small>${evento.local} ${evento.magnitude ? `(Mag: ${evento.magnitude})` : ''}</small><br>
                    <small style="color: #6c757d;">${new Date(evento.timestamp).toLocaleString('pt-PT')}</small>
                </div>`;
            });
        }
        html += '</div>';
        
        // Tempestades
        html += '<div style="flex: 1; min-width: 250px;">';
        html += '<h3 style="color: #2980b9; margin-top: 0;">⛈️ Tempestades</h3>';
        if (tempestades.length === 0) {
            html += '<p style="color: #6c757d;">Nenhuma tempestade registada</p>';
        } else {
            tempestades.slice(0, 10).forEach(evento => {
                html += `<div style="background: #cceef9; padding: 8px; margin: 5px 0; border-radius: 4px; border-left: 4px solid #2980b9;">
                    <strong>${evento.tipo}</strong><br>
                    <small>${evento.local}</small><br>
                    ${evento.precipitacao ? `<small>Precipitação: ${evento.precipitacao}%</small><br>` : ''}
                    ${evento.vento ? `<small>Vento: ${evento.vento} km/h</small><br>` : ''}
                    <small style="color: #6c757d;">${new Date(evento.timestamp).toLocaleString('pt-PT')}</small>
                </div>`;
            });
        }
        html += '</div>';
        
        html += '</div>';
        
        if (incendios.length === 0 && sismos.length === 0 && tempestades.length === 0) {
            html = '<p style="text-align: center; color: #6c757d; padding: 40px;">Nenhum evento foi registado ainda. Execute "Atualizar Dados" para começar a guardar o histórico.</p>';
        }
        
        conteudo.innerHTML = html;
        modal.style.display = 'block';
    }

    // Event listeners
    document.getElementById("atualizar").onclick = atualizarPainel;
    document.getElementById("verHistorico").onclick = mostrarHistorico;
    
    document.getElementById("fecharModal").onclick = function() {
        modal.style.display = 'none';
    };
    
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Atualiza ao carregar
    atualizarPainel();
});
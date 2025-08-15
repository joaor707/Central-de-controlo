document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector('.container');
    if (!container) return;

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

    // Sismos (dados locais)
    async function fetchSismos() {
        try {
            const res = await fetch('./eventos.json');
            const eventos = await res.json();
            const sismos = eventos.filter(evento => evento.tipo === 'sismo');
            document.getElementById("terremotos").textContent = sismos.length;
            document.getElementById("locTerremotos").textContent = sismos.map(s => s.local).join(", ") || 'Nenhuma';
        } catch (e) {
            document.getElementById("terremotos").textContent = "Erro";
            document.getElementById("locTerremotos").textContent = "Erro ao buscar";
        }
    }

    // Incêndios (dados locais)
    async function fetchIncendios() {
        try {
            const res = await fetch('./eventos.json');
            const eventos = await res.json();
            const incendios = eventos.filter(evento => evento.tipo === 'incendio');
            document.getElementById("incendios").textContent = incendios.length;
            document.getElementById("locIncendios").textContent = incendios.map(i => i.local).join(", ") || 'Nenhuma';
        } catch (e) {
            document.getElementById("incendios").textContent = "Erro";
            document.getElementById("locIncendios").textContent = "Erro ao buscar";
        }
    }

    // Tempestades (dados locais)
    async function fetchTempestades() {
        try {
            const res = await fetch('./eventos.json');
            const eventos = await res.json();
            const tempestades = eventos.filter(evento => evento.tipo === 'tempestade');
            document.getElementById("tempestades").textContent = tempestades.length;
            document.getElementById("locTempestades").textContent = tempestades.map(t => t.local).join(", ") || 'Nenhuma';
        } catch (e) {
            document.getElementById("tempestades").textContent = "Erro";
            document.getElementById("locTempestades").textContent = "Erro ao buscar";
        }
    }

    async function atualizarPainel() {
        fetchIncendios();
        fetchSismos();
        fetchTempestades();
        document.getElementById("ultimaAtualizacao").textContent = "Última atualização: " + new Date().toLocaleString("pt-PT");
    }

    document.getElementById("atualizar").onclick = atualizarPainel;

    // Atualiza ao carregar
    atualizarPainel();
});
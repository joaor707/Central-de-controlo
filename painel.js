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

    // Sismos (IPMA, dados reais)
    async function fetchSismos() {
        try {
            const res = await fetch('https://www.ipma.pt/resources.www/geofisica/sismicidade/catalogo_sismico.json');
            const data = await res.json();
            const hoje = new Date();
            const ultimos24h = data.filter(sismo => {
                const sismoData = new Date(sismo.data);
                return (hoje - sismoData) < 1000 * 60 * 60 * 24;
            });
            document.getElementById("terremotos").textContent = ultimos24h.length;
            document.getElementById("locTerremotos").textContent = ultimos24h.map(s => s.local).join(", ") || 'Nenhuma';
        } catch (e) {
            document.getElementById("terremotos").textContent = "Erro";
            document.getElementById("locTerremotos").textContent = "Erro ao buscar";
        }
    }

    // Incêndios (Fogos.pt via proxy/backend)
    async function fetchIncendios() {
        try {
            // Exemplo: troque a URL pelo endpoint do seu proxy
            // const res = await fetch('https://SEU_PROXY/fires');
            // const data = await res.json();
            // const ativos = data.length;
            // const locais = data.map(f => f.local).join(", ");
            // document.getElementById("incendios").textContent = ativos;
            // document.getElementById("locIncendios").textContent = locais || 'Nenhuma';

            // Exibe mensagem de instrução caso não haja proxy configurado
            document.getElementById("incendios").textContent = "Indisponível*";
            document.getElementById("locIncendios").textContent = "Configurar proxy/API";
        } catch (e) {
            document.getElementById("incendios").textContent = "Erro";
            document.getElementById("locIncendios").textContent = "Erro ao buscar";
        }
    }

    // Tempestades (IPMA via proxy/backend)
    async function fetchTempestades() {
        try {
            // Exemplo: troque a URL pelo endpoint do seu proxy
            // const res = await fetch('https://SEU_PROXY/tempestades');
            // const data = await res.json();
            // document.getElementById("tempestades").textContent = data.estado;
            // document.getElementById("locTempestades").textContent = data.locais;

            document.getElementById("tempestades").textContent = "Indisponível*";
            document.getElementById("locTempestades").textContent = "Configurar proxy/API";
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
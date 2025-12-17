const STORAGE_KEY = "smartplants_data";

function getData() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { colecoes: [], plantas: [], eventos: [] }; 
}

function showPopup(message, duration = 1500) {
    const popup = document.getElementById("popup");
    if (!popup) return;

    popup.textContent = message;
    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show");
    }, duration);
}

function getPlantIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function capitalizeFirst(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatarDias(dias) {
    if (!dias || !Array.isArray(dias) || dias.length === 0) return "N/A";

    const nomes = dias.map(dia => {
        switch (dia.toLowerCase()) {
            case "segunda": return "segunda-feira";
            case "terca": return "terça-feira";
            case "quarta": return "quarta-feira";
            case "quinta": return "quinta-feira";
            case "sexta": return "sexta-feira";
            case "sabado": return "sábado";
            case "domingo": return "domingo";
            default: return dia;
        }
    });

    if (nomes.length === 1) return capitalizeFirst(nomes[0]);
    if (nomes.length === 2) return `${capitalizeFirst(nomes[0])} e ${nomes[1]}`;
    return capitalizeFirst(nomes.slice(0, -1).join(", ")) + " e " + nomes[nomes.length - 1];
}

function renderPlant(plantId) {
    const data = getData();
    const plant = data.plantas.find(p => p.id === plantId);

    if (!plant) {
        showPopup("❌ Planta não encontrada. A voltar à coleção.");
        setTimeout(() => window.location.href = "colecoes.html", 1000); 
        return;
    }

    const tipoRega = plant.tipoRega
        ? (plant.tipoRega === "automatica" ? "Automática" : "Manual")
        : "Não definido";

    const frequencia = (plant.tipoRega === "automatica" && plant.diasRega && plant.diasRega.length > 0)
        ? formatarDias(plant.diasRega) + (plant.horaRega ? ` às ${plant.horaRega}` : "")
        : (plant.tipoRega === "automatica" ? "Por configurar" : "N/A");

    document.getElementById("plantName").textContent = ` ${plant.nome}` || "Planta";
    document.getElementById("plantTitle").textContent = `🌿 ${plant.nome}` || "Planta";

    document.getElementById("plantType").innerHTML =`<strong><iconify-icon icon="mdi:flower-outline" width="25" height="25" style="vertical-align: -5px; margin-left: -4px" ></iconify-icon> Espécie:</strong> ${plant.especie || "Desconhecido"}`;
    const dataFormatada = plant.dataPlant ? new Date(plant.dataPlant).toLocaleDateString("pt-PT") : "Sem data";
    document.getElementById("plantDate").innerHTML = `<strong><iconify-icon icon="uiw:date" style="vertical-align: -2px; "></iconify-icon> Data de Plantação:</strong> ${dataFormatada}`; 
    document.getElementById("plantWaterType").innerHTML = `<strong><iconify-icon icon="solar:waterdrops-bold-duotone" width="30" height="30" style="vertical-align: -5px; margin-left: -5px"></iconify-icon> Tipo de Rega:</strong> ${tipoRega}`;
    document.getElementById("plantFrequency").innerHTML = `<strong><iconify-icon icon="mdi:repeat" width="25" height="25" style="vertical-align: -5px; margin-left: -2px"></iconify-icon> Frequência da Rega:</strong> ${frequencia}`;

    const img = document.getElementById("plantImage");
    const imgContainer = img.parentElement; 
    const existingPlaceholder = imgContainer.querySelector('.placeholder-icon');
    if(existingPlaceholder) existingPlaceholder.remove();

    if (plant.imagem && plant.imagem.trim() !== "") {
        img.style.display = "block";
        img.src = plant.imagem;
        img.style.width = "100%";
        img.style.height = "350px"; 
        img.style.objectFit = "cover";
        img.style.borderRadius = "20px";
        
    } else {
        img.style.display = "none";
        
        const placeholder = document.createElement("div");
        placeholder.className = "placeholder-icon";

        placeholder.style.cssText = `
            width: 100%; 
            height: 350px; 
            background: #e8f5e9; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border-radius: 20px; /* Cantos arredondados, mas não circular */
            margin: 0 auto;
            box-shadow: inset 0 0 0 2px #c8e6c9; /* Borda interna subtil */
        `;
        placeholder.innerHTML = `<iconify-icon icon="solar:leaf-bold" style="font-size:120px; color:#a5d6a7;"></iconify-icon>`;
        imgContainer.appendChild(placeholder);
    }

    const agua = Math.min(100, plant.nivelAgua || 60);
    const luz = Math.min(100, plant.nivelLuz || 80);
    const fert = Math.min(100, plant.nivelFert || 30);
    
    const niveis = [
        { id: "agua", valor: agua },
        { id: "luz", valor: luz },
        { id: "fert", valor: fert }
    ];

    setTimeout(() => {
        niveis.forEach(({ id, valor }) => {
            const bar = document.getElementById(`${id}Nivel`);
            if(bar) bar.style.width = valor + "%";
            
            const indicador = document.getElementById(`${id}Indicador`);
            if (indicador) {
                indicador.style.left = valor + "%";
                const percentagemSpan = indicador.querySelector('.percentagem');
                if (percentagemSpan) {
                    percentagemSpan.textContent = `${valor}%`;
                }
            }
        });
    }, 200);

    document.getElementById("linkRega").href = `programar_rega.html?id=${plant.id}`;
    document.getElementById("linkDiario").href = `diario_verde.html?id=${plant.id}`;

    const linkEditar = document.getElementById("linkEditarPlanta");
    if (linkEditar) {
        linkEditar.href = `add_planta.html?id=${plant.id}`; 
    }
    
    return plant.colecaoId; 
}

function setupNavigation(colecaoId) {
    const gear = document.querySelector(".icon");
    if (gear) gear.addEventListener("click", () => showPopup("⚙️ Em breve: definições da aplicação!", 2000));

    const btnVoltar = document.getElementById("btnVoltar");
    if (btnVoltar) {
        btnVoltar.addEventListener("click", () => {
            const target = colecaoId ? `colecao.html?id=${colecaoId}` : "colecoes.html";
            window.location.href = target;
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const plantId = getPlantIdFromURL();

    document.body.style.opacity = 1;
    
    if (!plantId) {
        showPopup("Planta não especificada — a voltar à coleção.", 2000);
        setTimeout(() => window.location.href = "colecoes.html", 1000);
        return;
    }

    const colecaoId = renderPlant(plantId);
    setupNavigation(colecaoId); 
});
const STORAGE_KEY = "smartplants_data";

function getData() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { colecoes: [], plantas: [], eventos: [] };
}

function saveData(data) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

function getColecaoIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("colecao") || params.get("id"); 
}

function atualizarBotaoRemover() {
    const btn = document.getElementById("remover-selecionadas");
    if (!btn) return;
    const selecionados = document.querySelectorAll(".planta-checkbox:checked").length;
    if (selecionados === 0) {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
    } else {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
    }
}

function renderPlantas(colecaoId, filtro = "") {
    const container = document.querySelector(".plantas");
    const data = getData();
    const colecao = data.colecoes.find(c => c.id === colecaoId);

    container.innerHTML = "";

    if (!colecao) {
        container.innerHTML = "<p>🔎 Coleção não encontrada.</p>";
        return;
    }

    let plantasLista = data.plantas.filter(p => p.colecaoId === colecaoId);

    if (filtro) {
        const term = filtro.toLowerCase();
        plantasLista = plantasLista.filter(p => (p.nome || "").toLowerCase().includes(term));
    }

    if (plantasLista.length === 0) {
        container.innerHTML = "<p>🌿 Nenhuma planta encontrada </p>";
        atualizarBotaoRemover();
        return;
    }

    plantasLista.forEach(planta => {
        const wrapper = document.createElement("div");
        wrapper.className = "planta-wrapper";

        const article = document.createElement("article");
        article.className = "planta";
        article.style.display = "flex";
        article.style.alignItems = "center";

        const divImg = document.createElement("div");
        divImg.className = "plant-img-container";
        divImg.style.width = "160px";  
        divImg.style.height = "160px";
        divImg.style.minWidth = "160px"; 
        divImg.style.marginRight = "20px";

        if (planta.imagem && planta.imagem.trim() !== "") {
            divImg.innerHTML = `<img src="${planta.imagem}" alt="${planta.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px; border: 2px solid #2f4f4f; box-sizing: border-box; display: block;">`;
        } else {
            divImg.innerHTML = `
                <div style="
                    width: 100%; 
                    height: 100%; 
                    background: #e8f5e9; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    border-radius: 15px; 
                    box-shadow: inset 0 0 0 2px #c8e6c9; 
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                ">
                    <iconify-icon icon="solar:leaf-bold" style="font-size:60px; color:#a5d6a7;"></iconify-icon>
                </div>
            `;
        }

        const info = document.createElement("div");
        info.className = "plant-info";
        info.style.flex = "1"; 

        const h3 = document.createElement("h3");
        h3.textContent = planta.nome || "Sem nome";

        const especie = document.createElement("p");
        especie.innerHTML = `<strong>${planta.especie || "-"}</strong>`;

        const dataPlant = document.createElement("p");
        if (planta.dataPlant) {
            const dataFormatada = new Date(planta.dataPlant).toLocaleDateString("pt-PT", {
                day: "2-digit", month: "2-digit", year: "numeric"
            });
            dataPlant.innerHTML = `<iconify-icon icon="uiw:date" style="vertical-align: -2px; color: rgba(51, 183, 64, 1);"></iconify-icon> Plantada em <strong>${dataFormatada}</strong>`;
        }

        const rega = document.createElement("p");
        rega.innerHTML = `💧 Rega <strong>${planta.tipoRega || "manual"}</strong>`;

        info.appendChild(h3);
        info.appendChild(especie);
        if (planta.dataPlant) info.appendChild(dataPlant);
        info.appendChild(rega);

        article.appendChild(divImg);
        article.appendChild(info);

        const label = document.createElement("label");
        label.className = "checkbox-container";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = planta.id; 

        checkbox.className = "planta-checkbox"; 
        
        const span = document.createElement("span");
        span.className = "checkmark";
        label.appendChild(checkbox);
        label.appendChild(span);

        wrapper.appendChild(article);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    });
    
    atualizarBotaoRemover();
}

function handleRemoveSelected(colecaoId) {
    const checked = Array.from(document.querySelectorAll(".plantas .checkbox-container input:checked"));
    if (checked.length === 0) {
        showPopup("❗ Seleciona pelo menos uma planta para remover.");
        return;
    }

    const idsToRemove = checked.map(cb => cb.value);
    const data = getData();

    data.plantas = data.plantas.filter(p => !idsToRemove.includes(p.id));

    saveData(data);
    showPopup("🗑️ Plantas removidas com sucesso!");
    setTimeout(() => window.location.href = `colecao.html?id=${colecaoId}`, 1000);
}

function setupSearch(colecaoId) {
    const input = document.getElementById("searchInput");
    if (!input) return;
    input.addEventListener("input", (e) => {
        renderPlantas(colecaoId, e.target.value);
    });
}

function setupIcon() {
    const gear = document.querySelector(".icon");
    if (gear) gear.addEventListener("click", () => showPopup("⚙️ Em breve: definições da aplicação!"));
}

document.addEventListener("DOMContentLoaded", () => {
    setupIcon();

    const colecaoId = getColecaoIdFromURL();
    if (!colecaoId) {
        showPopup("❌ Coleção não identificada — a voltar para coleções.", 2000);
        setTimeout(() => window.location.href = "colecoes.html", 1000);
        return;
    }

    const data = getData();
    const colecao = data.colecoes.find(c => c.id === colecaoId);
    const nomeColecao = colecao ? colecao.nome : "Coleção";
    const pageTitle = document.getElementById("pageTitle"); 
    
    if (pageTitle) {
        pageTitle.innerHTML = `
            <iconify-icon icon="tabler:trash" width="80" height="80" style="vertical-align: -20px; margin-right: 10px; color: #2f4f4f;"></iconify-icon>
            Remover Plantas de ${nomeColecao} 
        `;
        pageTitle.style.display = "flex";
        pageTitle.style.alignItems = "center";
        pageTitle.style.justifyContent = "center";
    }

    renderPlantas(colecaoId);
    setupSearch(colecaoId);

    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('planta-checkbox')) {
        const plantaDiv = e.target.closest('.planta-wrapper').querySelector('.planta');

        if (e.target.checked) {
          plantaDiv.classList.add('selected');
        } else {
          plantaDiv.classList.remove('selected');
        }

        atualizarBotaoRemover();
      }
    });

    document.body.style.opacity = 1;
    const btnCancel = document.getElementById("cancelar");
    if (btnCancel) {
        btnCancel.addEventListener("click", () => {
            showPopup("❌ Cancelado");
            setTimeout(() => window.location.href = `colecao.html?id=${colecaoId}`, 1000);
        });
    }

    const btnRemove = document.getElementById("remover-selecionadas");
    if (btnRemove) {
        atualizarBotaoRemover();
        
        btnRemove.addEventListener("click", () => handleRemoveSelected(colecaoId));
    }
});
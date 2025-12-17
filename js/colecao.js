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

function getColecaoId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function renderNomeColecao(col) {
    const title = document.getElementById("colecaoNome");
    title.textContent = col ? col.nome : "Coleção Inválida"; 
}

function renderPlantas(lista) {
    const container = document.getElementById("plantasContainer");
    container.innerHTML = "";

    if (!lista || lista.length === 0) {
        container.innerHTML = "<p class='sem-colecoes' id='msg-colecao-vazia'>🌿 Esta coleção ainda não tem plantas</p>";
        return;
    }

    lista.forEach(planta => {
        const link = document.createElement("a");
        link.href = `planta.html?id=${planta.id}`;
        link.classList.add("colecao-link");

        const article = document.createElement("article");
        article.classList.add("planta");

        const divImg = document.createElement("div");
        divImg.classList.add("plant-img-container");

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
        info.classList.add("plant-info");

        info.style.flex = "1"; 

        const h3 = document.createElement("h3");
        h3.textContent = planta.nome || "Sem nome";

        const especie = document.createElement("p");
        especie.innerHTML = `<strong>${planta.especie || "-"}</strong>`;

        const dataP = document.createElement("p");
        if (planta.dataPlant) {
            const dataFormatada = new Date(planta.dataPlant).toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
            dataP.innerHTML = `<iconify-icon icon="uiw:date" style="vertical-align: -2px; color: rgba(51, 183, 64, 1);" ></iconify-icon> Plantada em <strong>${dataFormatada}</strong>`;
        }

        const rega = document.createElement("p");
        rega.innerHTML = `<iconify-icon icon="mdi:watering-can-outline" width="25" height="25" style="vertical-align: -2px; color: #2d8bc9ff;" ></iconify-icon> Rega <strong>${planta.tipoRega || "manual"}</strong>`;

        info.appendChild(h3);
        info.appendChild(especie);
        if (planta.dataPlant) info.appendChild(dataP);
        info.appendChild(rega);

        article.style.display = "flex";
        article.style.alignItems = "center";
        
        article.appendChild(divImg);
        article.appendChild(info);
        link.appendChild(article);
        container.appendChild(link);
    });

    const msgFiltro = document.getElementById("filtro-vazio-msg");
    if (msgFiltro) msgFiltro.remove(); 
}

function setupSearch(plantas) {
    const input = document.getElementById("searchInput");
    const container = document.getElementById("plantasContainer"); 

    if (!input || !container) return;

    const mensagemId = 'filtro-vazio-msg';

    input.addEventListener("input", () => {
        const term = input.value.toLowerCase().trim();
        const filtradas = plantas.filter(p => p.nome.toLowerCase().includes(term));

        renderPlantas(filtradas); 

        let mensagem = document.getElementById(mensagemId);

        if (filtradas.length === 0 && term.length > 0) {

            if (!mensagem) {
                mensagem = document.createElement('p');
                mensagem.id = mensagemId;
                mensagem.classList.add('sem-colecoes'); 
            }
            mensagem.textContent = `Nenhuma planta encontrada para "${term}".`;

            container.innerHTML = ""; 
            container.appendChild(mensagem); 
            mensagem.style.display = 'block';

        } else {
            if (mensagem) {
                mensagem.remove();
            }
        }
    });
}

function setupButtons(colecaoId, plantas) {
    document.getElementById("btnAdd")?.addEventListener("click", () => {
        window.location.href = `add_planta.html?colecao=${colecaoId}`;
    });

    const btnRemove = document.getElementById("btnRemove");

    if (btnRemove) {
        btnRemove.addEventListener("click", (e) => {
            if (plantas.length === 0) {
                e.preventDefault(); 
                showPopup("❌ Esta coleção não tem plantas para remover!", 2500);
            } else {
                window.location.href = `remove_planta.html?colecao=${colecaoId}`;
            }
        });
    }

    const linkEditar = document.getElementById("linkEditarColecao");
    
    if (linkEditar) {
        linkEditar.removeAttribute('href'); 
        linkEditar.href = `add_colecao.html?id=${colecaoId}`; 
    }
}

function setupIcon() {
    const gear = document.querySelector(".icon");
    if (gear) {
        gear.addEventListener("click", () => {
            showPopup("⚙️ Em breve: definições da aplicação!");
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {

    document.body.style.opacity = 1;

    setupIcon(); 

    const id = getColecaoId();
    const data = getData();
    const colecao = data.colecoes.find(c => c.id === id);

    if (!colecao) {
        showPopup("Coleção não encontrada! Redirecionando...", 3000); 
        setTimeout(() => {
            window.location.href = "colecoes.html";
        }, 500);
        renderNomeColecao(null); 
        return;
    }

    renderNomeColecao(colecao);
    
    const plantas = data.plantas.filter(p => p.colecaoId === id);

    renderPlantas(plantas);
    setupSearch(plantas);
    
    setupButtons(id, plantas); 
});
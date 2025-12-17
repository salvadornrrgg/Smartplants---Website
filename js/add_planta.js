const STORAGE_KEY = "smartplants_data";
const TEMP_FORM_KEY = "temp_plant_form"; 
const TEMP_WATERING_KEY = "temp_watering_schedule"; 

let currentImageBase64 = null; 

function getData() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { colecoes: [], plantas: [], eventos: [] }; 
}

function saveData(data) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        colecaoId: params.get("colecao"),
        plantaId: params.get("id")
    };
}

function showPopup(message, duration = 2000) {
    let popup = document.getElementById("popup");
    if (!popup) {
        popup = document.createElement("div");
        popup.id = "popup";
        popup.style.position = "fixed";
        popup.style.top = "20px";
        popup.style.left = "50%";
        popup.style.transform = "translateX(-50%)";
        popup.style.background = "#2a7a2a";
        popup.style.color = "white";
        popup.style.padding = "10px 20px";
        popup.style.borderRadius = "5px";
        popup.style.display = "none";
        popup.style.zIndex = 1000;
        document.body.appendChild(popup);
    }
    popup.textContent = message;
    popup.style.display = "block";
    popup.style.opacity = 0;
    popup.style.transition = "opacity 0.5s";

    setTimeout(() => { popup.style.opacity = 1; }, 50);
    setTimeout(() => {
        popup.style.opacity = 0;
        setTimeout(() => { popup.style.display = "none"; }, 500);
    }, duration);
}

function setupIcon() {
    const gear = document.querySelector(".icon");
    if (gear) {
        gear.addEventListener("click", () => showPopup("⚙️ Em breve: definições da aplicação!"));
    }
}

function renderTitulo(modo, nomeColecao) {
    const tituloBase = modo === 'edit' ? "Editar Planta" : "Adicionar Planta";
    document.title = nomeColecao ? `${nomeColecao} - ${tituloBase}` : tituloBase;
    const h2Titulo = document.getElementById("tituloAdd");
    
    if (h2Titulo) {
        h2Titulo.innerHTML = modo === 'edit' ? `✏️ ${tituloBase}` : `<iconify-icon icon="mingcute:add-fill" style="color: #2f4f4f; vertical-align: -4px;"></iconify-icon> ${tituloBase}`;
    }
    const addBtnSpan = document.getElementById("addBtn").querySelector('span');
    if(addBtnSpan) {
        addBtnSpan.textContent = modo === 'edit' ? 'Guardar' : 'Adicionar';
    }
}

function setupImagePreview(initialImageUrl = null) {
    const input = document.getElementById("capa");
    const box = document.getElementById("fileBox");
    const plusIcon = box.querySelector(".plus");

    if (initialImageUrl) {
        currentImageBase64 = initialImageUrl; 
        
        box.style.backgroundImage = `url('${initialImageUrl}')`;
        box.style.backgroundSize = "cover";
        box.style.backgroundPosition = "center";
        if (plusIcon) plusIcon.style.display = "none";
    } else {
        box.style.backgroundImage = "";
        currentImageBase64 = null; 
        if (plusIcon) plusIcon.style.display = "block";
    }

    input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                currentImageBase64 = ev.target.result; 
                
                box.style.backgroundImage = `url('${currentImageBase64}')`;
                box.style.backgroundSize = "cover";
                box.style.backgroundPosition = "center";
                if (plusIcon) plusIcon.style.display = "none";
            };
            reader.readAsDataURL(file);
        } else {
            box.style.backgroundImage = initialImageUrl ? `url('${initialImageUrl}')` : "";
            currentImageBase64 = initialImageUrl || null;
            if (plusIcon) plusIcon.style.display = initialImageUrl ? "none" : "block";
        }
    });
}

function saveTemporaryFormState(colecaoId, plantaId, isEditing) {
    const form = document.getElementById("plantForm");
    const formState = {
        colecaoId: colecaoId,
        plantaId: plantaId,
        isEditing: isEditing,
        nome: form.name.value,
        especie: form.species.value,
        dataPlant: form.date.value,
        tipoRega: form.watering.value,
        imagem: currentImageBase64
    };
    sessionStorage.setItem(TEMP_FORM_KEY, JSON.stringify(formState));
}

function restoreTemporaryFormState(isEditing, plantaExistente) {
    const tempStateRaw = sessionStorage.getItem(TEMP_FORM_KEY);
    const tempScheduleRaw = sessionStorage.getItem(TEMP_WATERING_KEY);
    const form = document.getElementById("plantForm");

    if (tempStateRaw) {
        const tempState = JSON.parse(tempStateRaw);

        form.name.value = tempState.nome;
        form.species.value = tempState.especie;
        form.date.value = tempState.dataPlant;
        form.watering.value = tempState.tipoRega;

        if (tempState.imagem) {
            currentImageBase64 = tempState.imagem;
            const box = document.getElementById("fileBox");
            const plusIcon = box.querySelector(".plus");
            box.style.backgroundImage = `url('${tempState.imagem}')`;
            box.style.backgroundSize = "cover";
            box.style.backgroundPosition = "center";
            if (plusIcon) plusIcon.style.display = "none";
        }
        
        

        sessionStorage.removeItem(TEMP_FORM_KEY);
        return true;
    }
    return false;
}

function setupWateringMessage(plantaExistente, colecaoId, isEditing) { 
    const select = document.getElementById("watering");
    const actionBox = document.getElementById("programmingAction"); 
    const infoBox = document.getElementById("wateringInfo"); 

    if (!actionBox || !infoBox) return;

    function updateMessage() {
        actionBox.innerHTML = "";   
        infoBox.innerHTML = "";     
        const tipoRega = select.value;

        actionBox.style.display = 'none'; 
        infoBox.style.display = 'block'; 

        if (tipoRega === "automatica") {

            infoBox.innerHTML = `<p>💧 A Rega Automática requer que os dias sejam programados</p>`;

            const targetUrl = isEditing 
                ? `programar_rega.html?id=${plantaExistente.id}` 
                : `programar_rega.html?colecao=${colecaoId}&isNew=true`; 
            
            const programLink = document.createElement('a');
            programLink.href = "#"; 
            programLink.innerHTML = `
                <button class="btn-rega">
                    <iconify-icon icon="mdi:watering-can-outline" width="60" height="50"></iconify-icon>
                    <span>Programar Rega</span>
                </button>
            `;

            programLink.querySelector('button').onclick = (e) => {
                e.preventDefault();
                saveTemporaryFormState(colecaoId, plantaExistente ? plantaExistente.id : null, isEditing); 
                window.location.href = targetUrl;
            };
            
            actionBox.appendChild(programLink);
            actionBox.style.display = 'block'; 
            
        } else if (tipoRega === "manual") {
            infoBox.innerHTML = `<p>💧 Você será responsável por regar a planta manualmente</p>`;
            actionBox.style.display = 'none'; 
        } else {
            infoBox.innerHTML = "";
            actionBox.style.display = 'none';
        }
    }

    select.addEventListener("change", updateMessage);
    updateMessage();
}

function handlePlantaSubmission(plantaExistente, colecaoId, plantaIndex) {
    const data = getData();
    const form = document.getElementById("plantForm");

    const nome = form.name.value.trim();
    const especie = form.species.value.trim();
    const dataPlant = form.date.value;
    const tipoRega = form.watering.value;
    
    if (!nome || !especie || !dataPlant || !tipoRega) {
        showPopup("⚠️ Preenche todos os campos obrigatórios", 1500);
        return;
    }
    
    let imagemASalvar = currentImageBase64 || ""; 
    
    if (plantaExistente && !imagemASalvar) {
        imagemASalvar = plantaExistente.imagem || ""; 
    }

    const tempScheduleRaw = sessionStorage.getItem(TEMP_WATERING_KEY);
    let tempSchedule = tempScheduleRaw ? JSON.parse(tempScheduleRaw) : { tipoRega: tipoRega, diasRega: [], horaRega: null };
    
    let plantaFinal;
    let targetUrl;

    if (plantaExistente) {
        if (plantaIndex !== -1) {
            data.plantas[plantaIndex].nome = nome;
            data.plantas[plantaIndex].especie = especie;
            data.plantas[plantaIndex].dataPlant = dataPlant;
            data.plantas[plantaIndex].tipoRega = tipoRega;
            data.plantas[plantaIndex].imagem = imagemASalvar;
            
            if (tempSchedule) {
                data.plantas[plantaIndex].tipoRega = tempSchedule.tipoRega; 
                data.plantas[plantaIndex].diasRega = tempSchedule.diasRega;
                data.plantas[plantaIndex].horaRega = tempSchedule.horaRega;
            }
            
            plantaFinal = data.plantas[plantaIndex];
        } else {
            plantaFinal = plantaExistente;
        }
        
        saveData(data); 
        sessionStorage.removeItem(TEMP_WATERING_KEY);
        sessionStorage.removeItem(TEMP_FORM_KEY); 
        
        showPopup(`✏️ Planta "${nome}" guardada com sucesso!`, 1500);
        targetUrl = `planta.html?id=${plantaFinal.id}`;
        
    } else {
        const plantaId = "pl_" + Date.now();
        plantaFinal = {
            id: plantaId,
            nome,
            especie,
            dataPlant,
            tipoRega: tempSchedule.tipoRega, 
            imagem: imagemASalvar, 
            colecaoId,
            diasRega: tempSchedule.diasRega, 
            horaRega: tempSchedule.horaRega 
        };
        
        data.plantas.push(plantaFinal);
        const colecao = data.colecoes.find(c => c.id === colecaoId);
        if (colecao) {
            if (!colecao.plantas) colecao.plantas = [];
            colecao.plantas.push(plantaId); 
        } else {
             showPopup("❌ Erro: Coleção de destino não encontrada!", 2000);
             return;
        }

        saveData(data);
        sessionStorage.removeItem(TEMP_WATERING_KEY);
        sessionStorage.removeItem(TEMP_FORM_KEY); 
        showPopup(`✅ Planta "${nome}" adicionada com sucesso!`, 1500);
        targetUrl = `colecao.html?id=${colecaoId}`;
    }

    setTimeout(() => {
        window.location.href = targetUrl;
    }, 1000);
}

function setupAddBtnListener(plantaExistente, colecaoId, plantaIndex) {
    const addBtn = document.getElementById("addBtn");
    
    addBtn.removeEventListener("click", addBtn.listener); 

    addBtn.listener = () => handlePlantaSubmission(plantaExistente, colecaoId, plantaIndex);
    addBtn.addEventListener("click", addBtn.listener);
}

function setupCancel(colecaoId, plantaExistente) {
    document.getElementById("cancelBtn").addEventListener("click", () => {
        sessionStorage.removeItem(TEMP_FORM_KEY); 
        sessionStorage.removeItem(TEMP_WATERING_KEY); 
        
        showPopup("❌ Cancelado", 1500);
        const targetUrl = plantaExistente ? `planta.html?id=${plantaExistente.id}` : `colecao.html?id=${colecaoId}`;
        setTimeout(() => window.location.href = targetUrl, 1000);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupIcon();
    document.body.style.opacity = 1;

    const hoje = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("date");
    if (dateInput) {
        dateInput.setAttribute("max", hoje);
    }
    
    const { colecaoId, plantaId } = getUrlParams();
    const data = getData();
    const form = document.getElementById("plantForm");

    let plantaExistente = null; 
    let plantaIndex = -1; 
    let modo = 'add'; 
    let idDaColecao;
    let initialImage = null;

    if (plantaId) {
        plantaIndex = data.plantas.findIndex(p => p.id === plantaId);
        if (plantaIndex !== -1) {
            plantaExistente = data.plantas[plantaIndex];
            modo = 'edit';
            idDaColecao = plantaExistente.colecaoId;
            initialImage = plantaExistente.imagem; 
            
            form.name.value = plantaExistente.nome;
            form.species.value = plantaExistente.especie;
            form.date.value = plantaExistente.dataPlant;
            form.watering.value = plantaExistente.tipoRega;
        }
    } else if (colecaoId) {
        idDaColecao = colecaoId;
    } else {
        showPopup("❌ URL inválida!", 2000);
        setTimeout(() => window.location.href = "colecoes.html", 1000);
        return;
    }
    
    const wasRestored = restoreTemporaryFormState(modo === 'edit', plantaExistente);
    
    if (!wasRestored) {
        setupImagePreview(initialImage);
    }

    setupWateringMessage(plantaExistente, idDaColecao, modo === 'edit'); 

    const colecao = data.colecoes.find(c => c.id === idDaColecao);
    const nomeColecao = colecao ? colecao.nome : "Coleção Desconhecida";

    renderTitulo(modo, nomeColecao); 
    setupAddBtnListener(plantaExistente, idDaColecao, plantaIndex); 
    setupCancel(idDaColecao, plantaExistente);
});
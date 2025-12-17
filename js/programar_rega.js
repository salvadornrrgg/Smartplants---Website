const STORAGE_KEY = "smartplants_data";
const TEMP_WATERING_KEY = "temp_watering_schedule"; 

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

function getPlantIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function setupTipoRega() {
    const radios = document.querySelectorAll('input[name="tipoRega"]');
    const infoRega = document.querySelector(".info-rega");

    function atualizarVisibilidade() {
        const selecionado = document.querySelector('input[name="tipoRega"]:checked').value;
        infoRega.style.display = selecionado === "automatica" ? "flex" : "none"; 
    }

    atualizarVisibilidade(); 
    radios.forEach(radio => radio.addEventListener("change", atualizarVisibilidade));
}

function carregarConfiguracao(plantId) {
    const urlParams = new URLSearchParams(window.location.search);
    const isNew = urlParams.get('isNew') === 'true';

    let scheduleData = null;
    let initialType = 'manual';
    const tempScheduleRaw = sessionStorage.getItem(TEMP_WATERING_KEY);
    if (tempScheduleRaw) {
        scheduleData = JSON.parse(tempScheduleRaw);
    } else if (plantId && !isNew) {

        const data = getData();
        const plant = data.plantas.find(p => p.id === plantId);
        if (plant) {
            scheduleData = plant;
        }
    } else {
        const tempFormRaw = sessionStorage.getItem('temp_plant_form'); 
        if (tempFormRaw) {
            const tempForm = JSON.parse(tempFormRaw);
            initialType = tempForm.tipoRega || 'manual';
        }
    }
    
    const radioManual = document.querySelector('input[value="manual"]');
    const radioAuto = document.querySelector('input[value="automatica"]');
    const infoRega = document.querySelector(".info-rega");
    const finalType = (scheduleData && scheduleData.tipoRega) ? scheduleData.tipoRega : initialType;

    if (finalType === "automatica") {
        if (radioAuto) radioAuto.checked = true;
        if (infoRega) infoRega.style.display = "flex";

        if (scheduleData && scheduleData.diasRega) {
            scheduleData.diasRega.forEach(dia => {
                const checkbox = document.querySelector(`.dias-semana input[value="${dia}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        if (scheduleData && scheduleData.horaRega) {
            document.querySelector('input[name="hora-rega"]').value = scheduleData.horaRega;
        }
    } else {
        if (radioManual) radioManual.checked = true;
        if (infoRega) infoRega.style.display = "none";
    }
}


function setupSalvarRega() {
    const btnSalvar = document.querySelector(".btn-add");
    if (!btnSalvar) return;

    btnSalvar.addEventListener("click", (e) => {
        e.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const plantId = urlParams.get('id');
        const colecaoId = urlParams.get('colecao');
        
        const tipoSelecionado = document.querySelector('input[name="tipoRega"]:checked').value;
        let diasSelecionados = [];
        let hora = null;

        if (tipoSelecionado === "automatica") {
            diasSelecionados = Array.from(document.querySelectorAll(".dias-semana input:checked")).map(i => i.value);
            hora = document.querySelector('input[name="hora-rega"]').value;

            if (diasSelecionados.length === 0 || !hora) {
                showPopup("❗ Selecione pelo menos um dia e a hora para a rega automática", 2500);
                return; 
            }
        }
        
        const scheduleData = { 
            tipoRega: tipoSelecionado, 
            diasRega: diasSelecionados, 
            horaRega: hora
        };
        
        let redirectUrl;
        const cameFromDetailsPage = plantId && !sessionStorage.getItem('temp_plant_form');

        if (cameFromDetailsPage) {
            const data = getData();
            const plantIndex = data.plantas.findIndex(p => p.id === plantId);

            if (plantIndex !== -1) {
                data.plantas[plantIndex].tipoRega = scheduleData.tipoRega;
                data.plantas[plantIndex].diasRega = scheduleData.diasRega;
                data.plantas[plantIndex].horaRega = scheduleData.horaRega;
                saveData(data); 

                sessionStorage.removeItem(TEMP_WATERING_KEY); 
                showPopup(`💧 Programação de rega atualizada e guardada!`);
                
                redirectUrl = `planta.html?id=${plantId}`; 
            } else {
                showPopup("❗ Erro ao encontrar planta", 1500);
                redirectUrl = `add_planta.html?id=${plantId}`;
            }

        } else {
            sessionStorage.setItem(TEMP_WATERING_KEY, JSON.stringify(scheduleData));
            showPopup("💧 Programação de rega atualizada e guardada!");

            if (plantId) {
                redirectUrl = `add_planta.html?id=${plantId}`;
            } else {
                redirectUrl = `add_planta.html?colecao=${colecaoId}`;
            }
        }

        setTimeout(() => window.location.href = redirectUrl, 1000);
    });
}

function setupCancelarRega() {
    const btnCancelar = document.querySelector(".btn-cancelar");
    if (!btnCancelar) return;

    btnCancelar.addEventListener("click", (e) => {
        e.preventDefault();
        
        const urlParams = new URLSearchParams(window.location.search);
        const plantId = urlParams.get('id');
        const colecaoId = urlParams.get('colecao');
        const isNew = urlParams.get('isNew') === 'true';
        
        showPopup("❌ Configuração de rega cancelada");
        
        let redirectUrl;
        if (isNew) {
            redirectUrl = `add_planta.html?colecao=${colecaoId}`;
        } else {
            redirectUrl = `add_planta.html?id=${plantId}`;
        }
        
        setTimeout(() => window.location.href = redirectUrl, 1000);
    });
}

function setupNavigation() {
    const gear = document.querySelector(".icon");
    if (gear) gear.addEventListener("click", () => showPopup("⚙️ Em breve: definições da aplicação!"));

    const btnVoltar = document.getElementById("btnVoltar");
    if (btnVoltar) {
        btnVoltar.addEventListener("click", () => {
             const urlParams = new URLSearchParams(window.location.search);
             const plantId = urlParams.get('id');

             if (plantId) {
                window.location.href = `planta.html?id=${plantId}`;
             } else {
                 window.history.back();
             }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation(); 
    setupSalvarRega();
    setupCancelarRega();

    document.body.style.opacity = 1;

    const plantId = getPlantIdFromURL();
    
    carregarConfiguracao(plantId); 
    setupTipoRega(); 
});
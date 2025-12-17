const STORAGE_KEY = "smartplants_data";
let selectedEventIds = new Set(); 

function getData() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { colecoes: [], plantas: [], eventos: [] };
    } catch (error) {
        console.error("Erro ao ler dados da storage:", error);
        return { colecoes: [], plantas: [], eventos: [] };
    }
}

function saveData(data) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Erro ao gravar dados na storage:", error);
        showPopup("❌ Erro ao guardar dados!", 3000);
    }
}

function showPopup(message, duration = 1500) {
    const popup = document.getElementById("popup");
    if (!popup) return;
    popup.textContent = message;
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), duration);
}

function getPlantIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id"); 
}

function atualizarBotaoRemover() {
    const btn = document.getElementById("remover-selecionadas");
    if (!btn) return;

    if (selectedEventIds.size === 0) {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
    } else {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
    }
}

function renderCalendarForRemoval(plantId) {
    const calendarEl = document.getElementById('calendar');
    const noEventMsg = document.getElementById("noEventMsg");
    const data = getData();
    const plant = data.plantas.find(p => p.id === plantId);

    if (!plant || !calendarEl) return;
    
    const plantEvents = data.eventos.filter(e => e.plantId === plantId);

    if (plantEvents.length === 0) {
        calendarEl.style.display = 'none';
        if (noEventMsg) noEventMsg.style.display = 'block';
        return;
    }

    const calendarEvents = plantEvents.map(evt => ({
        title: evt.titulo,
        start: evt.data,
        id: evt.id,
        allDay: true 
    }));

    if (typeof FullCalendar !== 'undefined') {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            buttonText: {
                today: 'Hoje',
                dayGridMonth: 'Mês',
            },
            headerToolbar: {
                left: 'prev,next',
                center: 'title',
                right: 'today' 
            },
            events: calendarEvents,

            eventClick: function(info) {
                const eventId = info.event.id;
                
                if (selectedEventIds.has(eventId)) {
                    selectedEventIds.delete(eventId);
                    info.el.classList.remove('delete-selected'); 
                } else {
                    selectedEventIds.add(eventId);
                    info.el.classList.add('delete-selected'); 
                }

                atualizarBotaoRemover();
            }
        });
        calendar.render();

        atualizarBotaoRemover();
    } else {
        calendarEl.innerHTML = "Erro ao carregar calendário.";
    }
}

function handleRemoverSelecionados(plantId) {
    if (selectedEventIds.size === 0) {
        return; 
    }

    const data = getData();
    const initialCount = data.eventos.length;

    data.eventos = data.eventos.filter(evt => !selectedEventIds.has(evt.id));

    if (data.eventos.length < initialCount) {
        saveData(data);
        showPopup("🗑️ Eventos removidos com sucesso!", 1500);
        
        setTimeout(() => {
            window.location.href = `diario_verde.html?id=${plantId}`;
        }, 1000);
    } else {
        showPopup("❌ Erro ao remover eventos.", 2000);
    }
}

function setupActionButtons(plantId) {
    const removeBtn = document.getElementById("remover-selecionadas");
    const cancelBtn = document.getElementById("cancelar");

    if (removeBtn) {
        atualizarBotaoRemover();
        
        removeBtn.addEventListener("click", () => handleRemoverSelecionados(plantId));
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            window.location.href = `diario_verde.html?id=${plantId}`;
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const plantId = getPlantIdFromURL();
    document.body.style.opacity = 1;

    if (!plantId) {
        showPopup("❌ Planta não encontrada.", 1500);
        setTimeout(() => window.location.href = "index.html", 1000);
        return;
    }
    
    renderCalendarForRemoval(plantId);
    setupActionButtons(plantId);
});
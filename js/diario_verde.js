const STORAGE_KEY = "smartplants_data"; 
let currentPlantId = null;
let currentCardIndex = 0; 

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
        showPopup("❌ Erro ao guardar dados! O armazenamento pode estar cheio.", 3000);
    }
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

function renderPlantInfo(plant) {
    document.getElementById("plantNameHeader").textContent = plant.nome;
}

function customGoToDate() {
    const dateInput = document.getElementById('hiddenDateInput');
    if (dateInput) {
        try {
            dateInput.showPicker(); 
        } catch (error) {
            dateInput.click(); 
        }
    }
}

function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {

            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            button.classList.add("active");

            const targetTabId = button.dataset.tab + "-tab";
            document.getElementById(targetTabId).classList.add("active");

            if (button.dataset.tab === "calendario") {
                renderCalendar(currentPlantId);
            } else if (button.dataset.tab === "eventos-lista") {
                renderEventCards(currentPlantId);
            }

            const url = new URL(window.location);
            url.searchParams.set("tab", button.dataset.tab);
            window.history.replaceState({}, "", url);
        });
    });
}

function renderCalendar(plantId) {
    const calendarEl = document.getElementById('calendar');
    const noEventMsgCalendar = document.getElementById('noEventMsgCalendar');
    const data = getData();
    const plantEvents = data.eventos.filter(e => e.plantId === plantId);
    
    if (!calendarEl || !noEventMsgCalendar) return;

    calendarEl.innerHTML = ''; 

    if (plantEvents.length === 0) {
        noEventMsgCalendar.style.display = 'block';
    } else {
         noEventMsgCalendar.style.display = 'none';
    }

    const calendarEvents = plantEvents.map(evt => ({
        title: evt.titulo,
        start: evt.data,
        id: evt.id,
        allDay: true 
    }));

    if (typeof FullCalendar !== 'undefined') {
        if (calendarEl.calendar) {
            calendarEl.calendar.destroy();
        }

        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            buttonText: {
                today: 'Hoje',
                dayGridMonth: 'Mês',
                timeGridWeek: 'Semana',
                timeGridDay: 'Dia'
            },
            customButtons: {
                customGoTo: {
                    text: 'Ir Para Data',
                    click: function() {
                        customGoToDate();
                    }
                }
            },
            headerToolbar: {
                left: 'prev,next customGoTo',
                center: 'title',
                right: 'today' 
            },
            events: calendarEvents,
            dateClick: function(info) {
                window.location.href = `add_evento.html?plantId=${plantId}&date=${info.dateStr}`;
            },
            eventClick: function(info) {
                window.location.href = `evento.html?plantId=${plantId}&eventoId=${info.event.id}`;
            }
        });
        
        calendar.render();
        calendarEl.calendar = calendar; 
        
        const dateInput = document.getElementById('hiddenDateInput');
        if (dateInput) {
            dateInput.onchange = function() {
                if (this.value) {
                    const targetDate = this.value + "-01";
                    calendar.gotoDate(targetDate);
                    calendar.changeView('dayGridMonth');
                    this.value = ''; 
                }
            };
        }
        initViewFilter(calendar); 
    } else {
        calendarEl.innerHTML = '<h3>Erro: Biblioteca FullCalendar não carregada.</h3>';
    }
}

function initViewFilter(calendar) {
    const filterBtn = document.getElementById('filterBtn');
    const dropdownMenu = document.getElementById('viewDropdownMenu');
    const dropdownContainer = document.getElementById('viewFilterDropdownContainer');
    
    if (!filterBtn || !dropdownMenu || !dropdownContainer) return;

    filterBtn.addEventListener('click', () => {
        dropdownMenu.classList.toggle('open');
        document.addEventListener('click', function closeIfOutside(e) {
            if (!dropdownContainer.contains(e.target)) {
                dropdownMenu.classList.remove('open');
                document.removeEventListener('click', closeIfOutside);
            }
        });
    });

    dropdownMenu.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.dataset.view;
            if (viewName) {
                calendar.changeView(viewName);
                filterBtn.innerHTML = `Filtrar por: ${item.textContent} <iconify-icon icon="line-md:chevron-down"></iconify-icon>`;
                dropdownMenu.classList.remove('open');
            }
        });
    });

    filterBtn.innerHTML = `Filtrar por: Mês <iconify-icon icon="line-md:chevron-down"></iconify-icon>`;
}

function renderEventCards(plantId) {
    const eventCardsContainer = document.getElementById('eventCards');
    const noEventMsgCards = document.getElementById('noEventMsgCards');
    const data = getData();
    
    const plantEvents = data.eventos
        .filter(e => e.plantId === plantId)
        .sort((a, b) => new Date(b.data) - new Date(a.data)); 

    eventCardsContainer.innerHTML = ''; 
    currentCardIndex = 0; 

    if (plantEvents.length === 0) {
        noEventMsgCards.style.display = 'block';
        const prevEl = document.querySelector('.carousel-nav.prev');
        const nextEl = document.querySelector('.carousel-nav.next');
        if (prevEl) prevEl.style.display = 'none';
        if (nextEl) nextEl.style.display = 'none';
        return;
    } else {
        noEventMsgCards.style.display = 'none';
        const prevEl = document.querySelector('.carousel-nav.prev');
        const nextEl = document.querySelector('.carousel-nav.next');
        if (prevEl) prevEl.style.display = 'flex';
        if (nextEl) nextEl.style.display = 'flex';
    }

    plantEvents.forEach((evento, index) => {
        const card = document.createElement('div');
        card.className = 'event-card'; 
        card.dataset.eventId = evento.id;
        card.dataset.plantId = evento.plantId;

        const dataFormatada = new Date(evento.data).toLocaleDateString('pt-PT');

        const imgTag = evento.imagem 
            ? `<img src="${evento.imagem}" alt="Foto">` 
            : `<div style="width:100%; height:280px; background:#e8f5e9; display:flex; align-items:center; justify-content:center; border-bottom:6px solid #4caf50; margin-bottom:20px;"><iconify-icon icon="solar:leaf-bold" style="font-size:80px; color:#a5d6a7;"></iconify-icon></div>`;

        card.innerHTML = `
            ${imgTag}
            <h3>${evento.titulo || 'Sem Título'}</h3>
            <p><iconify-icon icon="uiw:date" style="vertical-align: -3px"></iconify-icon> ${dataFormatada}</p>
        `;
        
        card.addEventListener('click', () => {
             window.location.href = `evento.html?plantId=${evento.plantId}&eventoId=${evento.id}`;
        });

        eventCardsContainer.appendChild(card);
    });

    setupCarouselNavigation(plantEvents.length);
}

function setupCarouselNavigation(totalCards) {
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    
    if (!prevBtn || !nextBtn) return;

    const newPrev = prevBtn.cloneNode(true);
    const newNext = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);

    function updateView() {
        const allCards = document.querySelectorAll('.event-card');
        
        const prevIndex = (currentCardIndex === 0) ? totalCards - 1 : currentCardIndex - 1;
        const nextIndex = (currentCardIndex === totalCards - 1) ? 0 : currentCardIndex + 1;

        allCards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next');
            
            if (index === currentCardIndex) {
                card.classList.add('active');
            } 
            else if (index === prevIndex) {
                card.classList.add('prev');
            } 
            else if (index === nextIndex) {
                card.classList.add('next');
            }
        });
    }

    updateView(); 

    newPrev.addEventListener('click', () => {
        if (totalCards > 1) {
            currentCardIndex = (currentCardIndex === 0) ? totalCards - 1 : currentCardIndex - 1;
            updateView();
        }
    });

    newNext.addEventListener('click', () => {
        if (totalCards > 1) {
            currentCardIndex = (currentCardIndex === totalCards - 1) ? 0 : currentCardIndex + 1;
            updateView();
        }
    });
}

function setupButtons(plantId) {
    const btnVoltar = document.querySelector(".btn-nav.voltar");
    const removePlantBtn = document.getElementById("removePlantBtn");
    const addEventBtn = document.getElementById("addEventBtn");
    const gearIcon = document.querySelector(".icon");

    if (gearIcon) gearIcon.addEventListener("click", () => showPopup("⚙️ Em breve: definições da aplicação!"));

    if (btnVoltar) {
        btnVoltar.addEventListener("click", () => {
            window.location.href = `planta.html?id=${plantId}`;
        });
    }

    if (addEventBtn) {
        addEventBtn.addEventListener("click", () => {
            window.location.href = `add_evento.html?plantId=${plantId}`;
        });
    }

    if (removePlantBtn) {
        removePlantBtn.addEventListener("click", () => {
            const data = getData();
            const temEventos = data.eventos.some(e => e.plantId === plantId);

            if (!temEventos) {
                showPopup("⚠️ Não existem eventos registados para remover!", 2500);
            } else {
                window.location.href = `remove_evento.html?id=${plantId}`;
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    currentPlantId = getPlantIdFromURL();

    document.body.style.opacity = 1;

    if (!currentPlantId) {
        showPopup("❌ ID da Planta em falta! A voltar para o índice.", 2500);
        setTimeout(() => window.location.href = "index.html", 2000);
        return;
    }
    
    const data = getData();
    const plant = data.plantas.find(p => p.id === currentPlantId);

    if (!plant) {
        showPopup("❌ Planta não encontrada no sistema de dados.", 2500);
        setTimeout(() => window.location.href = "index.html", 2000);
        return;
    }

    renderPlantInfo(plant); 
    initTabs();
    setupButtons(currentPlantId);

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab'); 

    if (tabParam) {
        const targetBtn = document.querySelector(`.tab-button[data-tab="${tabParam}"]`);
        if (targetBtn) {
            targetBtn.click();
        } else {
            renderCalendar(currentPlantId);
        }
    } else {
        renderCalendar(currentPlantId);
    }
});
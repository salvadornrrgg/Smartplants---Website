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

function setupIcon() {
    const gearIcon = document.querySelector(".icon");
    if (gearIcon) {
        gearIcon.addEventListener("click", () => {
            showPopup("⚙️ Em breve: definições da aplicação!");
        });
    }
}

function getPlantIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id"); 
}

function removerEvento(eventoId) {
    const data = getData();
    const idParaRemover = String(eventoId);

    const eventosAntes = data.eventos.length;
    data.eventos = data.eventos.filter(evt => evt.id !== idParaRemover);
    
    if (data.eventos.length < eventosAntes) {
        saveData(data);
        return true; 
    } else {
        return false; 
    }
}

document.addEventListener("DOMContentLoaded", () => {

    setupIcon();
    document.body.style.opacity = 1;

});
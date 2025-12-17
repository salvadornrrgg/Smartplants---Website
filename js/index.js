const STORAGE_KEY = "smartplants_data"; 

function initData() {
    if (!sessionStorage.getItem(STORAGE_KEY)) {
        const baseData = {
            colecoes: [],
            plantas: [],
            eventos: []
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(baseData));
        console.log("🌱 Estrutura inicial criada no sessionStorage");
    } else {
        console.log("✅ Dados já existentes no sessionStorage");
    }
}

function setupNavigation() {
    const colecoesBtn = document.querySelector(".btn-nav"); 

    if (colecoesBtn) {
        colecoesBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "colecoes.html";
        });
    }
}


function animatePage() {
    document.body.style.opacity = 1;
    setTimeout(() => {
        document.body.style.transition = "opacity 1s ease";
        document.body.style.opacity = 1;
    }, 100);
}


window.addEventListener("DOMContentLoaded", () => {
    animatePage();
    initData();      
    setupNavigation(); 
});


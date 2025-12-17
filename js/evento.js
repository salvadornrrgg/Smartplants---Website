const STORAGE_KEY = "smartplants_data"; 

function getData() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { colecoes: [], plantas: [], eventos: [] };
    } catch (error) {
        console.error("Erro ao ler dados da storage:", error);
        return { colecoes: [], plantas: [], eventos: [] };
    }
}

function showPopup(message, duration = 1500) {
    const popup = document.getElementById("popup");
    if (!popup) {
        return;
    }

    popup.textContent = message;
    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show");
    }, duration);
}

function getIdsFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        plantId: params.get("plantId") || params.get("id"),
        eventoId: params.get("eventoId")
    };
}

function renderEvento(plantId, eventoId) {
    const data = getData();
    const evento = data.eventos.find(e => e.id === eventoId && e.plantId === plantId);

    const infoContainer = document.querySelector(".detalhes-evento");
    const notasContainer = document.querySelector(".diario textarea");
    const linkEditar = document.querySelector(".atalhos a");
    const headerTitle = document.querySelector("header h2");

    const midiaArticle = document.querySelector("article.midia");
    const fotoBloco = document.getElementById("fotoMediaContainer"); 
    const videoBloco = document.getElementById("videoMediaContainer"); 
    const imgEl = document.querySelector("#fotoMediaContainer .plant-img");
    const videoEl = document.querySelector("#videoMediaContainer video");

    if (!evento || !infoContainer || !notasContainer || !linkEditar || !midiaArticle || !fotoBloco || !videoBloco) {
        showPopup("❌ Erro: Elementos ou evento não encontrado.", 3000);
        if (midiaArticle) midiaArticle.style.display = 'none';
        return;
    }

    const dataFormatada = evento.data
        ? new Date(evento.data).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })
        : "Data Desconhecida";

    headerTitle.textContent = `🌿 Evento da Planta: ${evento.titulo || 'Sem Título'}`;

    infoContainer.innerHTML = `
        <p><strong><iconify-icon icon="mdi:calendar-edit-outline" width="30" height="30" style="vertical-align: -7px; margin-left: -5px"></iconify-icon> Nome:</strong> <span id="eventoNome">${evento.titulo || 'Evento'}</span></p>
        <p><strong><iconify-icon icon="uiw:date" width="25" height="25" style="vertical-align: -4px; margin-left: -2px"></iconify-icon> Data:</strong> <span id="eventoData">${dataFormatada}</span></p>
    `;
    notasContainer.value = evento.notas || "Sem notas registadas para este evento.";

    let midiaEncontrada = false;

    if (evento.imagem) {
        imgEl.src = evento.imagem;
        fotoBloco.style.display = 'flex'; 
        midiaEncontrada = true;
    } else {
        fotoBloco.style.display = 'none'; 
    }

    if (evento.video) {
        const videoSource = videoEl ? videoEl.querySelector('source') : null;

        if (evento.video === "video_uploaded") {
             videoBloco.innerHTML = `
                <h3>Vídeo da Planta</h3>
                <div class="video-placeholder" style="padding: 20px; border: 1px dashed #2f4f4f; border-radius: 10px; text-align: center;">
                    <span style="font-size: 2em;"><iconify-icon icon="material-symbols:video-camera-back-add-outline" width="60" height="60"></iconify-icon></span>
                    <p style="margin-top: 10px; font-weight: bold;">Vídeo não suportado!</p>
                </div>
            `;
        } else if (videoSource) {
            videoSource.src = evento.video;
            videoEl.load();
        }
        
        videoBloco.style.display = 'flex'; 
        midiaEncontrada = true;
    } else {
        videoBloco.style.display = 'none'; 
    }
    
    if (midiaArticle) {
        if (midiaEncontrada) {
            midiaArticle.style.display = 'flex'; 
        } else {
            midiaArticle.style.display = 'none'; 
        }
    }

    linkEditar.href = `add_evento.html?plantId=${plantId}&eventoId=${eventoId}`;
}

const sharePlatforms = [
    { name: 'WhatsApp', icon: 'mdi:whatsapp', color: '#25D366' },
    { name: 'Twitter', icon: 'line-md:twitter', color: '#1DA1F2' },
    { name: 'Instagram', icon: 'line-md:instagram', color: '#E4405F' },
    { name: 'Facebook', icon: 'line-md:facebook', color: '#1877F2' },
    { name: 'Email', icon: 'line-md:email', color: '#D9534F' },
];

function generateShareLinks(title, url, eventDetails) {
    const shareUrl = encodeURIComponent(url); 
    const shareText = encodeURIComponent(`Diário Verde: Novo evento de ${title} com a minha planta! Detalhes: ${eventDetails.titulo} em ${eventDetails.data}.`);

    return {
        WhatsApp: `https://wa.me/?text=${shareText} ${shareUrl}`,
        Twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
        Facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`,
        Email: `mailto:?subject=${encodeURIComponent('Novo Evento no Diário Verde')}&body=${shareText}`,
        Instagram: `https://www.instagram.com/direct/inbox/`, 
    };
}

function openShareModal(plantId, evento) {
    const modal = document.getElementById('shareModal');
    const iconsContainer = document.getElementById('shareIcons');
    const currentUrl = window.location.href; 
    
    const shareLinks = generateShareLinks(
        'Planta',
        currentUrl,
        evento
    );

    iconsContainer.innerHTML = ''; 
    
    sharePlatforms.forEach(platform => {
        const link = shareLinks[platform.name];
        if (!link) return; 

        const linkEl = document.createElement('a');
        linkEl.href = link;
        linkEl.target = '_blank';
        linkEl.style.textDecoration = 'none';
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'share-icon';
        iconDiv.style.backgroundColor = platform.color;
        iconDiv.innerHTML = `<iconify-icon icon="${platform.icon}" width="30" height="30"></iconify-icon>`;
        
        linkEl.appendChild(iconDiv);
        iconsContainer.appendChild(linkEl);
    });

    if (modal) modal.style.display = 'flex'; 
}

function setupButtons(plantId, evento) {
    const btnVoltar = document.querySelector(".btn-nav.voltar");
    const btnPartilhar = document.querySelector(".atalhos button[title='Partilhar evento']");
    const modal = document.getElementById('shareModal');
    const closeX = document.getElementById('closeShareX'); 
    const gear = document.querySelector(".icon");

    if (gear) gear.addEventListener("click", () => showPopup("⚙️ Em breve: definições da aplicação!"));

    if (btnVoltar) {
        btnVoltar.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = `diario_verde.html?id=${plantId}`;
        });
    }

    if (btnPartilhar) {
        btnPartilhar.addEventListener("click", () => {
            openShareModal(plantId, evento); 
        });
    }
    
    if (closeX) {
        closeX.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const { plantId, eventoId } = getIdsFromURL();

    document.body.style.opacity = 1;

    if (!plantId || !eventoId) {
        showPopup("❌ ID de Planta ou Evento em falta! A voltar.", 2000);
        setTimeout(() => window.location.href = `diario_verde.html?id=${plantId || ''}`, 1000);
        return;
    }

    const data = getData();
    const evento = data.eventos.find(e => e.id === eventoId && e.plantId === plantId);

    renderEvento(plantId, eventoId);
    setupButtons(plantId, evento);
});
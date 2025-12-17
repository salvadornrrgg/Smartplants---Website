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

function setupIcon() {
    const gearIcon = document.querySelector(".icon");
    if (gearIcon) {
        gearIcon.addEventListener("click", () => {
            showPopup("⚙️ Em breve: definições da aplicação!");
        });
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
    if (!popup) {
        console.warn("Elemento popup #popup não encontrado.");
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

        plantId: params.get("id") || params.get("plantId"), 
        eventoId: params.get("eventoId") 
    };
}

function setupMediaPreviews() {
    const videoInput = document.getElementById("video");
    const imageInput = document.getElementById("imagem");

    if (videoInput) {
        const videoBox = videoInput.closest(".video-input");
        videoInput.addEventListener("change", (e) => {
            const plusSpan = videoBox ? videoBox.querySelector(".plus") : null;
            if (e.target.files[0] && videoBox && plusSpan) {
                videoBox.style.backgroundImage = "none";
                plusSpan.textContent = "🎥"; 
                plusSpan.style.fontSize = "3rem";
                plusSpan.style.display = "block";
                
            } else if (videoBox && plusSpan) {
                videoBox.style.backgroundImage = "none";
                plusSpan.textContent = "＋"; 
                plusSpan.style.fontSize = "3rem";
            }
        });
    }

    if (imageInput) {
        const imageBox = imageInput.closest(".custom-file-input");
        imageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            const plusSpan = imageBox ? imageBox.querySelector(".plus") : null;
            if (file && imageBox && plusSpan) {
                const reader = new FileReader();
                reader.onload = function (ev) {
                    imageBox.style.backgroundImage = `url('${ev.target.result}')`;
                    imageBox.style.backgroundSize = "cover";
                    imageBox.style.backgroundPosition = "center";
                    plusSpan.style.display = "none";
                };
                reader.readAsDataURL(file);
            } else if (imageBox && plusSpan) {
                imageBox.style.backgroundImage = "none";
                plusSpan.style.display = "block";
            }
        });
    }
}

function carregarEventoParaEdicao(evento) {
    document.getElementById("titulo").value = evento.titulo || "";
    document.getElementById("data").value = evento.data || "";
    document.getElementById("diario").value = evento.notas || ""; 

    const pageTitle = document.querySelector("header h2");
    if(pageTitle) pageTitle.textContent = "✏️ Editar Evento";

    const addBtn = document.getElementById("addBtn");
    if (addBtn) {
        const span = addBtn.querySelector("span");
        if(span) span.textContent = "Guardar";
        addBtn.title = "Guardar alterações";
    }

    const imagemInput = document.getElementById("imagem");
    if (evento.imagem && imagemInput) {
        const imageBox = imagemInput.closest(".custom-file-input");
        const plusSpan = imageBox ? imageBox.querySelector(".plus") : null;
        if (imageBox && plusSpan) {
            imageBox.style.backgroundImage = `url('${evento.imagem}')`;
            imageBox.style.backgroundSize = "cover";
            imageBox.style.backgroundPosition = "center";
            plusSpan.style.display = "none";
        }
    }

    const videoInput = document.getElementById("video");
    if (evento.video && videoInput) {
        const videoBox = videoInput.closest(".video-input");
        const plusSpan = videoBox ? videoBox.querySelector(".plus") : null;
        if (videoBox && plusSpan) {
            videoBox.style.backgroundImage = "none";
            plusSpan.textContent = "🎥";
            plusSpan.style.fontSize = "3rem";
            plusSpan.style.display = "block";
        }
    }
}

function handleAddEvento(plantId, eventoIdParaEditar) {
    const titulo = document.getElementById("titulo").value.trim();
    const dataEvento = document.getElementById("data").value;
    const diario = document.getElementById("diario").value.trim(); 

    const imagemInput = document.getElementById("imagem");
    const videoInput = document.getElementById("video");

    if (!titulo || !dataEvento) {
        showPopup("🛑 O Título e a Data do evento são obrigatórios! 🌱", 3000);
        return;
    }

    const storage = getData();
    let evento;
    let modoEdicao = false;
    let newOrExistingEventId = eventoIdParaEditar; 

    if (eventoIdParaEditar) {
        modoEdicao = true;
        const index = storage.eventos.findIndex(evt => evt.id === eventoIdParaEditar && evt.plantId === plantId);
        if (index === -1) {
            showPopup("❌ Erro: Evento a editar não encontrado.", 3000);
            return;
        }
        evento = storage.eventos[index];
    } else {

        newOrExistingEventId = `evt_${Date.now()}`;
        evento = {
            id: newOrExistingEventId,
            plantId: plantId, 
            imagem: null,
            video: null 
        };
        storage.eventos.push(evento);
    }

    evento.titulo = titulo;
    evento.data = dataEvento;
    evento.notas = diario || ""; 

    const fileImg = imagemInput.files[0];
    const fileVid = videoInput.files[0]; 

    const finalizar = () => {

        if (fileVid) {
             evento.video = "video_uploaded"; 
        } else if (!fileVid && modoEdicao && !videoInput.value) {
            evento.video = null; 
        } else if (!fileVid && !modoEdicao) {
             evento.video = null;
        }
        
        saveData(storage);
        showPopup(modoEdicao ? "✅ Evento atualizado!" : "✅ Evento adicionado com sucesso!", 1500);

        setTimeout(() => {
             window.location.href = `evento.html?plantId=${plantId}&eventoId=${newOrExistingEventId}`; 
        }, 1000);
    };

    let filesToProcess = 0;
    if (fileImg) filesToProcess++; 

    if (filesToProcess === 0) {
        finalizar();
        return;
    }

    let processedCount = 0;
    const checkCompletion = () => {
        processedCount++;
        if (processedCount === filesToProcess) {
            finalizar();
        }
    };
    
    if (fileImg) {
        const readerImg = new FileReader();
        readerImg.onload = (e) => {
            evento.imagem = e.target.result;
            checkCompletion();
        };
        readerImg.readAsDataURL(fileImg);
    }
}

function setupEventListeners(plantId, eventoId) {
    const form = document.getElementById("eventForm"); 
    const cancelBtn = document.getElementById("cancelarBtn");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            handleAddEvento(plantId, eventoId);
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            showPopup("❌ Cancelado");
            
            let targetPage;

            if (eventoId) {
                targetPage = `evento.html?plantId=${plantId}&eventoId=${eventoId}`;
            } else {
                targetPage = `diario_verde.html?id=${plantId}`;
            }
            
            setTimeout(() => {
                window.location.href = targetPage;
            }, 1000); 
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupIcon();

    document.body.style.opacity = 1;

    const dataInput = document.getElementById("data");
    if (dataInput) {
        const hoje = new Date().toISOString().split("T")[0];
        dataInput.setAttribute("max", hoje);
    }

    const { plantId, eventoId } = getIdsFromURL();
    const data = getData();
    
    const plant = data.plantas.find(p => p.id === plantId);

    if (!plantId || !plant) {
        showPopup("❌ ID de Planta em falta ou inválido. A voltar para o índice.", 2500);
        setTimeout(() => window.location.href = "index.html", 2000);
        return;
    }

    setupMediaPreviews();

    if (eventoId) {
        const evento = data.eventos.find(evt => evt.id === eventoId);
        if (evento) {
            carregarEventoParaEdicao(evento);
        } else {
            showPopup("❌ Evento a editar não encontrado.", 2000);
        }
    } else {
        if(dataInput) dataInput.valueAsDate = new Date();
    }

    setupEventListeners(plantId, eventoId);
});

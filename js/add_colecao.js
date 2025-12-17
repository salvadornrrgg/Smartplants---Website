function getColecaoIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id"); 
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.style.opacity = 1;
    const form = document.getElementById("addColecaoForm");
    const colecaoId = getColecaoIdFromUrl();

    const data = typeof getData === 'function' ? getData() : null;
    let colecaoExistente = null; 

    if (!form || !data || typeof showPopup !== 'function' || typeof saveData !== 'function') {
        console.error("Erro: Elementos ou funções de dependência (getData, showPopup, saveData) não encontrados.");
        return;
    }

    const h2Header = document.querySelector('header h2');
    const submitButtonSpan = form.querySelector('.btn-add span');
    
    if (colecaoId) {

        colecaoExistente = data.colecoes.find(c => c.id === colecaoId);
        
        if (colecaoExistente) {
            h2Header.innerHTML = '✏️ Editar Coleção';
            submitButtonSpan.textContent = 'Guardar';

            document.getElementById("nome").value = colecaoExistente.nome;

            const fileBox = document.getElementById('fileBox');
            if (colecaoExistente.capaUrl) {
                const plusIcon = fileBox.querySelector('.plus');
                if(plusIcon) plusIcon.remove();

                let img = fileBox.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    img.classList.add('capa-preview');
                    fileBox.appendChild(img);
                }
                img.src = colecaoExistente.capaUrl;
                img.alt = `Capa atual de ${colecaoExistente.nome}`;
            }

        } else {

            showPopup("⚠️ Coleção a editar não encontrada. A abrir em modo Adição.", 3000);
            colecaoId = null; 
        }
    }

    const fileInput = document.getElementById('capa');
    const fileBox = document.getElementById('fileBox');

    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const plusIcon = fileBox.querySelector('.plus');
                if(plusIcon) plusIcon.remove();

                let img = fileBox.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    img.classList.add('capa-preview');
                    fileBox.appendChild(img);
                }
                img.src = e.target.result;
                img.alt = 'Pré-visualização da Capa';
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const nomeColecao = document.getElementById("nome").value.trim();
        
        if (!nomeColecao) {
            showPopup("⚠️ Por favor, insira um nome para a coleção.");
            return;
        }

        let capaData = '';
        const previewImg = fileBox.querySelector('.capa-preview');
        if (previewImg) {
            capaData = previewImg.src; 
        }

        if (colecaoExistente) {
            colecaoExistente.nome = nomeColecao;
            colecaoExistente.capaUrl = capaData;
            
            saveData(data); 

            showPopup(`✏️ Coleção "${nomeColecao}" editada com sucesso!`, 1500); 
            
        } else {
            const newId = 'col_' + Date.now(); 

            const novaColecao = {
                id: newId,
                nome: nomeColecao,
                capaUrl: capaData,
                plantas: [] 
            };
            
            data.colecoes.push(novaColecao);
            saveData(data);

            showPopup(`✅ Coleção "${nomeColecao}" adicionada com sucesso!`, 1500); 
        }

        setTimeout(() => {
            const targetUrl = colecaoExistente ? `colecao.html?id=${colecaoExistente.id}` : "colecoes.html";
            window.location.href = targetUrl;
        }, 1000);
    });

    const cancelarBtn = document.getElementById('cancelarBtn');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', () => {
            showPopup("❌ Cancelado", 1500); 
            setTimeout(() => {
                const targetUrl = colecaoExistente ? `colecao.html?id=${colecaoExistente.id}` : "colecoes.html";
                window.location.href = targetUrl;
            }, 1000); 
        });
    }
});
let colecoesSelecionadas = new Set(); 

document.addEventListener("DOMContentLoaded", () => {
    if (typeof getData !== 'function' || typeof showPopup !== 'function' || typeof saveData !== 'function') {
        console.error("Erro: Funções essenciais (de geral.js) não carregadas.");
        return;
    }

    const data = getData();
    const colecoes = data.colecoes || [];
    const container = document.getElementById("colecoesContainer");
    const btnRemoverSelecionadas = document.getElementById("remover-selecionadas");
    const btnCancelar = document.getElementById("cancelar");

    if (!container) return;

    renderizarColecoes(colecoes, container);

    container.addEventListener('change', (e) => {

        if (e.target.type === 'checkbox' && e.target.classList.contains('colecao-checkbox')) {
            const id = e.target.value;

            const colecaoDiv = e.target.closest('.colecao-wrapper').querySelector('.colecao'); 

            if (e.target.checked) {
                colecoesSelecionadas.add(id);
                colecaoDiv.classList.add('selected'); 
            } else {
                colecoesSelecionadas.delete(id);
                colecaoDiv.classList.remove('selected');
            }

            atualizarBotaoRemover(btnRemoverSelecionadas);
        }
    });

    if (btnRemoverSelecionadas) {
        atualizarBotaoRemover(btnRemoverSelecionadas); 
        
        btnRemoverSelecionadas.addEventListener('click', () => {
            if (colecoesSelecionadas.size > 0) {
                removerColecoes(Array.from(colecoesSelecionadas));
            } else {
                showPopup("⚠️ Selecione pelo menos uma coleção para remover.", 2000);
            }
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            showPopup("❌ Cancelado", 1500);
            setTimeout(() => {
                window.location.href = "colecoes.html";
            }, 1000);
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const mensagemId = 'filtro-vazio-msg';

        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            const colecoesDivs = container.querySelectorAll('.colecao-wrapper'); 
            
            colecoesDivs.forEach(colecaoWrapper => {
                const nomeColecao = colecaoWrapper.querySelector('h3') ? colecaoWrapper.querySelector('h3').textContent.toLowerCase() : '';
                
                if (nomeColecao.includes(termo)) {
                    colecaoWrapper.style.display = 'flex'; 
                    encontrados++;
                } else {
                    colecaoWrapper.style.display = 'none';
                }
            });
            
            let mensagem = document.getElementById(mensagemId);

            if (encontrados === 0 && termo.length > 0) {
                if (!mensagem) {
                    mensagem = document.createElement('p');
                    mensagem.id = mensagemId;
                    mensagem.classList.add('sem-colecoes'); 
                    container.appendChild(mensagem); 
                }
                mensagem.textContent = `Nenhuma coleção encontrada para "${termo}".`;
                mensagem.style.display = 'block';
            } else {
                if (mensagem) {
                    mensagem.style.display = 'none';
                }
            }
        });
    }
});


function atualizarBotaoRemover(btn) {
    btn.disabled = colecoesSelecionadas.size === 0;
    btn.style.opacity = colecoesSelecionadas.size === 0 ? "0.5" : "1";
}

function renderizarColecoes(colecoes, container) {
    container.innerHTML = '';
    colecoesSelecionadas.clear();

    if (colecoes.length === 0) {
        container.innerHTML = "<p class='sem-colecoes'>Não há coleções para remover.</p>";
        return;
    }

    colecoes.forEach(colecao => {
        const colecaoWrapper = document.createElement('div');
        colecaoWrapper.classList.add('colecao-wrapper'); 

        let conteudoVisual;

        if (colecao.capaUrl) {
 
            conteudoVisual = `<img class="plant-img" src="${colecao.capaUrl}" alt="Capa da Coleção ${colecao.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px; display: block; border: 2px solid #2f4f4f; box-sizing: border-box;">`;
        } else {
            conteudoVisual = `
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
                ">
                    <iconify-icon icon="solar:leaf-bold" style="font-size:80px; color:#a5d6a7;"></iconify-icon>
                </div>
            `;
        }

        colecaoWrapper.innerHTML = `
            <div class="colecao" data-colecao-id="${colecao.id}">
                <div class="planta" style="height: 280px; width: 100%; margin-bottom: 10px;">
                    ${conteudoVisual}
                </div>
                <h3>${colecao.nome}</h3>
            </div>

            <label class="checkbox-container" title="Selecionar para remover">
                <input type="checkbox" class="colecao-checkbox" value="${colecao.id}">
                <span class="checkmark"></span>
            </label>
        `;
        container.appendChild(colecaoWrapper);
    });
}

function removerColecoes(idsParaRemover) {
    const data = getData();
    const colecoesAntes = data.colecoes.length;
    
    data.colecoes = data.colecoes.filter(col => !idsParaRemover.includes(col.id));

    if (data.colecoes.length < colecoesAntes) {
        saveData(data);

        showPopup(`🗑️ Coleções removidas com sucesso!`, 1500);

        setTimeout(() => {
            window.location.href = "colecoes.html"; 
        }, 1000); 
    } else {

        showPopup(`⚠️ Erro ao remover coleções`, 1200);
    }
}
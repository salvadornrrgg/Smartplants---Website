document.addEventListener("DOMContentLoaded", () => {

    if (typeof getData !== 'function' || typeof showPopup !== 'function') {
        console.error("Erro: Funções essenciais (getData ou showPopup) não carregadas de geral.js.");
        return;
    }

    const data = getData();
    const colecoes = data.colecoes || [];
    const container = document.querySelector(".colecoes"); 

    if (!container) {
        console.error("Container das coleções (classe '.colecoes') não encontrado.");
        return;
    }

    container.innerHTML = ''; 

    if (colecoes.length === 0) {
        container.innerHTML = "<p class='sem-colecoes'>Ainda não tem coleções. Clique em '+' para adicionar uma!</p>";
    } else {

        colecoes.forEach(colecao => {
            const colecaoDiv = document.createElement('div');
            colecaoDiv.classList.add('colecao');
            colecaoDiv.dataset.colecaoId = colecao.id; 
            
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

            colecaoDiv.innerHTML = `
                <div class="planta" style="height: 280px; width: 100%; margin-bottom: 10px;">
                    ${conteudoVisual}
                </div>
                <h3>${colecao.nome}</h3>
            `;

            colecaoDiv.addEventListener('click', () => {
                window.location.href = `colecao.html?id=${colecao.id}`;
            });

            container.appendChild(colecaoDiv);
        });
    }

    const searchInput = document.getElementById('searchInput');
    const mensagemId = 'filtro-vazio-msg';

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            const colecoesDivs = container.querySelectorAll('.colecao');
            let encontrados = 0;

            colecoesDivs.forEach(colecaoDiv => {
                const nomeColecao = colecaoDiv.querySelector('h3') ? colecaoDiv.querySelector('h3').textContent.toLowerCase() : '';
                
                if (nomeColecao.includes(termo)) {
                    colecaoDiv.style.display = 'flex'; 
                    encontrados++;
                } else {
                    colecaoDiv.style.display = 'none';
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

    const btnRemover = document.getElementById('btnRemoverColecao');

    if (btnRemover) {
        btnRemover.addEventListener('click', () => {
            const dataAtual = getData();
            const colecoesAtuais = dataAtual.colecoes || [];

            if (colecoesAtuais.length === 0) {
                showPopup("❌ Não tem coleções para remover!", 2500); 
            } else {
                window.location.href = 'remove_colecao.html';
            }
        });
    }
});
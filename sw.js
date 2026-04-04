// ... (mantenha o restante do código anterior)

function verLoja(nome) {
    const m = document.getElementById('corpo'); 
    const loja = lojas.find(l => l.nome === nome);
    
    m.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
                <i onclick="aba('l')" data-lucide="arrow-left" class="text-amber-500 w-6 h-6 cursor-pointer"></i>
                <h2 class="text-xl font-black uppercase italic tracking-tighter">${nome}</h2>
            </div>
            <button onclick="aba('p',{loja:'${nome}'})" class="bg-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">+ NOVO</button>
        </div>`;
    
    const agrupado = {};
    loja.produtos.forEach((p, i) => { 
        if(!agrupado[p.nome]) agrupado[p.nome] = []; 
        agrupado[p.nome].push({...p, i}); 
    });

    for(let n in agrupado) {
        m.innerHTML += `
        <div class="card-container">
            <div class="flex justify-between items-center mb-3">
                <span class="text-amber-500 font-black text-xs uppercase italic flex items-center gap-2">
                    <i data-lucide="package" class="w-3 h-3"></i> ${n}
                </span>
                <i onclick="confirmarExclusaoTotal('${nome}', '${n}')" data-lucide="trash-2" class="w-4 h-4 text-red-800 cursor-pointer"></i>
            </div>
            ${agrupado[n].map(p => `
                <div class="item-linha !bg-black/40 !mb-2">
                    <span class="text-[10px] font-bold text-gray-400">${p.data.split('-').reverse().join('/')} — <span class="text-amber-500 font-black">${p.qtd} UN</span></span>
                    <div class="flex gap-3">
                        <i onclick="editarQtd('${nome}', ${p.i})" data-lucide="pencil" class="w-4 h-4 text-blue-400 cursor-pointer"></i>
                        <i onclick="removerLote('${nome}', ${p.i})" data-lucide="trash-2" class="w-4 h-4 text-red-500 cursor-pointer"></i>
                    </div>
                </div>`).join('')}
        </div>`;
    }
    lucide.createIcons();
}

// Nova função com tela de aviso conforme solicitado
function confirmarExclusaoTotal(nomeLoja, nomeProduto) {
    abrirModal(
        'confirm', 
        `ATENÇÃO: Isso removerá o produto "${nomeProduto}" e TODAS as suas validades nesta loja. Deseja realmente continuar?`, 
        () => {
            delProdAgrupado(nomeLoja, nomeProduto);
        }
    );
}

// ... (mantenha as outras funções como delProdAgrupado, abrirModal, etc.)

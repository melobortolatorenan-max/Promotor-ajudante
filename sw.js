// ... (mantenha todo o seu código anterior de estilo e estrutura)

<script>
    let lojas = JSON.parse(localStorage.getItem('db_promotor_v2')) || [];
    let promptInstalacao = null;

    // --- LOGICA DE NOTIFICAÇÕES ---

    // Solicita permissão ao carregar
    if ("Notification" in window) {
        Notification.requestPermission();
    }

    // Registra o Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }

    function dispararNotificacao(produto, loja) {
        if (Notification.permission === "granted") {
            const titulo = "PROMOTOR AJUDANTE AVISA:";
            const corpo = `- Seu ${produto.nome} na ${loja} com vencimento para ${produto.data.split('-').reverse().join('/')} está próximo de vencer. Por favor retire o quanto antes.`;
            
            navigator.serviceWorker.ready.then(registration => {
                registration.active.postMessage({
                    type: 'NOTIFICAR',
                    title: titulo,
                    body: corpo
                });
            });
        }
    }

    function verificarVencimentosGerais() {
        lojas.forEach(l => {
            l.produtos.forEach(p => {
                const hoje = new Date();
                hoje.setHours(0,0,0,0);
                const dataVenc = new Date(p.data + 'T00:00:00');
                const diffDias = Math.ceil((dataVenc - hoje) / 86400000);

                // Notifica se estiver entre 0 e 3 dias para vencer
                if (diffDias <= 3 && diffDias >= 0) {
                    dispararNotificacao(p, l.nome);
                }
            });
        });
    }

    // Verifica sempre que o app abre
    window.addEventListener('load', () => {
        setTimeout(verificarVencimentosGerais, 2000);
    });

    // Modificação na função salvarP para notificar imediatamente
    function salvarP(orig) {
        const n = document.getElementById('pn').value, 
              q = document.getElementById('pq').value, 
              d = document.getElementById('pd').value, 
              l = document.getElementById('pl').value;
              
        if(!n || !d || !l) return abrirModal('alert', 'Erro: complete todas as informações!');
        
        const novoProduto = {nome: n, qtd: q, data: d};
        lojas.find(x => x.nome === l).produtos.push(novoProduto);
        salvar();

        // Checagem imediata pós-cadastro
        const hoje = new Date();
        hoje.setHours(0,0,0,0);
        const dataVenc = new Date(d + 'T00:00:00');
        const diffDias = Math.ceil((dataVenc - hoje) / 86400000);
        
        if (diffDias <= 3 && diffDias >= 0) {
            dispararNotificacao(novoProduto, l);
        }

        abrirModal('alert', 'Lote cadastrado!', () => { 
            if(orig === 'loja-detalhe') verLoja(l); else aba('l'); 
        });
    }

    // ... (restante das suas funções: aba, abrirModal, etc)
</script>

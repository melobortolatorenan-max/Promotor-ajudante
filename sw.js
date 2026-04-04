self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(clients.openWindow('/'));
});
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

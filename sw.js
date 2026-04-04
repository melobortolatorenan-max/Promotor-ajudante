self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NOTIFICAR') {
        const options = {
            body: event.data.body,
            icon: 'https://raw.githubusercontent.com/melobortolatorenan-max/Promotor-ajudante/main/logo.png',
            badge: 'https://raw.githubusercontent.com/melobortolatorenan-max/Promotor-ajudante/main/logo.png',
            vibrate: [200, 100, 200],
            data: { dateOfArrival: Date.now() }
        };
        self.registration.showNotification(event.data.title, options);
    }
});
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

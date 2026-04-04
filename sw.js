const CACHE_NAME = 'promotor-ajudante-v3'; // Mudamos a versão para forçar atualização

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
        </div>`;
    }
    lucide.createIcons();
}
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

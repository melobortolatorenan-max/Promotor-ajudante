    // Vigia de carregamento: se o app não sair da tela "Carregando..." em 12 segundos, mostra o motivo.
    window.__erros = [];
    window.addEventListener('error', function (e) { window.__erros.push((e.message || 'erro') + (e.lineno ? ' (linha ' + e.lineno + ')' : '')); });
    window.addEventListener('unhandledrejection', function (e) { window.__erros.push(String((e.reason && e.reason.message) || e.reason)); });
    setTimeout(function () {
        if (window.__appOk) return;
        var t = document.getElementById('carregando-txt');
        if (!t) return;
        var motivo = window.__erros.length
            ? 'Erro: ' + String(window.__erros[0]).replace(/[<>&]/g, '')
            : 'O arquivo do app pode estar incompleto (cortado ao colar no GitHub) ou a internet falhou.';
        t.innerHTML = 'O app não conseguiu iniciar<br><br><span style="text-transform:none;font-weight:500;letter-spacing:0;color:#9ca3af;font-size:11px;line-height:1.5;display:block">' + motivo +
            '</span><br><button onclick="location.reload()" style="background:#f59e0b;color:#030712;font-weight:900;border:0;border-radius:12px;padding:12px 18px;font-size:11px;text-transform:uppercase">Tentar de novo</button>';
    }, 12000);
    
// Botão "tentar de novo" da tela de carregamento (sem onclick no HTML)
document.addEventListener('click', (e) => {
  if (e.target.closest && e.target.closest('[data-reload]')) location.reload();
});
// Mensagem clara quando não há internet, em vez de ficar parado no "Carregando"
setTimeout(() => {
  const el = document.getElementById('carregando-txt');
  if (el && !window.__appOk && !navigator.onLine) {
    el.innerHTML = 'Sem conexão com a internet.<br><span class="normal-case font-medium text-gray-600">Verifique o Wi-Fi ou os dados do celular e tente de novo.</span><br><br><button data-reload="1" style="background:#f59e0b;color:#030712;font-weight:900;border:0;border-radius:12px;padding:12px 18px;font-size:11px">Tentar de novo</button>';
  }
}, 4000);
window.addEventListener('online', () => { if (!window.__appOk) location.reload(); });

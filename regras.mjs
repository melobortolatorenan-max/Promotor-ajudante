// Regras puras do app (sem tela nem banco), para poderem ser testadas automaticamente.

// Texto sem acento e sem maiúsculas, com espaços arrumados
export const normaliza = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

// Quantos dias separam duas datas AAAA-MM-DD
const diasEntre = (a, b) => (Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000;

// Motivo obrigatório só quando o vencimento for mais de 2 dias depois da retirada
export const motivoObrigatorio = (venc, ret) => {
  if (!venc || !ret) return false;
  return diasEntre(ret, venc) > 2;
};

const MESES = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// Converte a fala da validade ("dia 20 de novembro", "20/11", "amanhã", "hoje") em AAAA-MM-DD
export function parseValidade(txt, hoje) {
  const t = normaliza(txt);
  if (!t) return null;
  if (/\bhoje\b/.test(t)) return hoje;
  if (/\bamanha\b/.test(t)) {
    const [y, m, d] = hoje.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  }
  let d, m, a = null, r = t.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (r) { d = +r[1]; m = +r[2]; if (r[3]) a = +r[3]; }
  else {
    r = t.match(/(\d{1,2})\s*(?:de\s+)?([a-z]+)(?:\s+(?:de\s+)?(\d{4}))?/);
    if (!r) return null;
    const idx = MESES.findIndex(x => r[2].startsWith(x.slice(0, 3)));
    if (idx < 0) return null;
    d = +r[1]; m = idx + 1; if (r[3]) a = +r[3];
  }
  if (a && a < 100) a += 2000;
  const ano = a || Number(hoje.slice(0, 4));
  let iso = `${ano}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  if (!a && iso < hoje) iso = `${ano + 1}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && !isNaN(Date.parse(iso + 'T00:00:00Z')) && m >= 1 && m <= 12 && d >= 1 && d <= 31 ? iso : null;
}

// Distância de edição entre dois textos (quantas letras precisam mudar)
export function distancia(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

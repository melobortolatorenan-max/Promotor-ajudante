// Testes das regras do app. Rodar na pasta do projeto com: node --test testes/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normaliza, motivoObrigatorio, parseValidade, distancia } from '../regras.mjs';

const HOJE = '2026-11-14';

test('motivo só é obrigatório com mais de 2 dias de diferença', () => {
  assert.equal(motivoObrigatorio('2026-11-11', '2026-11-10'), false); // 1 dia
  assert.equal(motivoObrigatorio('2026-11-12', '2026-11-10'), false); // 2 dias
  assert.equal(motivoObrigatorio('2026-11-13', '2026-11-10'), true);  // 3 dias
  assert.equal(motivoObrigatorio('', '2026-11-10'), false);
});

test('validade: texto em português com dia e mês', () => {
  assert.equal(parseValidade('dia 20 de novembro', HOJE), '2026-11-20');
  assert.equal(parseValidade('20/11', HOJE), '2026-11-20');
  assert.equal(parseValidade('20/11/2027', HOJE), '2027-11-20');
});

test('validade: data que já passou no ano vai para o ano seguinte', () => {
  assert.equal(parseValidade('05/11', HOJE), '2027-11-05');
});

test('validade: hoje e amanhã', () => {
  assert.equal(parseValidade('hoje', HOJE), HOJE);
  assert.equal(parseValidade('amanhã', HOJE), '2026-11-15');
});

test('validade: texto que não é data retorna null', () => {
  assert.equal(parseValidade('qualquer coisa', HOJE), null);
  assert.equal(parseValidade('', HOJE), null);
});

test('normaliza tira acento e maiúscula', () => {
  assert.equal(normaliza('Pão Sanduíche'), 'pao sanduiche');
});

test('distância: pequenos erros de digitação', () => {
  assert.equal(distancia('fermentacao', 'fermentacao'), 0);
  assert.equal(distancia('fermentacao', 'fermentacaoo'), 1);
  assert.equal(distancia('fermentacao', 'fermentacao'.replace('c', 'x')), 1);
});

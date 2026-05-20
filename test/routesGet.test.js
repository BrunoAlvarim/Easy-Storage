const { server, closePool } = require('../server');
const request = require('supertest');

// Fecha o servidor e o pool após os testes
afterAll(async () => {
  server.close();
  await closePool();
});

describe('Testando GET nas rotas', () => {
  const rotas = [
    '/cadastro',
    '/estoque',
    '/gerenciador',
    '/lucros',
    '/theme',
    '/relatorios',
    '/sobre',
    '/usuario',
  ];

  rotas.forEach((rota) => {
    test(`GET ${rota}`, async () => {
      const response = await request(server).get(rota);
      console.log(`Resposta da rota ${rota}:`, response.body);
      expect([200, 404]).toContain(response.statusCode);
    });
  });
});
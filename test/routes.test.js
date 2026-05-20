const request = require('supertest');
const { app, server, closePool } = require('../server');

afterAll(async () => {
  server.close();
  await closePool();
});

describe('Testando rotas do servidor', () => {
  const rotas = [
    '/cadastro',
    '/estoque',
    '/gerenciador',
    '/lucros',
    '/theme',
    '/relatorios',
    '/sobre',
    '/usuario'
  ];

  rotas.forEach((rota) => {
    test(`GET ${rota}`, async () => {
      const response = await request(app).get(rota);
      expect([200, 404]).toContain(response.statusCode);
    });
  });
});
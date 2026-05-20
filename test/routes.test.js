const request = require('supertest');
const app = require('../server'); // Certifique-se de que o arquivo server.js exporta o app

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
      expect(response.statusCode).toBe(200); // Ajuste o código esperado conforme necessário
    });
  });
});
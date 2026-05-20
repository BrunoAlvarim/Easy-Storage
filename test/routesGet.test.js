const request = require('supertest');
const { app } = require('../server'); // Importa apenas o app para evitar conflitos

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
      const response = await request(app).get(rota);
      console.log(`Resposta da rota ${rota}:`, response.body);
      expect(response.statusCode).toBe(200); // Ajuste conforme necessário
    });
  });
});
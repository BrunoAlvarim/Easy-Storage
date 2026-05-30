const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos
app.use(express.static('html'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/backend', express.static('backend'));

// ==============================
// CONFIG BANCO
// ==============================
const pool = new Pool({
  host: process.env.DB_HOST || "ep-patient-cake-anjwy37x-pooler.c-6.us-east-1.aws.neon.tech",
  user: process.env.DB_USER || "neondb_owner",
  password: process.env.DB_PASS || "npg_tmoHu2eRbU6r",
  database: process.env.DB_NAME || "neondb",
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool do PostgreSQL:', err.message || err);
});

if (process.env.NODE_ENV === 'test') {
  console.log('🔧 Ambiente de teste detectado. Simulando banco de dados.');
  pool.query = jest.fn().mockResolvedValue({ rows: [] }); // Simula consultas ao banco
}

// ==============================
// INICIALIZAÇÃO - Verificar/Criar Colunas
// ==============================
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao banco PostgreSQL');

    // Adicionar coluna 'removido' na tabela 'item' se não existir
    try {
      await client.query(`
        ALTER TABLE item 
        ADD COLUMN IF NOT EXISTS removido BOOLEAN DEFAULT FALSE;
      `);
      console.log('✅ Coluna "removido" verificada/criada na tabela "item"');
    } catch (altErr) {
      if (altErr.message.includes('already exists')) {
        console.log('ℹ️ Coluna "removido" já existe na tabela "item"');
      } else {
        console.warn('⚠️ Aviso ao criar coluna removido:', altErr.message);
      }
    }

    client.release();
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco:', err.message || err);
  }
})();

// ==============================
// TESTE
// ==============================
app.get('/ping', (req, res) => res.json({ ok: true }));

// ==============================
// CADASTRO
// ==============================
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const existingUser = await pool.query(
      'SELECT * FROM usuario WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email já cadastrado!' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    await pool.query(
      'INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3)',
      [nome, email, hashedPassword]
    );

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
  }
});

// ==============================
// LOGIN
// ==============================
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM usuario WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    const validPassword = await bcrypt.compare(
      senha,
      user.rows[0].senha
    );

    if (!validPassword) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    res.status(200).json({
      message: 'Login bem-sucedido!',
      usuario: {
        id_usuario: user.rows[0].id_usuario,
        nome: user.rows[0].nome,
        email: user.rows[0].email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao realizar login.' });
  }
});

// ==============================
// CRUD ITEM
// ==============================

app.get('/api/item', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM item WHERE COALESCE(removido, FALSE) = FALSE ORDER BY id_item DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("ERRO REAL:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/item', async (req, res) => {
  const { codigo, nome, descricao, condicao } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO item (codigo, nome, descricao, condicao)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [codigo, nome, descricao, condicao]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("ERRO REAL:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/item/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo, nome, descricao, condicao } = req.body;

  try {
    const result = await pool.query(
      `UPDATE item 
       SET codigo=$1, nome=$2, descricao=$3, condicao=$4
       WHERE id_item=$5
       RETURNING *`,
      [codigo, nome, descricao, condicao, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
});

app.delete('/api/item/:id', async (req, res) => {
  const { id } = req.params;
  
  console.log('🗑️ DELETE /api/item/:id recebido com id:', id);

  try {
    const itemResult = await pool.query(
      'SELECT * FROM item WHERE id_item = $1',
      [id]
    );

    console.log('Item encontrado:', itemResult.rows.length > 0 ? itemResult.rows[0].nome : 'nenhum');

    if (itemResult.rows.length === 0) {
      console.warn('Item não encontrado:', id);
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    await pool.query(
      'UPDATE item SET removido = TRUE WHERE id_item = $1',
      [id]
    );

    console.log('✅ Item marcado como removido:', itemResult.rows[0].nome);
    res.json({ message: 'Item removido do estoque' });

  } catch (err) {
    console.error('❌ Erro ao remover item:', err.message);
    res.status(500).json({ error: 'Erro ao remover item: ' + err.message });
  }
});

// ==============================
// RELATÓRIOS
// ==============================

app.get('/api/relatorio/itens-mes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT codigo, nome, descricao, condicao, data_entrada
      FROM item
      WHERE EXTRACT(MONTH FROM data_entrada) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM data_entrada) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND COALESCE(removido, FALSE) = FALSE
      ORDER BY data_entrada DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar itens do mês' });
  }
});

app.get('/api/relatorio/saidas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT codigo, nome, descricao, condicao, data_entrada as data_saida
      FROM item 
      WHERE removido = TRUE
      ORDER BY data_entrada DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar saídas' });
  }
});

// ==============================
// PDF
// ==============================
app.get('/api/relatorio/exportar/:tipo', async (req, res) => {
  const { tipo } = req.params;

  let query, titulo;

  if (tipo === 'itens') {
    query = `
      SELECT codigo, nome, descricao, condicao, data_entrada AS data
      FROM item
      WHERE EXTRACT(MONTH FROM data_entrada) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM data_entrada) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND COALESCE(removido, FALSE) = FALSE
    `;
    titulo = 'Itens do mês';
  } else if (tipo === 'saidas') {
    query = `
      SELECT codigo, nome, descricao, condicao, data_entrada AS data
      FROM item
      WHERE removido = TRUE
    `;
    titulo = 'Itens removidos';
  } else {
    return res.status(400).json({ error: 'Tipo inválido' });
  }

  try {
    const result = await pool.query(query);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_${tipo}.pdf`);

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text(`Relatório - ${titulo}`, { align: 'center' });
    doc.moveDown();

    result.rows.forEach(row => {
      doc.fontSize(12)
        .text(`Código: ${row.codigo}`)
        .text(`Nome: ${row.nome}`)
        .text(`Descrição: ${row.descricao}`)
        .text(`Condição: ${row.condicao}`)
        .moveDown();
    });

    doc.end();

  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
});

// ==============================
// DASHBOARD
// ==============================
app.get('/api/dashboard/estatisticas', async (req, res) => {
  try {
    const totalItens = await pool.query(
      'SELECT COUNT(*) FROM item'
    );

    const itensEstoque = await pool.query(
      "SELECT COUNT(*)::int AS total FROM item WHERE COALESCE(removido, FALSE) = FALSE"
    );

    console.log('RAW itensEstoque:', JSON.stringify(itensEstoque.rows));

    const itensRemovidos = await pool.query(
      "SELECT COUNT(*) FROM item WHERE removido = TRUE"
    );

    const itensMes = await pool.query(`
      SELECT COUNT(*) FROM item
      WHERE DATE_PART('month', data_entrada) = DATE_PART('month', CURRENT_DATE)
      AND DATE_PART('year',  data_entrada) = DATE_PART('year',  CURRENT_DATE)
      AND COALESCE(removido, FALSE) = FALSE
    `);

    const condicoes = await pool.query(`
      SELECT condicao, COUNT(*) as quantidade
      FROM item
      WHERE COALESCE(removido, FALSE) = FALSE
      AND condicao IS NOT NULL
      GROUP BY condicao
      ORDER BY condicao
    `);

    res.json({
      totalItens:            parseInt(totalItens.rows[0].count),
      itensEstoque:          itensEstoque.rows[0].total,
      itensRemovidos:        parseInt(itensRemovidos.rows[0].count),
      itensMes:              parseInt(itensMes.rows[0].count),
      distribuicaoCondicoes: condicoes.rows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// CRUD LUCRO
// ==============================

app.get('/api/lucro', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, i.nome, i.codigo
      FROM lucro l
      JOIN item i ON i.id_item = l.id_item
      ORDER BY l.id_lucro DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/lucro', async (req, res) => {
  const { id_item, custo, venda, reparo } = req.body;
  try {
    // Upsert: salva ou atualiza se já existir para o mesmo item
    const result = await pool.query(`
      INSERT INTO lucro (id_item, custo, venda, reparo)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id_item)
      DO UPDATE SET custo=$2, venda=$3, reparo=$4, atualizado_em=NOW()
      RETURNING *
    `, [id_item, custo, venda, reparo]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/lucro/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM lucro WHERE id_lucro=$1', [req.params.id]);
    res.json({ message: 'Lucro excluído' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

let server;
const isVercel = !!process.env.VERCEL;

// Em ambientes normais (desenvolvimento) iniciamos o servidor localmente.
// Em Vercel e em ambientes serverless, NÃO chamamos app.listen — Vercel
// trata o export padrão como handler.
if (process.env.NODE_ENV === 'test') {
  // Para testes, manter um servidor escutando (pode ser necessário para alguns harnesses)
  server = app.listen();
} else if (!isVercel) {
  const port = process.env.PORT || 3001;
  const { exec } = require('child_process');

  server = app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
    console.log('✅ Sistema inicializado com sucesso');

    const url = `http://localhost:${port}/login.html`;

    // Abre automaticamente no Windows
    try { exec(`start ${url}`); } catch (e) { /* não crítico */ }
  });
} else {
  // Em Vercel, não iniciamos o listener. server fica undefined.
  server = undefined;
}

// Exporta o `app` (Express é uma função compatível com handler do Vercel).
// Anexamos propriedades úteis para testes locais (`server`) e para fechar o pool.
module.exports = app;
module.exports.server = server;
module.exports.closePool = () => pool.end();

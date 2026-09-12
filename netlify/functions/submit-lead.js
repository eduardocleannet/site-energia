// netlify/functions/submit-lead.js
//
// Recebe o formulário do site e grava o lead no Firestore, no mesmo banco
// usado pelo seu CRM (projeto Firebase "crm---parceiros-cogecom"), com
// exatamente os mesmos campos que a tela "Novo Lead" do próprio CRM grava —
// confirmado lendo o código-fonte do CRM. Assim, um lead vindo do site
// aparece no funil idêntico a um lead cadastrado manualmente.
//
// O QUE VOCÊ AINDA PRECISA FAZER (só isso, o resto já está pronto):
// 1. Gerar uma "service account key" no Firebase:
//    console.firebase.google.com → seu projeto → ⚙️ Configurações do projeto
//    → aba "Contas de serviço" → "Gerar nova chave privada" → baixa um .json
// 2. No Netlify, em Site settings → Environment variables, criar 3 variáveis
//    usando os valores desse .json:
//      FIREBASE_PROJECT_ID   → valor de "project_id"
//      FIREBASE_CLIENT_EMAIL → valor de "client_email"
//      FIREBASE_PRIVATE_KEY  → valor de "private_key" (cole tudo, com as
//                               linhas -----BEGIN PRIVATE KEY----- e -----END...)
// (O passo a passo completo, com prints de tela, está no LEIA-ME.md)

const admin = require('firebase-admin');

// CORS: o site e esta function sobem juntos no mesmo domínio do Netlify, então
// isso não é estritamente necessário — mas não faz mal manter como segurança extra.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // no Netlify a chave vem com \n escapado — precisa converter de volta
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Mesmo formato de data usado em todo o CRM: "AAAA-MM-DD" (string, não Timestamp)
const today = () => new Date().toISOString().split('T')[0];

// Limite simples de tamanho pra evitar payloads absurdos/abuso
function clean(str, max) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, max || 300);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.handler = async function (event) {
  // O navegador manda uma requisição OPTIONS antes do POST real, pra checar CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  const nome = clean(data.nome, 120);
  const telefone = clean(data.whatsapp, 30); // o formulário chama de "whatsapp", o CRM chama de "telefone"
  const email = clean(data.email, 150);
  const cidade = clean(data.cidade, 120);

  if (!nome || !telefone || !email || !isValidEmail(email)) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Dados obrigatórios faltando ou inválidos' }) };
  }

  // Monta um texto de origem parecido com o que você já usa no campo "Origem"
  // do Novo Lead manual, incluindo de qual campanha/anúncio a pessoa veio.
  const utmSource = clean(data.utm_source, 60);
  const utmCampaign = clean(data.utm_campaign, 60);
  let origem = 'Site';
  if (utmSource) origem += ' — ' + utmSource;
  if (utmCampaign) origem += ' (' + utmCampaign + ')';

  const agora = today();

  // Estes são exatamente os mesmos campos que window.salvarNovoLead grava
  // no CRM quando você cadastra um lead manualmente — email e cidade são os
  // únicos dois campos extras (o CRM não tem essas colunas hoje, mas gravá-las
  // não quebra nada; elas só não aparecem na tela até o CRM ser atualizado
  // para mostrá-las).
  const lead = {
    nome,
    telefone,
    email,
    cidade,
    origem,
    fornecedor: null,
    etapa: 'abordagem',
    criadoEm: agora,
    ultimoContato: agora,
    operador: null,
    tipoPessoa: null,
    temOutroDecisor: null,
    motivoParado: null,
    followUpCount: 0,
    economiaAnual: null,
    percentualMedio: null,
    kwhMedio: null,
    perdido: false,
    indicacaoSolicitada: false,
    entregue: false,
    historico: [{ data: agora, texto: 'Lead criado pelo site' }],
  };

  try {
    const ref = await db.collection('leads').add(lead);
    // Mesma tarefa automática que o CRM cria pra todo lead novo, pra já
    // aparecer na fila de "Atender próximo lead".
    await db.collection('tarefas_leads').add({
      leadId: ref.id,
      data: agora,
      nota: 'Enviar abordagem inicial',
      concluida: false,
    });
  } catch (err) {
    console.error('Erro ao gravar lead no Firestore:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Erro ao salvar' }) };
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ ok: true }),
  };
};

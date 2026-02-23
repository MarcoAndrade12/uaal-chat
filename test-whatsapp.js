const axios = require('axios');

const WEBHOOK_URL = 'http://localhost:3000/chat/whatsapp/webhook';
const VERIFY_TOKEN = 'meu_token_secreto'; // Defina o mesmo no seu .env

async function testWebhookVerification() {
  console.log('--- Testando Verificação de Webhook ---');
  try {
    const response = await axios.get(WEBHOOK_URL, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': VERIFY_TOKEN,
        'hub.challenge': '123456789'
      }
    });
    console.log('Resposta:', response.data);
    if (response.data === 123456789) {
      console.log('✅ Verificação bem-sucedida!');
    }
  } catch (error) {
    console.error('❌ Erro na verificação:', error.response?.status, error.response?.data);
  }
}

async function testIncomingMessage() {
  console.log('\n--- Testando Recebimento de Mensagem ---');
  const payload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: { display_phone_number: '123456789', phone_number_id: '123456789' },
          contacts: [{ profile: { name: 'João Silva' }, wa_id: '5511999999999' }],
          messages: [{
            from: '5511999999999',
            id: 'wamid.HBgLNTUxMTk5OTk5OTk5OQYVMRYfBAs',
            timestamp: '1666565145',
            text: { body: 'Olá, como você pode me ajudar?' },
            type: 'text'
          }]
        },
        field: 'messages'
      }]
    }]
  };

  try {
    const response = await axios.post(WEBHOOK_URL, payload);
    console.log('Status da Resposta:', response.status);
    if (response.status === 200) {
      console.log('✅ Mensagem enviada para o webhook com sucesso!');
      console.log('Verifique os logs do servidor para ver a IA processando a resposta.');
    }
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error.response?.status, error.response?.data);
  }
}

// Para rodar este teste, certifique-se que o servidor NestJS está rodando (npm run start:dev)
// e instale o axios: npm install axios
// testWebhookVerification();
// testIncomingMessage();

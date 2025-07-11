const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  console.log('📥 Webhook recebido:', JSON.stringify(req.body, null, 2));
  const body = req.body;

  // Ignora pedidos da Tray
  if (body?.metadata?.origem === 'tray') {
    console.log('⚠️ Pagamento da Tray ignorado.');
    return res.status(200).send('Ignorado');
  }

  if (body.current_status === 'paid') {
    // Montagem do pedido
    const pedido = {
      customer: {
        name: body.customer?.name || 'Nome não informado',
        email: body.customer?.email || 'sem@email.com',
        phone: body.customer?.phone_numbers?.[0] || '',
      },
      items: [
        {
          code: body.metadata?.sku || 'SKU',
          description: body.metadata?.descricao || 'Produto',
          quantity: 1,
          unit_value: body.amount / 100,
        },
      ],
    };

    console.log('📦 Enviando pedido para Bling:', pedido);

    try {
      const response = await axios.post(
        'https://www.bling.com.br/Api/v3/orders',
        pedido,
        {
          headers: {
            Authorization: `Bearer ${process.env.BLING_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Pedido criado no Bling:', response.data);
      res.status(200).send('Pedido criado com sucesso');
    } catch (err) {
      console.error('❌ Erro ao criar pedido no Bling:', err?.response?.data || err.message);
      res.status(500).send('Erro ao criar pedido');
    }
  } else {
    console.log('🔄 Status não é "paid". Ignorado.');
    res.status(200).send('Status não tratado');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook ouvindo na porta ${PORT}`);
});


const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const body = req.body;

  // Ignorar se a origem for 'tray'
  if (body.metadata?.origem === 'tray') {
    console.log('Pagamento da Tray ignorado.');
    return res.status(200).send('Ignorado');
  }

  // Confirmação de pagamento
  if (body.current_status === 'paid') {
    const pedido = {
      cliente: {
        nome: body.customer?.name || 'Nome não informado',
        email: body.customer?.email || 'sem@email.com',
        telefone: body.customer?.phone_numbers?.[0] || '',
      },
      itens: [
        {
          codigo: body.metadata?.sku || 'SKU',
          descricao: body.metadata?.descricao || 'Produto',
          quantidade: 1,
          valor_unitario: body.amount / 100,
        },
      ],
    };

    try {
      const response = await axios.post(
        'https://bling.com.br/Api/v3/pedido',
        pedido,
        {
          headers: {
            Authorization: `Bearer ${process.env.BLING_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Pedido criado no Bling:', response.data);
      res.status(200).send('Pedido criado');
    } catch (err) {
      console.error('Erro ao criar pedido:', err?.response?.data || err.message);
      res.status(500).send('Erro ao criar pedido');
    }
  } else {
    res.status(200).send('Status ignorado');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook ouvindo na porta ${PORT}`);
});

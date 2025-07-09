const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  const data = req.body;
  const metadata = data?.payload?.payment?.metadata;

  if (
    data.event === 'payment.paid' &&
    metadata &&
    metadata.origem?.toLowerCase() !== 'tray'
  ) {
    const payment = data.payload.payment;
    const cliente = payment.customer.name || 'Cliente Pagar.me';
    const email = payment.customer.email || 'sememail@exemplo.com';
    const valor = payment.amount / 100;

    const pedidoXML = `
      <pedido>
        <cliente>
          <nome>${cliente}</nome>
          <email>${email}</email>
        </cliente>
        <itens>
          <item>
            <codigo>001</codigo>
            <descricao>Venda via Pagar.me</descricao>
            <quantidade>1</quantidade>
            <valor>${valor}</valor>
          </item>
        </itens>
        <forma_pagamento>
          <forma>PIX</forma>
        </forma_pagamento>
      </pedido>
    `;

    try {
      const response = await axios.post(
        'https://bling.com.br/Api/v2/pedido/json/',
        null,
        {
          params: {
            apikey: process.env.BLING_API_KEY,
            xml: pedidoXML
          }
        }
      );

      console.log('✅ Pedido criado no Bling com sucesso!', response.data);
    } catch (error) {
      console.error('❌ Erro ao criar pedido no Bling:', error.response?.data || error);
    }
  } else {
    console.log('🚫 Evento ignorado: origem Tray ou inválida.');
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

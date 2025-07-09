const express = require("express");
const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

app.post("/webhook", async (req, res) => {
  const evento = req.body;
  const origem = evento?.metadata?.origem;

  console.log("🔔 Webhook recebido:", JSON.stringify(evento));

  if (origem === "tray") {
    console.log("🚫 Evento ignorado por ser da origem 'tray'");
    return res.status(200).send("Ignorado");
  }

  // Em breve: lógica para integrar com o Bling.
  res.status(200).send("Pagamento aceito. Integração será processada.");
});

app.listen(port, () => {
  console.log(`🚀 Webhook ouvindo na porta ${port}`);
});

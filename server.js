const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  const { mailInput, extra, tone } = req.body;

  const systemPrompt = `
Tu es l'assistant mail de Mourad.
Ton ton est ${tone || "professionnel"}.
Sois clair, poli, humain et naturel.
Ne répète jamais le mail reçu.
`;

  const userPrompt = `
Mail:
"""${mailInput}"""

Consignes:
${extra || "Aucune"}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(3000, () => console.log("Backend prêt sur port 3000"));

// server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

// middlewares
app.use(cors());            // dozvoljava pozive iz browsera (Adalo i sl.)
app.use(express.json());    // parsira JSON telo zahteva

// health check
app.get("/", (_req, res) => {
  res.send("✅ Excel Chat Backend is running!");
});

// chat endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: "Missing 'message' in body" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        // Ako želiš stariji model, zameni sa "gpt-3.5-turbo"
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content ?? "";
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    res.status(500).json({
      error: "OpenAI request failed",
      details: err.response?.data || err.message,
    });
  }
});

// Render koristi PORT iz okruženja
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

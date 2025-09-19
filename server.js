const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());                 // dozvoli pozive iz Adalo-a
app.use(bodyParser.json());

// Health-check
app.get("/", (req, res) => {
  res.send("✅ Excel Chat Backend is running!");
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing 'message' in body" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
        temperature: 0.6,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content?.trim() ||
      "Nešto nije u redu sa odgovorom.";

    res.json({ reply }); // čist JSON koji Adalo lako mapira
  } catch (err) {
    console.error("OpenAI error:", err?.response?.data || err.message);
    res.status(500).json({
      error: "Chat error",
      details: err?.response?.data || err.message,
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

const SUNO_API_KEY = process.env.SUNO_API_KEY || "";
const SUNO_API_BASE = "https://api.sunoapi.org/api/v1";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Generate a song
app.post("/api/generate", async (req, res) => {
  const { prompt, style, title, customMode, instrumental, model } = req.body;

  const payload = {
    prompt,
    customMode: customMode || false,
    instrumental: instrumental || false,
    model: model || "V4_5ALL",
  };

  if (customMode) {
    if (style) payload.style = style;
    if (title) payload.title = title;
  }

  try {
    const response = await fetch(`${SUNO_API_BASE}/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUNO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check generation status
app.get("/api/status", async (req, res) => {
  const { taskId } = req.query;

  if (!taskId) {
    return res.status(400).json({ error: "taskId is required" });
  }

  try {
    const response = await fetch(
      `${SUNO_API_BASE}/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
      {
        headers: {
          Authorization: `Bearer ${SUNO_API_KEY}`,
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check remaining credits
app.get("/api/credits", async (req, res) => {
  try {
    const response = await fetch(`${SUNO_API_BASE}/get-credits`, {
      headers: {
        Authorization: `Bearer ${SUNO_API_KEY}`,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Suno Song Generator running at http://localhost:${PORT}`);
});

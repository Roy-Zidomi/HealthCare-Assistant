import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";

const app = express();
const ai = new GoogleGenAI({});

// middleware HARUS di atas route
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer();

// routes
app.get("/halo", (req, res) => {
    res.json({ halo: "Halo, dunia!" });
});

app.post("/generate-text", upload.none(), async (req, res) => {
    const payload = req.body;

    const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: payload.message,
        config: {
            systemInstructions:
                "Kamu adalah asisten yang membantu menjawab pertanyaan dengan informasi yang akurat dan relevan.",
        },
    });

    res.json(aiResponse.text);
});

app.post(
  "/generate-from-image",
  upload.single("image"),
  async (req, res) => {
    try {
      const prompt = req.body.message;
      const file = req.file;

      // validasi input
      if (!file) {
        return res.status(400).json({
          error: "Image wajib diupload",
        });
      }

      const base64Image = file.buffer.toString("base64");

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt || "Jelaskan gambar ini",
              },
              {
                inlineData: {
                  mimeType: file.mimetype,
                  data: base64Image,
                },
              },
            ],
          },
        ],
      });

      res.status(200).json({
        result: response.text,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: e.message,
      });
    }
  }
);


app.listen(3000, () => {
    console.log("Server berjalan di http://localhost:3000");
});

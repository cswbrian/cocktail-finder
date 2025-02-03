require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { auth } = require('express-oauth2-jwt-bearer');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.auth?.sub || 'anonymous'
});

const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

app.post('/api/suggest-cocktails', 
  // checkJwt, 
  limiter, async (req, res) => {
  const { flavorProfile, strength, baseSpirit, sparkling } = req.body;
  
  const prompt = `As a professional mixologist, suggest 5 cocktails with these preferences:
  - Flavor profile: ${flavorProfile.join(', ')}
  - Strength preference: ${strength}
  - Base spirit: ${baseSpirit}
  - Sparkling preference: ${sparkling === 'yes' ? 'with sparkling' : 'without sparkling'}
  
  Return the suggestions in this exact JSON format:
  {
    "suggestions": [
      {
        "name": "Cocktail Name",
        "baseSpirits": [
          {
            "name": "spirit name",
            "amount": 30,
            "unit": "ml"
          }
        ],
        "liqueurs": [
          {
            "name": "liqueur name",
            "amount": 15,
            "unit": "ml"
          }
        ],
        "ingredients": [
          {
            "name": "ingredient name",
            "amount": 30,
            "unit": "ml"
          }
        ],
        "garnish": "garnish description",
        "reason": "Why this cocktail matches the preferences",
        "relevanceScore": 0.95,
        "sources": [
          "https://www.example.com/cocktail1",
          "https://www.example.com/cocktail2"
        ]
      }
    ]
  }`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('Gemini API Response:', response.text());
    const jsonResponse = JSON.parse(response.text());
    res.json(jsonResponse);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

app.get('/your-endpoint', (req, res) => {
  res.json({ message: 'Hello from Render!' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
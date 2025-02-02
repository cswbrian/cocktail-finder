require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { auth } = require('express-oauth2-jwt-bearer');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
app.use(cors());
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

app.post('/api/suggest-cocktails', checkJwt, limiter, async (req, res) => {
  const { flavorProfile, abv, strength, baseSpirit } = req.body;
  
  const prompt = `As a professional mixologist, suggest 5 cocktails with these preferences:
  - Flavor profile: ${flavorProfile}
  - ABV range: ${abv}
  - Strength preference: ${strength}
  - Base spirit: ${baseSpirit}
  
  Return the suggestions in this exact JSON format:
  {
    "suggestions": [
      {
        "name": "Cocktail Name",
        "baseSpirit": "Main spirit",
        "otherIngredients": ["ingredient1", "ingredient2"],
        "potentialAllergens": ["allergen1", "allergen2"],
        "reason": "Why this cocktail matches the preferences"
      }
    ]
  }`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
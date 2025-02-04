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
  const { flavorProfile, baseSpirits, bubbles, sweetness, booziness } = req.body;
  
  // Convert sweetness to description if provided
  const sweetnessDescription = sweetness !== undefined ? 
    sweetness <= -0.8 ? 'very sour' :
    sweetness <= -0.3 ? 'sour' :
    sweetness <= 0.3 ? 'balanced' :
    sweetness <= 0.8 ? 'sweet' :
    'very sweet' : null;
  
  // Convert booziness to description if provided
  const boozinessDescription = booziness !== undefined ? 
    booziness <= -0.8 ? 'very light' :
    booziness <= -0.3 ? 'light' :
    booziness <= 0.3 ? 'medium' :
    booziness <= 0.8 ? 'strong' :
    'very strong' : null;
  
  // Build prompt dynamically based on provided parameters
  const preferences = [
    flavorProfile?.length > 0 && `- Flavor profile: ${flavorProfile.join(', ')}`,
    baseSpirits?.length > 0 && `- Base spirits: ${baseSpirits.join(', ')}`,
    bubbles && `- ${bubbles === 'yes' ? 'This cocktail contains bubbles.' : 'This cocktail doesn\'t contain bubbles.'}`,
    sweetnessDescription && `- Sweetness level: ${sweetnessDescription}`,
    boozinessDescription && `- Alcohol content: ${boozinessDescription}`
  ].filter(Boolean).join('\n');

  const prompt = `As a professional mixologist, create cocktail suggestions following these EXACT requirements:

# User Preferences
${preferences || 'No specific preferences provided'}

# Flavor Profile Requirements
1. Sweet-Sour Balance: ${sweetnessDescription ? `${sweetnessDescription} (${sweetness})` : 'Not specified'}
2. Alcohol Strength: ${boozinessDescription ? `${boozinessDescription} (${booziness})` : 'Not specified'} 
3. Carbonation: ${bubbles === 'yes' ? 'Required' : 'Not desired'}

# Base Spirit Priority
${baseSpirits.length > 0 ? `PRIMARY: ${baseSpirits.join(', ')}` : 'Any quality base spirits acceptable'}

# Required Structure
- Develop 5 distinct cocktails
- Prioritize clarity in flavor composition
- Balance ingredients for harmonious taste
- Consider modern mixology techniques
- Ensure structural integrity of drinks

# Response Formatting Rules 
{
  "suggestions": [
    {
      "name": "(Creative cocktail name)",
      "baseSpirits": [
        {
          "name": "(Specific spirit)",
          "amount": (15-60),
          "unit": "ml"
        }
      ],
      "ingredients": [
        {
          "name": "(Ingredient)",
          "amount": (1-60),
          "unit": "ml|dash|piece"
        }
      ],
      "technique": "(Preparation method)",
      "garnish": "(Specific garnish)",
      "flavor_profile": {
        "sweetness": ${sweetness},
        "booziness": ${booziness},
        "balance_rating": 0.0-1.0
      },
      "rationale": "(Technical explanation of preference matching)",
      "source_links": [
        "(Verified cocktail DB URL)"
      ]
    }
  ]
}

Important Notes:
1. ALWAYS maintain exact JSON structure
2. Use precise measurements
3. Source links must be valid cocktail database URLs
4. Omit unspecified parameters
5. Never invent unspecified preferences`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Log the finalized prompt
    console.log('Finalized Prompt:', prompt);
    
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
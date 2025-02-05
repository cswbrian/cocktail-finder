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
  const { flavorProfile, baseSpirits, bubbles, booziness, sweetness, sourness, bodyWeight, complexity } = req.body;
  
  // Convert parameters to descriptions
  const boozinessDescription = booziness !== undefined ? 
    booziness <= 2 ? 'very light' :
    booziness <= 4 ? 'light' :
    booziness <= 6 ? 'medium' :
    booziness <= 8 ? 'strong' :
    'very strong' : null;

  const sweetnessDescription = sweetness !== undefined ? 
    sweetness <= 2 ? 'very dry' :
    sweetness <= 4 ? 'dry' :
    sweetness <= 6 ? 'balanced' :
    sweetness <= 8 ? 'sweet' :
    'very sweet' : null;

  const sournessDescription = sourness !== undefined ? 
    sourness <= 2 ? 'not sour' :
    sourness <= 4 ? 'slightly sour' :
    sourness <= 6 ? 'moderately sour' :
    sourness <= 8 ? 'sour' :
    'very sour' : null;

  const bodyWeightDescription = bodyWeight !== undefined ? 
    bodyWeight <= 2 ? 'very light' :
    bodyWeight <= 4 ? 'light' :
    bodyWeight <= 6 ? 'medium' :
    bodyWeight <= 8 ? 'heavy' :
    'very heavy' : null;

  const complexityDescription = complexity !== undefined ? 
    complexity <= 2 ? 'very simple' :
    complexity <= 4 ? 'simple' :
    complexity <= 6 ? 'moderate' :
    complexity <= 8 ? 'complex' :
    'very complex' : null;

  // Build prompt dynamically based on provided parameters
  const preferences = [
    flavorProfile?.length > 0 && `- Flavor profile: ${flavorProfile.join(', ')}`,
    baseSpirits?.length > 0 && `- Base spirits: ${baseSpirits.join(', ')}`,
    bubbles && `- ${bubbles === 'yes' ? 'This cocktail contains bubbles.' : 'This cocktail doesn\'t contain bubbles.'}`,
    boozinessDescription && `- Alcohol content: ${boozinessDescription} (${booziness}/10)`,
    sweetnessDescription && `- Sweetness level: ${sweetnessDescription} (${sweetness}/10)`,
    sournessDescription && `- Sourness level: ${sournessDescription} (${sourness}/10)`,
    bodyWeightDescription && `- Body/Weight: ${bodyWeightDescription} (${bodyWeight}/10)`,
    complexityDescription && `- Complexity: ${complexityDescription} (${complexity}/10)`
  ].filter(Boolean).join('\n');

  const prompt = `As a professional mixologist specializing in classic cocktails, create Savoy-aligned suggestions following these EXACT requirements:

# User Requirements
${preferences || 'No specific preferences provided'}

# Historical Mandates
1. PRIMARY SOURCE: The Savoy Cocktail Book (1930) as foundation
2. SPIRIT REQUIREMENT: ${baseSpirits.length > 0 ? `MUST USE ${baseSpirits.join(', ')}` : 'Classic spirits preferred'}
3. TECHNIQUE: Period-accurate preparation methods
4. MODERN TWISTS: Only if significantly better match parameters

# Construction Rules
- 3 Savoy originals (with exact page references)
- 2 modern adaptations (when necessary)
- Vintage glassware specifications
- Historical measurement verification

# Response Formatting Rules 
{
  "suggestions": [
    {
      "name": "(Official Savoy name if original)",
      "baseSpirits": [
        {
          "name": "Plymouth Gin (1930s spec)",
          "amount": 45,
          "unit": "ml"
        }
      ],
      "ingredients": [
        {
          "name": "Fresh lemon juice",
          "amount": 20,
          "unit": "ml"
        }
      ],
      "technique": "Shaken hard (Craddock style)",
      "garnish": "Lemon spiral & cherry",
      "flavor_profile": {
        "sweetness": ${sweetness},
        "sourness": ${sourness},
        "booziness": ${booziness},
        "bodyWeight": ${bodyWeight},
        "complexity": ${complexity},
        "balance_rating": 0.92
      },
      "rationale": "Matches body/weight through [...]",
      "source_links": [
        "https://archive.org/details/savoycocktailbook0000unse"
      ]
    }
  ]
}

Critical Enforcement:
1. ${baseSpirits.length > 0 ? `STRICT BASE SPIRIT ADHERENCE: 
   - ${baseSpirits.join(', ')} MUST be used in all suggestions
   - Modern twists CANNOT replace specified base spirits` : 'Classic spirit preferences encouraged'}
   
2. Parameter Implementation Examples:
   - Sweetness (${sweetness}/10):
     * 0-2: Savoy Dry Martini (pg. 120)
     * 4-6: 20th Century Cocktail (pg. 23)
     * 8-10: Brandy Alexander (pg. 45)
     
   - Sourness (${sourness}/10):
     * 0-2: Tom Collins (pg. 68)
     * 4-6: White Lady (pg. 201)
     * 8-10: Whiskey Sour (1930s spec)
     
   - Booziness (${booziness}/10):
     * 0-2: Bamboo Cocktail (pg. 34)
     * 4-6: Hanky Panky (pg. 96)
     * 8-10: Vieux Carré (pg. 189)
     
   - Body/Weight (${bodyWeight}/10):
     * 0-2: French 75 (pg. 82)
     * 4-6: Manhattan (pg. 110)
     * 8-10: Egg Nog (pg. 72)
     
   - Complexity (${complexity}/10):
     * 0-2: Highball (pg. 99)
     * 4-6: Sidecar (pg. 160)
     * 8-10: Corpse Reviver #2 (pg. 60)

3. Modern Twist Rules:
   - Only modify secondary ingredients
   - Preserve original base spirit(s)
   - Maximum 1 twist per traditional recipe
   
4. Historical Verification:
   - Reject unverifiable pre-1950 cocktails
   - Page references must match 1930 Savoy edition`;

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
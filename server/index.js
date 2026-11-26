import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// ── Analyze food label image ──────────────────────────────────────────────────
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mediaType, profile, allergies } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

    const profileContext = profile
      ? `El usuario tiene perfil nutricional: **${profile.name}** — ${profile.description}. Sus objetivos: ${profile.goals?.join(', ')}.`
      : 'No se especificó perfil nutricional.';

    const allergyContext = allergies?.length
      ? `Alérgenos vigilados: ${allergies.join(', ')}.`
      : 'Sin alérgenos registrados.';

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 }
          },
          {
            type: 'text',
            text: `Eres un nutricionista experto analizando una etiqueta de alimento.

${profileContext}
${allergyContext}

Analiza esta etiqueta nutricional y responde en JSON con esta estructura exacta:
{
  "productName": "nombre del producto",
  "brand": "marca si es visible",
  "summary": "resumen de 2-3 oraciones sobre el producto",
  "compatibility": "COMPATIBLE" | "PRECAUCIÓN" | "NO COMPATIBLE",
  "compatibilityReason": "por qué es o no compatible con el perfil",
  "detectedAllergens": ["lista de alérgenos encontrados en el producto"],
  "alertAllergens": ["alérgenos del usuario presentes en el producto"],
  "nutrients": {
    "calories": "valor por porción",
    "protein": "valor",
    "carbs": "valor",
    "fat": "valor",
    "fiber": "valor si aparece",
    "sugar": "valor si aparece",
    "sodium": "valor si aparece"
  },
  "pros": ["beneficio 1", "beneficio 2"],
  "cons": ["desventaja 1", "desventaja 2"],
  "recommendation": "recomendación personalizada para el perfil del usuario en 1-2 oraciones"
}

Si no puedes leer la etiqueta claramente, indica lo que sí puedes ver. Responde SOLO con el JSON, sin markdown.`
          }
        ]
      }]
    });

    const text = message.content[0].text.trim();
    const json = JSON.parse(text);
    res.json(json);
  } catch (err) {
    console.error('analyze-image error:', err);
    res.status(500).json({ error: err.message || 'Error al analizar la imagen' });
  }
});

// ── Analyze barcode ───────────────────────────────────────────────────────────
app.post('/api/analyze-barcode', async (req, res) => {
  try {
    const { barcode, profile, allergies } = req.body;
    if (!barcode) return res.status(400).json({ error: 'No barcode provided' });

    // First try Open Food Facts
    const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const offData = await offRes.json();

    if (offData.status === 1 && offData.product) {
      const p = offData.product;
      const profileContext = profile
        ? `Perfil nutricional: ${profile.name} — ${profile.description}.`
        : '';
      const allergyContext = allergies?.length
        ? `Alérgenos vigilados: ${allergies.join(', ')}.`
        : '';

      const nutriments = p.nutriments || {};
      const productInfo = {
        name: p.product_name || p.product_name_es || 'Producto desconocido',
        brand: p.brands || '',
        ingredients: p.ingredients_text_es || p.ingredients_text || '',
        allergens: p.allergens_tags?.map(a => a.replace('en:', '').replace('es:', '')) || [],
        nutrients: {
          calories: nutriments['energy-kcal_100g'] ? `${nutriments['energy-kcal_100g']} kcal/100g` : 'N/A',
          protein: nutriments.proteins_100g ? `${nutriments.proteins_100g}g/100g` : 'N/A',
          carbs: nutriments.carbohydrates_100g ? `${nutriments.carbohydrates_100g}g/100g` : 'N/A',
          fat: nutriments.fat_100g ? `${nutriments.fat_100g}g/100g` : 'N/A',
          fiber: nutriments.fiber_100g ? `${nutriments.fiber_100g}g/100g` : 'N/A',
          sugar: nutriments.sugars_100g ? `${nutriments.sugars_100g}g/100g` : 'N/A',
          sodium: nutriments.sodium_100g ? `${nutriments.sodium_100g}g/100g` : 'N/A',
        }
      };

      // Ask Claude to interpret for the profile
      const msg = await client.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Producto encontrado: ${JSON.stringify(productInfo)}

${profileContext}
${allergyContext}

Analiza este producto y responde en JSON:
{
  "productName": "${productInfo.name}",
  "brand": "${productInfo.brand}",
  "summary": "resumen breve",
  "compatibility": "COMPATIBLE" | "PRECAUCIÓN" | "NO COMPATIBLE",
  "compatibilityReason": "razón",
  "detectedAllergens": ${JSON.stringify(productInfo.allergens)},
  "alertAllergens": ["alérgenos del usuario que aparecen en el producto"],
  "nutrients": ${JSON.stringify(productInfo.nutrients)},
  "pros": ["pro 1", "pro 2"],
  "cons": ["con 1", "con 2"],
  "recommendation": "recomendación personalizada"
}
Solo JSON, sin markdown.`
        }]
      });

      const text = msg.content[0].text.trim();
      res.json(JSON.parse(text));
    } else {
      res.status(404).json({ error: 'Producto no encontrado en la base de datos' });
    }
  } catch (err) {
    console.error('analyze-barcode error:', err);
    res.status(500).json({ error: err.message || 'Error al analizar el código de barras' });
  }
});

// ── Get recipe suggestions ────────────────────────────────────────────────────
app.post('/api/recipes', async (req, res) => {
  try {
    const { profile, allergies, count = 5 } = req.body;

    const profileContext = profile
      ? `Perfil: ${profile.name} — ${profile.description}. Objetivos: ${profile.goals?.join(', ')}.`
      : 'Sin perfil específico.';
    const allergyContext = allergies?.length
      ? `Evitar: ${allergies.join(', ')}.`
      : '';

    const msg = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Eres un nutricionista experto en cocina latinoamericana.

${profileContext}
${allergyContext}

Genera ${count} recetas saludables adaptadas a este perfil, usando ingredientes accesibles en Latinoamérica.

Responde en JSON con esta estructura exacta:
{
  "recipes": [
    {
      "id": "unique-id",
      "name": "Nombre de la receta",
      "emoji": "🥗",
      "prepTime": "15 min",
      "difficulty": "Fácil" | "Media" | "Difícil",
      "calories": "350 kcal",
      "protein": "25g",
      "tags": ["tag1", "tag2"],
      "description": "Descripción breve apetitosa",
      "ingredients": ["ingrediente 1", "ingrediente 2"],
      "steps": ["paso 1", "paso 2"],
      "nutritionNote": "nota nutricional relevante para el perfil"
    }
  ]
}
Solo JSON, sin markdown.`
      }]
    });

    const text = msg.content[0].text.trim();
    res.json(JSON.parse(text));
  } catch (err) {
    console.error('recipes error:', err);
    res.status(500).json({ error: err.message || 'Error al obtener recetas' });
  }
});

// ── Get top foods for profile ─────────────────────────────────────────────────
app.post('/api/top-foods', async (req, res) => {
  try {
    const { profile, allergies } = req.body;

    const profileContext = profile
      ? `Perfil: ${profile.name} — ${profile.description}. Objetivos: ${profile.goals?.join(', ')}.`
      : 'Sin perfil específico.';
    const allergyContext = allergies?.length
      ? `Evitar: ${allergies.join(', ')}.`
      : '';

    const msg = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Eres un nutricionista experto.

${profileContext}
${allergyContext}

Genera recomendaciones de alimentos para este perfil. Prioriza alimentos accesibles en Latinoamérica.

Responde en JSON:
{
  "topRecommended": [
    { "name": "Nombre", "emoji": "🥑", "reason": "por qué es ideal para el perfil", "benefit": "beneficio principal" }
  ],
  "essential": [
    { "name": "Nombre", "emoji": "🥦", "reason": "por qué es indispensable", "frequency": "diario/semanal" }
  ],
  "alternatives": [
    { "original": "Alimento común", "alternative": "Alternativa saludable", "emoji": "🔄", "reason": "por qué sustituir" }
  ],
  "disclaimer": "Texto breve recordando consultar a un nutricionista profesional"
}
topRecommended: 5 items, essential: 5 items, alternatives: 4 items. Solo JSON, sin markdown.`
      }]
    });

    const text = msg.content[0].text.trim();
    res.json(JSON.parse(text));
  } catch (err) {
    console.error('top-foods error:', err);
    res.status(500).json({ error: err.message || 'Error al obtener alimentos' });
  }
});

app.listen(PORT, () => console.log(`NutriScan server running on port ${PORT}`));

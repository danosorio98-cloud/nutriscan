# NutriScan 🥗

Tu nutricionista de bolsillo. Escanea alimentos, descubre recetas y come mejor.

## Requisitos

- Node.js 18+
- Una API Key de Anthropic (https://console.anthropic.com)

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
cp .env.example .env
# Editar .env y agregar tu ANTHROPIC_API_KEY

# 3. Iniciar la app
npm run dev
```

Abrir en el navegador: **http://localhost:5173**

## Funcionalidades

- 🧠 **Onboarding inteligente** — árbol de decisiones de 5 preguntas para asignar tu perfil nutricional
- 🏠 **Inicio** — alimentos recomendados, indispensables y alternativas para tu perfil
- 📷 **Escáner** — analiza etiquetas con foto o código de barras usando Claude AI
- 👨‍🍳 **Recetas** — 6 recetas personalizadas para tu perfil (latam-friendly)
- 👤 **Perfil** — estadísticas, historial completo, gestión de alergias

## Perfiles disponibles

| Perfil | Descripción |
|--------|-------------|
| 🌱 Vegano | Sin productos de origen animal |
| 💪 Fit | Alto en proteína, bajo en grasa |
| ⚖️ Bajar de peso | Déficit calórico saludable |
| 🥑 Keto | Bajo en carbohidratos, alto en grasas |

## Stack

- **Frontend**: React 18 + Vite
- **Backend**: Express.js
- **IA**: Anthropic Claude (claude-opus-4-5)
- **Base de datos de alimentos**: Open Food Facts (código de barras)
- **Persistencia**: localStorage

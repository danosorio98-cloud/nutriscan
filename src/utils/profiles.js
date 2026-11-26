// ── Nutritional profiles ──────────────────────────────────────────────────────
export const PROFILES = {
  vegano: {
    id: 'vegano',
    name: 'Vegano',
    emoji: '🌱',
    color: '#22c55e',
    colorLight: '#dcfce7',
    description: 'Sin productos de origen animal',
    goals: ['Dieta basada en plantas', 'Evitar carne, lácteos y huevos', 'Alta en fibra y antioxidantes'],
    avoid: ['Carne', 'Pescado', 'Lácteos', 'Huevos', 'Miel', 'Gelatina'],
    prioritize: ['Legumbres', 'Frutas', 'Verduras', 'Granos integrales', 'Frutos secos', 'Semillas'],
  },
  fit: {
    id: 'fit',
    name: 'Fit',
    emoji: '💪',
    color: '#3b82f6',
    colorLight: '#dbeafe',
    description: 'Alto en proteína, bajo en grasa',
    goals: ['Aumentar masa muscular', 'Alta proteína', 'Carbohidratos complejos', 'Grasas saludables'],
    avoid: ['Azúcar refinada', 'Frituras', 'Ultraprocesados'],
    prioritize: ['Pollo', 'Huevos', 'Atún', 'Avena', 'Arroz integral', 'Quinoa', 'Brócoli'],
  },
  bajar_peso: {
    id: 'bajar_peso',
    name: 'Bajar de peso',
    emoji: '⚖️',
    color: '#f97316',
    colorLight: '#ffedd5',
    description: 'Déficit calórico saludable',
    goals: ['Reducir calorías', 'Aumentar saciedad', 'Preservar músculo', 'Alta fibra'],
    avoid: ['Azúcar', 'Harinas refinadas', 'Bebidas azucaradas', 'Frituras', 'Snacks procesados'],
    prioritize: ['Verduras', 'Proteína magra', 'Frutas', 'Agua', 'Fibra'],
  },
  keto: {
    id: 'keto',
    name: 'Keto',
    emoji: '🥑',
    color: '#a855f7',
    colorLight: '#f3e8ff',
    description: 'Muy bajo en carbohidratos, alto en grasas',
    goals: ['Cetosis metabólica', 'Menos de 20-50g carbs/día', 'Alta en grasas saludables'],
    avoid: ['Azúcar', 'Pan', 'Arroz', 'Papa', 'Maíz', 'Frutas dulces', 'Legumbres'],
    prioritize: ['Aguacate', 'Carnes', 'Quesos', 'Huevos', 'Nueces', 'Aceite de oliva', 'Verduras bajas en carbs'],
  },
};

// ── Decision tree ─────────────────────────────────────────────────────────────
export const QUESTIONS = [
  {
    id: 'q1',
    text: '¿Cuál es tu principal objetivo con la alimentación?',
    emoji: '🎯',
    options: [
      { id: 'perder', label: 'Perder peso', emoji: '⚖️' },
      { id: 'musculo', label: 'Ganar músculo', emoji: '💪' },
      { id: 'saludable', label: 'Comer más saludable', emoji: '🥗' },
      { id: 'etico', label: 'Razones éticas/ambientales', emoji: '🌍' },
    ],
  },
  {
    id: 'q2',
    text: '¿Consumes productos de origen animal?',
    emoji: '🥩',
    options: [
      { id: 'si_todo', label: 'Sí, de todo', emoji: '✅' },
      { id: 'si_poco', label: 'Sí, pero poco', emoji: '🔻' },
      { id: 'no', label: 'No consumo ninguno', emoji: '🚫' },
    ],
  },
  {
    id: 'q3',
    text: '¿Cómo describes tu relación con los carbohidratos?',
    emoji: '🍞',
    options: [
      { id: 'pocos', label: 'Los reduzco al mínimo', emoji: '❌' },
      { id: 'moderados', label: 'Los consumo con moderación', emoji: '⚖️' },
      { id: 'normales', label: 'Los como normalmente', emoji: '✅' },
    ],
  },
  {
    id: 'q4',
    text: '¿Con qué frecuencia haces ejercicio?',
    emoji: '🏃',
    options: [
      { id: 'nunca', label: 'Poco o nada', emoji: '🛋️' },
      { id: 'moderado', label: '1-3 veces por semana', emoji: '🚶' },
      { id: 'frecuente', label: '4 o más veces por semana', emoji: '🏋️' },
    ],
  },
  {
    id: 'q5',
    text: '¿Tienes alguna restricción alimentaria?',
    emoji: '⚠️',
    options: [
      { id: 'ninguna', label: 'Ninguna', emoji: '✅' },
      { id: 'intolerancia', label: 'Intolerancia (lactosa, gluten…)', emoji: '🔶' },
      { id: 'alergia', label: 'Alergia alimentaria', emoji: '🚨' },
      { id: 'medica', label: 'Indicación médica', emoji: '🏥' },
    ],
  },
];

// Decision tree mapping → profile
export function determineProfile(answers) {
  const { q1, q2, q3 } = answers;

  // Vegano: razones éticas O no consume animales
  if (q1 === 'etico' || q2 === 'no') return 'vegano';

  // Keto: reduce carbs al mínimo Y no es vegano
  if (q3 === 'pocos') return 'keto';

  // Fit: objetivo ganar músculo
  if (q1 === 'musculo') return 'fit';

  // Bajar de peso: objetivo perder peso
  if (q1 === 'perder') return 'bajar_peso';

  // Default: fit (saludable)
  return 'fit';
}

// ── Common allergens ──────────────────────────────────────────────────────────
export const COMMON_ALLERGENS = [
  { id: 'gluten', label: 'Gluten', emoji: '🌾' },
  { id: 'lactosa', label: 'Lactosa', emoji: '🥛' },
  { id: 'huevo', label: 'Huevo', emoji: '🥚' },
  { id: 'mani', label: 'Maní', emoji: '🥜' },
  { id: 'soja', label: 'Soja', emoji: '🫘' },
  { id: 'nueces', label: 'Frutos secos', emoji: '🌰' },
  { id: 'mariscos', label: 'Mariscos', emoji: '🦐' },
  { id: 'pescado', label: 'Pescado', emoji: '🐟' },
  { id: 'sesamo', label: 'Sésamo', emoji: '⚫' },
  { id: 'sulfitos', label: 'Sulfitos', emoji: '🍷' },
];

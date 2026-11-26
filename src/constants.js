export const PROFILES = {
  vegano:    { id:'vegano',     name:'Vegano',        emoji:'🌱', color:'#52B788' },
  fit:       { id:'fit',        name:'Fit',           emoji:'💪', color:'#3B82F6' },
  bajar_peso:{ id:'bajar_peso', name:'Bajar de peso', emoji:'⚖️', color:'#F97316' },
  keto:      { id:'keto',       name:'Keto',          emoji:'🥑', color:'#A855F7' },
};

export const ALLERGY_LIST = [
  {id:'mani',        name:'Maní',        emoji:'🥜'},
  {id:'lacteos',     name:'Lácteos',     emoji:'🥛'},
  {id:'mariscos',    name:'Mariscos',    emoji:'🦐'},
  {id:'huevo',       name:'Huevo',       emoji:'🥚'},
  {id:'soya',        name:'Soya',        emoji:'🫘'},
  {id:'pescado',     name:'Pescado',     emoji:'🐟'},
  {id:'frutos_secos',name:'Frutos secos',emoji:'🌰'},
  {id:'gluten',      name:'Gluten',      emoji:'🌾'},
];

export const OB_STEPS = [
  {
    id:'q1', label:'PREGUNTA 1 DE 5',
    title:'¿Cuál es tu objetivo?',
    opts:[
      {id:'bajar',    text:'Bajar de peso',        emoji:'⚖️'},
      {id:'muscular', text:'Ganar masa muscular',   emoji:'💪'},
      {id:'saludable',text:'Comer más saludable',  emoji:'🌿'},
    ]
  },
  {
    id:'q2', label:'PREGUNTA 2 DE 5',
    title:'¿Consumes productos animales?',
    opts:[
      {id:'no', text:'No, ninguno',            emoji:'🥬'},
      {id:'ovo',text:'Solo huevos y lácteos',  emoji:'🥚'},
      {id:'si', text:'Sí, de todo',            emoji:'🍖'},
    ]
  },
  {
    id:'q3', label:'PREGUNTA 3 DE 5',
    title:'¿Evitas los carbohidratos?',
    opts:[
      {id:'si',    text:'Sí, los limito',   emoji:'✓'},
      {id:'aveces',text:'A veces',          emoji:'○'},
      {id:'no',   text:'No, los incluyo',   emoji:'📦'},
    ]
  },
  {
    id:'q4', label:'PREGUNTA 4 DE 5',
    title:'¿Haces ejercicio 4+ veces/semana?',
    opts:[
      {id:'mucho',text:'Sí, 4 o más',   emoji:'🏃'},
      {id:'medio',text:'1 a 3 veces',   emoji:'🚶'},
      {id:'poco', text:'No por ahora',  emoji:'○'},
    ]
  },
  {
    id:'q5', label:'PREGUNTA 5 DE 5',
    title:'¿Tienes alguna restricción alimentaria?',
    opts:[
      {id:'no',  text:'Ninguna',           emoji:'✓'},
      {id:'veg', text:'Vegetariana',       emoji:'🌱'},
      {id:'otra',text:'Otra restricción',  emoji:'✦'},
    ]
  },
];

export function computeProfile(answers) {
  const a = answers;
  if (a.q2 === 'no' || a.q5 === 'veg') return 'vegano';
  if (a.q3 === 'si') return 'keto';
  if (a.q1 === 'muscular' || a.q4 === 'mucho') return 'fit';
  return 'bajar_peso';
}

export function calcMacros(user) {
  const { age=25, sex='masculino', weight=70, height=170, activity='moderado', profile } = user;
  const bmr = sex === 'masculino'
    ? 10*weight + 6.25*height - 5*age + 5
    : 10*weight + 6.25*height - 5*age - 161;
  const mult = { sedentario:1.2, ligero:1.375, moderado:1.55, activo:1.725, muy_activo:1.9 }[activity] || 1.55;
  let tdee = Math.round(bmr * mult);
  if (profile === 'bajar_peso') tdee -= 400;
  if (profile === 'keto') tdee -= 200;
  const prot = profile === 'fit' ? Math.round(weight*2.2) : Math.round(weight*1.5);
  const fat  = profile === 'keto' ? Math.round(tdee*0.7/9) : Math.round(tdee*0.3/9);
  return { kcal: tdee, protein: prot, fat };
}

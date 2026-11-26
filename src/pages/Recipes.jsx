import { useState, useEffect } from 'react';
import { PROFILES } from '../constants';
import { gemini, parseJSON } from '../utils/gemini';
import { loadRecipesCache, saveRecipesCache } from '../utils/storage';

function getFallback() {
  return [
    { name:'Bowl verde con pollo', meal:'Almuerzo', emoji:'🥗', kcal:420, protein:32, time:20, tag:'Alta proteína',
      ingredients:['200g pechuga de pollo','1 taza de quinoa','1 aguacate','2 tazas espinaca','Limón y sal'],
      steps:['Cocinar la quinoa según instrucciones.','Grillar el pollo con sal y pimienta.','Cortar el aguacate en cubos.','Combinar todo y aliñar con limón.'],
      description:'Un bowl equilibrado con proteína magra, granos integrales y grasas saludables.' },
    { name:'Smoothie verde proteico', meal:'Desayuno', emoji:'🥤', kcal:280, protein:22, time:5, tag:'Rápido',
      ingredients:['1 banana','2 tazas espinaca','1 scoop proteína','1 taza leche de almendra','Hielo'],
      steps:['Poner todos los ingredientes en la licuadora.','Licuar hasta obtener mezcla homogénea.','Servir inmediatamente.'],
      description:'Smoothie nutritivo listo en 5 minutos, ideal para comenzar el día.' },
  ];
}

function RecipeDetail({ recipe, onBack }) {
  return (
    <div className="scr" style={{ background:'var(--bg)' }}>
      <div style={{ padding:'20px 20px 0' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:8, color:'var(--g1)', fontWeight:600, fontSize:15, marginBottom:20 }}>← Recetas</button>
        <div style={{ width:'100%', aspectRatio:'1.6', borderRadius:20, background:'var(--g4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:64, marginBottom:20 }}>{recipe.emoji || '🍽️'}</div>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--g2)', letterSpacing:'1px', marginBottom:6 }}>{recipe.meal?.toUpperCase()}</div>
        <div style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>{recipe.name}</div>
        <div style={{ display:'flex', gap:10, marginBottom:16 }}>
          <span style={{ padding:'6px 12px', background:'var(--g4)', color:'var(--g1)', borderRadius:20, fontSize:13, fontWeight:600 }}>{recipe.kcal} kcal</span>
          {recipe.protein && <span style={{ padding:'6px 12px', background:'var(--g4)', color:'var(--g1)', borderRadius:20, fontSize:13, fontWeight:600 }}>{recipe.protein}g proteína</span>}
          {recipe.time && <span style={{ padding:'6px 12px', background:'var(--bg2)', color:'var(--text2)', borderRadius:20, fontSize:13, fontWeight:600 }}>{recipe.time} min</span>}
        </div>
        {recipe.description && <div style={{ fontSize:14, color:'var(--text2)', lineHeight:1.6, marginBottom:20 }}>{recipe.description}</div>}
        {recipe.ingredients && <>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>Ingredientes</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
            {recipe.ingredients.map((ing,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'var(--bg2)', borderRadius:10 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--g1)', flexShrink:0 }}/>
                <span style={{ fontSize:14 }}>{ing}</span>
              </div>
            ))}
          </div>
        </>}
        {recipe.steps && <>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>Preparación</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {recipe.steps.map((s,i) => (
              <div key={i} style={{ display:'flex', gap:14, padding:'12px 14px', background:'var(--bg2)', borderRadius:12 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--g1)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                <span style={{ fontSize:14, lineHeight:1.5, paddingTop:4 }}>{s}</span>
              </div>
            ))}
          </div>
        </>}
      </div>
      <div style={{ height:20 }}/>
    </div>
  );
}

export default function Recipes({ user }) {
  const [recipes, setRecipes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todas');
  const [detail, setDetail] = useState(null);
  const prof = PROFILES[user.profile];

  useEffect(() => {
    const cached = loadRecipesCache(user.profile);
    if (cached && Date.now() - cached.ts < 43200000) {
      setRecipes(cached.data);
      setLoading(false);
      return;
    }
    gemini(
      [{ text: `Profile: ${user.profile}. Allergies: ${user.allergies?.join(', ') || 'none'}. Restriction: ${user.restriction || 'none'}` }],
      `You are a LATAM nutritionist chef. Return JSON array of 6 recipes for this nutritional profile. Each: {name, meal (Desayuno/Almuerzo/Cena/Snacks), emoji, kcal, protein, time, tag (e.g. "Alta proteína"), ingredients (array of strings), steps (array of strings), description}. Use common LATAM ingredients. Spanish. JSON only.`,
      1500
    )
      .then(txt => {
        const d = parseJSON(txt);
        setRecipes(d);
        saveRecipesCache(user.profile, d);
      })
      .catch(() => setRecipes(getFallback()))
      .finally(() => setLoading(false));
  }, [user.profile]);

  const filters = ['Todas','Desayuno','Almuerzo','Cena','Snacks'];
  const filtered = (recipes || []).filter(r => filter === 'Todas' || r.meal === filter);

  if (detail) return <RecipeDetail recipe={detail} onBack={() => setDetail(null)}/>;

  return (
    <div className="scr" style={{ background:'var(--bg)' }}>
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
          <div style={{ fontSize:22, fontWeight:800 }}>Recetas</div>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', background:'var(--g4)', color:'var(--g1)', borderRadius:20, fontWeight:600, fontSize:13 }}>{prof.emoji} {prof.name}</span>
        </div>
        <div style={{ fontSize:14, color:'var(--text2)', marginBottom:16 }}>Elegidas para tu perfil</div>

        <div className="sx" style={{ marginBottom:20 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flexShrink:0, padding:'8px 16px', borderRadius:20, fontWeight:600, fontSize:14,
              background: filter === f ? 'var(--g1)' : 'var(--bg2)',
              color: filter === f ? '#fff' : 'var(--text2)', border:'none', transition:'all .15s',
            }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spin"/></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {filtered.map((r,i) => (
              <button key={i} onClick={() => setDetail(r)} className="card" style={{ width:'100%', textAlign:'left', display:'flex', gap:14, padding:'14px 16px' }}>
                <div style={{ width:64, height:64, borderRadius:14, background:'var(--g4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>{r.emoji || '🍽️'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--g2)', letterSpacing:'1px', marginBottom:3 }}>{r.meal?.toUpperCase()}</div>
                  <div style={{ fontWeight:700, marginBottom:6 }}>{r.name}</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)' }}>{r.kcal} kcal</span>
                    {r.tag && <span style={{ fontSize:12, fontWeight:600, padding:'2px 8px', background:'var(--g4)', color:'var(--g1)', borderRadius:10 }}>{r.tag}</span>}
                    <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)' }}>{r.time} min</span>
                  </div>
                  {r.ingredients && <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>{r.ingredients.slice(0,3).join(' · ')}</div>}
                </div>
                <span style={{ color:'var(--text3)', alignSelf:'center', fontSize:18 }}>›</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ height:20 }}/>
    </div>
  );
}

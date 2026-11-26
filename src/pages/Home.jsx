import { useState, useEffect } from 'react';
import { PROFILES, calcMacros } from '../constants';
import { gemini, parseJSON } from '../utils/gemini';
import { loadFoodsCache, saveFoodsCache, loadHistory } from '../utils/storage';

const FALLBACKS = {
  vegano:    [{name:'Tofu',emoji:'🫘',kcal:76,protein:8,carbs:2,fat:4},{name:'Lentejas',emoji:'🍲',kcal:116,protein:9,carbs:20,fat:0},{name:'Aguacate',emoji:'🥑',kcal:160,protein:2,carbs:9,fat:15},{name:'Espinaca',emoji:'🥬',kcal:23,protein:3,carbs:4,fat:0},{name:'Quinoa',emoji:'🌾',kcal:120,protein:4,carbs:21,fat:2}],
  fit:       [{name:'Pechuga',emoji:'🍗',kcal:165,protein:31,carbs:0,fat:4},{name:'Huevo',emoji:'🥚',kcal:78,protein:6,carbs:0,fat:5},{name:'Atún',emoji:'🐟',kcal:132,protein:29,carbs:0,fat:1},{name:'Brócoli',emoji:'🥦',kcal:34,protein:3,carbs:7,fat:0},{name:'Avena',emoji:'🌾',kcal:389,protein:17,carbs:66,fat:7}],
  bajar_peso:[{name:'Aguacate',emoji:'🥑',kcal:160,protein:2,carbs:9,fat:15},{name:'Salmón',emoji:'🐟',kcal:208,protein:20,carbs:0,fat:13},{name:'Brócoli',emoji:'🥦',kcal:34,protein:3,carbs:7,fat:0},{name:'Arándanos',emoji:'🫐',kcal:57,protein:1,carbs:14,fat:0},{name:'Huevo',emoji:'🥚',kcal:78,protein:6,carbs:0,fat:5}],
  keto:      [{name:'Aguacate',emoji:'🥑',kcal:160,protein:2,carbs:2,fat:15},{name:'Tocino',emoji:'🥓',kcal:541,protein:37,carbs:1,fat:42},{name:'Queso',emoji:'🧀',kcal:402,protein:25,carbs:1,fat:33},{name:'Nueces',emoji:'🌰',kcal:654,protein:15,carbs:14,fat:65},{name:'Salmón',emoji:'🐟',kcal:208,protein:20,carbs:0,fat:13}],
};

export default function Home({ user, onNavigate }) {
  const [foods, setFoods] = useState(null);
  const [loading, setLoading] = useState(true);
  const prof = PROFILES[user.profile];
  const history = loadHistory();
  const macros = calcMacros(user);

  useEffect(() => {
    setFoods(null);
    setLoading(true);
    const cached = loadFoodsCache(user.profile);
    if (cached && Date.now() - cached.ts < 86400000) {
      setFoods(cached.data);
      setLoading(false);
      return;
    }
    gemini(
      [{ text: `Profile: ${user.profile}. Allergies: ${user.allergies?.join(', ') || 'none'}` }],
      `You are a nutrition expert for LATAM. Return JSON array of exactly 5 recommended foods for this profile. Each: {name, emoji, kcal, protein, carbs, fat, why}. Names in Spanish. Common LATAM ingredients. JSON only.`,
      800
    )
      .then(txt => {
        const d = parseJSON(txt);
        setFoods(d);
        saveFoodsCache(user.profile, d);
      })
      .catch(() => setFoods(FALLBACKS[user.profile] || FALLBACKS.bajar_peso))
      .finally(() => setLoading(false));
  }, [user.profile]);

  const essentials = foods?.slice(0, 2) || [];

  return (
    <div className="scr" style={{ background:'var(--bg)' }}>
      <div style={{ padding:'20px 20px 0' }}>
        {/* Greeting */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:800 }}>Hola, {user.name || 'Usuario'}</div>
            <div style={{ fontSize:14, color:'var(--text2)' }}>Qué bueno verte de nuevo</div>
          </div>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', background:'var(--g4)', color:'var(--g1)', borderRadius:20, fontWeight:600, fontSize:13 }}>
            {prof.emoji} {prof.name}
          </span>
        </div>

        {/* Top 5 */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontSize:17, fontWeight:700 }}>Top 5 para ti</div>
          </div>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:20 }}><div className="spin"/></div>
          ) : (
            <div className="sx" style={{ paddingBottom:4 }}>
              {(foods || []).map((f,i) => (
                <div key={i} style={{ flexShrink:0, width:80, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{ width:72, height:72, borderRadius:16, background:'var(--g4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>{f.emoji || '🍽️'}</div>
                  <div style={{ fontSize:12, fontWeight:600, textAlign:'center', maxWidth:72 }}>{f.name}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{f.kcal} kcal</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Essentials */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:17, fontWeight:700, marginBottom:12 }}>Alimentos indispensables</div>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:20 }}><div className="spin"/></div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {essentials.map((f,i) => (
                <div key={i} className="card" style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:'var(--g4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{f.emoji || '🍽️'}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, marginBottom:2 }}>{f.name}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>
                      {f.protein && `${f.protein}g proteína · `}{f.carbs && `${f.carbs}g carbs · `}{f.kcal} kcal
                    </div>
                  </div>
                  <span className="tag tag-g">Esencial</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Last scans */}
        {history.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ fontSize:17, fontWeight:700 }}>Últimos escaneos</div>
              <button style={{ fontSize:13, fontWeight:600, color:'var(--g1)' }} onClick={() => onNavigate('scanner')}>Ver más</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {history.slice(0,2).map((h,i) => (
                <div key={i} className="card" style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>📦</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, marginBottom:2, fontSize:14 }}>{h.name}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{h.kcal || 0} kcal</div>
                  </div>
                  <span className={`tag ${h.score==='ok'?'ok':h.score==='warn'?'warn':'bad'}`}>
                    {h.score==='ok'?'✓ Apto':h.score==='warn'?'⚠ Cuidado':'✗ Evitar'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Macros */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:17, fontWeight:700, marginBottom:12 }}>Tus macros diarios</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[
              { label:'Calorías', value:macros.kcal, unit:'/día' },
              { label:'Proteína', value:`${macros.protein}g`, unit:'' },
              { label:'Grasa', value:`${macros.fat}g`, unit:'' },
            ].map((m,i) => (
              <div key={i} style={{ background:'var(--g4)', borderRadius:14, padding:'14px 10px', textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:800, color:'var(--g1)' }}>{m.value}{m.unit}</div>
                <div style={{ fontSize:11, color:'var(--text2)', fontWeight:600, marginTop:3 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height:20 }}/>
    </div>
  );
}

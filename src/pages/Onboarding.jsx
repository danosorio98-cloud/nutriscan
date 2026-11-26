import { useState } from 'react';
import { OB_STEPS, ALLERGY_LIST, PROFILES, computeProfile } from '../constants';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sel, setSel] = useState(null);
  const [otherRestr, setOtherRestr] = useState('');
  const [age, setAge] = useState('28');
  const [sex, setSex] = useState('femenino');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('moderado');
  const [allergyMode, setAllergyMode] = useState('ninguna');
  const [selAllergies, setSelAllergies] = useState([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [customAllergies, setCustomAllergies] = useState([]);

  function nextStep() {
    if (step < 5) {
      const qid = OB_STEPS[step].id;
      setAnswers(p => ({ ...p, [qid]: sel }));
      setSel(null);
      setStep(s => s + 1);
    } else if (step === 5) {
      setStep(6);
    } else if (step === 6) {
      setStep(7);
    }
  }

  function finish() {
    const pId = computeProfile(answers);
    const allAllergies = allergyMode === 'ninguna' ? [] : [
      ...selAllergies.map(id => ALLERGY_LIST.find(a => a.id === id)?.name || id),
      ...customAllergies,
    ];
    onComplete({
      profile: pId,
      age: parseInt(age) || 25,
      sex,
      weight: parseFloat(weight) || 65,
      height: parseFloat(height) || 165,
      activity,
      allergies: allAllergies,
      restriction: answers.q5 === 'otra' ? otherRestr : (answers.q5 === 'veg' ? 'Vegetariana' : ''),
      answers,
      createdAt: Date.now(),
    });
  }

  /* ── Questions ── */
  if (step < 5) {
    const q = OB_STEPS[step];
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100dvh', background:'var(--bg)' }}>
        <div style={{ padding:'16px 20px 0', display:'flex', alignItems:'center', gap:12 }}>
          {step > 0 && (
            <button onClick={() => { setStep(s => s-1); setSel(null); }}
              style={{ width:36, height:36, borderRadius:10, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>←</button>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:8, margin:'0 auto' }}>
            <div style={{ background:'var(--g1)', borderRadius:8, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>📊</div>
            <span style={{ fontWeight:700, fontSize:16, color:'var(--g1)' }}>NutriScan</span>
          </div>
          {step > 0 && <div style={{ width:36 }}/>}
        </div>

        <div style={{ flex:1, padding:'20px 20px 0', overflow:'auto' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--g2)', letterSpacing:'1px', marginBottom:8 }}>{q.label}</div>
          <div style={{ fontSize:24, fontWeight:800, color:'var(--text1)', marginBottom:14, lineHeight:1.25 }}>{q.title}</div>
          <div style={{ marginBottom:20 }}>
            <div style={{ height:3, background:'var(--border)', borderRadius:4, marginBottom:8, overflow:'hidden' }}>
              <div style={{ height:'100%', background:'var(--g1)', borderRadius:4, width:`${((step+1)/5)*100}%`, transition:'width .3s' }}/>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {OB_STEPS.map((_,i) => (
                <div key={i} style={{ width:20, height:6, borderRadius:3, background: i<=step ? 'var(--g1)' : 'var(--border)', transition:'background .3s' }}/>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {q.opts.map(opt => {
              const isActive = sel === opt.id;
              return (
                <button key={opt.id} onClick={() => setSel(opt.id)} style={{
                  display:'flex', alignItems:'center', gap:14, padding:'16px',
                  borderRadius:14, border:`1.5px solid ${isActive ? 'var(--g1)' : 'var(--border)'}`,
                  background: isActive ? 'var(--g5)' : 'var(--bg)', textAlign:'left', transition:'all .15s',
                }}>
                  <div style={{ width:40, height:40, borderRadius:10, background: isActive ? 'var(--g4)' : 'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                    {opt.emoji}
                  </div>
                  <span style={{ flex:1, fontWeight:600, fontSize:15, color:'var(--text1)' }}>{opt.text}</span>
                  <div style={{
                    width:22, height:22, borderRadius:'50%', flexShrink:0,
                    border:`2px solid ${isActive ? 'var(--g1)' : 'var(--border)'}`,
                    background: isActive ? 'var(--g1)' : 'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {isActive && <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }}/>}
                  </div>
                </button>
              );
            })}
            {step === 4 && sel === 'otra' && (
              <div style={{ marginTop:4 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:8 }}>Cuéntanos cuál</div>
                <input className="inp" value={otherRestr} onChange={e => setOtherRestr(e.target.value)} placeholder="Ej. dieta baja en sodio"/>
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:6 }}>La tendremos en cuenta en tus recomendaciones.</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding:'16px 20px', paddingBottom:'calc(16px + env(safe-area-inset-bottom))' }}>
          <button className="btn-p" disabled={!sel} onClick={nextStep}>Continuar →</button>
        </div>
      </div>
    );
  }

  /* ── Personal info ── */
  if (step === 5) {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100dvh', background:'var(--bg)' }}>
        <div style={{ padding:'16px 20px 0', display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => setStep(4)} style={{ width:36, height:36, borderRadius:10, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>←</button>
          <span style={{ fontWeight:600, color:'var(--text2)', fontSize:14 }}>Perfil</span>
        </div>
        <div style={{ flex:1, padding:'24px 20px', overflow:'auto' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--g2)', letterSpacing:'1px', marginBottom:8 }}>CONFIGURA TU PERFIL</div>
          <div style={{ fontSize:26, fontWeight:800, marginBottom:6 }}>Información personal</div>
          <div style={{ fontSize:14, color:'var(--text2)', marginBottom:20 }}>Para personalizar tus recomendaciones</div>
          <div style={{ height:3, background:'var(--g1)', borderRadius:4, marginBottom:24 }}/>

          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:8 }}>Edad</div>
              <select className="inp" value={age} onChange={e => setAge(e.target.value)}>
                {Array.from({ length:63 }, (_,i) => i+13).map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:8 }}>Sexo biológico</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {['femenino','masculino'].map(s => (
                  <button key={s} onClick={() => setSex(s)} style={{
                    padding:'12px', borderRadius:12, fontWeight:600, fontSize:14,
                    border:`1.5px solid ${sex === s ? 'var(--g1)' : 'var(--border)'}`,
                    background: sex === s ? 'var(--g4)' : 'var(--bg)',
                    color: sex === s ? 'var(--g1)' : 'var(--text2)',
                  }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:8 }}>Peso</div>
              <div style={{ position:'relative' }}>
                <input className="inp" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="64" style={{ paddingRight:48 }}/>
                <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:14, fontWeight:600 }}>kg</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:8 }}>Altura</div>
              <div style={{ position:'relative' }}>
                <input className="inp" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="168" style={{ paddingRight:48 }}/>
                <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:14, fontWeight:600 }}>cm</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:8 }}>Nivel de actividad</div>
              <select className="inp" value={activity} onChange={e => setActivity(e.target.value)}>
                <option value="sedentario">Sedentario</option>
                <option value="ligero">Ligero</option>
                <option value="moderado">Moderado</option>
                <option value="activo">Activo</option>
                <option value="muy_activo">Muy activo</option>
              </select>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text3)', fontSize:12 }}>
              <span>ⓘ</span><span>Puedes editarlo después en tu perfil</span>
            </div>
          </div>
        </div>
        <div style={{ padding:'16px 20px', paddingBottom:'calc(16px + env(safe-area-inset-bottom))' }}>
          <button className="btn-p" onClick={nextStep}>Continuar →</button>
        </div>
      </div>
    );
  }

  /* ── Allergies ── */
  if (step === 6) {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100dvh', background:'var(--bg)' }}>
        <div style={{ padding:'16px 20px 0', display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => setStep(5)} style={{ width:36, height:36, borderRadius:10, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>←</button>
          <span style={{ fontWeight:600, color:'var(--text2)', fontSize:14 }}>Alergias</span>
        </div>
        <div style={{ flex:1, padding:'24px 20px', overflow:'auto' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--g2)', letterSpacing:'1px', marginBottom:8 }}>ÚLTIMO PASO</div>
          <div style={{ fontSize:26, fontWeight:800, marginBottom:6 }}>¿Tienes alguna alergia?</div>
          <div style={{ fontSize:14, color:'var(--text2)', marginBottom:20 }}>Selecciona todas las que apliquen</div>
          <div style={{ height:3, background:'var(--g1)', borderRadius:4, marginBottom:24 }}/>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'var(--bg2)', borderRadius:30, padding:4, marginBottom:20 }}>
            {['ninguna','alergias'].map(m => (
              <button key={m} onClick={() => setAllergyMode(m)} style={{
                padding:'10px', borderRadius:26, fontWeight:600, fontSize:14,
                background: allergyMode === m ? '#fff' : 'transparent',
                boxShadow: allergyMode === m ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                color: allergyMode === m ? 'var(--text1)' : 'var(--text3)', transition:'all .2s',
              }}>{m === 'ninguna' ? 'Ninguna' : 'Tengo alergias'}</button>
            ))}
          </div>

          {allergyMode === 'alergias' && (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                {ALLERGY_LIST.map(a => {
                  const active = selAllergies.includes(a.id);
                  return (
                    <button key={a.id}
                      onClick={() => setSelAllergies(p => active ? p.filter(x => x !== a.id) : [...p, a.id])}
                      style={{
                        display:'flex', alignItems:'center', gap:8, padding:'12px 14px',
                        borderRadius:12, border:`1.5px solid ${active ? 'var(--red)' : 'var(--border)'}`,
                        background: active ? 'var(--red-bg)' : 'var(--bg)', fontWeight:600, fontSize:14,
                        color: active ? 'var(--red)' : 'var(--text1)', transition:'all .15s',
                      }}>
                      <span style={{ fontSize:18 }}>{a.emoji}</span>
                      <span style={{ flex:1, textAlign:'left' }}>{a.name}</span>
                      {active && <span style={{ fontSize:14 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:8 }}>Otra alergia</div>
              <div style={{ display:'flex', gap:10 }}>
                <input className="inp" value={customAllergy} onChange={e => setCustomAllergy(e.target.value)}
                  placeholder="Ej. sulfitos, mostaza..." style={{ flex:1 }}
                  onKeyDown={e => { if (e.key === 'Enter' && customAllergy.trim()) { setCustomAllergies(p => [...p, customAllergy.trim()]); setCustomAllergy(''); }}}/>
                <button onClick={() => { if (customAllergy.trim()) { setCustomAllergies(p => [...p, customAllergy.trim()]); setCustomAllergy(''); }}}
                  style={{ width:44, height:44, borderRadius:10, background:'var(--g1)', color:'#fff', fontSize:20, flexShrink:0 }}>+</button>
              </div>
              {customAllergies.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:10 }}>
                  {customAllergies.map((a,i) => (
                    <span key={i} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', background:'var(--red-bg)', color:'var(--red)', borderRadius:20, fontSize:13, fontWeight:600 }}>
                      {a}<button onClick={() => setCustomAllergies(p => p.filter((_,j) => j !== i))} style={{ color:'var(--red)', fontSize:14, marginLeft:2 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div style={{ padding:'16px 20px', paddingBottom:'calc(16px + env(safe-area-inset-bottom))' }}>
          <button className="btn-p" onClick={nextStep}>Finalizar y entrar</button>
        </div>
      </div>
    );
  }

  /* ── Result ── */
  const pId = computeProfile(answers);
  const prof = PROFILES[pId];
  const allAllergies = allergyMode === 'ninguna' ? [] : [
    ...selAllergies.map(id => ALLERGY_LIST.find(a => a.id === id)?.name || id),
    ...customAllergies,
  ];
  const displayAnswers = [
    answers.q2 === 'si' ? 'Sí, de todo' : answers.q2 === 'ovo' ? 'Solo huevos y lácteos' : 'No, ninguno',
    answers.q3 === 'si' ? 'Sí, los limito' : answers.q3 === 'aveces' ? 'A veces' : 'No, los incluyo',
    answers.q4 === 'mucho' ? 'Sí, 4 o más' : answers.q4 === 'medio' ? '1 a 3 veces' : 'No por ahora',
    answers.q5 === 'veg' ? 'Vegetariana' : answers.q5 === 'otra' ? 'Otra restricción' : 'Ninguna',
  ].filter(Boolean);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh', background:'var(--bg)', overflow:'auto' }}>
      <div style={{ flex:1, padding:'40px 20px 20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
        <div style={{ fontSize:26, fontWeight:800, textAlign:'center', marginBottom:8 }}>Tu perfil está listo</div>
        <div style={{ fontSize:14, color:'var(--text2)', textAlign:'center', marginBottom:24 }}>Diseñamos recomendaciones basadas en tus hábitos y objetivos.</div>

        <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', background:'var(--g4)', color:'var(--g1)', borderRadius:20, fontWeight:700, fontSize:14, marginBottom:24 }}>
          {prof.emoji} {prof.name}
        </span>

        <div style={{ width:'100%', background:'var(--g5)', border:'1px solid var(--g3)', borderRadius:16, padding:'16px', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--g4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>✓</div>
            <div>
              <div style={{ fontWeight:700, marginBottom:4 }}>Tu plan personalizado</div>
              <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.5 }}>
                {pId==='bajar_peso'&&'Recibirás alimentos, recetas y alternativas con porciones equilibradas para bajar de peso de forma saludable y sostenible.'}
                {pId==='fit'&&'Recibirás alimentos y recetas altos en proteína para maximizar tu rendimiento y recuperación muscular.'}
                {pId==='vegano'&&'Recibirás alimentos y recetas 100% de origen vegetal con los nutrientes esenciales balanceados.'}
                {pId==='keto'&&'Recibirás alimentos y recetas bajos en carbohidratos para mantenerte en cetosis y controlar tu peso.'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ width:'100%', marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', letterSpacing:'1px', marginBottom:10 }}>TUS PREFERENCIAS</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {displayAnswers.map((a,i) => (
              <span key={i} style={{ padding:'6px 12px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:20, fontSize:13, fontWeight:500 }}>{a}</span>
            ))}
          </div>
        </div>

        {allAllergies.length > 0 && (
          <div style={{ width:'100%', marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', letterSpacing:'1px', marginBottom:10 }}>ALERGIAS CONSIDERADAS</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {allAllergies.map((a,i) => (
                <span key={i} style={{ padding:'6px 12px', background:'var(--red-bg)', color:'var(--red)', border:'1px solid rgba(229,115,115,.3)', borderRadius:20, fontSize:13, fontWeight:600 }}>{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ padding:'16px 20px', paddingBottom:'calc(16px + env(safe-area-inset-bottom))', display:'flex', flexDirection:'column', gap:10 }}>
        <button className="btn-p" onClick={finish}>Comenzar →</button>
        <button className="btn-s" onClick={() => setStep(0)}>Cambiar perfil manualmente</button>
      </div>
    </div>
  );
}

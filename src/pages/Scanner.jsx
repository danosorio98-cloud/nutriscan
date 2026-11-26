import { useState, useEffect, useRef } from 'react';
import { PROFILES } from '../constants';
import { gemini, parseJSON } from '../utils/gemini';
import { loadHistory, addHistoryItem } from '../utils/storage';

export default function Scanner({ user }) {
  const [mode, setMode] = useState('idle'); // idle | camera | analyzing | result | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => loadHistory());
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const prof = PROFILES[user.profile];

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  async function openCamera() {
    setMode('camera');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      setMode('error');
    }
  }

  function capture() {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    stopCamera();
    analyze(dataUrl.split(',')[1]);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => analyze(ev.target.result.split(',')[1]);
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }

  async function analyze(base64) {
    setMode('analyzing');
    try {
      const txt = await gemini(
        [
          { inline_data: { mime_type: 'image/jpeg', data: base64 } },
          { text: `User profile: ${user.profile}. Allergies: ${user.allergies?.join(', ') || 'none'}. Restriction: ${user.restriction || 'none'}.` },
        ],
        `You are a nutritionist analyzing a food label or product for a ${user.profile} profile. Return JSON: {name, brand, kcal, protein, carbs, fat, sodium, sugar, score ("ok"|"warn"|"bad"), verdict (1 sentence in Spanish), highlights (array of 2-3 strings in Spanish), warnings (array of 0-2 strings in Spanish), compatible (true/false)}. JSON only.`,
        800
      );
      const d = parseJSON(txt);
      const entry = { ...d, ts: Date.now() };
      const newHistory = addHistoryItem(entry);
      setHistory(newHistory);
      setResult(d);
      setMode('result');
    } catch (e) {
      setError(e.message || 'Error al analizar la imagen');
      setMode('error');
    }
  }

  function reset() {
    setMode('idle');
    setResult(null);
    setError('');
    stopCamera();
  }

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="scr" style={{ background:'var(--bg)' }}>
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
          <div style={{ fontSize:22, fontWeight:800 }}>Escanear producto</div>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', background:'var(--g4)', color:'var(--g1)', borderRadius:20, fontWeight:600, fontSize:13 }}>{prof.emoji} {prof.name}</span>
        </div>
        <div style={{ fontSize:14, color:'var(--text2)', marginBottom:20 }}>Evaluaremos si es ideal para ti</div>

        {/* IDLE */}
        {mode === 'idle' && (
          <>
            <div style={{ border:'2px dashed var(--border)', borderRadius:20, padding:'32px 20px', marginBottom:20, display:'flex', flexDirection:'column', alignItems:'center', gap:12, background:'var(--bg2)' }}>
              <div style={{ width:60, height:60, borderRadius:16, background:'var(--g4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>⊞</div>
              <div style={{ fontWeight:700, fontSize:16 }}>Apunta a la etiqueta</div>
              <div style={{ fontSize:14, color:'var(--text3)', textAlign:'center' }}>o al código de barras del producto</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
              <button onClick={openCamera} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'16px', borderRadius:14, background:'var(--g1)', color:'#fff', fontWeight:700, fontSize:15 }}>
                📷 Abrir cámara
              </button>
              <button onClick={() => fileRef.current?.click()} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'16px', borderRadius:14, background:'var(--bg)', border:'1.5px solid var(--border)', fontWeight:700, fontSize:15, color:'var(--text1)' }}>
                ⬆ Subir foto
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={handleFile}/>

            <div style={{ margin:'0 0 20px', padding:'14px 16px', background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:14, display:'flex', gap:10 }}>
              <span style={{ flexShrink:0 }}>✦</span>
              <span style={{ fontSize:13, color:'#92400E' }}>Consejo: asegúrate de tener buena luz y enfocar toda la etiqueta nutricional.</span>
            </div>

            <div style={{ fontSize:17, fontWeight:700, marginBottom:12 }}>Tu historial</div>
            {history.length === 0 ? (
              <div className="card" style={{ padding:'20px', textAlign:'center' }}>
                <div style={{ fontSize:24, marginBottom:8 }}>⊞</div>
                <div style={{ fontWeight:700, marginBottom:4 }}>Aún no hay escaneos</div>
                <div style={{ fontSize:13, color:'var(--text3)' }}>Escanea tu primer alimento o producto para conocer si es ideal para tu perfil.</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {history.slice(0,5).map((h,i) => (
                  <div key={i} className="card" style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>📦</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>{h.name || 'Producto'}</div>
                      <div style={{ fontSize:12, color:'var(--text3)' }}>{h.kcal || 0} kcal</div>
                    </div>
                    <span className={`tag ${h.score==='ok'?'ok':h.score==='warn'?'warn':'bad'}`}>
                      {h.score==='ok'?'✓ Apto':h.score==='warn'?'⚠ Cuidado':'✗ Evitar'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CAMERA */}
        {mode === 'camera' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width:'100%', borderRadius:16, background:'#000', maxHeight:320, objectFit:'cover' }}/>
            <button className="btn-p" onClick={capture}>📸 Capturar</button>
            <button className="btn-s" onClick={reset}>Cancelar</button>
          </div>
        )}

        {/* ANALYZING */}
        {mode === 'analyzing' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'60px 20px', textAlign:'center' }}>
            <div className="spin"/>
            <div style={{ fontWeight:700, fontSize:17 }}>Analizando producto...</div>
            <div style={{ fontSize:14, color:'var(--text2)' }}>Evaluando con tu perfil {prof.name}</div>
          </div>
        )}

        {/* ERROR */}
        {mode === 'error' && (
          <div style={{ padding:'20px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
            <div style={{ fontWeight:700, marginBottom:8 }}>Error al analizar</div>
            <div style={{ color:'var(--text2)', marginBottom:20 }}>{error}</div>
            <button className="btn-p" onClick={reset}>Intentar de nuevo</button>
          </div>
        )}

        {/* RESULT */}
        {mode === 'result' && result && (
          <div className="fu">
            <div style={{ padding:'20px', borderRadius:20, marginBottom:16, background: result.score==='ok'?'#E8F5E9':result.score==='warn'?'#FFF8E1':'#FFEBEE', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>{result.score==='ok'?'✅':result.score==='warn'?'⚠️':'❌'}</div>
              <div style={{ fontSize:20, fontWeight:800, color: result.score==='ok'?'#1B5E20':result.score==='warn'?'#E65100':'#B71C1C' }}>{result.name}</div>
              {result.brand && <div style={{ fontSize:14, color:'var(--text2)', marginTop:2 }}>{result.brand}</div>}
              <div style={{ fontSize:14, marginTop:8, color: result.score==='ok'?'#2E7D32':result.score==='warn'?'#BF360C':'#C62828', lineHeight:1.5 }}>{result.verdict}</div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
              {[
                { label:'Kcal', val:result.kcal },
                { label:'Prot.', val:`${result.protein}g` },
                { label:'Carbs', val:`${result.carbs}g` },
                { label:'Grasa', val:`${result.fat}g` },
              ].map((m,i) => (
                <div key={i} style={{ background:'var(--bg2)', borderRadius:12, padding:'10px 6px', textAlign:'center' }}>
                  <div style={{ fontWeight:700, fontSize:16 }}>{m.val}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{m.label}</div>
                </div>
              ))}
            </div>

            {result.highlights?.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ fontWeight:700, marginBottom:8 }}>Puntos positivos</div>
                {result.highlights.map((h,i) => (
                  <div key={i} style={{ display:'flex', gap:8, padding:'8px 12px', marginBottom:6, background:'#E8F5E9', borderRadius:10, fontSize:13 }}>
                    <span style={{ color:'#2E7D32', flexShrink:0 }}>✓</span>{h}
                  </div>
                ))}
              </div>
            )}
            {result.warnings?.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontWeight:700, marginBottom:8 }}>Advertencias</div>
                {result.warnings.map((w,i) => (
                  <div key={i} style={{ display:'flex', gap:8, padding:'8px 12px', marginBottom:6, background:'#FFEBEE', borderRadius:10, fontSize:13 }}>
                    <span style={{ color:'#C62828', flexShrink:0 }}>⚠</span>{w}
                  </div>
                ))}
              </div>
            )}
            <button className="btn-p" onClick={reset} style={{ marginBottom:8 }}>Escanear otro</button>
          </div>
        )}
      </div>
      <div style={{ height:20 }}/>
    </div>
  );
}

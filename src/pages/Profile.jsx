import { useState } from 'react';
import { PROFILES, calcMacros } from '../constants';
import { loadHistory, saveUserProfile } from '../utils/storage';

export default function Profile({ user, onUpdateUser, onReset }) {
  const macros = calcMacros(user);
  const history = loadHistory();
  const prof = PROFILES[user.profile];
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ ...user });
  const [showAllergyInput, setShowAllergyInput] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);

  function saveEdit() {
    onUpdateUser(editData);
    setEditing(false);
  }

  function addAllergy() {
    if (newAllergy.trim()) {
      onUpdateUser({ ...user, allergies: [...(user.allergies || []), newAllergy.trim()] });
      setNewAllergy('');
      setShowAllergyInput(false);
    }
  }

  /* ── Edit form ── */
  if (editing) return (
    <div className="scr" style={{ background:'var(--bg)' }}>
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button onClick={() => setEditing(false)} style={{ width:36, height:36, borderRadius:10, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
          <div style={{ fontWeight:700, fontSize:17 }}>Editar datos</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[
            { label:'Nombre', key:'name', type:'text', placeholder:'Tu nombre' },
            { label:'Edad', key:'age', type:'number', placeholder:'25' },
            { label:'Peso (kg)', key:'weight', type:'number', placeholder:'70' },
            { label:'Altura (cm)', key:'height', type:'number', placeholder:'170' },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>{f.label}</div>
              <input className="inp" type={f.type}
                value={editData[f.key] || ''}
                onChange={e => setEditData(p => ({ ...p, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                placeholder={f.placeholder}/>
            </div>
          ))}
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>Sexo biológico</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {['femenino','masculino'].map(s => (
                <button key={s} onClick={() => setEditData(p => ({ ...p, sex:s }))} style={{
                  padding:'12px', borderRadius:12, fontWeight:600, fontSize:14,
                  border:`1.5px solid ${editData.sex === s ? 'var(--g1)' : 'var(--border)'}`,
                  background: editData.sex === s ? 'var(--g4)' : 'var(--bg)',
                  color: editData.sex === s ? 'var(--g1)' : 'var(--text2)',
                }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>Nivel de actividad</div>
            <select className="inp" value={editData.activity || 'moderado'} onChange={e => setEditData(p => ({ ...p, activity:e.target.value }))}>
              <option value="sedentario">Sedentario</option>
              <option value="ligero">Ligero</option>
              <option value="moderado">Moderado</option>
              <option value="activo">Activo</option>
              <option value="muy_activo">Muy activo</option>
            </select>
          </div>
        </div>
      </div>
      <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:10 }}>
        <button className="btn-p" onClick={saveEdit}>Guardar cambios</button>
        <button className="btn-s" onClick={() => setEditing(false)}>Cancelar</button>
      </div>
    </div>
  );

  /* ── Main profile view ── */
  const ACTIVITY_LABELS = { sedentario:'Sedentario', ligero:'Ligero', moderado:'Moderado', activo:'Activo', muy_activo:'Muy activo' };

  return (
    <div className="scr" style={{ background:'var(--bg)' }}>
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ fontSize:22, fontWeight:800, marginBottom:20 }}>Mi perfil</div>

        {/* Avatar */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:24 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--g4)', border:'2px solid var(--g3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, color:'var(--g1)', marginBottom:10 }}>
            {initials}
          </div>
          <div style={{ fontWeight:700, fontSize:18 }}>{user.name || 'Usuario'}</div>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:8, padding:'6px 14px', background:'var(--g4)', color:'var(--g1)', borderRadius:20, fontWeight:600, fontSize:13 }}>{prof.emoji} {prof.name}</span>
        </div>

        {/* Macros */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontSize:16, fontWeight:700 }}>Mis macros objetivo</div>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--g2)', letterSpacing:'1px' }}>CALCULADO PARA TI</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[
              { label:'Calorías / día', val:macros.kcal },
              { label:'Proteína', val:`${macros.protein}g` },
              { label:'Grasa', val:`${macros.fat}g` },
            ].map((m,i) => (
              <div key={i} style={{ background:'var(--g4)', borderRadius:14, padding:'14px 10px', textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:800, color:'var(--g1)' }}>{m.val}</div>
                <div style={{ fontSize:10, color:'var(--text2)', fontWeight:600, marginTop:3 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal data */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>Datos personales</div>
          <div className="card">
            {[
              { icon:'👤', label:'Edad y sexo', val:`${user.age || '—'} años · ${user.sex || '—'}` },
              { icon:'⊡', label:'Peso', val:`${user.weight || '—'} kg` },
              { icon:'↕', label:'Altura', val:`${user.height || '—'} cm` },
              { icon:'⚡', label:'Actividad', val:ACTIVITY_LABELS[user.activity] || user.activity },
            ].map((d,i,arr) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize:20, width:28, textAlign:'center' }}>{d.icon}</span>
                <span style={{ flex:1, color:'var(--text2)', fontSize:14 }}>{d.label}</span>
                <span style={{ fontWeight:600, fontSize:14 }}>{d.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>Alergias</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
            {(user.allergies || []).map((a,i) => (
              <span key={i} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', background:'var(--red-bg)', color:'var(--red)', border:'1px solid rgba(229,115,115,.3)', borderRadius:20, fontSize:13, fontWeight:600 }}>
                {a}
                <button onClick={() => onUpdateUser({ ...user, allergies:(user.allergies||[]).filter((_,j) => j !== i) })} style={{ color:'var(--red)', fontSize:14 }}>×</button>
              </span>
            ))}
            {!showAllergyInput ? (
              <button onClick={() => setShowAllergyInput(true)} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', border:'1.5px dashed var(--border)', borderRadius:20, fontSize:13, fontWeight:600, color:'var(--text3)' }}>
                + Agregar
              </button>
            ) : (
              <div style={{ display:'flex', gap:8, width:'100%', marginTop:4 }}>
                <input className="inp" value={newAllergy} onChange={e => setNewAllergy(e.target.value)}
                  placeholder="Ej. sulfitos" style={{ flex:1 }}
                  onKeyDown={e => e.key === 'Enter' && addAllergy()}
                  autoFocus/>
                <button onClick={addAllergy} style={{ width:44, height:44, borderRadius:10, background:'var(--g1)', color:'#fff', fontSize:18, flexShrink:0 }}>+</button>
                <button onClick={() => { setShowAllergyInput(false); setNewAllergy(''); }} style={{ width:44, height:44, borderRadius:10, background:'var(--bg2)', fontSize:16, flexShrink:0 }}>×</button>
              </div>
            )}
          </div>
        </div>

        {/* Scan stats */}
        {history.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>Historial de escaneos</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              {[
                { label:'Total', val:history.length },
                { label:'Aptos', val:history.filter(h => h.score === 'ok').length },
                { label:'Evitar', val:history.filter(h => h.score === 'bad').length },
              ].map((s,i) => (
                <div key={i} style={{ background:'var(--bg2)', borderRadius:14, padding:'14px', textAlign:'center' }}>
                  <div style={{ fontSize:22, fontWeight:800, color:'var(--g1)' }}>{s.val}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', fontWeight:500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>Configuración</div>
          <div className="card">
            <button onClick={() => setEditing(true)} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom:'1px solid var(--border)', textAlign:'left' }}>
              <span style={{ fontSize:18, width:28, textAlign:'center' }}>✏️</span>
              <span style={{ flex:1, fontSize:14 }}>Editar datos personales</span>
              <span style={{ color:'var(--text3)', fontSize:16 }}>›</span>
            </button>
            <button onClick={onReset} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom:'1px solid var(--border)', textAlign:'left' }}>
              <span style={{ fontSize:18, width:28, textAlign:'center' }}>🔄</span>
              <span style={{ flex:1, fontSize:14 }}>Recalcular perfil</span>
              <span style={{ color:'var(--text3)', fontSize:16 }}>›</span>
            </button>
            <button onClick={() => {
              if (window.confirm('¿Cerrar sesión y borrar todos los datos?')) onReset();
            }} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', textAlign:'left' }}>
              <span style={{ fontSize:18, width:28, textAlign:'center' }}>🚪</span>
              <span style={{ flex:1, fontSize:14, color:'var(--red)' }}>Cerrar sesión</span>
              <span style={{ color:'var(--text3)', fontSize:16 }}>›</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign:'center', fontSize:12, color:'var(--text3)', padding:'8px 0 20px', lineHeight:1.5 }}>
          NutriScan ofrece orientación general y no reemplaza la consulta con un nutricionista profesional.
        </div>
      </div>
    </div>
  );
}

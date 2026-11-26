import { useState } from 'react';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import Scanner from './pages/Scanner';
import Profile from './pages/Profile';
import { loadUserProfile, saveUserProfile } from './utils/storage';

const TABS = [
  { id:'home',    label:'Inicio',   icon:'⌂' },
  { id:'recipes', label:'Recetas',  icon:'☰' },
  { id:'scanner', label:'Escanear', icon:'⊞' },
  { id:'profile', label:'Perfil',   icon:'◯' },
];

export default function App() {
  const [user, setUser] = useState(() => loadUserProfile());
  const [activeTab, setActiveTab] = useState('home');

  function handleOnboardingComplete(newUser) {
    saveUserProfile(newUser);
    setUser(newUser);
    setActiveTab('home');
  }

  function handleUpdateUser(updated) {
    saveUserProfile(updated);
    setUser(updated);
  }

  function handleReset() {
    localStorage.clear();
    setUser(null);
    setActiveTab('home');
  }

  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh', background:'var(--bg)' }}>
      {/* Page content */}
      <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
        {activeTab === 'home'    && <Home    user={user} onNavigate={setActiveTab} />}
        {activeTab === 'recipes' && <Recipes user={user} />}
        {activeTab === 'scanner' && <Scanner user={user} />}
        {activeTab === 'profile' && <Profile user={user} onUpdateUser={handleUpdateUser} onReset={handleReset} />}
      </div>

      {/* Bottom tab bar */}
      <nav style={{
        height:'var(--tab-h)',
        background:'var(--bg)',
        borderTop:'1px solid var(--border)',
        display:'flex',
        alignItems:'stretch',
        boxShadow:'0 -2px 12px rgba(0,0,0,.06)',
        flexShrink:0,
        paddingBottom:'env(safe-area-inset-bottom)',
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const isScanner = tab.id === 'scanner';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', gap: isScanner ? 0 : 3,
                position:'relative', transition:'all .15s', background:'none', border:'none',
              }}
            >
              {isScanner ? (
                <div style={{
                  width:52, height:52, borderRadius:'50%',
                  background: isActive ? '#1F5C3A' : 'var(--g1)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:22, color:'#fff',
                  boxShadow:'0 4px 14px rgba(45,106,79,.4)',
                  transform: isActive ? 'scale(.95)' : 'scale(1)',
                  transition:'all .2s', marginTop:-14,
                }}>
                  {tab.icon}
                </div>
              ) : (
                <>
                  <span style={{ fontSize:20, transition:'transform .15s', transform: isActive ? 'scale(1.15)' : 'scale(1)', filter: isActive ? 'none' : 'grayscale(1) opacity(.5)' }}>
                    {tab.icon}
                  </span>
                  <span style={{ fontSize:10, fontWeight:600, color: isActive ? 'var(--g1)' : 'var(--text3)', transition:'color .15s' }}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <span style={{ position:'absolute', bottom:0, width:24, height:3, background:'var(--g1)', borderRadius:'3px 3px 0 0' }}/>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

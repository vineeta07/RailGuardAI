import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Camera, UploadCloud, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { t } = useTranslation();
  const [editName, setEditName] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhoto(user.profilePic || '');
    }
  }, [user]);

  const handleSave = () => {
    updateProfile({ name: editName, profilePic: editPhoto });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bento" 
      style={{ display: 'block', maxWidth: 800, margin: '0 auto' }}
    >
      <div className="g-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
          <SettingsIcon size={28} className="text-accent" />
          <h1 style={{ margin: 0, fontSize: 24 }}>{t('Account Settings')}</h1>
        </div>

        <div className="form-group" style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>{t('Display Name')}</label>
          <input 
            type="text" 
            value={editName} 
            onChange={e => setEditName(e.target.value)} 
            placeholder={t('Display Name')} 
            className="form-input" 
            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 15 }} 
          />
        </div>

        <div className="form-group" style={{ marginBottom: 40 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>{t('Profile Photo')}</label>
          
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ position: 'relative' }}>
              {editPhoto ? (
                <img src={editPhoto} alt="preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-input)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Camera size={32} color="var(--text-muted)" />
                </div>
              )}
              <label 
                style={{ position: 'absolute', bottom: -6, right: -6, background: 'var(--accent)', color: 'white', padding: 8, borderRadius: '50%', cursor: 'pointer', boxShadow: 'var(--shadow-lg)' }}
                title="Upload Photo from PC"
              >
                <UploadCloud size={16} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setEditPhoto(reader.result);
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            </div>
            
            <div style={{ flex: 1, paddingTop: 6 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{t('Or choose a preset avatar:')}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6, 7].map((seed) => (
                  <img 
                    key={seed} 
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`} 
                    alt={`avatar ${seed}`} 
                    style={{ width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', border: editPhoto?.includes(`seed=${seed}`) ? '2px solid var(--accent)' : '2px solid transparent', background: 'var(--bg-card)', transition: 'all 0.2s ease' }}
                    onClick={() => setEditPhoto(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
          {saved && <span style={{ color: 'var(--success)', fontSize: 13, fontWeight: 500 }}>{t('Settings saved successfully!')}</span>}
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Save size={16} /> {t('Save Changes')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

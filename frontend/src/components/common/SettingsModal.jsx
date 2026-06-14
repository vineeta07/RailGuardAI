import { useState, useEffect } from 'react';
import { Settings, X, Camera, LogOut, UploadCloud } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, updateProfile, logout } = useAuth();
  const [editName, setEditName] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setEditName(user.name || '');
      setEditPhoto(user.profilePic || '');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }} 
      onClick={onClose}
    >
      <div 
        style={{ background: 'var(--bg-surface)', padding: 32, borderRadius: 16, width: 440, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={20} className="text-accent" /> Profile Settings</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6, borderRadius: '50%' }}><X size={18} /></button>
        </div>
        
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Display Name</label>
          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Enter your name" className="form-input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
        </div>
        <div className="form-group" style={{ marginBottom: 32 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Profile Photo</label>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              {editPhoto ? (
                <img src={editPhoto} alt="preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-input)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Camera size={24} color="var(--text-muted)" />
                </div>
              )}
              <label 
                style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--accent)', color: 'white', padding: 6, borderRadius: '50%', cursor: 'pointer', boxShadow: 'var(--shadow-lg)' }}
                title="Upload Photo"
              >
                <UploadCloud size={14} />
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
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Or choose an avatar:</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map((seed) => (
                  <img 
                    key={seed} 
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`} 
                    alt={`avatar ${seed}`} 
                    style={{ width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', border: editPhoto.includes(`seed=${seed}`) ? '2px solid var(--accent)' : '2px solid transparent', background: 'var(--bg-card)' }}
                    onClick={() => setEditPhoto(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-danger" onClick={() => { onClose(); logout(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'var(--danger-dim)', color: 'var(--danger)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            <LogOut size={16} /> Sign Out
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button className="btn" onClick={() => { updateProfile({ name: editName, profilePic: editPhoto }); onClose(); }} style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

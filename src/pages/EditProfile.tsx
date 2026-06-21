import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';

const AVATAR_EMOJIS = ['👤', '😀', '😎', '🤩', '😺', '🐶', '🐼', '🦊', '🐯', '🦄', '🌈', '⭐', '🔥', '💪', '🎵', '🎨', '🌸', '🍀', '🌊', '🏔️', '🚀', '🏀', '⚽', '🎮', '📚', '💻', '📷', '🎧'];

export default function EditProfile() {
  const navigate = useNavigate();
  const userName = useStore(s => s.userName);
  const setUserName = useStore(s => s.setUserName);
  const avatar = useStore(s => s.avatar);
  const setAvatar = useStore(s => s.setAvatar);
  const bio = useStore(s => s.bio);
  const setBio = useStore(s => s.setBio);

  const [name, setName] = useState(userName);
  const [bioText, setBioText] = useState(bio);
  const [curAvatar, setCurAvatar] = useState(avatar);
  const [showPicker, setShowPicker] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setUserName(name);
    setBio(bioText);
    setAvatar(curAvatar);
    navigate('/profile');
  };

  return (
    <div className="px-4 pt-12 stagger">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-white/80 dark:bg-gray-800 flex items-center justify-center apple-btn shadow-sm">
          <ArrowLeft size={18} className="text-apple-text dark:text-apple-dark-text" />
        </button>
        <h1 className="text-lg font-bold text-apple-text dark:text-apple-dark-text">编辑资料</h1>
        <button onClick={handleSave}
          className="w-9 h-9 rounded-full bg-apple-blue flex items-center justify-center apple-btn shadow-sm">
          <Check size={18} color="white" strokeWidth={3} />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <button onClick={() => setShowPicker(true)}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-apple-blue to-blue-400 flex items-center justify-center text-4xl text-white shadow-lg mb-2 apple-btn relative group overflow-hidden">
          {curAvatar.startsWith('data:') ? (
            <img src={curAvatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            curAvatar || '👤'
          )}
          <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-white font-medium">更换</span>
          </div>
        </button>
        <p className="text-xs text-apple-subtext">点击更换头像</p>
      </div>

      {/* Name */}
      <div className="apple-card p-5 mb-4">
        <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext mb-2 font-medium">昵称</p>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="输入昵称"
          className="w-full bg-transparent text-base text-apple-text dark:text-apple-dark-text outline-none" />
      </div>

      {/* Bio */}
      <div className="apple-card p-5 mb-6">
        <p className="text-xs text-apple-subtext dark:text-apple-dark-subtext mb-2 font-medium">个人简介</p>
        <textarea value={bioText} onChange={e => setBioText(e.target.value)}
          placeholder="添加个人简介..."
          className="w-full bg-transparent text-sm text-apple-text dark:text-apple-dark-text outline-none resize-none"
          rows={3} maxLength={100} />
        <p className="text-xs text-apple-subtext text-right mt-1">{bioText.length}/100</p>
      </div>

      {/* Save Button */}
      <button onClick={handleSave}
        className="w-full py-3.5 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 apple-btn"
        style={{
          background: 'linear-gradient(135deg, #4f7cff, #6b9bff)',
          color: 'white',
          boxShadow: '0 4px 14px rgba(79,124,255,0.35)',
        }}>
        <Check size={20} strokeWidth={3} />
        保存
      </button>

      {/* Hidden file input */}
      <input ref={avatarFileRef} type="file" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          setCurAvatar(ev.target?.result as string);
          setShowPicker(false);
          e.target.value = '';
        };
        reader.readAsDataURL(file);
      }} className="hidden" />

      {/* Avatar Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ paddingTop: '6vh', paddingBottom: 'calc(6vh + 80px)' }}>
          <div className="fixed inset-0 bg-black/20 fade-enter" onClick={() => setShowPicker(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full shadow-xl modal-enter flex flex-col overflow-hidden"
            style={{ maxWidth: 360, maxHeight: '60vh' }}>
            <div className="p-6 pb-0 shrink-0">
              <h3 className="text-lg font-bold text-apple-text dark:text-apple-dark-text mb-4 text-center">选择头像</h3>
              <button onClick={() => avatarFileRef.current?.click()}
                className="w-full py-2.5 rounded-2xl text-sm font-semibold text-white apple-btn mb-4 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #4f7cff, #6b9bff)',
                  boxShadow: '0 4px 12px rgba(79,124,255,0.3)',
                }}>
                <Upload size={16} />
                上传图片
              </button>
              <p className="text-xs text-apple-subtext text-center mb-2 font-medium">或选择表情</p>
            </div>
            <div className="px-6 overflow-y-auto min-h-0 flex-1 pb-6">
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_EMOJIS.map(e => (
                  <button key={e} onClick={() => { setCurAvatar(e); setShowPicker(false); }}
                    className={`w-full aspect-square rounded-xl flex items-center justify-center text-xl apple-btn ${
                      curAvatar === e ? 'bg-apple-blue/10 border border-apple-blue/30 ring-2 ring-apple-blue/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// resources/js/Components/ProfileDropdown.jsx
// Gumagamit ng existing hooks at api.js — walang process.env, walang Next.js

import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { useProfile } from '../hooks/useProfile';
import { useNotifications } from '../hooks/useNotifications';
import AvatarUploadModal from './AvatarUploadModal';
import ChangePasswordModal from './ChangePasswordModal';
import NotificationsModal from './NotificationsModal';

export default function ProfileDropdown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modal, setModal]               = useState(null); // 'avatar' | 'password' | 'notif' | null
  const [toast, setToast]               = useState(null);
  const dropdownRef                     = useRef();

  const {
    profile,
    loading: profileLoading,
    handleAvatarUpload,
    handleChangePassword,
  } = useProfile();

  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    handleMarkAllRead,
    handleMarkOneRead,
  } = useNotifications();

  // Isara ang dropdown kapag na-click sa labas
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  function openModal(name) {
    setDropdownOpen(false);
    setModal(name);
  }

  function closeModal() {
    setModal(null);
  }

  async function onAvatarUpload(file) {
    try {
      await handleAvatarUpload(file);
      showToast('Profile photo updated!');
      closeModal();
    } catch {
      showToast('Failed to upload photo.', 'error');
    }
  }

  async function onChangePassword(payload) {
    await handleChangePassword(payload); // throws on error — hinahawakan ng ChangePasswordModal
    showToast('Password updated!');
  }

  function handleLogout() {
    setDropdownOpen(false);
    router.post(route('logout'));
  }

  // Initials: first letter ng bawat word, max 2 characters
  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#CC0000' : '#16a34a',
          color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: 13,
          zIndex: 9999, pointerEvents: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Avatar Button + Dropdown ── */}
      <div style={{ position: 'relative' }} ref={dropdownRef}>

        {/* Avatar Button */}
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
          aria-label="Open profile menu"
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: profile?.avatar_url ? 'transparent' : '#CC0000',
            backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center',
            border: 'none', cursor: 'pointer', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700,
            flexShrink: 0, position: 'relative',
          }}
        >
          {!profile?.avatar_url && initials}

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              background: '#ef4444', color: '#fff',
              fontSize: 9, fontWeight: 700,
              width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid white',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* ── Dropdown Panel ── */}
        {dropdownOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 42, width: 240,
            background: '#fff', border: '1px solid #E5E7EB',
            borderRadius: 12, overflow: 'hidden', zIndex: 1000,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>

            {/* Header — User info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 12px' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: profile?.avatar_url ? 'transparent' : '#CC0000',
                backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : undefined,
                backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {!profile?.avatar_url && initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profileLoading ? '…' : profile?.name}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile?.email}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #F3F4F6' }} />

            {/* Menu Items */}
            {[
              { label: 'Change photo',     icon: '📷', action: () => openModal('avatar') },
              {
                label: 'Notifications',
                icon: '🔔',
                action: () => openModal('notif'),
                badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : null,
              },
              { label: 'Change password',  icon: '🔒', action: () => openModal('password') },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', width: '100%',
                  background: 'none', border: 'none', borderTop: '1px solid #F9FAFB',
                  fontSize: 13, color: '#374151', cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    background: '#ef4444', color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    padding: '1px 6px', borderRadius: 10,
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            <div style={{ borderTop: '1px solid #F3F4F6' }} />

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', width: '100%',
                background: 'none', border: 'none',
                fontSize: 13, color: '#CC0000', cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FFF5F5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: 15 }}>🚪</span>
              Log out
            </button>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal === 'avatar' && (
        <AvatarUploadModal
          onClose={closeModal}
          onUpload={onAvatarUpload}
        />
      )}

      {modal === 'notif' && (
        <NotificationsModal
          notifications={notifications}
          loading={notifLoading}
          onClose={closeModal}
          onMarkAllRead={handleMarkAllRead}
          onMarkOneRead={handleMarkOneRead}
        />
      )}

      {modal === 'password' && (
        <ChangePasswordModal
          onClose={closeModal}
          onSubmit={onChangePassword}
        />
      )}
    </>
  );
}
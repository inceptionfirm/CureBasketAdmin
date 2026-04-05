import React, { useEffect, useState } from 'react';
import { User, userService } from '../../services/userService';
import './EditUserModal.css';

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSaved }) => {
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState<'email' | 'password' | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setNewEmail(user.email || '');
      setNewPassword('');
      setErr(null);
      setBusy(null);
    }
  }, [isOpen, user]);

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const handleChangeEmail = async () => {
    if (!user) return;
    const trimmed = newEmail.trim();
    if (!trimmed) {
      setErr('Enter an email address.');
      return;
    }
    if (trimmed === (user.email || '').trim()) {
      setErr('Enter a different email than the current one.');
      return;
    }
    setBusy('email');
    setErr(null);
    try {
      await userService.changeEmail(user.id, trimmed);
      onSaved();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to update email');
    } finally {
      setBusy(null);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (newPassword.length < 6) {
      setErr('Password must be at least 6 characters.');
      return;
    }
    setBusy('password');
    setErr(null);
    try {
      await userService.changePassword(user.id, newPassword);
      setNewPassword('');
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to update password');
    } finally {
      setBusy(null);
    }
  };

  if (!isOpen || !user) return null;

  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.email;

  return (
    <div className="edit-user-overlay" onClick={handleClose} role="presentation">
      <div className="edit-user-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="edit-user-title">
        <div className="edit-user-modal__header">
          <h2 id="edit-user-title">Edit user</h2>
          <button type="button" className="edit-user-modal__close" onClick={handleClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="edit-user-modal__body">
          <p className="edit-user-modal__meta">
            <strong>{displayName}</strong>
            {user.apiRole && (
              <span className="edit-user-modal__role"> · {user.apiRole}</span>
            )}
          </p>
          <p className="edit-user-modal__hint">User ID: {user.id}</p>

          {err && <div className="edit-user-modal__error">{err}</div>}

          <div className="edit-user-modal__field">
            <label htmlFor="edit-user-email">Email</label>
            <input
              id="edit-user-email"
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={!!busy}
            />
            <button
              type="button"
              className="edit-user-modal__btn edit-user-modal__btn--primary"
              onClick={handleChangeEmail}
              disabled={!!busy}
            >
              {busy === 'email' ? 'Updating…' : 'Update email'}
            </button>
          </div>

          <div className="edit-user-modal__field">
            <label htmlFor="edit-user-password">New password</label>
            <input
              id="edit-user-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!!busy}
              placeholder="Leave empty until you change it"
            />
            <button
              type="button"
              className="edit-user-modal__btn"
              onClick={handleChangePassword}
              disabled={!!busy}
            >
              {busy === 'password' ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;

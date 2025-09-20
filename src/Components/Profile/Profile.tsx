import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale } from '../../contexts/LocaleContext';
import './Profile.css';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    avatar: user?.avatar || '👤'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would update the backend
    console.log('Profile updated:', profileData);
    setIsEditing(false);
    // Show success message
    alert(t('profile.updateSuccess'));
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'user',
      avatar: user?.avatar || '👤'
    });
    setIsEditing(false);
  };

  const avatars = ['👤', '👨‍💼', '👩‍💼', '🎭', '🤖', '🦸', '🧙‍♂️', '👨‍🚀'];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{t('profile.title')}</h1>
        <p>{t('profile.subtitle')}</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {profileData.avatar}
            </div>
            {isEditing && (
              <div className="avatar-selector">
                <label>{t('profile.chooseAvatar')}</label>
                <div className="avatar-options">
                  {avatars.map((avatar, index) => (
                    <button
                      key={index}
                      className={`avatar-option ${profileData.avatar === avatar ? 'selected' : ''}`}
                      onClick={() => setProfileData(prev => ({ ...prev, avatar }))}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="name">{t('profile.fullName')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('profile.emailAddress')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">{t('profile.role')}</label>
              <select
                id="role"
                name="role"
                value={profileData.role}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-input"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="demo">Demo</option>
              </select>
            </div>

            <div className="profile-actions">
              {!isEditing ? (
                <button
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  {t('profile.editProfile')}
                </button>
              ) : (
                <div className="edit-actions">
                  <button
                    className="save-button"
                    onClick={handleSave}
                  >
                    {t('profile.saveChanges')}
                  </button>
                  <button
                    className="cancel-button"
                    onClick={handleCancel}
                  >
                    {t('profile.cancel')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-icon">🏥</div>
            <div className="stat-content">
              <h3>Healthcare Activity</h3>
              <p>Last login: {new Date().toLocaleDateString()}</p>
              <p>Member since: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-content">
              <h3>Security & Privacy</h3>
              <p>Password: ••••••••</p>
              <button className="change-password-btn">Change Password</button>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚙️</div>
            <div className="stat-content">
              <h3>Healthcare Preferences</h3>
              <p>Theme: Healthcare Green</p>
              <p>Notifications: Enabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

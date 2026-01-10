import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../contexts/LocaleContext';
import './Footer.css';

interface FooterProps {
  sidebarOpen?: boolean;
}

const Footer: React.FC<FooterProps> = ({ sidebarOpen = true }) => {
  const navigate = useNavigate();
  const { t } = useLocale();

  const footerLinks = [
    { label: 'Home', path: '/dashboard', icon: '🏠' },
    { label: 'About Us', path: '/about', icon: 'ℹ️' },
    { label: 'Contact', path: '/contact', icon: '📧' },
    { label: 'FAQ', path: '/faq', icon: '❓' },
    { label: 'Privacy', path: '/privacy', icon: '🔒' },
    { label: 'Terms', path: '/terms', icon: '📄' },
  ];

  const handleLinkClick = (path: string) => {
    navigate(path);
  };

  return (
    <footer className={`admin-footer ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="footer-content">
        <div className="footer-address">
          <p className="footer-address-line">GFB-018A, Roman Court, Ansal Sushant City, Kundli, Sonipat, Haryana 131029</p>
          <p className="footer-address-line">📞 +91 72060 03516 | ✉️ info@nixonism.com</p>
        </div>
        <div className="footer-links">
          {footerLinks.map((link, index) => (
            <button
              key={index}
              className="footer-link"
              onClick={() => handleLinkClick(link.path)}
              title={link.label}
            >
              <span className="footer-link-icon">{link.icon}</span>
              <span className="footer-link-text">{link.label}</span>
            </button>
          ))}
        </div>
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} NIXONISM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


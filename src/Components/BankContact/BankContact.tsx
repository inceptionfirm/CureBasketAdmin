import React, { useEffect, useState } from 'react';
import { metadataService, type BankInfo, type ContactUsInfo } from '../../services/metadataService';
import './BankContact.css';

const BankContact: React.FC = () => {
    // Bank information state
    const [bankInfo, setBankInfo] = useState<BankInfo>({
        bankName: '',
        bankCode: '',
        bankAccountNumber: '',
        bankAccountName: '',
    });
    const [bankLoading, setBankLoading] = useState<boolean>(false);
    const [bankSaving, setBankSaving] = useState<boolean>(false);
    const [bankError, setBankError] = useState<string | null>(null);

    // Contact us information state
    const [contactUsInfo, setContactUsInfo] = useState<ContactUsInfo>({
        phone: '',
        email: '',
        address: '',
        pincode: '',
    });
    const [contactUsLoading, setContactUsLoading] = useState<boolean>(false);
    const [contactUsSaving, setContactUsSaving] = useState<boolean>(false);
    const [contactUsError, setContactUsError] = useState<string | null>(null);
    const [isContactEditing, setIsContactEditing] = useState<boolean>(false);
    const [originalContactInfo, setOriginalContactInfo] = useState<ContactUsInfo>({
        phone: '',
        email: '',
        address: '',
        pincode: '',
    });

    const [isBankEditing, setIsBankEditing] = useState<boolean>(false);
    const [originalBankInfo, setOriginalBankInfo] = useState<BankInfo>({
        bankName: '',
        bankCode: '',
        bankAccountNumber: '',
        bankAccountName: '',
    });

    // Load configured bank info
    useEffect(() => {
        const loadBankInfo = async () => {
            try {
                setBankLoading(true);
                setBankError(null);
                const data = await metadataService.getBankInfo();
                if (data) {
                    setBankInfo(data);
                    setOriginalBankInfo(data);
                }
            } catch (error) {
                console.error('Failed to load bank info:', error);
                setBankError(
                    error instanceof Error ? error.message : 'Failed to load bank info'
                );
            } finally {
                setBankLoading(false);
            }
        };

        loadBankInfo();
    }, []);

    // Load configured contact us information
    const loadContactUsInfo = async () => {
        try {
            setContactUsLoading(true);
            setContactUsError(null);
            const data = await metadataService.getContactUsInfo();
            if (data) {
                const contactData = {
                    phone: data.phone ? String(data.phone) : '',
                    email: data.email || '',
                    address: data.address || '',
                    pincode: data.pincode || '',
                };
                setContactUsInfo(contactData);
                setOriginalContactInfo(contactData);
                // Save to localStorage as backup (in case GET fails next time due to CORS)
                localStorage.setItem('contactUsInfo_backup', JSON.stringify(contactData));
            } else {
                // If no data from API, try to load from localStorage as fallback
                const backup = localStorage.getItem('contactUsInfo_backup');
                if (backup) {
                    try {
                        const backupData = JSON.parse(backup);
                        setContactUsInfo(backupData);
                        setOriginalContactInfo(backupData);
                        console.log('Loaded contact us info from localStorage backup');
                    } catch (e) {
                        console.error('Failed to parse localStorage backup:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load contact us info:', error);
            // Don't block editing if data hasn't been configured yet or if there's a CORS error
            // Allow user to create new contact info even if fetch fails
            const errorMessage = error instanceof Error ? error.message : 'Failed to load contact us info';

            // Check if it's a CORS error or network error
            const isCorsError = errorMessage.includes('Failed to fetch') ||
                errorMessage.includes('CORS') ||
                errorMessage.includes('NetworkError') ||
                errorMessage.includes('Network request failed');

            // If it's a CORS error, try to load from localStorage as fallback
            if (isCorsError || errorMessage.includes('not found') || errorMessage.includes('No Static Resource Found')) {
                // Try to load from localStorage as fallback
                const backup = localStorage.getItem('contactUsInfo_backup');
                if (backup) {
                    try {
                        const backupData = JSON.parse(backup);
                        setContactUsInfo(backupData);
                        setOriginalContactInfo(backupData);
                        console.log('Loaded contact us info from localStorage backup (CORS error)');
                    } catch (e) {
                        console.error('Failed to parse localStorage backup:', e);
                    }
                }
                // Don't set error for CORS issues - POST might still work
                // Just log it and allow editing
                console.warn('Contact us info fetch failed (CORS or not found), but editing is still allowed:', errorMessage);
                setContactUsError(null);
            } else {
                // For other errors, show them but allow editing
                setContactUsError(errorMessage);
                // Clear error after a moment to allow editing
                setTimeout(() => {
                    setContactUsError(null);
                }, 3000);
            }
        } finally {
            setContactUsLoading(false);
        }
    };

    useEffect(() => {
        loadContactUsInfo();
    }, []);

    const handleBankChange = (field: keyof BankInfo, value: string) => {
        setBankInfo(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleBankSave = async () => {
        try {
            setBankSaving(true);
            setBankError(null);
            await metadataService.configureBankInfo(bankInfo);
            setOriginalBankInfo(bankInfo);
            setIsBankEditing(false);
            alert('Bank details updated successfully. They will be used only inside customer emails.');
        } catch (error) {
            console.error('Failed to save bank info:', error);
            const message =
                error instanceof Error ? error.message : 'Failed to save bank info';
            setBankError(message);
            alert(message);
        } finally {
            setBankSaving(false);
        }
    };

    const handleContactUsChange = (field: keyof ContactUsInfo, value: string | number) => {
        setContactUsInfo(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleContactUsEdit = () => {
        setIsContactEditing(true);
        // Clear any previous errors when entering edit mode
        setContactUsError(null);
    };

    const handleContactUsCancel = () => {
        setContactUsInfo(originalContactInfo);
        setIsContactEditing(false);
        setContactUsError(null);
    };

    const handleContactUsSave = async () => {
        try {
            setContactUsSaving(true);
            setContactUsError(null);
            await metadataService.configureContactUsInfo(contactUsInfo);

            // Save to localStorage as backup (in case GET fails due to CORS)
            localStorage.setItem('contactUsInfo_backup', JSON.stringify(contactUsInfo));

            // Update original info with saved data immediately (so it persists even if reload fails)
            setOriginalContactInfo(contactUsInfo);
            setIsContactEditing(false);

            // Try to reload from server, but don't fail if it errors (CORS issue)
            // The saved data is already in state and localStorage, so we're good
            try {
                await loadContactUsInfo();
            } catch (reloadError) {
                // Reload failed (likely CORS), but that's okay - we already have the saved data
                console.warn('Failed to reload contact us info after save (CORS?), but data was saved:', reloadError);
            }

            alert('Contact us information updated successfully. This will be shown on the website.');
        } catch (error) {
            console.error('Failed to save contact us info:', error);
            const message =
                error instanceof Error ? error.message : 'Failed to save contact us info';
            setContactUsError(message);
            alert(message);
        } finally {
            setContactUsSaving(false);
        }
    };

    const handleBankEdit = () => {
        setIsBankEditing(true);
    };

    const handleBankCancel = () => {
        setBankInfo(originalBankInfo);
        setIsBankEditing(false);
        setBankError(null);
    };

    return (
        <div className="bank-contact-container">
            <div className="bank-contact-header">
                <div className="header-icon">🏦</div>
                <h1>Bank & Contact Information</h1>
                <p>Manage bank details for emails and contact information for the website</p>
            </div>

            <div className="bank-contact-content">
                {/* Contact Us Information (shown on website) */}
                <div className="form-card">
                    <div className="card-header">
                        <div className="card-icon">📞</div>
                        <div className="card-title-group">
                            <h2>Contact Us Information</h2>
                            <p className="card-subtitle">Configure contact details displayed on the website</p>
                        </div>
                        {!isContactEditing && !contactUsLoading && (
                            <button className="edit-btn" onClick={handleContactUsEdit}>
                                <span>✏️</span>
                                Edit
                            </button>
                        )}
                    </div>

                    {contactUsLoading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading contact information...</p>
                        </div>
                    )}

                    {contactUsError && !isContactEditing && (
                        <div className="error-alert">
                            <span className="error-icon">⚠️</span>
                            <p>{contactUsError}</p>
                            <p className="error-hint">You can still edit to create or update contact information.</p>
                        </div>
                    )}

                    {!contactUsLoading && (
                        <div className="form-body">
                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="contact-phone">
                                        <span className="label-icon">📱</span>
                                        Phone Number
                                    </label>
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        className="form-input"
                                        value={contactUsInfo.phone}
                                        onChange={(e) => handleContactUsChange('phone', e.target.value)}
                                        placeholder="e.g., 1234567890"
                                        disabled={!isContactEditing}
                                    />
                                    <span className="field-hint">Contact phone number shown on website</span>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="contact-email">
                                        <span className="label-icon">✉️</span>
                                        Email Address
                                    </label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        className="form-input"
                                        value={contactUsInfo.email}
                                        onChange={(e) => handleContactUsChange('email', e.target.value)}
                                        placeholder="e.g., support@website2.com"
                                        disabled={!isContactEditing}
                                    />
                                    <span className="field-hint">Contact email address shown on website</span>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-field full-width">
                                    <label htmlFor="contact-address">
                                        <span className="label-icon">📍</span>
                                        Address
                                    </label>
                                    <textarea
                                        id="contact-address"
                                        className="form-textarea"
                                        rows={3}
                                        value={contactUsInfo.address}
                                        onChange={(e) => handleContactUsChange('address', e.target.value)}
                                        placeholder="e.g., 1234, Street, City, Country"
                                        disabled={!isContactEditing}
                                    />
                                    <span className="field-hint">Physical address shown on website</span>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="contact-pincode">
                                        <span className="label-icon">📮</span>
                                        Pincode
                                    </label>
                                    <input
                                        id="contact-pincode"
                                        type="text"
                                        className="form-input"
                                        value={contactUsInfo.pincode}
                                        onChange={(e) => handleContactUsChange('pincode', e.target.value)}
                                        placeholder="e.g., 301201"
                                        disabled={!isContactEditing}
                                    />
                                    <span className="field-hint">Postal/ZIP code</span>
                                </div>
                            </div>

                            {isContactEditing && (
                                <div className="card-actions">
                                    <button
                                        className="cancel-btn"
                                        onClick={handleContactUsCancel}
                                        disabled={contactUsSaving}
                                    >
                                        <span>❌</span>
                                        Cancel
                                    </button>
                                    <button
                                        className="save-btn primary"
                                        onClick={handleContactUsSave}
                                        disabled={contactUsSaving}
                                    >
                                        {contactUsSaving ? (
                                            <>
                                                <span className="btn-spinner"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <span>💾</span>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Payment & Bank Info (used in emails, not shown on website) */}
                <div className="form-card">
                    <div className="card-header">
                        <div className="card-icon">💳</div>
                        <div className="card-title-group">
                            <h2>Payment & Bank Info</h2>
                            <p className="card-subtitle">Bank details included in payment and dispatch emails</p>
                        </div>
                        {!isBankEditing && !bankLoading && (
                            <button className="edit-btn" onClick={handleBankEdit}>
                                <span>✏️</span>
                                Edit
                            </button>
                        )}
                    </div>

                    {bankLoading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading bank details...</p>
                        </div>
                    )}

                    {bankError && (
                        <div className="error-alert">
                            <span className="error-icon">⚠️</span>
                            <p>{bankError}</p>
                        </div>
                    )}

                    {!bankLoading && (
                        <div className="form-body">
                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="bank-name">
                                        <span className="label-icon">🏛️</span>
                                        Bank Name
                                    </label>
                                    <input
                                        id="bank-name"
                                        type="text"
                                        className="form-input"
                                        value={bankInfo.bankName}
                                        onChange={(e) => handleBankChange('bankName', e.target.value)}
                                        placeholder="e.g., HDFC Bank"
                                        disabled={!isBankEditing}
                                    />
                                    <span className="field-hint">Name of the bank shown in customer emails</span>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="bank-code">
                                        <span className="label-icon">🔢</span>
                                        Bank Code / IFSC
                                    </label>
                                    <input
                                        id="bank-code"
                                        type="text"
                                        className="form-input"
                                        value={bankInfo.bankCode}
                                        onChange={(e) => handleBankChange('bankCode', e.target.value)}
                                        placeholder="e.g., HDFC0001234"
                                        disabled={!isBankEditing}
                                    />
                                    <span className="field-hint">Bank IFSC code for transfers</span>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="account-number">
                                        <span className="label-icon">🔐</span>
                                        Account Number
                                    </label>
                                    <input
                                        id="account-number"
                                        type="text"
                                        className="form-input"
                                        value={bankInfo.bankAccountNumber}
                                        onChange={(e) => handleBankChange('bankAccountNumber', e.target.value)}
                                        placeholder="e.g., 012345678901"
                                        disabled={!isBankEditing}
                                    />
                                    <span className="field-hint">Customer will pay to this account</span>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="account-name">
                                        <span className="label-icon">👤</span>
                                        Account Holder Name
                                    </label>
                                    <input
                                        id="account-name"
                                        type="text"
                                        className="form-input"
                                        value={bankInfo.bankAccountName}
                                        onChange={(e) => handleBankChange('bankAccountName', e.target.value)}
                                        placeholder="e.g., CureBasket Pvt. Ltd."
                                        disabled={!isBankEditing}
                                    />
                                    <span className="field-hint">Name that appears on the bank account</span>
                                </div>
                            </div>

                            {isBankEditing && (
                                <div className="card-actions">
                                    <button
                                        className="cancel-btn"
                                        onClick={handleBankCancel}
                                        disabled={bankSaving}
                                    >
                                        <span>❌</span>
                                        Cancel
                                    </button>
                                    <button
                                        className="save-btn primary"
                                        onClick={handleBankSave}
                                        disabled={bankSaving}
                                    >
                                        {bankSaving ? (
                                            <>
                                                <span className="btn-spinner"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <span>💾</span>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BankContact;

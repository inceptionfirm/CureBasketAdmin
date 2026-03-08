import React, { useEffect, useState } from 'react';
import {
  metadataService,
  type OrderShippingConfig,
  type DiscountRangeItem,
} from '../../services/metadataService';
import './OrderShippingConfig.css';

const OrderShippingConfig: React.FC = () => {
  const [config, setConfig] = useState<OrderShippingConfig>({
    shippingFee: '',
    discountRange: [{ start: 0, end: 0, discount: 0 }],
    discountCriteria: 'QUANTITY',
    taxRate: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await metadataService.getOrderShippingConfig();
        if (data) {
          setConfig({
            shippingFee: data.shippingFee ?? '',
            discountRange:
              Array.isArray(data.discountRange) && data.discountRange.length > 0
                ? data.discountRange.map((r) => ({
                    start: Number(r.start) || 0,
                    end: Number(r.end) || 0,
                    discount: Number(r.discount) || 0,
                  }))
                : [{ start: 0, end: 0, discount: 0 }],
            discountCriteria: data.discountCriteria ?? 'QUANTITY',
            taxRate: data.taxRate ?? '',
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load config');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof OrderShippingConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleDiscountRangeChange = (
    index: number,
    field: keyof DiscountRangeItem,
    value: number
  ) => {
    setConfig((prev) => {
      const next = [...(prev.discountRange || [])];
      if (!next[index]) next[index] = { start: 0, end: 0, discount: 0 };
      next[index] = { ...next[index], [field]: value };
      return { ...prev, discountRange: next };
    });
  };

  const addDiscountRow = () => {
    setConfig((prev) => ({
      ...prev,
      discountRange: [...(prev.discountRange || []), { start: 0, end: 0, discount: 0 }],
    }));
  };

  const removeDiscountRow = (index: number) => {
    setConfig((prev) => {
      const next = (prev.discountRange || []).filter((_, i) => i !== index);
      return { ...prev, discountRange: next.length ? next : [{ start: 0, end: 0, discount: 0 }] };
    });
  };

  // Backend expects numeric strings only (e.g. "5.12"). Strip %, ₹, and non-numeric chars to avoid "Malformed JSON" parse error.
  const toNumericString = (value: string | number | undefined): string => {
    const s = String(value ?? '').replace(/[%\s₹,]/g, '').replace(/[^\d.-]/g, '');
    return s || '0';
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload: OrderShippingConfig = {
        shippingFee: toNumericString(config.shippingFee),
        discountCriteria: config.discountCriteria || 'QUANTITY',
        taxRate: toNumericString(config.taxRate),
        discountRange: (config.discountRange || []).map((r) => ({
          start: Number(r.start) || 0,
          end: Number(r.end) || 0,
          discount: Number(r.discount) || 0,
        })),
      };
      await metadataService.configureOrderShippingConfig(payload);
      alert('Order shipping config saved successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="order-shipping-config-page">
      <div className="osc-header">
        <div className="osc-header-icon">🚚</div>
        <div>
          <h1>Order & Shipping Config</h1>
          <p>Configure shipping fee, tax rate, and discount ranges</p>
        </div>
      </div>

      {error && (
        <div className="osc-error">
          <span className="osc-error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="osc-loading">
          <div className="osc-spinner" />
          <p>Loading config...</p>
        </div>
      ) : (
        <div className="osc-content">
          {/* Section 1: Configure */}
          <div className="osc-card">
            <h2 className="osc-card-title">
              <span className="osc-card-icon">⚙️</span>
              Configure
            </h2>
            <div className="osc-form-row">
              <div className="osc-field">
                <label>Shipping Fee (₹)</label>
                <input
                  type="text"
                  value={config.shippingFee}
                  onChange={(e) => handleChange('shippingFee', e.target.value)}
                  placeholder="e.g. 555.55"
                />
              </div>
              <div className="osc-field">
                <label>Tax Rate (%)</label>
                <input
                  type="text"
                  value={config.taxRate}
                  onChange={(e) => handleChange('taxRate', e.target.value)}
                  placeholder="e.g. 5.12"
                />
              </div>
            </div>
            <div className="osc-form-row">
              <div className="osc-field">
                <label>Discount Criteria</label>
                <select
                  value={config.discountCriteria}
                  onChange={(e) => handleChange('discountCriteria', e.target.value)}
                >
                  <option value="QUANTITY">QUANTITY</option>
                  <option value="AMOUNT">AMOUNT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Discount */}
          <div className="osc-card">
            <h2 className="osc-card-title">
              <span className="osc-card-icon">💰</span>
              Discount Ranges
            </h2>
            <p className="osc-card-desc">
              Add ranges (start – end) and discount % for each. Example: 102–500 → 7% discount.
            </p>
            <div className="osc-discount-table-wrap">
              <table className="osc-discount-table">
                <thead>
                  <tr>
                    <th>Start</th>
                    <th>End</th>
                    <th>Discount (%)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(config.discountRange || []).map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={row.start}
                          onChange={(e) =>
                            handleDiscountRangeChange(index, 'start', Number(e.target.value) || 0)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={row.end}
                          onChange={(e) =>
                            handleDiscountRangeChange(index, 'end', Number(e.target.value) || 0)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={row.discount}
                          onChange={(e) =>
                            handleDiscountRangeChange(index, 'discount', Number(e.target.value) || 0)
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="osc-btn-remove"
                          onClick={() => removeDiscountRow(index)}
                          disabled={(config.discountRange?.length ?? 0) <= 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="osc-btn-add" onClick={addDiscountRow}>
              + Add range
            </button>
          </div>

          <div className="osc-actions">
            <button
              type="button"
              className="osc-btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save config'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderShippingConfig;

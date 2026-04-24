import React, { useState } from 'react';

export default function FormModal({ feature, item, onClose, onSave }) {
  const [formData, setFormData] = useState(() => {
    if (item) {
      const data = {};
      feature.formFields.forEach((f) => {
        data[f.key] = item[f.key] != null ? String(item[f.key]) : '';
      });
      return data;
    }
    const data = {};
    feature.formFields.forEach((f) => { data[f.key] = ''; });
    return data;
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const cleaned = {};
    feature.formFields.forEach((f) => {
      const val = formData[f.key];
      if (val !== '' && val != null) {
        if (f.type === 'number') {
          cleaned[f.key] = parseFloat(val);
        } else {
          cleaned[f.key] = val;
        }
      }
    });
    await onSave(cleaned);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'Edit' : 'New'} {feature.name}</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {feature.formFields.map((field) => (
              <div className="form-group" key={field.key}>
                <label>
                  {field.label}
                  {field.required && <span style={{ color: '#f87171' }}> *</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    step={field.type === 'number' ? 'any' : undefined}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-action btn-save" disabled={saving}>
              {saving ? 'Saving...' : item ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn-action btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

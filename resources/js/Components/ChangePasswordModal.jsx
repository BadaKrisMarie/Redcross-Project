import { useState } from 'react';

const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Strong', 'Very strong'];
const STRENGTH_COLORS = ['', '#e24b4a', '#ef9f27', '#639922', '#1d9e75'];

export default function ChangePasswordModal({ onClose, onSubmit }) {
  const [form, setForm]       = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getStrength(form.new_password);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    const errs = {};
    if (!form.current_password) errs.current_password = 'Required.';
    if (!form.new_password)     errs.new_password     = 'Required.';
    else if (strength < 2)      errs.new_password     = 'Password is too weak.';
    if (form.new_password !== form.new_password_confirmation)
      errs.new_password_confirmation = 'Passwords do not match.';

    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setSaving(true);
      await onSubmit(form);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      const serverErrors = err.response?.data?.errors ?? {};
      const msg          = err.response?.data?.message  ?? '';
      setErrors({
        ...serverErrors,
        current_password: serverErrors.current_password?.[0] ?? (msg || undefined),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Change password</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {success ? (
            <p style={{ textAlign: 'center', color: '#1d9e75', padding: '1rem 0' }}>
              ✓ Password updated successfully!
            </p>
          ) : (
            <>
              <div className="field-group">
                <label htmlFor="current_password">Current password</label>
                <input
                  id="current_password"
                  type="password"
                  placeholder="Enter current password"
                  value={form.current_password}
                  onChange={set('current_password')}
                />
                {errors.current_password && <span className="field-error">{errors.current_password}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="new_password">New password</label>
                <input
                  id="new_password"
                  type="password"
                  placeholder="At least 8 chars, uppercase &amp; number"
                  value={form.new_password}
                  onChange={set('new_password')}
                />
                {form.new_password && (
                  <>
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${strength * 25}%`,
                          background: STRENGTH_COLORS[strength],
                        }}
                      />
                    </div>
                    <span className="strength-label" style={{ color: STRENGTH_COLORS[strength] }}>
                      {STRENGTH_LABELS[strength]}
                    </span>
                  </>
                )}
                {errors.new_password && <span className="field-error">{errors.new_password}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="new_password_confirmation">Confirm new password</label>
                <input
                  id="new_password_confirmation"
                  type="password"
                  placeholder="Re-enter new password"
                  value={form.new_password_confirmation}
                  onChange={set('new_password_confirmation')}
                />
                {errors.new_password_confirmation && (
                  <span className="field-error">{errors.new_password_confirmation}</span>
                )}
              </div>
            </>
          )}
        </div>

        {!success && (
          <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn-save" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Updating…' : 'Update password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

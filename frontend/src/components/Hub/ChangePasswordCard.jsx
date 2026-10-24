import { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { apiRequest } from "../../services/api";
import { changePassword } from "../../services/authService";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

const FIELDS = [
  { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm new password", autoComplete: "new-password" },
];

/**
 * Settings card for changing the password while signed in.
 * Lives inside the settings <form>, so it uses a plain button and handles Enter itself.
 */
export default function ChangePasswordCard() {
  const [hasPassword, setHasPassword] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/auth/me")
      .then((me) => active && setHasPassword(me?.hasPassword !== false))
      .catch(() => active && setHasPassword(true));
    return () => {
      active = false;
    };
  }, []);

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  };

  const submit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("Please fill in all three fields.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("The new password must be at least 8 characters long.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await changePassword(form);
      setForm(EMPTY);
      setSuccess(res?.message || "Your password was changed.");
    } catch (err) {
      setError(err?.message || "Could not change your password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hub-family-card hub-org-card">
      <div className="hub-family-header">
        <KeyRound size={22} color="#a78bfa" />
        <div>
          <strong className="hub-org-title">Change Password</strong>
          <p className="hub-org-subtitle">
            {hasPassword === false
              ? "You sign in with Google, GitHub or Discord, so this account has no password to change."
              : "Enter your current password, then choose a new one. Other devices will be signed out."}
          </p>
        </div>
      </div>

      {hasPassword !== false && (
        <>
          <div className="hub-password-fields">
            {FIELDS.map((field) => (
              <input
                key={field.name}
                className="hub-text-input hub-org-input hub-password-input"
                type={visible ? "text" : "password"}
                placeholder={field.label}
                aria-label={field.label}
                autoComplete={field.autoComplete}
                value={form[field.name]}
                disabled={saving}
                maxLength={200}
                onChange={(e) => update(field.name, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // Keep Enter from submitting the surrounding settings form.
                    e.preventDefault();
                    submit();
                  }
                }}
              />
            ))}
          </div>

          <div className="hub-password-actions">
            <button
              type="button"
              className="hub-password-toggle"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide passwords" : "Show passwords"}
            >
              {visible ? <EyeOff size={15} /> : <Eye size={15} />}
              <span>{visible ? "Hide" : "Show"}</span>
            </button>
            <button type="button" className="hub-copy-btn hub-org-send" onClick={submit} disabled={saving}>
              {saving ? (
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <KeyRound size={14} />
              )}
              <span>{saving ? "Saving…" : "Update password"}</span>
            </button>
          </div>
        </>
      )}

      {success && (
        <div className="hub-org-status accepted" role="status">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <p className="hub-org-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

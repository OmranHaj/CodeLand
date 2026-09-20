import { useState } from "react";
import { Check, Copy, Settings as SettingsIcon, UserRound, Users } from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
import { getParentInviteCode, getProfile, getUser, userKey, writeStored } from "../../services/learningHub";

export default function Settings() {
  const user = getUser();
  const [form, setForm] = useState(() => getProfile(user));
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const inviteCode = user?.role === "parent" ? getParentInviteCode(user) : null;

  const handleCopyInviteCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {}
  };

  const update = (name, value) => { setForm(current => ({ ...current, [name]: value })); setMessage(""); };
  const save = event => {
    event.preventDefault();
    if (!form.name.trim()) { setFailed(true); setMessage("Please enter a display name."); return; }
    try {
      writeStored(`codeland_profile_${userKey(user)}`, { ...form, name: form.name.trim() });
      document.documentElement.dataset.reducedMotion = String(form.reducedMotion);
      setFailed(false); setMessage("Your preferences have been saved on this device.");
    } catch { setFailed(true); setMessage("Unable to save preferences. Please enable browser storage and try again."); }
  };
  return <HubLayout title="Settings"><div className="hub-heading"><div><span className="hub-eyebrow"><SettingsIcon size={13} /> MAKE YOURSELF AT HOME</span><h1>Your space. Your pace.</h1><p>A few small preferences to make your learning experience feel like you.</p></div></div><div className="hub-settings"><form className="hub-panel hub-form" onSubmit={save}><h2>Your profile</h2><label>Display name<input value={form.name} maxLength={50} autoComplete="nickname" required onChange={event => update("name", event.target.value)} /></label><label>Account email<input value={user?.email || "No email linked in preview mode"} readOnly /><small>Account credentials are managed by your account provider.</small></label>{user?.role === "parent" && inviteCode && (<div style={{ marginTop: "10px", padding: "18px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 22, 39, 0.9))", border: "1px solid #6366f1" }}><div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}><Users size={18} color="#a78bfa" /><strong style={{ fontSize: "14px", color: "#f8fafc" }}>Family Invitation Code</strong></div><p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 14px 0", lineHeight: "1.5" }}>Give this code to your child when they register. When they enter it during student registration, their account will instantly connect to your Parent Observatory.</p><div className="hub-family-code" style={{ marginTop: 0 }}><code>{inviteCode}</code><button type="button" className="hub-icon-button" aria-label="Copy invitation code" onClick={handleCopyInviteCode}>{copiedCode ? <Check size={17} color="#34d399" /> : <Copy size={17} />}</button></div>{copiedCode && <p style={{ fontSize: "11px", color: "#34d399", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}><Check size={13} /> Invitation code copied to clipboard!</p>}</div>)}<h2>Learning preferences</h2><label>Practice goal<select value={form.goal} onChange={event => update("goal", Number(event.target.value))}><option value={1}>Easy start · 1 challenge</option><option value={3}>Steady explorer · 3 challenges</option><option value={6}>Full adventure · 6 challenges</option></select><small>Your goal appears on the overview page.</small></label><label className="hub-toggle"><span>Reduce motion<small style={{ display: "block" }}>Keep animations and transitions to a minimum.</small></span><input type="checkbox" checked={form.reducedMotion} onChange={event => update("reducedMotion", event.target.checked)} /></label><div><button className="hub-btn primary" type="submit"><Check size={15} />Save preferences</button></div>{message && <p className={failed ? "hub-feedback" : "hub-form-message"} role={failed ? "alert" : "status"}>{message}</p>}</form><aside className="hub-panel hub-profile-preview"><div className="hub-avatar">{form.name.slice(0, 1).toUpperCase() || "E"}</div><h2>{form.name || "Explorer"}</h2><p>{user?.role === "parent" ? "Your family's biggest supporter" : "Curious today. Creator tomorrow."}</p><span className="hub-tag"><UserRound size={12} />{user?.role === "parent" ? "PARENT" : "EXPLORER"} PROFILE</span>{user?.role === "parent" && inviteCode && (<div style={{ margin: "18px 0", padding: "12px 14px", background: "#141b30", borderRadius: "10px", border: "1px dashed #4f46e5" }}><span style={{ fontSize: "10px", color: "#94a3b8", display: "block", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Family Invite Code</span><code style={{ fontSize: "17px", fontWeight: "700", color: "#c4b5fd", letterSpacing: "2px" }}>{inviteCode}</code></div>)}<hr className="hub-rule" /><p>Profile preferences and learning progress are stored in this browser. Use the same browser to pick up where you left off.</p></aside></div></HubLayout>;
}


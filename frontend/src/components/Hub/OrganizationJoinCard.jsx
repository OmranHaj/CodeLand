import { useEffect, useState } from "react";
import { Building2, CheckCircle2, Clock3, Loader2, Send, XCircle } from "lucide-react";
import {
  fetchMyOrganization,
  requestToJoinOrganization,
} from "../../services/organizationService";

/**
 * Student settings card: enter an organization's code to send a join request,
 * then see whether it is waiting, accepted, or declined.
 * Lives inside the settings <form>, so it uses a plain button and handles Enter itself.
 */
export default function OrganizationJoinCard() {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchMyOrganization()
      .then((data) => active && setMembership(data))
      .catch(() => active && setError("Could not load your organization. Please refresh the page."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const send = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter the organization code.");
      return;
    }

    setSending(true);
    setError("");
    try {
      const res = await requestToJoinOrganization(trimmed);
      setMembership((current) => ({ ...(current || {}), request: res.request }));
      setCode("");
    } catch (err) {
      setError(err?.message || "Could not send your request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const organization = membership?.organization;
  const request = membership?.request;

  return (
    <div className="hub-family-card hub-org-card">
      <div className="hub-family-header">
        <Building2 size={22} color="#a78bfa" />
        <div>
          <strong className="hub-org-title">Your Organization</strong>
          <p className="hub-org-subtitle">
            Join your school, university, or teacher using the code they gave you.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="hub-org-status">
          <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
          Loading…
        </div>
      ) : organization ? (
        <div className="hub-org-status accepted" role="status">
          <CheckCircle2 size={16} />
          <span>
            You are a member of <strong>{organization.name || "your organization"}</strong>.
          </span>
        </div>
      ) : (
        <>
          {request?.status === "PENDING" && (
            <div className="hub-org-status pending" role="status">
              <Clock3 size={16} />
              <span>
                Request sent to <strong>{request.organizationName || "the organization"}</strong>.
                Waiting for their approval.
              </span>
            </div>
          )}

          {request?.status === "REJECTED" && (
            <div className="hub-org-status rejected" role="status">
              <XCircle size={16} />
              <span>
                <strong>{request.organizationName || "The organization"}</strong> declined your
                request. You can send a new one.
              </span>
            </div>
          )}

          <div className="hub-org-form">
            <input
              className="hub-text-input hub-org-input"
              type="text"
              placeholder="Organization code, e.g. AB12CD34"
              autoComplete="off"
              aria-label="Organization code"
              value={code}
              disabled={sending}
              maxLength={20}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Keep Enter from submitting the surrounding settings form.
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button type="button" className="hub-copy-btn hub-org-send" onClick={send} disabled={sending}>
              {sending ? (
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Send size={14} />
              )}
              <span>{sending ? "Sending…" : "Send request"}</span>
            </button>
          </div>
        </>
      )}

      {error && (
        <p className="hub-org-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

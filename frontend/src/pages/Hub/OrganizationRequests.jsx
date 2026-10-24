import { useCallback, useEffect, useState } from "react";
import { Check, Inbox, Loader2, UserPlus, X } from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
import { decideJoinRequest, fetchJoinRequests } from "../../services/organizationService";

function initials(name, email) {
  const source = (name || email || "?").trim();
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function announceCount(count) {
  // Keeps the sidebar badge in sync without another request.
  window.dispatchEvent(new CustomEvent("codeland:join-requests", { detail: { count } }));
}

export default function OrganizationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState(null);

  const load = useCallback(
    () =>
      fetchJoinRequests()
        .then((data) => {
          const list = Array.isArray(data?.requests) ? data.requests : [];
          setRequests(list);
          announceCount(list.length);
        })
        .catch((err) => setNotice({ type: "error", text: err?.message || "Could not load join requests." }))
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (request, accept) => {
    const studentName = request.student?.name || request.student?.email || "The student";
    setBusyId(request.id);
    setNotice(null);
    try {
      await decideJoinRequest(request.id, accept);
      const remaining = requests.filter((r) => r.id !== request.id);
      setRequests(remaining);
      announceCount(remaining.length);
      setNotice({
        type: "success",
        text: accept
          ? `${studentName} joined your organization and now appears on your dashboard.`
          : `You declined ${studentName}'s request.`,
      });
    } catch (err) {
      setNotice({ type: "error", text: err?.message || "Could not update this request." });
      // The request may have been handled elsewhere; refresh the list.
      load();
    } finally {
      setBusyId("");
    }
  };

  return (
    <HubLayout title="Join Requests">
      <div className="hub-heading">
        <div>
          <span className="hub-eyebrow">
            <UserPlus size={13} /> ORGANIZATION MEMBERSHIP
          </span>
          <h1>Join Requests</h1>
          <p>
            Students who entered your organization code are waiting here. Accept a request to add
            the student to your dashboard.
          </p>
        </div>
      </div>

      {notice && (
        <div className={`hub-requests-notice ${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
          {notice.text}
        </div>
      )}

      {loading ? (
        <div className="hub-requests-empty">
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
          <strong>Loading requests…</strong>
        </div>
      ) : requests.length === 0 ? (
        <div className="hub-requests-empty">
          <Inbox size={28} />
          <strong>No pending requests</strong>
          <span>Share your organization code from Settings so students can send you a request.</span>
        </div>
      ) : (
        <div className="hub-requests-list">
          {requests.map((request) => {
            const busy = busyId === request.id;
            const { student } = request;
            return (
              <div className="hub-request-row" key={request.id}>
                <div className="hub-request-avatar" aria-hidden="true">
                  {student?.avatar ? <img src={student.avatar} alt="" /> : initials(student?.name, student?.email)}
                </div>
                <div className="hub-request-info">
                  <strong>{student?.name || "Student"}</strong>
                  <span>{student?.email}</span>
                  <span>Sent {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="hub-request-actions">
                  <button
                    type="button"
                    className="hub-request-btn accept"
                    disabled={Boolean(busyId)}
                    onClick={() => decide(request, true)}
                  >
                    {busy ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />}
                    Accept
                  </button>
                  <button
                    type="button"
                    className="hub-request-btn reject"
                    disabled={Boolean(busyId)}
                    onClick={() => decide(request, false)}
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </HubLayout>
  );
}

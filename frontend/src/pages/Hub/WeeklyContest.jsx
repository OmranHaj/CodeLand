import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Crown,
  Flame,
  History,
  Lock,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import gsap from "gsap";

import HubLayout from "../../components/Hub/HubLayout";
import Arena3DScene from "../../components/Contest/Arena3DScene";
import ContestCertificate from "../../components/Contest/ContestCertificate";
import ContestStoryArena from "../../components/Contest/ContestStoryArena";
import { formatXp } from "../../services/arenaProblemService";
import {
  STAGE_LABELS,
  STAGE_THEME,
  divisionFor,
  fetchContestHistory,
  fetchCurrentContest,
  fetchMyMedals,
  fetchStandings,
  formatContestWindow,
  formatDateTime,
  getCountdown,
  registerForContest,
  toCertificateMedal,
  unregisterFromContest,
} from "../../services/contestService";
import { getUser } from "../../services/learningHub";

const WC_EXTRA_STYLES = String.raw`
  .wc-state { display: grid; place-items: center; gap: 10px; padding: 46px 20px; text-align: center; color: #94a3b8; }
  .wc-state h2 { margin: 0; color: #fff; font-size: 22px; }
  .wc-state p { margin: 0; max-width: 560px; line-height: 1.6; }
  .wc-spinner { width: 34px; height: 34px; border-radius: 50%; border: 3px solid rgba(148,163,184,.2); border-top-color: var(--wc-accent); animation: wc-spin .9s linear infinite; }
  @keyframes wc-spin { to { transform: rotate(360deg); } }
  .wc-admin-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 10px 16px; border-radius: 14px; border: 1px solid rgba(56,189,248,.25); background: rgba(56,189,248,.06); color: #cbd5e1; font-size: 13px; }
  .wc-admin-bar a { color: #38bdf8; font-weight: 800; text-decoration: none; }
  .wc-standings { display: grid; gap: 8px; }
  .wc-standing-row { display: grid; grid-template-columns: 54px minmax(0, 1.6fr) repeat(3, minmax(0, .8fr)); align-items: center; gap: 10px; padding: 11px 14px; border-radius: 14px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); color: #cbd5e1; font-size: 13.5px; }
  .wc-standing-row.head { background: transparent; border: 0; color: #64748b; font-size: 10.5px; font-weight: 900; letter-spacing: .12em; }
  .wc-standing-row.me { border-color: rgba(var(--wc-accent-rgb), .6); background: rgba(var(--wc-accent-rgb), .08); }
  .wc-standing-row strong { color: #fff; }
  .wc-standing-rank { font-weight: 900; color: #e2e8f0; }
  .wc-standing-rank.r1 { color: #fbbf24; } .wc-standing-rank.r2 { color: #cbd5e1; } .wc-standing-rank.r3 { color: #fb923c; }
  .wc-history { display: grid; gap: 12px; }
  .wc-history-card { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 16px 18px; border-radius: 16px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); }
  .wc-history-card h3 { margin: 0 0 4px; color: #fff; font-size: 16px; }
  .wc-history-card p { margin: 0; color: #94a3b8; font-size: 13px; max-width: 620px; }
  .wc-history-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
  .wc-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 700; color: #cbd5e1; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); }
  .wc-chip.gold { color: #fde68a; border-color: rgba(251,191,36,.4); } .wc-chip.silver { color: #e2e8f0; } .wc-chip.bronze { color: #fdba74; border-color: rgba(251,146,60,.4); }
  .wc-history-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .wc-overlay { position: fixed; inset: 0; z-index: 1300; overflow-y: auto; padding: 24px; background: rgba(2,4,12,.9); backdrop-filter: blur(10px); }
  .wc-overlay-card { max-width: 1280px; margin: 0 auto; }
  .wc-overlay-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; color: #fff; }
  .wc-icon-btn { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.06); color: #fff; cursor: pointer; }
  .wc-medal-empty { opacity: .45; }
  @media (max-width: 760px) {
    .wc-standing-row { grid-template-columns: 40px minmax(0, 1fr) 70px; }
    .wc-standing-row > :nth-child(4), .wc-standing-row > :nth-child(5) { display: none; }
  }
  @media (prefers-reduced-motion: reduce) { .wc-spinner { animation: none; } }
`;

/** Contenders get a rank only after solving a sector; before that they show "—". */
const rankLabel = (rank) => (rank ? `#${rank}` : "—");

const MEDAL_UI = [
  { rank: 2, type: "silver", label: "SILVER // RANK 02", emoji: "🥈", color: "#cbd5e1", bonus: 300 },
  { rank: 1, type: "gold", label: "GRAND CHAMPION // RANK 01", emoji: "🥇", color: "#fbbf24", bonus: 500 },
  { rank: 3, type: "bronze", label: "BRONZE // RANK 03", emoji: "🥉", color: "#fb923c", bonus: 150 },
];

export default function WeeklyContest() {
  const [currentUser] = useState(getUser);
  const role = (currentUser?.role || "").toLowerCase();
  const isStudent = role === "student" || role === "child";
  const [searchParams] = useSearchParams();

  // "roster" | "arena" | "podium" | "history" | "rules"
  const [activeTab, setActiveTab] = useState(() =>
    ["arena", "problems"].includes(searchParams.get("tab")) ? "arena" : "roster"
  );

  // ---------------- server data ----------------
  const [data, setData] = useState(null); // GET /arena/contest/current
  const [loadState, setLoadState] = useState("loading"); // "loading" | "ready" | "error"
  const [loadError, setLoadError] = useState("");
  const [serverOffset, setServerOffset] = useState(0);
  const [standings, setStandings] = useState(null);
  const [medals, setMedals] = useState([]);
  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState("");
  const [historyView, setHistoryView] = useState(null); // { contest, mode: "standings" | "problems", standings }

  // ---------------- UI state ----------------
  const [now, setNow] = useState(() => Date.now());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [regBusy, setRegBusy] = useState(false);
  const [certificateMedal, setCertificateMedal] = useState(null);
  const [celebrationMessage, setCelebrationMessage] = useState(null);

  const heroRef = useRef(null);
  const cardsGridRef = useRef(null);
  const reloadedForRef = useRef(null);

  const contest = data?.contest || null;
  const stage = contest?.stage || "none";
  const effectiveStage = STAGE_THEME[stage] || "registration";
  const isRegistered = Boolean(data?.registration?.registered);

  const notify = (message) => {
    setCelebrationMessage(message);
    setTimeout(() => setCelebrationMessage(null), 4500);
  };

  const loadContest = useCallback(async () => {
    try {
      const res = await fetchCurrentContest();
      setData(res);
      setServerOffset(new Date(res.serverTime).getTime() - Date.now());
      setLoadState("ready");
      return res;
    } catch (err) {
      setLoadError(err.message || "Could not reach the arena.");
      setLoadState("error");
      return null;
    }
  }, []);

  const loadStandings = useCallback(async (contestId) => {
    if (!contestId) {
      setStandings(null);
      return;
    }
    try {
      setStandings(await fetchStandings(contestId));
    } catch {
      setStandings(null);
    }
  }, []);

  const loadMedals = useCallback(async () => {
    try {
      const list = await fetchMyMedals();
      setMedals(Array.isArray(list) ? list : []);
    } catch {
      setMedals([]);
    }
  }, []);

  useEffect(() => {
    loadContest();
    loadMedals();
  }, [loadContest, loadMedals]);

  useEffect(() => {
    loadStandings(contest?.id);
  }, [contest?.id, loadStandings]);

  useEffect(() => {
    if (activeTab !== "history" || history) return;
    fetchContestHistory()
      .then((list) => setHistory(Array.isArray(list) ? list : []))
      .catch((err) => setHistoryError(err.message || "Could not load past contests."));
  }, [activeTab, history]);

  // Ticking clock (display only — the server enforces the window).
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdownTarget = stage === "upcoming" ? contest?.startsAt : stage === "live" ? contest?.endsAt : null;
  const countdown = getCountdown(countdownTarget, serverOffset, now);

  // When the countdown reaches zero the stage changed on the server: refetch once.
  useEffect(() => {
    if (!countdownTarget || countdown.diffMs > 0 || reloadedForRef.current === countdownTarget) return;
    reloadedForRef.current = countdownTarget;
    loadContest().then(() => {
      loadStandings(contest?.id);
      loadMedals();
    });
  }, [countdownTarget, countdown.diffMs, contest?.id, loadContest, loadStandings, loadMedals]);

  // Open the arena automatically when the contest is live and the student is in.
  useEffect(() => {
    if (stage === "live" && isRegistered) setActiveTab("arena");
  }, [stage, isRegistered]);

  const entries = standings?.entries || [];
  const me = standings?.me || data?.myStanding || null;
  const participants = contest?.participants ?? entries.length;
  const contestMedal = medals.find((m) => m.contestId === contest?.id) || null;

  const filteredCompetitors = useMemo(
    () =>
      entries.filter((s) => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const division = divisionFor(s.totalXp).division.toLowerCase();
        return matchesSearch && (selectedDivision === "all" || division === selectedDivision);
      }),
    [entries, searchQuery, selectedDivision]
  );

  // Registration is open only during the week before the contest (server-decided).
  const canRegisterNow = Boolean(contest?.registrationOpen);
  const canLeaveNow = canRegisterNow;
  const registrationNotYetOpen =
    stage === "upcoming" && !canRegisterNow && contest?.registrationOpensAt && new Date(contest.registrationOpensAt) > new Date(now + serverOffset);

  const handleToggleRegistration = async () => {
    if (!contest || !isStudent || regBusy) return;
    if (isRegistered && !canLeaveNow) {
      setActiveTab("arena");
      return;
    }
    setRegBusy(true);
    try {
      if (isRegistered) {
        await unregisterFromContest(contest.id);
        notify("You have left this Sunday's Arena.");
      } else {
        await registerForContest(contest.id);
        notify("✓ Arena Pass Confirmed! You are officially registered for this contest.");
        gsap.fromTo(
          ".wc-hero-copy",
          { boxShadow: "0 0 50px rgba(168, 85, 247, 0.6)" },
          { boxShadow: "0 0 0 rgba(0,0,0,0)", duration: 0.8 }
        );
      }
      await loadContest();
      await loadStandings(contest.id);
    } catch (err) {
      notify(err.message || "Registration failed.");
    } finally {
      setRegBusy(false);
    }
  };

  // Every sector cleared: medals are decided by the server when the contest ends.
  const handleContestFinish = ({ totalScore }) => {
    notify(
      `🎉 MISSION COMPLETE! You cleared every sector with ${formatXp(totalScore)} XP. Final medals are awarded when the contest closes.`
    );
    loadStandings(contest?.id);
    setActiveTab("podium");
  };

  const openHistoryStandings = async (item) => {
    setHistoryView({ contest: item, mode: "standings", standings: null });
    try {
      const res = await fetchStandings(item.id);
      setHistoryView({ contest: item, mode: "standings", standings: res });
    } catch (err) {
      notify(err.message || "Could not load the standings.");
      setHistoryView(null);
    }
  };

  const openCertificate = (medal) => setCertificateMedal(toCertificateMedal(medal));

  // GSAP Animations
  useLayoutEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll(".stagger-in"),
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [loadState]);

  // Cinematic page choreography
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".wc-reveal",
        { opacity: 0, y: 28, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.07, ease: "power3.out" }
      );
      gsap.to(".wc-orbit-ring-a", { rotation: 360, duration: 24, repeat: -1, ease: "none" });
      gsap.to(".wc-orbit-ring-b", { rotation: -360, duration: 34, repeat: -1, ease: "none" });
      gsap.to(".wc-scan-beam", { yPercent: 900, duration: 5.5, repeat: -1, ease: "none" });
    });
    return () => ctx.revert();
  }, [loadState]);

  useLayoutEffect(() => {
    gsap.fromTo(".wc-tab-content", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
  }, [activeTab]);

  const stageLabel = STAGE_LABELS[stage] || STAGE_LABELS.none;
  const stageAccent = effectiveStage === "live" ? "#22c55e" : effectiveStage === "concluded" ? "#fbbf24" : "#a855f7";

  const tabs = [
    { id: "roster", label: "Contenders", Icon: Users },
    { id: "arena", label: "Story Arena", Icon: Swords },
    { id: "podium", label: "Podium", Icon: Trophy },
    { id: "history", label: "History", Icon: History },
    { id: "rules", label: "Protocols", Icon: ShieldCheck },
  ];

  const registerLabel = !contest
    ? "No contest scheduled"
    : isRegistered
    ? canLeaveNow
      ? "Arena Pass Active · Leave"
      : "Arena Pass Active · Enter"
    : canRegisterNow
    ? "Register for Sunday Arena"
    : registrationNotYetOpen
    ? `Registration opens ${formatDateTime(contest.registrationOpensAt)}`
    : "Registration closed";

  return (
    <HubLayout title="Weekly Contest">
      <style>{String.raw`
        .wc-shell {
          --wc-accent: #a855f7;
          --wc-accent-rgb: 168, 85, 247;
          --wc-cyan: #38bdf8;
          --wc-green: #34d399;
          --wc-gold: #fbbf24;
          position: relative;
          isolation: isolate;
          min-height: 100vh;
          color: #eef2ff;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .wc-shell.stage-live {
          --wc-accent: #22c55e;
          --wc-accent-rgb: 34, 197, 94;
        }

        .wc-shell.stage-concluded {
          --wc-accent: #fbbf24;
          --wc-accent-rgb: 251, 191, 36;
        }

        .wc-cosmos {
          position: fixed;
          inset: 0;
          z-index: -4;
          pointer-events: none;
          overflow: hidden;
          background:
            radial-gradient(circle at 13% 12%, rgba(var(--wc-accent-rgb), .12), transparent 24%),
            radial-gradient(circle at 88% 18%, rgba(56, 189, 248, .09), transparent 24%),
            radial-gradient(circle at 72% 84%, rgba(99, 102, 241, .08), transparent 25%),
            linear-gradient(135deg, #030611 0%, #050916 45%, #03050c 100%);
        }

        .wc-cosmos::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .24;
          background-image:
            linear-gradient(rgba(148, 163, 184, .06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, .06) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: linear-gradient(to bottom, black, transparent 88%);
          transform: perspective(650px) rotateX(60deg) scale(1.4) translateY(20%);
          transform-origin: center bottom;
        }

        .wc-cosmos::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,.52) 0 1px, transparent 1.25px);
          background-size: 53px 53px;
          opacity: .12;
        }

        .wc-ambient-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(70px);
          opacity: .22;
          animation: wcFloatOrb 12s ease-in-out infinite alternate;
        }

        .wc-ambient-orb.one {
          width: 360px;
          height: 360px;
          top: 9%;
          left: -110px;
          background: rgba(var(--wc-accent-rgb), .46);
        }

        .wc-ambient-orb.two {
          width: 300px;
          height: 300px;
          right: -90px;
          top: 42%;
          background: rgba(56, 189, 248, .3);
          animation-delay: -5s;
        }

        .wc-layout {
          position: relative;
          max-width: 1540px;
          margin: 0 auto;
          padding: 6px 0 80px;
        }

        .wc-glass {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, .14);
          background:
            linear-gradient(145deg, rgba(15, 23, 42, .78), rgba(5, 9, 21, .86));
          box-shadow:
            0 26px 70px rgba(0, 0, 0, .38),
            inset 0 1px rgba(255, 255, 255, .035);
          backdrop-filter: blur(18px);
        }

        .wc-glass::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(120deg, transparent 0 30%, rgba(255,255,255,.035) 48%, transparent 65%);
          transform: translateX(-90%);
          transition: transform .8s ease;
        }

        .wc-glass:hover::before { transform: translateX(90%); }

        .wc-devbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 10px 14px;
          margin-bottom: 18px;
          border-radius: 16px;
          background: rgba(3, 7, 18, .72);
          border: 1px solid rgba(148, 163, 184, .12);
        }

        .wc-devbar-label {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .06em;
        }

        .wc-devbar-label strong { color: #e2e8f0; }

        .wc-sim-controls {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }

        .wc-sim-btn {
          border: 1px solid rgba(148, 163, 184, .14);
          border-radius: 9px;
          padding: 6px 10px;
          background: rgba(15, 23, 42, .8);
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: .2s ease;
        }

        .wc-sim-btn:hover,
        .wc-sim-btn.active {
          color: white;
          border-color: rgba(var(--wc-accent-rgb), .58);
          background: rgba(var(--wc-accent-rgb), .13);
          box-shadow: 0 0 24px rgba(var(--wc-accent-rgb), .13);
        }

        .wc-toast {
          position: relative;
          z-index: 8;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          margin-bottom: 18px;
          border-radius: 14px;
          color: #a7f3d0;
          border: 1px solid rgba(52, 211, 153, .34);
          background: linear-gradient(90deg, rgba(16, 185, 129, .14), rgba(6, 182, 212, .08));
          box-shadow: 0 10px 40px rgba(16, 185, 129, .1);
          font-size: 13px;
          font-weight: 700;
        }

        .wc-hero {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(430px, .95fr);
          gap: 22px;
          margin-bottom: 22px;
          min-height: 510px;
        }

        .wc-hero-copy {
          border-radius: 28px;
          padding: 38px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 510px;
        }

        .wc-hero-copy::after {
          content: "";
          position: absolute;
          width: 340px;
          height: 340px;
          left: -120px;
          top: -140px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(var(--wc-accent-rgb), .2), transparent 68%);
          pointer-events: none;
        }

        .wc-eyebrow {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          width: fit-content;
          padding: 7px 12px;
          margin-bottom: 20px;
          border: 1px solid rgba(var(--wc-accent-rgb), .34);
          border-radius: 999px;
          background: rgba(var(--wc-accent-rgb), .08);
          color: var(--wc-accent);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .15em;
          text-transform: uppercase;
          box-shadow: 0 0 30px rgba(var(--wc-accent-rgb), .08);
        }

        .wc-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 12px currentColor;
          animation: wcPulse 1.5s ease-in-out infinite;
        }

        .wc-kicker {
          margin: 0 0 8px;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .wc-title {
          position: relative;
          z-index: 2;
          max-width: 820px;
          margin: 0;
          font-size: clamp(38px, 5vw, 72px);
          line-height: .98;
          letter-spacing: -.05em;
          font-weight: 950;
          color: #fff;
          text-wrap: balance;
          text-shadow: 0 12px 40px rgba(0,0,0,.5);
        }

        .wc-title span {
          display: block;
          margin-top: 8px;
          font-size: .52em;
          letter-spacing: -.025em;
          background: linear-gradient(90deg, var(--wc-accent), #38bdf8 50%, #e879f9);
          -webkit-background-clip: text;
          color: transparent;
          filter: drop-shadow(0 0 14px rgba(var(--wc-accent-rgb), .2));
        }

        .wc-intro {
          max-width: 730px;
          margin: 20px 0 26px;
          color: #9aa9be;
          font-size: 14px;
          line-height: 1.8;
        }

        .wc-intro strong { color: #f8fafc; }

        .wc-countdown {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 9px;
          padding: 10px;
          border: 1px solid rgba(148,163,184,.1);
          border-radius: 18px;
          background: rgba(2,6,23,.56);
          box-shadow: inset 0 0 30px rgba(0,0,0,.25);
        }

        .wc-timecell {
          position: relative;
          padding: 14px 10px 12px;
          text-align: center;
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(30,41,59,.48), rgba(8,12,26,.35));
          overflow: hidden;
        }

        .wc-timecell::before {
          content: "";
          position: absolute;
          left: 10%;
          right: 10%;
          top: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--wc-accent), transparent);
          opacity: .65;
        }

        .wc-timevalue {
          display: block;
          font-family: "SFMono-Regular", Consolas, monospace;
          color: #f8fafc;
          font-size: 27px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -.03em;
          text-shadow: 0 0 18px rgba(var(--wc-accent-rgb), .24);
        }

        .wc-timelabel {
          display: block;
          margin-top: 7px;
          color: #526176;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .18em;
        }

        .wc-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        .wc-primary-btn,
        .wc-secondary-btn,
        .wc-card-btn {
          appearance: none;
          border: 0;
          cursor: pointer;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
          font: inherit;
        }

        .wc-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 47px;
          padding: 0 22px;
          border-radius: 13px;
          background: linear-gradient(135deg, var(--wc-accent), #6366f1);
          color: white;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 12px 32px rgba(var(--wc-accent-rgb), .28), inset 0 1px rgba(255,255,255,.16);
        }

        .stage-live .wc-primary-btn { background: linear-gradient(135deg, #22c55e, #059669); }
        .stage-concluded .wc-primary-btn { background: linear-gradient(135deg, #fbbf24, #d97706); color: #111827; }

        .wc-primary-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 38px rgba(var(--wc-accent-rgb), .4); }

        .wc-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 47px;
          padding: 0 18px;
          border: 1px solid rgba(148,163,184,.16);
          border-radius: 13px;
          background: rgba(15,23,42,.58);
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 800;
        }

        .wc-secondary-btn:hover { transform: translateY(-2px); border-color: rgba(var(--wc-accent-rgb), .5); }

        .wc-action-note {
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
        }

        .wc-visual {
          position: relative;
          min-height: 510px;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid rgba(var(--wc-accent-rgb), .22);
          background: linear-gradient(160deg, rgba(6, 10, 24, .92), rgba(3, 5, 13, .98));
          box-shadow: 0 30px 80px rgba(0,0,0,.52), 0 0 60px rgba(var(--wc-accent-rgb), .08);
        }

        .wc-visual > div:not(.wc-visual-overlay):not(.wc-orbit-ring-a):not(.wc-orbit-ring-b):not(.wc-scan-beam) {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }

        .wc-visual canvas { width: 100% !important; height: 100% !important; display: block; }

        .wc-visual-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 4;
          background:
            linear-gradient(to bottom, rgba(2,6,23,.02), rgba(2,6,23,.42)),
            radial-gradient(circle at 50% 50%, transparent 35%, rgba(2,6,23,.54) 100%);
        }

        .wc-hud-top,
        .wc-hud-bottom {
          position: absolute;
          left: 18px;
          right: 18px;
          z-index: 6;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          pointer-events: none;
          font-family: "SFMono-Regular", Consolas, monospace;
          color: #93a4b8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .wc-hud-top { top: 17px; }
        .wc-hud-bottom { bottom: 17px; }

        .wc-hud-chip {
          padding: 6px 9px;
          border-radius: 8px;
          border: 1px solid rgba(148,163,184,.14);
          background: rgba(3,7,18,.64);
          backdrop-filter: blur(8px);
        }

        .wc-hud-chip strong { color: var(--wc-accent); }

        .wc-corner {
          position: absolute;
          z-index: 6;
          width: 34px;
          height: 34px;
          pointer-events: none;
        }

        .wc-corner.tl { top: 13px; left: 13px; border-top: 2px solid var(--wc-accent); border-left: 2px solid var(--wc-accent); }
        .wc-corner.tr { top: 13px; right: 13px; border-top: 2px solid var(--wc-accent); border-right: 2px solid var(--wc-accent); }
        .wc-corner.bl { bottom: 13px; left: 13px; border-bottom: 2px solid var(--wc-accent); border-left: 2px solid var(--wc-accent); }
        .wc-corner.br { bottom: 13px; right: 13px; border-bottom: 2px solid var(--wc-accent); border-right: 2px solid var(--wc-accent); }

        .wc-orbit-ring-a,
        .wc-orbit-ring-b {
          position: absolute;
          z-index: 3;
          left: 50%;
          top: 50%;
          border-radius: 50%;
          pointer-events: none;
          transform-origin: center;
        }

        .wc-orbit-ring-a {
          width: 74%;
          aspect-ratio: 1;
          margin: -37% 0 0 -37%;
          border: 1px dashed rgba(var(--wc-accent-rgb), .24);
        }

        .wc-orbit-ring-b {
          width: 58%;
          aspect-ratio: 1;
          margin: -29% 0 0 -29%;
          border: 1px solid rgba(56,189,248,.12);
        }

        .wc-orbit-ring-a::before,
        .wc-orbit-ring-b::before {
          content: "";
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--wc-accent);
          box-shadow: 0 0 16px var(--wc-accent);
          left: 50%;
          top: -4px;
        }

        .wc-scan-beam {
          position: absolute;
          z-index: 5;
          top: 0;
          left: 5%;
          right: 5%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,.7), transparent);
          box-shadow: 0 0 18px rgba(56,189,248,.45);
          pointer-events: none;
        }

        .wc-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0,1fr));
          gap: 12px;
          margin-bottom: 22px;
        }

        .wc-stat {
          position: relative;
          overflow: hidden;
          min-height: 116px;
          padding: 18px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid rgba(148,163,184,.11);
          background: linear-gradient(145deg, rgba(15,23,42,.66), rgba(5,9,21,.78));
          box-shadow: 0 15px 40px rgba(0,0,0,.18);
          transition: transform .25s ease, border-color .25s ease;
        }

        .wc-stat:hover { transform: translateY(-4px); border-color: rgba(var(--wc-accent-rgb), .34); }

        .wc-stat::after {
          content: "";
          position: absolute;
          inset: auto 0 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--stat-color, var(--wc-accent)), transparent);
          opacity: .65;
        }

        .wc-stat-icon {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: var(--stat-color, var(--wc-accent));
          background: color-mix(in srgb, var(--stat-color, var(--wc-accent)) 13%, transparent);
          border: 1px solid color-mix(in srgb, var(--stat-color, var(--wc-accent)) 22%, transparent);
          box-shadow: 0 0 22px color-mix(in srgb, var(--stat-color, var(--wc-accent)) 12%, transparent);
        }

        .wc-stat-value {
          color: #f8fafc;
          font-size: 19px;
          font-weight: 900;
          letter-spacing: -.02em;
        }

        .wc-stat-label {
          margin-top: 4px;
          color: #66758b;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .wc-nav {
          position: sticky;
          top: 8px;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 9px;
          margin-bottom: 18px;
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,.12);
          background: rgba(3,7,18,.82);
          backdrop-filter: blur(18px);
          box-shadow: 0 16px 45px rgba(0,0,0,.28);
        }

        .wc-tabs {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }

        .wc-tab {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid transparent;
          border-radius: 11px;
          background: transparent;
          color: #64748b;
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
          transition: .2s ease;
        }

        .wc-tab:hover { color: #cbd5e1; background: rgba(148,163,184,.06); }

        .wc-tab.active {
          color: #fff;
          background: rgba(var(--wc-accent-rgb), .13);
          border-color: rgba(var(--wc-accent-rgb), .26);
          box-shadow: inset 0 0 22px rgba(var(--wc-accent-rgb), .06);
        }

        .wc-tab.active::after {
          content: "";
          position: absolute;
          left: 16%;
          right: 16%;
          bottom: -10px;
          height: 2px;
          background: var(--wc-accent);
          box-shadow: 0 0 12px var(--wc-accent);
        }

        .wc-nav-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-right: 8px;
          color: #64748b;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .1em;
        }

        .wc-nav-status b { color: var(--wc-accent); }

        .wc-panel {
          position: relative;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid rgba(148,163,184,.11);
          background: linear-gradient(145deg, rgba(10,15,30,.72), rgba(4,7,16,.82));
          box-shadow: 0 22px 60px rgba(0,0,0,.25);
        }

        .wc-section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 20px;
        }

        .wc-section-kicker {
          color: var(--wc-accent);
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .wc-section-title {
          margin: 5px 0 0;
          color: #f8fafc;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -.03em;
        }

        .wc-section-sub {
          margin-top: 7px;
          color: #728197;
          font-size: 12px;
          line-height: 1.6;
        }

        .wc-tools {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .wc-searchbox {
          position: relative;
          min-width: 240px;
        }

        .wc-searchbox svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #526176;
        }

        .wc-input,
        .wc-select {
          width: 100%;
          height: 40px;
          border: 1px solid rgba(148,163,184,.13);
          border-radius: 11px;
          outline: none;
          background: rgba(2,6,23,.68);
          color: #e2e8f0;
          font-size: 11px;
          font-weight: 700;
          transition: .2s ease;
        }

        .wc-input { padding: 0 13px 0 36px; }
        .wc-select { width: auto; min-width: 150px; padding: 0 11px; }
        .wc-input:focus, .wc-select:focus { border-color: rgba(var(--wc-accent-rgb), .5); box-shadow: 0 0 0 3px rgba(var(--wc-accent-rgb), .07); }

        .wc-roster-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .wc-contender {
          --division: #8b5cf6;
          position: relative;
          min-height: 196px;
          padding: 17px;
          border-radius: 17px;
          border: 1px solid rgba(148,163,184,.1);
          background:
            radial-gradient(circle at 100% 0, color-mix(in srgb, var(--division) 11%, transparent), transparent 42%),
            linear-gradient(145deg, rgba(15,23,42,.72), rgba(5,9,21,.76));
          overflow: hidden;
          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
        }

        .wc-contender:hover {
          transform: translateY(-5px);
          border-color: color-mix(in srgb, var(--division) 42%, transparent);
          box-shadow: 0 18px 40px rgba(0,0,0,.28), 0 0 28px color-mix(in srgb, var(--division) 10%, transparent);
        }

        .wc-contender.me {
          border-color: rgba(168,85,247,.46);
          box-shadow: inset 0 0 38px rgba(168,85,247,.06), 0 0 28px rgba(168,85,247,.09);
        }

        .wc-contender-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .wc-profile {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .wc-avatar {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 13px;
          border: 1px solid color-mix(in srgb, var(--division) 52%, transparent);
          background: rgba(15,23,42,.8);
          color: #e2e8f0;
          font-weight: 900;
          box-shadow: 0 0 20px color-mix(in srgb, var(--division) 10%, transparent);
        }

        .wc-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .wc-name {
          color: #f8fafc;
          font-size: 14px;
          font-weight: 850;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wc-handle { margin-top: 3px; color: #526176; font-size: 10px; }

        .wc-you {
          display: inline-flex;
          margin-left: 6px;
          padding: 2px 5px;
          border-radius: 4px;
          background: #a855f7;
          color: white;
          font-size: 7px;
          font-weight: 900;
          vertical-align: middle;
        }

        .wc-rank {
          flex: 0 0 auto;
          min-width: 44px;
          padding: 6px 8px;
          border-radius: 9px;
          text-align: center;
          border: 1px solid rgba(148,163,184,.12);
          background: rgba(2,6,23,.46);
          color: #94a3b8;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 10px;
          font-weight: 900;
        }

        .wc-rank.top1 { color: #fde047; border-color: rgba(251,191,36,.34); background: rgba(251,191,36,.09); }
        .wc-rank.top2 { color: #e2e8f0; border-color: rgba(203,213,225,.25); }
        .wc-rank.top3 { color: #fdba74; border-color: rgba(249,115,22,.28); background: rgba(249,115,22,.07); }

        .wc-badges {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
          margin: 16px 0;
        }

        .wc-division-badge,
        .wc-confirmed {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 7px;
          font-size: 9px;
          font-weight: 850;
        }

        .wc-division-badge {
          color: var(--division);
          background: color-mix(in srgb, var(--division) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--division) 24%, transparent);
        }

        .wc-confirmed { color: #6ee7b7; background: rgba(16,185,129,.07); border: 1px solid rgba(16,185,129,.14); }

        .wc-contender-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(148,163,184,.08);
        }

        .wc-xp {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #fde047;
          font-size: 12px;
          font-weight: 900;
        }

        .wc-streak {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #fb923c;
          font-size: 10px;
          font-weight: 800;
        }

        .wc-empty {
          grid-column: 1/-1;
          padding: 50px 20px;
          text-align: center;
          color: #64748b;
          border: 1px dashed rgba(148,163,184,.14);
          border-radius: 16px;
        }

        .wc-vault {
          position: relative;
          overflow: hidden;
          padding: 36px 30px 30px;
          border-radius: 24px;
          text-align: center;
          border: 1px solid rgba(var(--wc-accent-rgb), .22);
          background:
            radial-gradient(circle at 50% 0%, rgba(var(--wc-accent-rgb), .13), transparent 34%),
            linear-gradient(145deg, rgba(9,14,30,.9), rgba(3,6,14,.95));
          box-shadow: 0 28px 70px rgba(0,0,0,.38), inset 0 0 80px rgba(var(--wc-accent-rgb), .025);
        }

        .wc-vault-emblem {
          position: relative;
          width: 108px;
          height: 108px;
          margin: 0 auto 22px;
          display: grid;
          place-items: center;
        }

        .wc-vault-emblem::before,
        .wc-vault-emblem::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          border: 1px dashed rgba(var(--wc-accent-rgb), .38);
          animation: wcSpin 14s linear infinite;
        }

        .wc-vault-emblem::before { inset: 0; }
        .wc-vault-emblem::after { inset: 13px; animation-direction: reverse; animation-duration: 9s; }

        .wc-lock-core {
          width: 66px;
          height: 66px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          color: var(--wc-accent);
          border: 1px solid rgba(var(--wc-accent-rgb), .55);
          background: rgba(var(--wc-accent-rgb), .09);
          box-shadow: 0 0 35px rgba(var(--wc-accent-rgb), .2), inset 0 0 18px rgba(var(--wc-accent-rgb), .06);
        }

        .wc-vault-title {
          margin: 5px 0 8px;
          color: #f8fafc;
          font-size: clamp(25px, 4vw, 38px);
          font-weight: 950;
          letter-spacing: -.035em;
        }

        .wc-vault-copy {
          max-width: 700px;
          margin: 0 auto 24px;
          color: #7f8ea3;
          font-size: 12px;
          line-height: 1.8;
        }

        .wc-pass-banner {
          max-width: 660px;
          margin: 0 auto 26px;
          padding: 13px 15px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-align: left;
          border: 1px solid rgba(148,163,184,.11);
          background: rgba(2,6,23,.54);
        }

        .wc-pass-banner.ready { border-color: rgba(52,211,153,.24); background: rgba(16,185,129,.055); }
        .wc-pass-title { color: #e2e8f0; font-size: 11px; font-weight: 900; }
        .wc-pass-copy { margin-top: 3px; color: #64748b; font-size: 10px; }

        .wc-sectors {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 10px;
          max-width: 1020px;
          margin: 0 auto;
          text-align: left;
        }

        .wc-sector {
          position: relative;
          min-height: 108px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,.09);
          background: linear-gradient(145deg, rgba(15,23,42,.52), rgba(3,7,18,.58));
          overflow: hidden;
        }

        .wc-sector::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          width: 2px;
          background: var(--sector-color, var(--wc-accent));
          opacity: .35;
        }

        .wc-sector-num { color: var(--sector-color, var(--wc-accent)); font-size: 8px; font-weight: 900; letter-spacing: .14em; }
        .wc-sector-title { margin-top: 7px; color: #dbe4f0; font-size: 11px; font-weight: 850; }
        .wc-sector-meta { margin-top: 6px; color: #56657a; font-size: 9px; }
        .wc-sector-lock { position: absolute; right: 12px; bottom: 12px; color: #3f4d61; }

        .wc-dev-shortcut {
          max-width: 1020px;
          margin: 12px auto 0;
          padding: 12px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-align: left;
          background: rgba(2,6,23,.68);
          border: 1px solid rgba(56,189,248,.1);
          color: #64748b;
          font-size: 10px;
        }

        .wc-live-gate {
          padding: 48px 26px;
          border-radius: 24px;
          text-align: center;
          border: 1px solid rgba(34,197,94,.34);
          background:
            radial-gradient(circle at 50% 0, rgba(34,197,94,.16), transparent 34%),
            linear-gradient(145deg, rgba(6,24,18,.78), rgba(3,7,18,.96));
          box-shadow: 0 0 60px rgba(34,197,94,.09);
        }

        .wc-live-gate-icon {
          width: 82px;
          height: 82px;
          margin: 0 auto 18px;
          display: grid;
          place-items: center;
          border-radius: 24px;
          color: #4ade80;
          border: 1px solid rgba(74,222,128,.34);
          background: rgba(34,197,94,.08);
          box-shadow: 0 0 34px rgba(34,197,94,.13);
          animation: wcPulseSoft 2s ease-in-out infinite;
        }

        .wc-arena-wrap {
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(var(--wc-accent-rgb), .14);
          background: rgba(2,6,23,.34);
          box-shadow: 0 24px 70px rgba(0,0,0,.28);
        }

        .wc-podium-stage {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 16px;
          align-items: end;
          padding: 34px 10px 10px;
          overflow: hidden;
        }

        .wc-podium-stage::before {
          content: "";
          position: absolute;
          left: 10%;
          right: 10%;
          bottom: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(251,191,36,.65), transparent);
          box-shadow: 0 0 30px rgba(251,191,36,.28);
        }

        .wc-medal-card {
          position: relative;
          padding: 24px 18px 18px;
          border-radius: 22px 22px 10px 10px;
          text-align: center;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--medal) 28%, transparent);
          background:
            radial-gradient(circle at 50% 0, color-mix(in srgb, var(--medal) 12%, transparent), transparent 42%),
            linear-gradient(180deg, rgba(15,23,42,.78), rgba(4,7,16,.94));
          box-shadow: 0 20px 50px rgba(0,0,0,.3);
          min-height: 290px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .wc-medal-card:hover { transform: translateY(-6px); box-shadow: 0 26px 60px rgba(0,0,0,.38), 0 0 35px color-mix(in srgb, var(--medal) 10%, transparent); }
        .wc-medal-card.gold { min-height: 350px; transform: translateY(-16px); }
        .wc-medal-card.gold:hover { transform: translateY(-22px); }

        .wc-medal-glow {
          position: absolute;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          left: 50%;
          top: -95px;
          transform: translateX(-50%);
          background: var(--medal);
          filter: blur(60px);
          opacity: .13;
        }

        .wc-medal-emoji { font-size: 48px; filter: drop-shadow(0 10px 18px rgba(0,0,0,.35)); }
        .wc-medal-label { margin-top: 7px; color: var(--medal); font-size: 10px; font-weight: 950; letter-spacing: .13em; }
        .wc-medal-name { margin-top: 18px; color: white; font-size: 15px; font-weight: 900; }
        .wc-medal-score { margin-top: 5px; color: #75849a; font-size: 10px; }

        .wc-card-btn {
          width: 100%;
          min-height: 39px;
          margin-top: 18px;
          border-radius: 10px;
          border: 1px solid color-mix(in srgb, var(--medal) 26%, transparent);
          background: color-mix(in srgb, var(--medal) 9%, rgba(2,6,23,.82));
          color: color-mix(in srgb, var(--medal) 80%, white);
          font-size: 10px;
          font-weight: 900;
        }

        .wc-card-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px color-mix(in srgb, var(--medal) 12%, transparent); }

        .wc-rules-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 12px;
        }

        .wc-rule {
          position: relative;
          min-height: 230px;
          padding: 20px;
          border-radius: 17px;
          border: 1px solid rgba(148,163,184,.1);
          background: linear-gradient(145deg, rgba(15,23,42,.64), rgba(4,7,16,.76));
          overflow: hidden;
        }

        .wc-rule-index {
          color: var(--rule-color, var(--wc-accent));
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .14em;
        }

        .wc-rule-icon {
          width: 44px;
          height: 44px;
          margin: 20px 0 18px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: var(--rule-color, var(--wc-accent));
          background: color-mix(in srgb, var(--rule-color, var(--wc-accent)) 9%, transparent);
          border: 1px solid color-mix(in srgb, var(--rule-color, var(--wc-accent)) 20%, transparent);
        }

        .wc-rule-title { color: #f8fafc; font-size: 13px; font-weight: 900; }
        .wc-rule-copy { margin-top: 8px; color: #748398; font-size: 11px; line-height: 1.75; }

        .wc-honor {
          margin-top: 12px;
          padding: 17px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 13px;
          color: #a5b4fc;
          border: 1px solid rgba(99,102,241,.18);
          background: rgba(99,102,241,.055);
          font-size: 11px;
          line-height: 1.65;
        }

        .wc-footer-signal {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          margin-top: 22px;
          color: #3f4d61;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .16em;
        }

        .wc-footer-signal::before,
        .wc-footer-signal::after {
          content: "";
          width: 70px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #273449);
        }

        @keyframes wcFloatOrb {
          from { transform: translate3d(0,0,0) scale(1); }
          to { transform: translate3d(34px,28px,0) scale(1.08); }
        }

        @keyframes wcPulse {
          0%,100% { opacity: .45; transform: scale(.82); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        @keyframes wcPulseSoft {
          0%,100% { transform: scale(1); box-shadow: 0 0 28px rgba(34,197,94,.1); }
          50% { transform: scale(1.035); box-shadow: 0 0 46px rgba(34,197,94,.2); }
        }

        @keyframes wcSpin { to { transform: rotate(360deg); } }

        @media (max-width: 1180px) {
          .wc-hero { grid-template-columns: minmax(0, 1fr); }
          .wc-visual { min-height: 430px; }
          .wc-stats { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .wc-sectors { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }

        @media (max-width: 820px) {
          .wc-layout { padding-bottom: 48px; }
          .wc-devbar { align-items: flex-start; flex-direction: column; }
          .wc-hero-copy { padding: 25px; min-height: auto; }
          .wc-title { font-size: clamp(36px, 11vw, 58px); }
          .wc-nav { position: relative; top: auto; align-items: flex-start; flex-direction: column; }
          .wc-nav-status { padding: 0 8px 4px; }
          .wc-section-head { align-items: flex-start; flex-direction: column; }
          .wc-tools { width: 100%; }
          .wc-searchbox { min-width: 0; flex: 1 1 220px; }
          .wc-podium-stage { grid-template-columns: minmax(0, 1fr); padding-top: 10px; }
          .wc-medal-card.gold { transform: none; min-height: 300px; }
          .wc-medal-card.gold:hover { transform: translateY(-6px); }
          .wc-rules-grid { grid-template-columns: minmax(0, 1fr); }
        }

        @media (max-width: 620px) {
          .wc-stats { grid-template-columns: minmax(0, 1fr); }
          .wc-countdown { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .wc-visual { min-height: 360px; }
          .wc-panel { padding: 15px; }
          .wc-sectors { grid-template-columns: minmax(0, 1fr); }
          .wc-vault { padding: 30px 16px 20px; }
          .wc-pass-banner, .wc-dev-shortcut { align-items: flex-start; flex-direction: column; }
          .wc-tabs { width: 100%; display: grid; grid-template-columns: repeat(2,minmax(0, 1fr)); }
          .wc-tab { justify-content: center; }
          .wc-tab.active::after { display: none; }
          .wc-nav-status { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .wc-shell *, .wc-shell *::before, .wc-shell *::after {
            animation-duration: .001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
      <style>{WC_EXTRA_STYLES}</style>

      <div className={`wc-shell stage-${effectiveStage}`}>
        <div className="wc-cosmos">
          <div className="wc-ambient-orb one" />
          <div className="wc-ambient-orb two" />
        </div>

        <div className="wc-layout">
          {!isStudent && (
            <div className="wc-admin-bar wc-reveal">
              <span>
                <ShieldCheck size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Admin view — registration and submissions are for students. The schedule is set and enforced on the server.
              </span>
              <Link to="/admin/arena">Manage contest & schedule →</Link>
            </div>
          )}

          {celebrationMessage && (
            <div className="wc-toast">
              <CheckCircle2 size={17} />
              <span>{celebrationMessage}</span>
            </div>
          )}

          {loadState === "loading" ? (
            <div className="wc-panel wc-state">
              <div className="wc-spinner" />
              <p>Synchronizing with the arena server…</p>
            </div>
          ) : loadState === "error" ? (
            <div className="wc-panel wc-state">
              <ShieldAlert size={32} color="#fb7185" />
              <h2>Arena signal lost</h2>
              <p>{loadError}</p>
              <button type="button" className="wc-secondary-btn" onClick={loadContest}>
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          ) : (
            <>
              <section ref={heroRef} className="wc-hero">
                <div className="wc-hero-copy wc-glass wc-reveal">
                  <div>
                    <div className="wc-eyebrow stagger-in">
                      <span className="wc-live-dot" />
                      {stageLabel}
                    </div>

                    <div className="wc-kicker stagger-in">
                      CODELAND // SUNDAY CHAMPIONSHIP PROTOCOL{contest ? ` // EDITION #${contest.edition}` : ""}
                    </div>

                    <h1 className="wc-title stagger-in">
                      {contest?.title || "Sunday Arena"}
                      <span>Enter the Algorithmic Battleground</span>
                    </h1>

                    <p className="wc-intro stagger-in">
                      {contest?.story ||
                        "The weekly arena where CodeLand contenders breach six algorithmic sectors, climb the live standings, and fight for Gold, Silver, and Bronze distinction."}
                    </p>

                    {countdownTarget ? (
                      <>
                        <div className="wc-section-kicker stagger-in" style={{ marginTop: 14 }}>
                          {stage === "upcoming"
                            ? `ARENA OPENS IN${canRegisterNow ? " · REGISTRATION CLOSES AT THE START" : ""}`
                            : "ARENA CLOSES IN · REGISTRATION IS CLOSED"}
                        </div>
                        <div className="wc-countdown stagger-in">
                          {[
                            { label: "DAYS", val: countdown.days },
                            { label: "HOURS", val: String(countdown.hours).padStart(2, "0") },
                            { label: "MINS", val: String(countdown.minutes).padStart(2, "0") },
                            { label: "SECS", val: String(countdown.seconds).padStart(2, "0") },
                          ].map((item) => (
                            <div className="wc-timecell" key={item.label}>
                              <span className="wc-timevalue">{item.val}</span>
                              <span className="wc-timelabel">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="wc-section-sub stagger-in" style={{ marginTop: 14 }}>
                        <Calendar size={13} style={{ verticalAlign: "middle", marginRight: 6 }} />
                        {contest ? formatContestWindow(contest) : "No contest is scheduled right now."}
                      </div>
                    )}
                  </div>

                  <div className="wc-actions stagger-in">
                    {isStudent && (
                      <button
                        type="button"
                        className="wc-primary-btn"
                        onClick={handleToggleRegistration}
                        disabled={regBusy || !contest || (!isRegistered && !canRegisterNow)}
                      >
                        {isRegistered ? <UserCheck size={17} /> : <UserPlus size={17} />}
                        {regBusy ? "Syncing…" : registerLabel}
                      </button>
                    )}

                    {medals.length > 0 && (
                      <button type="button" className="wc-secondary-btn" onClick={() => openCertificate(contestMedal || medals[0])}>
                        <Printer size={16} /> Open Certificate Vault
                      </button>
                    )}

                    <div className="wc-action-note">
                      {!contest
                        ? "The next contest appears here as soon as an arena admin publishes it."
                        : isRegistered
                        ? stage === "live"
                          ? "You're in. The arena is live — go clear the sectors!"
                          : "Identity verified. Your combat slot is synchronized."
                        : canRegisterNow
                        ? "Registration is open until the arena opens on Sunday at 17:00."
                        : registrationNotYetOpen
                        ? "Registration opens one week before the contest."
                        : "Registration closed when the contest started — see you next Sunday!"}
                    </div>
                  </div>
                </div>

                <div className="wc-visual wc-reveal">
                  <Arena3DScene stage={effectiveStage} />
                  <div className="wc-visual-overlay" />
                  <div className="wc-orbit-ring-a" />
                  <div className="wc-orbit-ring-b" />
                  <div className="wc-scan-beam" />
                  <span className="wc-corner tl" />
                  <span className="wc-corner tr" />
                  <span className="wc-corner bl" />
                  <span className="wc-corner br" />

                  <div className="wc-hud-top">
                    <span className="wc-hud-chip">ARENA CORE // <strong>{contest ? "ONLINE" : "STANDBY"}</strong></span>
                    <span className="wc-hud-chip">{contest ? `EDITION #${contest.edition}` : "NO EDITION"}</span>
                  </div>
                  <div className="wc-hud-bottom">
                    <span className="wc-hud-chip">SERVER-VERIFIED SCORING</span>
                    <span className="wc-hud-chip">STAGE // <strong>{stage.toUpperCase()}</strong></span>
                  </div>
                </div>
              </section>

              <section className="wc-stats wc-reveal">
                {[
                  { Icon: Users, color: "#c084fc", value: `${participants} Students`, label: "Registered contenders" },
                  { Icon: Zap, color: "#fbbf24", value: `${formatXp(contest?.maxScore || 0)} XP`, label: `Prize pool · ${contest?.problemCount || 0} sectors` },
                  {
                    Icon: Trophy,
                    color: "#38bdf8",
                    value: !me ? "—" : me.rank ? `#${me.rank} · ${formatXp(me.score)} XP` : "Not ranked yet",
                    label: !me ? "Register to get a rank" : me.rank ? "Your live standing" : "Solve a sector to get ranked",
                  },
                  { Icon: Calendar, color: "#34d399", value: contest ? formatContestWindow(contest) : "Every Sunday", label: "Every Sunday 17:00 – 20:00" },
                ].map(({ Icon, color, value, label }) => (
                  <div key={label} className="wc-stat" style={{ "--stat-color": color }}>
                    <div className="wc-stat-icon"><Icon size={22} /></div>
                    <div>
                      <div className="wc-stat-value">{value}</div>
                      <div className="wc-stat-label">{label}</div>
                    </div>
                  </div>
                ))}
              </section>

              <div className="wc-nav wc-reveal">
                <div className="wc-tabs">
                  {tabs.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      className={`wc-tab ${activeTab === id ? "active" : ""}`}
                      onClick={() => setActiveTab(id)}
                    >
                      <Icon size={15} />
                      {label}
                      {id === "arena" && stage === "live" && (
                        <span style={{ color: "#4ade80", fontSize: 8, fontWeight: 900 }}>LIVE</span>
                      )}
                      {id === "arena" && (stage === "upcoming" || stage === "unscheduled") && <Lock size={10} />}
                    </button>
                  ))}
                </div>
                <div className="wc-nav-status">
                  <span className="wc-live-dot" style={{ color: stageAccent }} />
                  SYSTEM <b>{stage.toUpperCase()}</b>
                </div>
              </div>

              {/* ===================== ROSTER ===================== */}
              {activeTab === "roster" && (
                <section className="wc-panel wc-tab-content">
                  <div className="wc-section-head">
                    <div>
                      <div className="wc-section-kicker">CONTENDER DATABASE // LIVE STANDINGS</div>
                      <h2 className="wc-section-title">Arena Roster</h2>
                      <div className="wc-section-sub">
                        {filteredCompetitors.length} of {entries.length} registered contenders // ranked by contest XP, then speed
                      </div>
                    </div>

                    <div className="wc-tools">
                      <div className="wc-searchbox">
                        <Search size={14} />
                        <input
                          className="wc-input"
                          type="text"
                          placeholder="Search contender..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <select
                        className="wc-select"
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                      >
                        <option value="all">All Divisions</option>
                        <option value="grandmaster">Grandmaster</option>
                        <option value="master">Master</option>
                        <option value="challenger">Challenger</option>
                        <option value="rising star">Rising Star</option>
                      </select>
                    </div>
                  </div>

                  <div ref={cardsGridRef} className="wc-roster-grid">
                    {!contest ? (
                      <div className="wc-empty">No contest is scheduled yet, so there are no contenders.</div>
                    ) : entries.length === 0 ? (
                      <div className="wc-empty">Nobody has registered yet — be the first contender!</div>
                    ) : filteredCompetitors.length === 0 ? (
                      <div className="wc-empty">No contender signal matches your current filters.</div>
                    ) : (
                      filteredCompetitors.map((student, idx) => {
                        const { division, color } = divisionFor(student.totalXp);
                        const initials = student.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();
                        return (
                          <article
                            key={`${student.rank}-${student.name}-${idx}`}
                            className={`wc-contender ${student.isMe ? "me" : ""}`}
                            style={{ "--division": color }}
                          >
                            <div className="wc-contender-top">
                              <div className="wc-profile">
                                <div className="wc-avatar">
                                  {student.avatar ? <img src={student.avatar} alt={student.name} /> : initials}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div className="wc-name">
                                    {student.name}
                                    {student.isMe && <span className="wc-you">YOU</span>}
                                  </div>
                                  <div className="wc-handle">
                                    {student.rank
                                      ? `${student.solvedCount} solved · ${formatXp(student.score)} contest XP`
                                      : "Not started yet"}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`wc-rank ${student.rank === 1 ? "top1" : student.rank === 2 ? "top2" : student.rank === 3 ? "top3" : ""}`}
                                title={student.rank ? undefined : "Ranked after solving a first sector"}
                              >
                                {rankLabel(student.rank)}
                              </div>
                            </div>

                            <div className="wc-badges">
                              <span className="wc-division-badge">{division}</span>
                              <span className="wc-confirmed"><CheckCircle2 size={10} /> Registered</span>
                            </div>

                            <div className="wc-contender-bottom">
                              <div className="wc-xp"><Zap size={13} /> {formatXp(student.totalXp)} XP</div>
                              <div className="wc-streak"><Flame size={12} /> {student.streakDays}d streak</div>
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>
              )}

              {/* ===================== ARENA ===================== */}
              {activeTab === "arena" && (
                <section className="wc-tab-content">
                  {!contest ? (
                    <div className="wc-vault">
                      <div className="wc-vault-emblem">
                        <div className="wc-lock-core"><Lock size={30} /></div>
                      </div>
                      <div className="wc-section-kicker">STANDBY // NO ACTIVE EDITION</div>
                      <h2 className="wc-vault-title">No Contest Scheduled</h2>
                      <p className="wc-vault-copy">
                        The Sunday Arena is empty right now. As soon as an arena admin generates and publishes this
                        week's contest, it will appear here with its countdown.
                      </p>
                    </div>
                  ) : stage === "upcoming" || stage === "unscheduled" ? (
                    <div className="wc-vault">
                      <div className="wc-vault-emblem">
                        <div className="wc-lock-core"><Lock size={30} /></div>
                      </div>
                      <div className="wc-section-kicker">RESTRICTED ACCESS // SUNDAY PROTOCOL</div>
                      <h2 className="wc-vault-title">The Arena is Sealed</h2>
                      <p className="wc-vault-copy">
                        {contest.problemCount} sectors stay encrypted on the server until the live window opens
                        {contest.startsAt ? ` (${formatContestWindow(contest)})` : ""}. Register now so your seat is ready.
                      </p>

                      {isStudent && (
                        <div className={`wc-pass-banner ${isRegistered ? "ready" : ""}`}>
                          <div>
                            <div className="wc-pass-title">
                              {isRegistered
                                ? "✓ ARENA PASS CONFIRMED"
                                : registrationNotYetOpen
                                ? "⏳ REGISTRATION NOT OPEN YET"
                                : "⚠ REGISTRATION TOKEN NOT FOUND"}
                            </div>
                            <div className="wc-pass-copy">
                              {isRegistered
                                ? "Your seat is secured. Sector 01 unlocks automatically when the arena goes live."
                                : registrationNotYetOpen
                                ? `Registration opens ${formatDateTime(contest.registrationOpensAt)} — one week before the contest.`
                                : "Register before Sunday 17:00. Once the arena opens, registration closes for everyone."}
                            </div>
                          </div>
                          {!isRegistered && canRegisterNow && (
                            <button type="button" className="wc-primary-btn" onClick={handleToggleRegistration} disabled={regBusy}>
                              <UserPlus size={15} /> Register
                            </button>
                          )}
                        </div>
                      )}

                      <div className="wc-sectors">
                        {Array.from({ length: contest.problemCount || 0 }).map((_, idx) => (
                          <div key={idx} className="wc-sector" style={{ "--sector-color": "#a855f7" }}>
                            <div className="wc-sector-num">SECTOR {String(idx + 1).padStart(2, "0")}</div>
                            <div className="wc-sector-title">Classified</div>
                            <div className="wc-sector-meta">Revealed when the arena opens</div>
                            <Lock className="wc-sector-lock" size={14} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="wc-arena-wrap">
                      {stage !== "live" ? (
                        <div className="wc-admin-bar" style={{ marginBottom: 12 }}>
                          <span>
                            <Clock size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                            This contest has ended — practice mode: Run works, submissions and XP are closed.
                          </span>
                          <button type="button" className="wc-secondary-btn" onClick={() => setActiveTab("podium")}>
                            <Trophy size={14} /> Final standings
                          </button>
                        </div>
                      ) : isStudent && !isRegistered ? (
                        <div className="wc-admin-bar" style={{ marginBottom: 12 }}>
                          <span>
                            <Lock size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                            You didn't register for this edition, and registration closed when the arena opened. You can
                            read the sectors and Run your code, but not submit. Registration for next Sunday opens after
                            the next contest is published.
                          </span>
                        </div>
                      ) : null}
                      <ContestStoryArena
                        key={contest.id}
                        user={currentUser}
                        readOnly={stage !== "live" || (isStudent && !isRegistered)}
                        onProgress={() => loadStandings(contest.id)}
                        onContestComplete={handleContestFinish}
                      />
                    </div>
                  )}
                </section>
              )}

              {/* ===================== PODIUM ===================== */}
              {activeTab === "podium" && (
                <section className="wc-panel wc-tab-content">
                  <div className="wc-section-head" style={{ justifyContent: "center", textAlign: "center" }}>
                    <div>
                      <div className="wc-section-kicker" style={{ color: "#fbbf24" }}>HALL OF SUNDAY GLADIATORS</div>
                      <h2 className="wc-section-title">Championship Podium</h2>
                      <div className="wc-section-sub">
                        {stage === "live"
                          ? "Live standings — medals are awarded by the server when the contest closes."
                          : stage === "ended" || stage === "archived"
                          ? "Final standings. Medals and bonus XP have been awarded."
                          : "The podium fills up once the arena goes live."}
                      </div>
                    </div>
                  </div>

                  <div className="wc-podium-stage">
                    {MEDAL_UI.map((slot) => {
                      const holder = entries.find((e) => e.rank === slot.rank && e.score > 0);
                      const mine = holder?.isMe && contestMedal?.rank === slot.rank ? contestMedal : null;
                      return (
                        <article
                          key={slot.type}
                          className={`wc-medal-card ${slot.type === "gold" ? "gold" : ""} ${holder ? "" : "wc-medal-empty"}`}
                          style={{ "--medal": slot.color }}
                        >
                          <div className="wc-medal-glow" />
                          <div>
                            {slot.type === "gold" && <Crown size={27} color="#fde047" />}
                            <div className="wc-medal-emoji">{slot.emoji}</div>
                            <div className="wc-medal-label">{slot.label}</div>
                            <div className="wc-medal-name">{holder ? holder.name : "Unclaimed"}</div>
                            <div className="wc-medal-score">
                              {holder
                                ? `${formatXp(holder.score)} / ${formatXp(standings?.maxScore || 0)} XP · +${slot.bonus} BONUS XP`
                                : `+${slot.bonus} BONUS XP`}
                            </div>
                          </div>
                          {mine && (
                            <button type="button" className="wc-card-btn" onClick={() => openCertificate(mine)}>
                              <Printer size={13} style={{ verticalAlign: "middle", marginRight: 6 }} />
                              Open my certificate
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>

                  {entries.length > 0 && (
                    <div className="wc-standings" style={{ marginTop: 22 }}>
                      <div className="wc-standing-row head">
                        <span>RANK</span><span>CONTENDER</span><span>XP</span><span>SOLVED</span><span>FAILED</span>
                      </div>
                      {entries.slice(0, 25).map((e, idx) => (
                        <div key={`${e.rank}-${idx}`} className={`wc-standing-row ${e.isMe ? "me" : ""}`}>
                          <span className={`wc-standing-rank r${e.rank}`}>{rankLabel(e.rank)}</span>
                          <strong>{e.name}{e.isMe ? " (you)" : ""}</strong>
                          <span>{formatXp(e.score)}</span>
                          <span>{e.solvedCount}</span>
                          <span>{e.failedCount}</span>
                        </div>
                      ))}
                      {me && entries.findIndex((e) => e.isMe) >= 25 && (
                        <div className="wc-standing-row me">
                          <span className="wc-standing-rank">{rankLabel(me.rank)}</span>
                          <strong>{me.name} (you)</strong>
                          <span>{formatXp(me.score)}</span>
                          <span>{me.solvedCount}</span>
                          <span>{me.failedCount}</span>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* ===================== HISTORY ===================== */}
              {activeTab === "history" && (
                <section className="wc-panel wc-tab-content">
                  <div className="wc-section-head">
                    <div>
                      <div className="wc-section-kicker">ARENA ARCHIVE // PAST EDITIONS</div>
                      <h2 className="wc-section-title">Contest History</h2>
                      <div className="wc-section-sub">Every finished contest keeps its standings, medals and problems.</div>
                    </div>
                    <History size={30} color="#38bdf8" />
                  </div>

                  {historyError ? (
                    <div className="wc-empty">{historyError}</div>
                  ) : !history ? (
                    <div className="wc-state"><div className="wc-spinner" /></div>
                  ) : history.length === 0 ? (
                    <div className="wc-empty">No finished contests yet — the first one will appear here after it closes.</div>
                  ) : (
                    <div className="wc-history">
                      {history.map((item) => (
                        <article key={item.id} className="wc-history-card">
                          <div>
                            <h3>{item.title} · Edition #{item.edition}</h3>
                            <p>{item.story}</p>
                            <div className="wc-history-meta">
                              <span className="wc-chip"><Calendar size={11} /> {formatContestWindow(item)}</span>
                              <span className="wc-chip"><Users size={11} /> {item.participants} contenders</span>
                              {item.podium.map((p) => (
                                <span key={p.rank} className={`wc-chip ${p.medalType}`}>
                                  {p.medalType === "gold" ? "🥇" : p.medalType === "silver" ? "🥈" : "🥉"} {p.name}
                                  {p.isMe ? " (you)" : ""} · {formatXp(p.score)} XP
                                </span>
                              ))}
                              {item.me && (
                                <span className="wc-chip">
                                  <Award size={11} />{" "}
                                  {item.me.rank
                                    ? `You: #${item.me.rank} · ${formatXp(item.me.score)} / ${formatXp(item.maxScore)} XP`
                                    : "You: registered, no sector solved"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="wc-history-actions">
                            <button type="button" className="wc-secondary-btn" onClick={() => openHistoryStandings(item)}>
                              <Trophy size={14} /> Standings
                            </button>
                            <button
                              type="button"
                              className="wc-secondary-btn"
                              onClick={() => setHistoryView({ contest: item, mode: "problems" })}
                            >
                              <Code2 size={14} /> Practice problems
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ===================== RULES ===================== */}
              {activeTab === "rules" && (
                <section className="wc-panel wc-tab-content">
                  <div className="wc-section-head">
                    <div>
                      <div className="wc-section-kicker">ARENA GOVERNANCE // SERVER-ENFORCED RULESET</div>
                      <h2 className="wc-section-title">Arena Protocols</h2>
                      <div className="wc-section-sub">Timing and scoring are decided by the server, not by your browser.</div>
                    </div>
                    <ShieldCheck size={30} color="#38bdf8" />
                  </div>

                  <div className="wc-rules-grid">
                    <article className="wc-rule" style={{ "--rule-color": "#38bdf8" }}>
                      <div className="wc-rule-index">PROTOCOL // 01</div>
                      <div className="wc-rule-icon"><Clock size={21} /></div>
                      <div className="wc-rule-title">Sunday Combat Window</div>
                      <div className="wc-rule-copy">
                        The arena runs every Sunday from 17:00 to 20:00
                        {contest?.startsAt ? ` (this edition: ${formatContestWindow(contest)})` : ""}. Registration opens
                        one week before and closes the moment the arena opens — nobody can join a running contest.
                        Problems unlock at 17:00; submissions after 20:00 are rejected by the server.
                      </div>
                    </article>

                    <article className="wc-rule" style={{ "--rule-color": "#a855f7" }}>
                      <div className="wc-rule-index">PROTOCOL // 02</div>
                      <div className="wc-rule-icon"><Code2 size={21} /></div>
                      <div className="wc-rule-title">Scoring & Ranking</div>
                      <div className="wc-rule-copy">
                        Six story sectors worth 25 → 150 XP. Ranking: total XP, then sectors solved, then who got there
                        first, then fewer failed submissions. A hint costs 25% of that sector's XP — once.
                      </div>
                    </article>

                    <article className="wc-rule" style={{ "--rule-color": "#fbbf24" }}>
                      <div className="wc-rule-index">PROTOCOL // 03</div>
                      <div className="wc-rule-icon"><Award size={21} /></div>
                      <div className="wc-rule-title">Podium Honors</div>
                      <div className="wc-rule-copy">
                        When the window closes the server awards Gold (+500 XP), Silver (+300 XP) and Bronze (+150 XP)
                        to the top 3 scorers, with a printable, verifiable certificate.
                      </div>
                    </article>
                  </div>

                  <div className="wc-honor">
                    <ShieldAlert size={20} style={{ flex: "0 0 auto" }} />
                    <span>
                      <strong style={{ color: "#e0e7ff" }}>Honor Code:</strong> compete using your own reasoning and
                      submitted code. Arena integrity is part of the championship.
                    </span>
                  </div>
                </section>
              )}

              <div className="wc-footer-signal">
                ARENA NETWORK // SERVER-VERIFIED // {contest ? `EDITION #${contest.edition}` : "STANDBY"}
              </div>
            </>
          )}
        </div>

        {historyView && (
          <div className="wc-overlay" role="dialog" aria-modal="true">
            <div className="wc-overlay-card">
              <div className="wc-overlay-head">
                <h2 style={{ margin: 0 }}>
                  Edition #{historyView.contest.edition} · {historyView.mode === "problems" ? "Practice" : "Final standings"}
                </h2>
                <button type="button" className="wc-icon-btn" onClick={() => setHistoryView(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              {historyView.mode === "problems" ? (
                <ContestStoryArena user={currentUser} contestId={historyView.contest.id} readOnly />
              ) : !historyView.standings ? (
                <div className="wc-state"><div className="wc-spinner" /></div>
              ) : historyView.standings.entries.length === 0 ? (
                <div className="wc-empty">Nobody registered for this contest.</div>
              ) : (
                <div className="wc-panel">
                  <div className="wc-standings">
                    <div className="wc-standing-row head">
                      <span>RANK</span><span>CONTENDER</span><span>XP</span><span>SOLVED</span><span>FAILED</span>
                    </div>
                    {historyView.standings.entries.map((e, idx) => (
                      <div key={`${e.rank}-${idx}`} className={`wc-standing-row ${e.isMe ? "me" : ""}`}>
                        <span className={`wc-standing-rank r${e.rank}`}>{rankLabel(e.rank)}</span>
                        <strong>{e.name}{e.isMe ? " (you)" : ""}</strong>
                        <span>{formatXp(e.score)}</span>
                        <span>{e.solvedCount}</span>
                        <span>{e.failedCount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {certificateMedal && (
          <ContestCertificate
            medalData={certificateMedal}
            initialStudentName={certificateMedal.studentName}
            onClose={() => setCertificateMedal(null)}
          />
        )}
      </div>
    </HubLayout>
  );
}

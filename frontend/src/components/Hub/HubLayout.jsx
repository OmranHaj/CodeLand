import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bot,
  LayoutDashboard,
  Compass,
  Code2,
  Trophy,
  Settings,
  CircleHelp,
  LogOut,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  Users,
  BookOpen,
  FileText,
  ShieldCheck,
  Heart
} from "lucide-react";
import { getProfile, getUser, startPreview, writeStored } from "../../services/learningHub";
import "./hub.css";

export default function HubLayout({ children, title = "Learning space" }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [, refresh] = useState(0);
  const user = getUser();
  const profile = getProfile(user);
  const parent = user?.role === "parent";
  useEffect(() => {
    const sync = () => refresh(n => n + 1);
    window.addEventListener("codeland:update", sync);
    return () => window.removeEventListener("codeland:update", sync);
  }, []);
  useEffect(() => {
    const close = event => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const studentLinks = [
    ["/student/dashboard", "Overview", LayoutDashboard],
    ["/courses", "Explore courses", Compass],
    ["/challenges", "Practice arena", Code2],
    ["/student/achievements", "Achievements", Trophy],
  ];

  const parentLinks = [
    ["/parent/dashboard", "Family Observatory", Users],
    ["/parent/curriculum", "Curriculum Guide", BookOpen],
    ["/parent/reports", "Monthly Reports", FileText],
    ["/parent/guide", "Parent Guide & Safety", ShieldCheck],
  ];

  const links = parent ? parentLinks : studentLinks;

  return <div className="hub">
    <a className="hub-skip" href="#hub-content">Skip to content</a>
    {open && <button className="hub-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={`hub-sidebar ${open ? "is-open" : ""}`} id="hub-navigation">
      <Link to="/" className="hub-brand"><span><Bot size={23} /></span>Code<span className="hub-brand-accent">Land</span><i /></Link>
      <span className="hub-nav-label">{parent ? "PARENT OBSERVATORY" : "YOUR LEARNING SPACE"}</span>
      <nav aria-label="Learning navigation">{links.map(([to, label, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? "active" : ""}><Icon size={19} />{label}</NavLink>)}</nav>
      <div className="hub-side-bottom">
        {parent ? (
          <div className="hub-side-card">
            <Heart size={21} color="#f43f5e" />
            <strong>Every Step Needs Encouragement</strong>
            <p>A little support from you creates a world of confidence.</p>
            <Link to="/parent/guide">Read parent guide <ArrowUpRight size={16} /></Link>
          </div>
        ) : (
          <div className="hub-side-card">
            <Sparkles size={21} />
            <strong>A little code. A big future.</strong>
            <p>Your next discovery is one lesson away.</p>
            <Link to="/student/choose-path">Find your path <ArrowUpRight size={16} /></Link>
          </div>
        )}
        <nav aria-label="Account navigation"><NavLink to="/student/settings"><Settings size={18} />Settings</NavLink><NavLink to="/help"><CircleHelp size={18} />Help & support</NavLink></nav>
        {user ? <button className="hub-signout" onClick={() => { writeStored("codeland_current_user", null); navigate("/"); }}><LogOut size={17} />{user.isDemo ? "Exit preview" : "Log out"}</button> : <Link className="hub-signout" to="/login"><LogOut size={17} />Log in</Link>}
      </div>
    </aside>
    <div className="hub-body">
      <header className="hub-topbar"><div className="hub-top-title"><button className="hub-menu hub-icon-button" aria-label={open ? "Close navigation" : "Open navigation"} aria-controls="hub-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button><span>Workspace <span className="hub-slash">/</span> <strong>{title}</strong></span></div><div className="hub-top-actions"><span className="hub-status"><i />{user?.isDemo ? "Preview mode" : "Keep exploring"}</span><Link to="/student/settings" className="hub-avatar" aria-label="Open profile">{profile.name.slice(0, 1).toUpperCase()}</Link></div></header>
      {!user && <div className="hub-preview-banner"><span>Take a look around. Your coding adventure starts here.</span><button onClick={() => { startPreview(); navigate("/student/dashboard"); }}>Try student preview <ArrowUpRight size={15} /></button></div>}
      {user?.isDemo && <div className="hub-preview-banner"><span>You're exploring a demo. Progress is saved only in this browser.</span><Link to="/register">Create your account <ArrowUpRight size={15} /></Link></div>}
      <main id="hub-content" className="hub-main">{children}</main>
      <footer className="hub-mini-footer"><span>Made for curious minds. Built for what comes next.</span><span>CodeLand © {new Date().getFullYear()}</span></footer>
    </div>
  </div>;
}

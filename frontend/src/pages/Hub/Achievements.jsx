import { Link } from "react-router-dom";
import { ArrowRight, Award, BookOpen, Code2, Compass, Rocket, Sparkles, Trophy, Zap } from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
import { getSummary } from "../../services/learningHub";

export default function Achievements() {
  const summary = getSummary();
  const badges = [
    { title: "First spark", description: "Complete your very first lesson.", current: summary.lessons, target: 1, Icon: Sparkles },
    { title: "Curious mind", description: "Discover something new in 5 lessons.", current: summary.lessons, target: 5, Icon: BookOpen },
    { title: "Problem solver", description: "Solve 3 coding challenges.", current: summary.challenges, target: 3, Icon: Code2 },
    { title: "XP explorer", description: "Earn your first 250 experience points.", current: summary.xp, target: 250, Icon: Zap },
    { title: "World builder", description: "Complete an entire learning world.", current: summary.completed, target: 1, Icon: Compass },
    { title: "Arena champion", description: "Solve all 6 practice arena challenges.", current: summary.practiceIds.length, target: 6, Icon: Trophy },
  ];
  const earned = badges.filter(badge => badge.current >= badge.target).length;
  return <HubLayout title="Achievements"><div className="hub-heading"><div><span className="hub-eyebrow"><Award size={13} /> LITTLE WINS. LASTING CONFIDENCE.</span><h1>Look how far you can go.</h1><p>Every badge tells a story. Make the next one yours.</p></div><span className="hub-tag"><Trophy size={13} />{earned} / {badges.length} UNLOCKED</span></div><div className="hub-badge-grid">{badges.map(({ title, description, current, target, Icon }) => <article className={`hub-badge-card ${current < target ? "locked" : ""}`} key={title}><div className="hub-badge-emblem"><Icon size={31} /></div><h2>{title}</h2><p>{description}</p><div className="hub-progress" role="progressbar" aria-label={title} aria-valuemin={0} aria-valuemax={target} aria-valuenow={Math.min(current, target)}><span style={{ width: `${Math.min(current / target, 1) * 100}%` }} /></div><div className="hub-badge-status">{current >= target ? "✦ Achievement unlocked" : `${current} / ${target} · Keep exploring`}</div></article>)}</div><div className="hub-bottom-callout"><Rocket size={27} /><div><h3>The best achievement? Something you made yourself.</h3><p>Keep learning, experiment often, and enjoy every little breakthrough.</p></div><Link className="hub-btn primary small" to="/courses">Keep discovering <ArrowRight size={14} /></Link></div></HubLayout>;
}

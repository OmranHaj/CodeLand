import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Sparkles, Zap } from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
import { practiceChallenges } from "../../data/hubContent";
import { getSummary, userKey, writeStored } from "../../services/learningHub";

export default function Challenges() {
  const { challengeId } = useParams();
  const [filter, setFilter] = useState("All challenges");
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(() => getSummary().practiceIds);
  const challenge = practiceChallenges.find(item => String(item.id) === challengeId);
  const check = () => {
    const correct = selected === challenge.answer;
    if (correct && !completed.includes(challenge.id)) {
      const next = [...completed, challenge.id];
      try { writeStored(`codeland_practice_${userKey()}`, next); setCompleted(next); setError(""); } catch { setError("Your answer is correct, but progress could not be saved. Please enable browser storage and check again."); return; }
    }
    setResult(correct);
  };
  return <HubLayout title="Practice arena"><div className="hub-heading"><div><span className="hub-eyebrow"><Code2 size={13} /> A LITTLE CHALLENGE. A NEW SUPERPOWER.</span><h1>{challenge ? challenge.title : "Put your skills into play."}</h1><p>{challenge ? "Read the code, think it through, and make your move." : "Small puzzles. Real understanding. Every discovery counts."}</p></div><span className="hub-tag"><Zap size={13} />{completed.length * 25} ARENA XP</span></div>
    {challengeId && !challenge ? <div className="hub-empty"><h2>This challenge doesn't exist.</h2><Link className="hub-btn" to="/challenges">Back to the arena</Link></div> : challenge ? <><Link to="/challenges" className="hub-btn small ghost"><ArrowLeft size={14} />All challenges</Link><div className="hub-split hub-spaced"><section className="hub-panel"><span className="hub-tag">{challenge.category} · {challenge.difficulty}</span><h2 className="hub-spaced">Your mission</h2><p className="hub-lesson-copy">{challenge.description}</p><div className="hub-code"><div className="hub-code-label"><span>MISSION.{challenge.category.toLowerCase()}</span><span>READ & PREDICT</span></div><pre><code>{challenge.code}</code></pre></div><p><Sparkles size={13} /> Take your time. Understanding beats guessing.</p></section><section className="hub-panel"><h2>What's your answer?</h2><div className="hub-answers" role="group" aria-label="Answer choices">{challenge.options.map((option, i) => <button key={option} className="hub-answer" aria-pressed={selected === i} onClick={() => { setSelected(i); setResult(null); }}><span>{String.fromCharCode(65 + i)}</span>{option}</button>)}</div><button className="hub-btn primary" disabled={selected === null} onClick={check}>Check answer <ArrowRight size={14} /></button>{error && <p className="hub-feedback" role="alert">{error}</p>}{result !== null && <div className={`hub-feedback ${result ? "success" : ""}`} role="status"><strong>{result ? "Nicely done! Challenge completed." : "Not quite. Give it another try."}</strong>{result ? challenge.explanation : "Look carefully at what each line does. You can change your answer and try again."}{result && <p>25 XP per challenge · Awarded once</p>}</div>}{result && <Link to={challenge.id < 6 ? `/challenges/${challenge.id + 1}` : "/student/achievements"} className="hub-btn ghost">{challenge.id < 6 ? "Next challenge" : "View achievements"}<ArrowRight size={14} /></Link>}</section></div></> : <><div className="hub-toolbar"><div className="hub-tabs">{["All challenges", "Beginner", "Intermediate", "Completed"].map(item => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div><span className="hub-result-count">{completed.length} / 6 completed</span></div><div className="hub-catalog">{practiceChallenges.filter(item => filter === "All challenges" || item.difficulty === filter || (filter === "Completed" && completed.includes(item.id))).map(item => <article className="hub-challenge-card" key={item.id}><div className="hub-challenge-top"><span>{item.category} · {item.difficulty}</span><span>{completed.includes(item.id) ? <CheckCircle2 size={17} /> : "+25 XP"}</span></div><h2>{item.title}</h2><p>{item.description}</p><Link className="hub-btn ghost" to={`/challenges/${item.id}`}>{completed.includes(item.id) ? "Practice again" : "Accept challenge"}<ArrowRight size={14} /></Link></article>)}</div>{filter === "Completed" && !completed.length && <div className="hub-empty"><Code2 size={30} /><h2>Your first win is waiting.</h2><p>Solve a challenge and it will appear here.</p><button className="hub-btn" onClick={() => setFilter("All challenges")}>Find a challenge</button></div>}</>}
  </HubLayout>;
}

import { Link } from "react-router-dom";
import { ArrowRight, Home } from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
export default function NotFound() {
  return <HubLayout title="Uncharted territory"><div className="hub-notfound"><strong>404</strong><h1>A little off the map.</h1><p>This page hasn't been discovered yet. Let's get you back to your next adventure.</p><div className="hub-flex" style={{ justifyContent: "center" }}><Link className="hub-btn primary" to="/student/dashboard">Back to your space <ArrowRight size={15} /></Link><Link className="hub-btn ghost" to="/"><Home size={15} />Home</Link></div></div></HubLayout>;
}

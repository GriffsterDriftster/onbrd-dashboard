import { Brain, Handshake, MessageSquare, Smile, Timer, DollarSign } from 'lucide-react';
import KpiCard from './KpiCard';
export default function KpiGrid({ containment, ttfr, escalation, leads, csat, cpr }:{ containment:string; ttfr:string; escalation:string; leads:string; csat:string; cpr:string; }) {
  return (
    <section aria-labelledby="kpi-heading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <h2 id="kpi-heading" className="sr-only">Key performance indicators</h2>
      <KpiCard label="Containment" value={containment} help="% resolved by bot" icon={<Brain />} />
      <KpiCard label="TTFR" value={ttfr} help="Time to first response" icon={<Timer />} />
      <KpiCard label="Escalation" value={escalation} help="% handed to humans" icon={<Handshake />} />
      <KpiCard label="Leads" value={leads} help="Qualified leads captured" icon={<MessageSquare />} />
      <KpiCard label="CSAT" value={csat} help="1–5 rating" icon={<Smile />} />
      <KpiCard label="Cost/Resolution" value={cpr} help="Estimated platform cost" icon={<DollarSign />} />
    </section>
  );
}

'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
export function ContainmentChart({ data }:{ data:{ day:string; containment:number }[] }) {
  return (<div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4" role="figure" aria-label="Containment trend">
    <div className="mb-2 text-sm text-neutral-500">Containment over time</div>
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis domain={[0,100]} tickFormatter={(v)=>`${v}%`} /><Tooltip formatter={(v:number)=>`${v}%`} /><Legend />
        <Line type="monotone" dataKey="containment" strokeWidth={2} dot={false} name="Containment" />
      </LineChart>
    </ResponsiveContainer>
  </div>);
}
export function OutcomeChart({ data }:{ data:{ name:string; value:number }[] }) {
  return (<div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4" role="figure" aria-label="Conversation outcomes">
    <div className="mb-2 text-sm text-neutral-500">Conversations by outcome</div>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
        <Bar dataKey="value" name="Count" />
      </BarChart>
    </ResponsiveContainer>
  </div>);
}

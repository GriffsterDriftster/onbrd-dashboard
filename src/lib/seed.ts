import { prisma } from './db';
function randInt(min:number,max:number){return Math.floor(Math.random()*(max-min+1))+min;}
function pick<T>(arr:T[]){return arr[Math.floor(Math.random()*arr.length)];}
async function main(){
  const client = await prisma.client.upsert({ where:{ name:'Demo Client' }, update:{}, create:{ name:'Demo Client' } });
  const today = new Date(); today.setUTCHours(0,0,0,0);
  const days = 21;
  for(let d=days; d>=0; d--){
    const day = new Date(today); day.setUTCDate(today.getUTCDate()-d);
    const dayKey = day.toISOString().slice(0,10);
    const convs = randInt(10,30);
    for(let i=0;i<convs;i++){
      const id = `conv_${dayKey}_${i}`;
      const startedAt = new Date(day.getTime()+randInt(0,23)*3600*1000+randInt(0,59)*60*1000);
      const firstResponseSeconds = randInt(1,8);
      const isBot = Math.random()<0.65;
      const escalated = !isBot && Math.random()<0.5;
      const resolvedBy = isBot?'bot':'human';
      const resolvedAt = new Date(startedAt.getTime()+randInt(1,8)*60*1000);
      const leadCaptured = Math.random()<0.25;
      const csat = pick([undefined,3,4,5,5,4]) as number|undefined;
      const costCents = isBot?randInt(5,25):randInt(50,200);
      await prisma.conversation.upsert({ where:{ id }, update:{}, create:{ id, clientId:client.id, startedAt, resolvedAt, resolvedBy, escalated, firstResponseSeconds, leadCaptured, csat, costCents, dayKey } });
    }
  }
  console.log('Seed complete.');
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});

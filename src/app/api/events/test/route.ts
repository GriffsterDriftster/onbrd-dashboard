import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    examplePayload: {
      clientName: 'Demo Client',
      conversationId: 'conv_abc123',
      startedAt: new Date().toISOString(),
      resolvedAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
      resolvedBy: 'bot',
      escalated: false,
      firstResponseSeconds: 2,
      leadCaptured: true,
      csat: 5,
      costCents: 8
    }
  });
}

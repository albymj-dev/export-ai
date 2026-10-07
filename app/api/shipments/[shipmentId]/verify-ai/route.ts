import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GeminiService } from '@/lib/ai/gemini';
import crypto from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;
    const messages = await db.getAssistantMessages(shipmentId);
    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const shipment = await db.getShipmentById(shipmentId);
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const discrepancies = await db.getDiscrepancies(shipmentId);
    const history = await db.getAssistantMessages(shipmentId);

    // Save user message
    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };
    await db.addAssistantMessage(shipmentId, userMsg);

    // Query Gemini VerifyAI
    const aiAnswer = await GeminiService.askVerifyAI(
      shipment,
      discrepancies,
      message,
      history.map((h) => ({ role: h.role, content: h.content }))
    );

    const assistantMsg = {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: aiAnswer,
      timestamp: new Date().toISOString(),
    };
    await db.addAssistantMessage(shipmentId, assistantMsg);

    return NextResponse.json({ userMessage: userMsg, assistantMessage: assistantMsg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification assistant failed' }, { status: 500 });
  }
}

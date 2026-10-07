import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { ShipmentRecord } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    
    // Automatically ensure demo is seeded if database is fresh
    let shipments = await db.getShipments(userId);
    if (shipments.length === 0) {
      await db.seedHackathonDemo(false);
      shipments = await db.getShipments(userId);
    }
    
    return NextResponse.json({ shipments });
  } catch (error: any) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch shipments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = `shipment-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const newShipment: ShipmentRecord = {
      id,
      userId: body.userId || 'user_officer_kerala',
      shipmentReference: body.shipmentReference || `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      exporter: body.exporter || 'Kerala Agro & Marine Exports Ltd.',
      buyer: body.buyer || 'Global Logistics BV',
      consignee: body.consignee || 'Global Logistics Port Hub',
      countryOfOrigin: body.countryOfOrigin || 'India',
      destinationCountry: body.destinationCountry || 'Netherlands',
      portOfLoading: body.portOfLoading || 'Cochin Port (INCOK)',
      portOfDischarge: body.portOfDischarge || 'Rotterdam (NLRTM)',
      shipmentDate: body.shipmentDate || now.split('T')[0],
      incoterms: body.incoterms || 'FOB Cochin',
      currency: body.currency || 'USD',
      status: 'DRAFT',
      riskScore: 0,
      riskTier: 'LOW',
      exportReadinessScore: 25,
      exportReadinessStatus: 'NEEDS_REVIEW',
      documentCount: 0,
      discrepancyCount: 0,
      criticalDiscrepancies: 0,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await db.createShipment(newShipment);
    await db.logAudit({
      shipmentId: id,
      userId: saved.userId,
      userName: 'Verification Officer',
      action: 'SHIPMENT_CREATED',
      resourceType: 'SHIPMENT',
      resourceId: id,
      newValue: { reference: saved.shipmentReference, exporter: saved.exporter },
    });

    return NextResponse.json({ shipment: saved }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating shipment:', error);
    return NextResponse.json({ error: error.message || 'Failed to create shipment' }, { status: 500 });
  }
}

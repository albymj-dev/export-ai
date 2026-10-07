import { redirect } from 'next/navigation';

export default async function ShipmentAnalysisPage({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = await params;
  redirect(`/shipments/${shipmentId}?tab=overview`);
}

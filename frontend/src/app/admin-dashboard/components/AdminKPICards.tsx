/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React from 'react';

export default function AdminKPICards() {
  const cards = [
    ['Members', '1'],
    ['Exchanges', '1'],
    ['Disputes', '1'],
    ['Rating', '1.0'],
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{cards.map(([label, value]) => <div key={label} className="bg-card border border-border rounded-xl p-4"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p><p className="text-2xl font-bold font-tabular text-foreground">{value}</p></div>)}</div>
  );
}

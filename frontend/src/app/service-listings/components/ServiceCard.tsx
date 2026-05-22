/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React from 'react';

export interface Service {
  id: string;
  title: string;
}

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-semibold text-foreground">{service.title}</h3>
      <p className="text-sm text-muted-foreground mt-1">Starter card placeholder.</p>
    </div>
  );
}

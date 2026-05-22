/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React from 'react';

export default function FilterSidebar() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="font-semibold text-foreground mb-2">Filters</p>
      <p className="text-sm text-muted-foreground">No filters configured yet.</p>
    </div>
  );
}

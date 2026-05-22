/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';

export default function ServiceListingsContent() {
  return (
    <div>
      <div className="bg-card border border-border rounded-xl p-4 mb-5 flex flex-col lg:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2"><Search size={16} className="text-muted-foreground" /><input className="bg-transparent outline-none text-sm w-full" placeholder="Search services..." /></div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"><Filter size={14} /> Filters</button>
      </div>
      <div className="bg-card border border-border rounded-xl p-10 text-center">
        <Sparkles size={28} className="mx-auto text-muted-foreground mb-3" />
        <h2 className="text-lg font-semibold text-foreground">No listings yet</h2>
      </div>
    </div>
  );
}

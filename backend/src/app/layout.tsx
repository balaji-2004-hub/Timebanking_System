/* Layout or shell component responsible for the global app structure. */
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

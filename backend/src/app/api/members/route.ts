/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { listProfiles } from '@/lib/server-db';

export async function GET() {
  const profiles = await listProfiles();
  const members = profiles
    .sort((a, b) => b.stats.exchanges - a.stats.exchanges)
    .map((profile) => ({
      email: profile.email,
      displayName: profile.displayName,
      role: profile.role,
      ageGroup: profile.ageGroup,
      credits: profile.stats.credits,
      exchanges: profile.stats.exchanges,
      skillsOffered: profile.skillsOffered,
      neighborhood: profile.neighborhood,
    }));

  return NextResponse.json({ members, total: members.length });
}

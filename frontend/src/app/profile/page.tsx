'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Edit3, MapPin, Calendar, CheckCircle, Shield, Camera, Plus, Save, Trash2 } from 'lucide-react';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import RealUsersPanel from '@/components/community/RealUsersPanel';

const skillOptions = ['Gardening', 'Cooking', 'Tutoring', 'Transportation', 'Tech Help', 'Childcare', 'Carpentry', 'Music', 'Fitness', 'Pet Care', 'Language', 'Art'];

export default function ProfilePage() {
  const { user, profile, updateProfile } = useCurrentUserProfile();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [neighborhood, setNeighborhood] = useState(profile?.neighborhood ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [ageGroup, setAgeGroup] = useState<'senior' | 'adult' | 'youth'>(profile?.ageGroup ?? 'adult');
  const [skillsOffered, setSkillsOffered] = useState<string[]>(profile?.skillsOffered ?? []);
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>(profile?.skillsNeeded ?? []);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setNeighborhood(profile.neighborhood);
    setBio(profile.bio);
    setPhone(profile.phone);
    setAgeGroup(profile.ageGroup);
    setSkillsOffered(profile.skillsOffered);
    setSkillsNeeded(profile.skillsNeeded);
  }, [profile]);

  const initial = useMemo(() => (displayName || user?.displayName || 'N').slice(0, 1).toUpperCase(), [displayName, user?.displayName]);

  const toggleSkill = (label: string, type: 'offered' | 'needed') => {
    if (type === 'offered') {
      setSkillsOffered((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]));
    } else {
      setSkillsNeeded((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]));
    }
  };

  const handleSave = async () => {
    await updateProfile({
      displayName: displayName.trim() || user?.displayName || 'New user',
      neighborhood,
      bio,
      phone,
      ageGroup,
      skillsOffered,
      skillsNeeded,
      stats: {
        ...(profile?.stats ?? { credits: 1, given: 0, received: 0, exchanges: 0, rating: 0, reviews: 0, listings: 0 }),
      },
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <AppLayout variant={user?.role === 'admin' ? 'admin' : 'member'}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-5">
          <div className="h-28 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 relative">
            <button className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"><Camera size={14} className="text-white" /></button>
          </div>
          <div className="px-6 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 mb-4">
              <div className="relative w-fit">
                <div className="w-20 h-20 rounded-2xl bg-primary border-4 border-white flex items-center justify-center shadow-card"><span className="text-white text-2xl font-bold">{initial}</span></div>
              </div>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-amber-700 transition-colors btn-press w-fit"><Save size={14} /> {saved ? 'Saved' : 'Save Profile'}</button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1"><h1 className="text-xl font-bold text-foreground">{displayName || user?.displayName || 'New user'}</h1><CheckCircle size={16} className="text-success" /><Shield size={14} className="text-info" /></div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2 flex-wrap"><div className="flex items-center gap-1"><MapPin size={13} /> {neighborhood || 'Add your neighborhood'}</div><div className="flex items-center gap-1"><Calendar size={13} /> {user?.role === 'admin' ? 'Admin account' : 'Member account'}</div></div>
                <p className="text-sm text-muted-foreground">Edit your profile and the page updates immediately for this account.</p>
              </div>
              <div className="flex gap-5 sm:gap-6">
                <div className="text-center"><p className="text-2xl font-bold font-tabular text-foreground">{profile?.stats.exchanges ?? 0}</p><p className="text-xs text-muted-foreground">Exchanges</p></div>
                <div className="text-center"><p className="text-2xl font-bold font-tabular text-foreground">{profile?.stats.credits ?? 1}</p><p className="text-xs text-muted-foreground">Credits</p></div>
                <div className="text-center"><p className="text-2xl font-bold font-tabular text-foreground">{(profile?.stats.rating ?? 0).toFixed(1)}</p><p className="text-xs text-muted-foreground">Rating</p></div>
              </div>
            </div>
            <div className="mt-4 border border-dashed border-border rounded-xl p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Display name</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Bio</p>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none resize-none" placeholder="Add a short bio to introduce yourself." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none" placeholder="Neighborhood / Area" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none" placeholder="Phone" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Age group</label>
                <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value as 'senior' | 'adult' | 'youth')} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none">
                  <option value="adult">Adult</option>
                  <option value="senior">60+ / Senior</option>
                  <option value="youth">Below 60 / Youth</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Skills</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {skillOptions.map((skill) => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill, 'offered')} className={`rounded-lg border px-3 py-2 text-left text-sm ${skillsOffered.includes(skill) ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <div className="font-medium">{skill}</div>
                  <div className="text-xs text-muted-foreground">Offered skill</div>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-3"><Plus size={14} className="text-muted-foreground" /><span className="text-sm font-semibold text-foreground">Skills needed</span></div>
            <div className="grid grid-cols-2 gap-2">
              {skillOptions.map((skill) => (
                <button key={`need-${skill}`} type="button" onClick={() => toggleSkill(skill, 'needed')} className={`rounded-lg border px-3 py-2 text-left text-sm ${skillsNeeded.includes(skill) ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <div className="font-medium">{skill}</div>
                  <div className="text-xs text-muted-foreground">Needed skill</div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
            <div className="border border-dashed border-border rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">{profile?.recentActivity?.length ? profile.recentActivity.join(' • ') : 'No recent activity. Your updates will appear here.'}</p>
            </div>
            <button onClick={() => updateProfile({ ageGroup: profile?.ageGroup ?? 'adult', skillsOffered: [], skillsNeeded: [], firstListing: null, recentActivity: [], transactions: [], stats: { credits: 1, given: 0, received: 0, exchanges: 0, rating: 0, reviews: 0, listings: 0 } })} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-danger hover:underline">
              <Trash2 size={14} /> Reset my profile data
            </button>
          </div>
        </div>

        <div className="mt-5">
          <RealUsersPanel title="Real users nearby" subtitle="See other registered members while editing your profile" compact />
        </div>
      </div>
    </AppLayout>
  );
}

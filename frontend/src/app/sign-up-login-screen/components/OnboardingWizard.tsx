'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check, User, Briefcase, Clock, MapPin, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiUpdateProfile } from '@/lib/timebank-api';

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  neighborhood: string;
  bio: string;
  phone: string;
  role: 'member' | 'admin';
  ageGroup: 'senior' | 'adult' | 'youth';
}

interface ServiceData {
  title?: string;
  category?: string;
  type?: 'offer' | 'request';
  description?: string;
  creditHours?: number;
}

const skillOptions = [
  { id: 'skill-gardening', label: 'Gardening', emoji: '🌱' },
  { id: 'skill-cooking', label: 'Cooking & Baking', emoji: '🍳' },
  { id: 'skill-tutoring', label: 'Tutoring / Teaching', emoji: '📚' },
  { id: 'skill-transport', label: 'Transportation', emoji: '🚗' },
  { id: 'skill-tech', label: 'Tech Help', emoji: '💻' },
  { id: 'skill-childcare', label: 'Childcare', emoji: '👶' },
  { id: 'skill-carpentry', label: 'Carpentry & Repairs', emoji: '🔨' },
  { id: 'skill-music', label: 'Music Lessons', emoji: '🎵' },
  { id: 'skill-fitness', label: 'Fitness & Wellness', emoji: '🏋️' },
  { id: 'skill-pets', label: 'Pet Care', emoji: '🐾' },
  { id: 'skill-language', label: 'Language Exchange', emoji: '🌍' },
  { id: 'skill-art', label: 'Art & Crafts', emoji: '🎨' },
];

const serviceCategories = [
  'Gardening', 'Cooking', 'Tutoring', 'Transportation', 'Tech Help',
  'Childcare', 'Carpentry', 'Music', 'Fitness', 'Pet Care', 'Language', 'Art',
];

const steps = [
  { number: 1, label: 'Account' },
  { number: 2, label: 'Skills' },
  { number: 3, label: 'First Listing' },
];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [offeredSkills, setOfferedSkills] = useState<string[]>([]);
  const [neededSkills, setNeededSkills] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const router = useRouter();
  const { register: createAccount } = useAuth();

  const form = useForm<SignupData & ServiceData>({
    defaultValues: {
      type: 'offer',
      creditHours: 1,
      role: 'member',
      ageGroup: 'adult',
    },
  });

  const { register, trigger, handleSubmit, formState: { errors } } = form;

  const firstName = form.watch('firstName') ?? '';
  const lastName = form.watch('lastName') ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  const toggleSkill = (skillId: string, list: 'offered' | 'needed') => {
    if (list === 'offered') {
      setOfferedSkills((prev) => (prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]));
      return;
    }
    setNeededSkills((prev) => (prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]));
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const valid = await trigger(['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'neighborhood']);
      if (!valid) return;
      if (form.getValues('password') !== form.getValues('confirmPassword')) {
        form.setError('confirmPassword', { message: 'Passwords do not match' });
        return;
      }
    }
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const handleFinish = async (data: SignupData & ServiceData) => {
    setIsLoading(true);
    try {
      const user = await createAccount({
        email: data.email,
        password: data.password,
        displayName: `${data.firstName} ${data.lastName}`.trim(),
        role: data.role,
        credits: 1,
        ageGroup: data.ageGroup,
        rememberMe: true,
      });

      const firstListing = data.title && data.description && data.category
        ? {
            title: data.title,
            category: data.category,
            type: data.type ?? 'offer',
            description: data.description,
            creditHours: data.creditHours ?? 1,
          }
        : null;

      await apiUpdateProfile(user.email, {
        neighborhood: data.neighborhood,
        bio: data.bio,
        phone: data.phone,
        displayName: `${data.firstName} ${data.lastName}`.trim(),
        role: data.role,
        ageGroup: data.ageGroup,
        skillsOffered: offeredSkills,
        skillsNeeded: neededSkills,
        firstListing,
        stats: {
          credits: 1,
          given: 0,
          received: 0,
          exchanges: 0,
          rating: 0,
          reviews: 0,
          listings: firstListing ? 1 : 0,
        },
      });

      setCompleted(true);
      router.push(user.role === 'admin' ? '/admin-dashboard' : '/');
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Unable to create your account right now.',
      });
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="text-center py-8 fade-in">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Your account is ready</h2>
        <p className="text-sm text-muted-foreground">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Join TimeBank</h2>
        <p className="text-sm text-muted-foreground mt-1">Create a fresh account and personalize your own pages.</p>
      </div>

      {errors.root && (
        <div className="mb-4 bg-danger-bg border border-danger/20 rounded-lg px-4 py-3">
          <p className="text-sm text-danger font-medium">{errors.root.message}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        {steps.map((step) => (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= step.number ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                {step.number}
              </div>
              <span className={`text-xs font-semibold ${currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'}`}>{step.label}</span>
            </div>
            {step.number < 3 && <div className="flex-1 h-px bg-border" />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(handleFinish)} className="space-y-4">
        {currentStep === 1 && (
          <div className="space-y-4 slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">First name</label>
                <input
                  className={`w-full px-3.5 py-2.5 bg-input border rounded-lg text-sm outline-none ${errors.firstName ? 'border-danger' : 'border-border'}`}
                  placeholder="Margaret"
                  {...register('firstName', { required: 'First name is required' })}
                />
                {errors.firstName && <p className="text-xs text-danger mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Last name</label>
                <input
                  className={`w-full px-3.5 py-2.5 bg-input border rounded-lg text-sm outline-none ${errors.lastName ? 'border-danger' : 'border-border'}`}
                  placeholder="Chen"
                  {...register('lastName', { required: 'Last name is required' })}
                />
                {errors.lastName && <p className="text-xs text-danger mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-input border rounded-lg text-sm outline-none ${errors.email ? 'border-danger' : 'border-border'}`}
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                  })}
                />
              </div>
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Role</label>
              <select className="w-full px-3.5 py-2.5 bg-input border border-border rounded-lg text-sm outline-none" {...register('role')}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Age group</label>
              <select className="w-full px-3.5 py-2.5 bg-input border border-border rounded-lg text-sm outline-none" {...register('ageGroup')}>
                <option value="adult">Adult</option>
                <option value="senior">60+ / Senior</option>
                <option value="youth">Below 60 / Youth</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full pl-9 pr-10 py-2.5 bg-input border rounded-lg text-sm outline-none ${errors.password ? 'border-danger' : 'border-border'}`}
                    placeholder="Create a password"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`w-full pl-9 pr-10 py-2.5 bg-input border rounded-lg text-sm outline-none ${errors.confirmPassword ? 'border-danger' : 'border-border'}`}
                    placeholder="Repeat your password"
                    {...register('confirmPassword', { required: 'Please confirm your password' })}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Neighborhood / Area</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-input border rounded-lg text-sm outline-none ${errors.neighborhood ? 'border-danger' : 'border-border'}`}
                  placeholder="e.g. Riverside, Portland OR"
                  {...register('neighborhood', { required: 'Neighborhood is required' })}
                />
              </div>
              {errors.neighborhood && <p className="text-xs text-danger mt-1">{errors.neighborhood.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Short bio</label>
              <textarea
                rows={3}
                className="w-full px-3.5 py-2.5 bg-input border border-border rounded-lg text-sm outline-none resize-none"
                placeholder="Tell neighbors what you enjoy and what you can help with."
                {...register('bio')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Phone</label>
              <input
                className="w-full px-3.5 py-2.5 bg-input border border-border rounded-lg text-sm outline-none"
                placeholder="Optional"
                {...register('phone')}
              />
            </div>

            <button type="button" onClick={handleNext} className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg">
              Continue
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 slide-up">
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Skills you offer</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {skillOptions.map((skill) => {
                  const active = offeredSkills.includes(skill.id);
                  return (
                    <button key={skill.id} type="button" onClick={() => toggleSkill(skill.id, 'offered')} className={`p-2 rounded-lg border text-left ${active ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <div className="text-base">{skill.emoji}</div>
                      <div className="text-xs font-medium">{skill.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Skills you need</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {skillOptions.map((skill) => {
                  const active = neededSkills.includes(skill.id);
                  return (
                    <button key={`need-${skill.id}`} type="button" onClick={() => toggleSkill(skill.id, 'needed')} className={`p-2 rounded-lg border text-left ${active ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <div className="text-base">{skill.emoji}</div>
                      <div className="text-xs font-medium">{skill.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setCurrentStep(1)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-semibold">Back</button>
              <button type="button" onClick={() => setCurrentStep(3)} className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold">Continue</button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 slide-up">
            <div className="bg-muted border border-border rounded-xl p-4 text-sm text-muted-foreground">
              This step is optional. Leave it blank to start with an empty profile.
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">First listing title</label>
              <input
                className={`w-full px-3.5 py-2.5 bg-input border rounded-lg text-sm outline-none ${errors.title ? 'border-danger' : 'border-border'}`}
                placeholder="Need help with… / I can help with…"
                {...register('title')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Category</label>
              <select className="w-full px-3.5 py-2.5 bg-input border border-border rounded-lg text-sm outline-none" {...register('category')}>
                <option value="">Select a category</option>
                {serviceCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 border border-border rounded-lg p-3">
                <input type="radio" value="offer" {...register('type')} />
                <span className="text-sm font-medium">Offer</span>
              </label>
              <label className="flex items-center gap-2 border border-border rounded-lg p-3">
                <input type="radio" value="request" {...register('type')} />
                <span className="text-sm font-medium">Request</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
              <textarea
                rows={4}
                className="w-full px-3.5 py-2.5 bg-input border border-border rounded-lg text-sm outline-none resize-none"
                placeholder="Add details for other users…"
                {...register('description')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Credit hours</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                className="w-full px-3.5 py-2.5 bg-input border border-border rounded-lg text-sm outline-none"
                {...register('creditHours', { valueAsNumber: true, min: 0.5 })}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <p className="font-semibold text-amber-900 mb-2">Preview</p>
              <p><span className="text-muted-foreground">Name:</span> {fullName || 'New user'}</p>
              <p><span className="text-muted-foreground">Skills offered:</span> {offeredSkills.length}</p>
              <p><span className="text-muted-foreground">Skills needed:</span> {neededSkills.length}</p>
              <p><span className="text-muted-foreground">First listing:</span> {form.watch('title')?.trim() ? 'Will be saved' : 'Empty starter profile'}</p>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setCurrentStep(2)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-semibold">Back</button>
              <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                Create account
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

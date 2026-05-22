'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSuccess?: (role: 'member' | 'admin') => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({ defaultValues: { rememberMe: true } });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const user = await login(data);
      onSuccess?.(user.role);
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Unable to sign in right now' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in with the account you created in this app.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root && (
          <div className="bg-danger-bg border border-danger/20 rounded-lg px-4 py-3">
            <p className="text-sm text-danger font-medium">{errors.root.message}</p>
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className={`w-full px-3.5 py-2.5 bg-input border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-colors ${errors.email ? 'border-danger focus:ring-danger/20' : 'border-border'}`}
            placeholder="you@example.com"
            {...register('email', { required: 'Email address is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' } })}
          />
          {errors.email && <p className="text-xs text-danger mt-1.5 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-sm font-semibold text-foreground">Password</label>
            <button type="button" className="text-xs text-primary hover:underline font-medium">Forgot password?</button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`w-full px-3.5 py-2.5 pr-10 bg-input border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-colors ${errors.password ? 'border-danger focus:ring-danger/20' : 'border-border'}`}
              placeholder="Your password"
              {...register('password', { required: 'Password is required' })}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-danger mt-1.5 font-medium">{errors.password.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input id="remember-me" type="checkbox" className="w-4 h-4 rounded border-border accent-primary cursor-pointer" {...register('rememberMe')} />
          <label htmlFor="remember-me" className="text-sm text-foreground cursor-pointer">Keep me signed in</label>
        </div>

        <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors btn-press flex items-center justify-center gap-2">
          {isLoading ? (<><Loader2 size={16} className="animate-spin" /> Signing in…</>) : 'Sign in'}
        </button>
      </form>

      <div className="mt-5 p-4 bg-muted border border-border rounded-xl">
        <p className="text-xs text-muted-foreground">Use the account you created here. No demo login is preloaded.</p>
      </div>
    </div>
  );
}

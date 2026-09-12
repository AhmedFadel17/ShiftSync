import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useLoginMutation } from '@/store/apis';
import { setCredentials, isRoleAdmin, type AuthUser } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in as Admin, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated && isRoleAdmin(user?.role)) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      const response = await login({ email, password }).unwrap();
      const authData = response.data;

      if (!authData || !authData.token) {
        toast.error('Unexpected response from server.');
        return;
      }

      // Check if user is Admin
      if (!isRoleAdmin(authData.role)) {
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      const authUser: AuthUser = {
        id: authData.userId,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
      };

      dispatch(setCredentials({ token: authData.token, user: authUser }));
      toast.success(`Welcome back, ${authUser.fullName}!`);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const message =
        err?.data?.message ??
        err?.data?.title ??
        (typeof err?.data === 'string' ? err.data : null) ??
        err?.message ??
        'Invalid email or password.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              alt="ShiftSync Logo"
              className="h-12 w-auto object-contain shrink-0"
              src="https://lh3.googleusercontent.com/aida/AEtjO1VLFCQVXaxkNKwJMzPnRjNoh0pmSrzDk0GYLLLOGZDWKzFbjAzQij247WFq2AVq5pgcnVzSf1HmIcibA6B2DGdAGEkKONcgO7c3e5Y0Upl9itoLM4uQEUU70ZsWk8tF2nEHxixzlHWdSNIG9Q03uudPF5pEOKbcq3HuZ2Uh6AksAd8qyMPbO53K2suZ8YQ2eJcbX4JHIH77TngpM5yoq4Fpez7HLAe8XqUK-ciH2oeeeEgNLSQmP4PqOA"
            />
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight font-headline-lg-mobile">
            ShiftSync
          </h1>
          <p className="text-on-surface-variant text-xs mt-1 font-body-sm">
            Workforce Management Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 shadow-xl">
          <h2 className="text-base font-bold text-on-surface mb-1 font-headline-md">Sign In</h2>
          <p className="text-on-surface-variant text-xs mb-6 font-body-sm">
            Enter your administrative credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-md uppercase tracking-wider"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shiftsync.com"
                  autoComplete="email"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-surface-container-low/60 border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-md uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full h-11 pl-10 pr-10 bg-surface-container-low/60 border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-xs font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all hover:opacity-90 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                  Signing in…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-on-surface-variant/60 text-[11px] mt-6 font-label-mono">
          ShiftSync Workforce Management System
        </p>
      </div>
    </div>
  );
}

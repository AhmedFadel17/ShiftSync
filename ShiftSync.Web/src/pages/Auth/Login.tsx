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
    <div className="min-h-screen bg-dashboard-bg flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ShiftSync</h1>
          <p className="text-white/40 text-sm mt-1">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Sign In</h2>
          <p className="text-white/40 text-sm mb-6">Enter your admin credentials to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg pointer-events-none">
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
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg pointer-events-none">
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
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
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
              className="btn-primary w-full mt-2 h-11 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          ShiftSync Workforce Management System
        </p>
      </div>
    </div>
  );
}

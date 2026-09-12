import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950 text-white">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-extrabold text-cyan-400 mb-4 tracking-tight">404</h1>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-slate-400 mb-8 text-sm">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-colors shadow-lg shadow-cyan-900/30"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

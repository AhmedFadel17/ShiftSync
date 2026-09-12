import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-surface text-on-surface">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 shadow-sm">
          <span className="material-symbols-outlined text-3xl">sentiment_dissatisfied</span>
        </div>
        <h1 className="text-6xl font-extrabold text-primary mb-2 tracking-tight font-headline-lg">
          404
        </h1>
        <h2 className="text-xl font-bold mb-2 font-headline-md">Page Not Found</h2>
        <p className="text-on-surface-variant mb-6 text-xs font-body-sm">
          The page or resource you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-on-primary font-label-md text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

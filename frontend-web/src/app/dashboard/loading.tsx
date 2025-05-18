// Basic loading skeleton, can be improved with a more specific dashboard skeleton later
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
      <p className="text-lg text-slate-700 dark:text-slate-300">Loading dashboard...</p>
      {/* Consider adding a spinner or a skeleton UI that matches the dashboard layout */}
    </div>
  );
} 
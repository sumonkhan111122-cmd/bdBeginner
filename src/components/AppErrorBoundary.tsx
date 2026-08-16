import { Component, type ErrorInfo, type ReactNode } from 'react';

type AppErrorBoundaryProps = { children: ReactNode };
type AppErrorBoundaryState = { hasError: boolean };

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error', {
      errorClass: error.constructor.name,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-50 px-5">
        <section className="w-full max-w-lg rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Something went wrong</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink-900">This page could not be displayed.</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            Your account and order data are safe. Reload the page, or return to the homepage and try again.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Reload page
            </button>
            <a
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-ink-200 bg-white px-5 text-sm font-semibold text-ink-800 hover:bg-ink-50"
            >
              Go to homepage
            </a>
          </div>
        </section>
      </main>
    );
  }
}

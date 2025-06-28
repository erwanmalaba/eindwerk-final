import React from "react";
import { Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Auth } from "./pages/Auth";
import { Overview } from "./pages/Overview";
import { Workout } from "./pages/Workout";
import { Goals } from "./pages/Goals";
import { Schedule } from "./pages/Schedule";
import { Progress } from "./pages/Progress";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 App Error:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-slate-600 mb-4">
              The app encountered an error. Please reload the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Reload Page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-slate-500">
                  Error Details (Dev Mode)
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const App = (): JSX.Element => {
  // Add global error handler for extension errors
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || event.reason?.toString() || '';
      
      // Filter out extension errors
      if (
        message.includes('checkoutUrls') ||
        message.includes('feature_extension') ||
        message.includes('merchant-homepage') ||
        message.includes('background.js')
      ) {
        event.preventDefault(); // Prevent this from bubbling up
        return;
      }
      
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
    };

    const handleError = (event: ErrorEvent) => {
      const message = event.message || '';
      const filename = event.filename || '';
      
      // Filter out extension errors
      if (
        message.includes('checkoutUrls') ||
        filename.includes('feature_extension') ||
        filename.includes('merchant-homepage') ||
        filename.includes('background.js')
      ) {
        event.preventDefault(); // Prevent this from bubbling up
        return;
      }
      
      console.error('🚨 Global Error:', event.error || event.message);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <div data-testid="app-content">
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/workout" element={<Workout />} />
                        <Route path="/goals" element={<Goals />} />
                        <Route path="/schedule" element={<Schedule />} />
                        <Route path="/progress" element={<Progress />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </div>
      </Provider>
    </ErrorBoundary>
  );
};
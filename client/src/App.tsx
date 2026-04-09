import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-store";
import { DataProvider } from "@/lib/data-store";
import { AuthScreen } from "@/components/auth-dialog";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Builder from "@/pages/builder";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthEnabled } = useAuth();

  // Auth not configured — run without auth (local mode)
  if (!isAuthEnabled) return <>{children}</>;

  // Loading session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not signed in — show auth screen
  if (!user) return <AuthScreen />;

  return <>{children}</>;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/builder" component={Builder} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <AuthGate>
            <Router hook={useHashLocation}>
              <AppRouter />
            </Router>
          </AuthGate>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;

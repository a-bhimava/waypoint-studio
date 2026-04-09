import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/lib/data-store";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Builder from "@/pages/builder";

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
    <DataProvider>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </DataProvider>
  );
}

export default App;

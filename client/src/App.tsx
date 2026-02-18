import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Companies from "@/pages/Companies";
import CompanyDetail from "@/pages/CompanyDetail";
import CreateCompany from "@/pages/CreateCompany";
import Lists from "@/pages/Lists";
import ListDetail from "@/pages/ListDetail";
import SavedSearches from "@/pages/SavedSearches";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/companies" />} />
      <Route path="/companies" component={Companies} />
      <Route path="/companies/new" component={CreateCompany} />
      <Route path="/companies/:id" component={CompanyDetail} />
      <Route path="/lists" component={Lists} />
      <Route path="/lists/:id" component={ListDetail} />
      <Route path="/saved-searches" component={SavedSearches} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

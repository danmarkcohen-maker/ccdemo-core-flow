import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DemoMenu from "./pages/DemoMenu";
import SingleChat from "./pages/SingleChat";
import Onboarding from "./pages/Onboarding";
import TwoPlayerChat from "./pages/TwoPlayerChat";
import FourPlayerChat from "./pages/FourPlayerChat";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DemoMenu />} />
          <Route path="/demo/single-chat" element={<SingleChat />} />
          <Route path="/demo/onboarding" element={<Onboarding />} />
          <Route path="/demo/two-player" element={<TwoPlayerChat />} />
          <Route path="/demo/four-player" element={<FourPlayerChat />} />
          <Route path="/demo/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

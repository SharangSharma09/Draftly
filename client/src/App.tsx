import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import TextTransformer from "@/pages/TextTransformer";

// For Chrome extension, we're using a simpler approach without routing
// This avoids the 404 errors when loading the extension
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TextTransformer />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

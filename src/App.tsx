import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import AppInitializer from "./app/AppInitializer";
import { ThemeProvider } from "./context/ThemeProvider";
import { router } from "./router";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            richColors
            closeButton
            expand={false}
            duration={3000}
          />
        </ThemeProvider>
      </AppInitializer>
    </QueryClientProvider>
  );
}

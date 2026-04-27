import { QueryClientProvider } from "@tanstack/react-query";

import Pages from "./pages"
import { queryClient } from "./utils/queryClient";
import ThemeProviderWrapper from "./components/themeProviderWrapper";
import { AppConfigProvider } from "./contexts/appConfigContext/appConfigProvider";
import { BroadcastChannelProvider } from "./contexts/broadcastChannelContext/broadcastChannelProvider";
import { AppAlertProvider } from "./contexts/appAlertContext/appAlertProvider";

function App() {
  return (
    <ThemeProviderWrapper>
      <BroadcastChannelProvider>
        <AppConfigProvider>
          <QueryClientProvider client={queryClient}>
            <AppAlertProvider>
              <Pages />
            </AppAlertProvider>
          </QueryClientProvider>
        </AppConfigProvider>
      </BroadcastChannelProvider>
    </ThemeProviderWrapper>
  );
}

export default App;

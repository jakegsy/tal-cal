import { Calculator } from './containers/Calculator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CacheProvider } from './contexts/CacheContext';

const queryClient = new QueryClient();

function App() {
  return (
    <CacheProvider>
    <QueryClientProvider client={queryClient}>
      <div className="bg-white">
        <Calculator />
      </div>
    </QueryClientProvider>
    </CacheProvider>
  );
}

export default App;
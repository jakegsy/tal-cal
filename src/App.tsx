import { Calculator } from './containers/Calculator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CacheProvider } from './contexts/CacheContext';
import { RecordList } from './components/Records/RecordList';
import { useEffect, useState } from 'react';



const queryClient = new QueryClient();


function App() {
  // set a list of record to pass into recordList
  



  return (
    <CacheProvider>
    <QueryClientProvider client={queryClient}>
      <div className="bg-white w-full min-h-screen">
        <Calculator />
      </div>
    </QueryClientProvider>
    </CacheProvider>
  );
}

export default App;
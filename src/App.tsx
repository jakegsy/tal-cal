import { Calculator } from './containers/Calculator';
import { CacheProvider } from './contexts/CacheContext';

function App() {
  return (
    <CacheProvider>
      <div className="bg-white">
        <Calculator />
      </div>
    </CacheProvider>
  );
}

export default App;
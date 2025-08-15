import './App.css';
import { AppRoutes } from './routes/AppRoutes';
import ConfigDebug from './components/ConfigDebug';
import ConnectionTest from './components/ConnectionTest';

function App() {
  return (
    <>
      <AppRoutes />
      <ConfigDebug show={true} />
      <ConnectionTest />
    </>
  );
}

export default App;

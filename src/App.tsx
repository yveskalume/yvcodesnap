import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainScreen from './components/MainScreen';
import Editor from './components/Editor';
import FontLoader from './components/FontLoader';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <FontLoader />
      <Toaster theme="dark" position="top-center" toastOptions={{ duration: 2600 }} />
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </Router>
  );
}

export default App;

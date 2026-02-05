import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FontLoader from './components/FontLoader';
import { Toaster } from 'sonner';
import LandingLayout from './layouts/LandingLayout';
import LandingPage from './pages/LandingPage';
import Editor from './pages/Editor';

function App() {
  return (
    <Router>
      <FontLoader />
      <Toaster theme="dark" position="top-center" toastOptions={{ duration: 2600 }} />
      <Routes>
        {/* Landing pages with layout */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        {/* Editor (no layout) */}
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </Router>
  );
}

export default App;

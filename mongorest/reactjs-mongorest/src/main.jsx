import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/Toaster';
import { BrowserRouter } from 'react-router-dom';
import { CommonProvider } from './context/CommonContext';
import './i18n';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { ProjectProvider } from './context/ProjectContext';

createRoot(document.getElementById('root')).render(
  <>
    <BrowserRouter>
      <ProjectProvider>
        <AuthProvider>
          <CommonProvider>
            <App />
          </CommonProvider>
        </AuthProvider>
      </ProjectProvider>
    </BrowserRouter>
    <Toaster />
  </>
);

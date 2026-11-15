import { StyleProvider } from '@ant-design/cssinjs';
import { App as AntApp, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import './index.css';

dayjs.locale('ru');

const root = document.getElementById('root');
if (!root) throw new Error('Элемент #root не найден');

createRoot(root).render(
  <StrictMode>
    {/* layer: стили AntD попадают в @layer antd и корректно сочетаются с Tailwind */}
    <StyleProvider layer>
      <ConfigProvider locale={ruRU} theme={{ token: { colorPrimary: '#4f46e5', borderRadius: 8 } }}>
        <AntApp>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AntApp>
      </ConfigProvider>
    </StyleProvider>
  </StrictMode>,
);

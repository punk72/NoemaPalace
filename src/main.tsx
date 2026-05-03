import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/styles/global.css'
import App from './app/App.tsx'
import { I18nProvider } from '@/shared/i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)

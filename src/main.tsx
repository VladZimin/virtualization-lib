import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'


const container = document.getElementById('root');
if (!container) {
  throw new Error('Контейнер root не найден. Не удалось вмонтировать react компонент');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

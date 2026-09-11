import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import App from './App';
import { routerBasename } from './router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={routerBasename(import.meta.env.BASE_URL)}>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);

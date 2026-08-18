import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

import OfflineFallback from './components/OfflineFallback';

function App() {
  return (
    <OfflineFallback>
      <RouterProvider router={router} />
    </OfflineFallback>
  );
}

export default App;

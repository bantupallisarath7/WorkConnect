import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/AppRoutes";
import SimpleLoader from "./components/SimpleLoader";
import ScrollReset from "./utils/ScrollReset";

function App() {
  return (
    <BrowserRouter>
      <ScrollReset />
      <Suspense>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
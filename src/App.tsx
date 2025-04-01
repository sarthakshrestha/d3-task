import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Menu from "./reusable/menu";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-gray-50">
        <h1 className="text-lg font-light">D3 Dashboard</h1>
        <Menu />
      </header>
      <div className="items-center justify-center">
        <h1>Main Dashboards</h1>
      </div>
    </>
  );
}

export default App;

import { useState } from "react";

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
      <div className="items-center flex justify-center">
        <h1 className="pt-12  text-2xl max-w-4xl  text-center text-gray-800">
          Utilizing the data of the Largest Videogame Company by Market Cap{" "}
        </h1>
      </div>
    </>
  );
}

export default App;

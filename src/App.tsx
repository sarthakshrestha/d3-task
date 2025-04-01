import "./App.css";
import Menu from "./reusable/menu";
import FirstChart from "./pages/BarChart";
import ScatterPlot from "./pages/ScatterPlot";
import FetchPlot from "./pages/FetchPlot";
import { Toaster } from "sonner";
import Logo from "/logo/Assabet.webp";

function App() {
  return (
    <div className="bg-zinc-900 overflow-x-hidden rounded-3xl mx-auto items-center">
      <header className="flex items-center justify-end p-2 bg-transaprent">
        <Menu />
      </header>
      <Toaster position="top-center" richColors closeButton />

      <h1 className="text-white font-light text-center">D3 Dashboard</h1>
      <h1 className="text-2xl text-white font-light text-center">
        built by <span className="font-bold">Sarthak Shrestha</span>
      </h1>
      <p className="text-white">for</p>

      <div className="flex justify-center mt-4 mx-auto bg-gray-50 w-fit rounded-full p-1 items-center">
        <img
          src={Logo}
          alt="Assabet Logo"
          className="h-16 object-contain"
          title="Assabet"
        />
      </div>

      <div>
        <FirstChart /> <ScatterPlot /> <FetchPlot />{" "}
      </div>
    </div>
  );
}

export default App;

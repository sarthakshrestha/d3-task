import "./App.css";
import Menu from "./reusable/menu";
import FirstChart from "./pages/BarChart";
import ScatterPlot from "./pages/ScatterPlot";
function App() {
  return (
    <div className="bg-zinc-900 overflow-x-hidden">
      <header className="flex items-center justify-end p-4 bg-transaprent">
        <Menu />
      </header>
      <h1 className=" text-white font-light text-center">D3 Dashboard</h1>
      <h1 className="text-2xl text-white font-light text-center">
        built by <span className="font-bold">Sarthak</span>
      </h1>

      <div className="mt-8 ">
        <FirstChart />{" "}
      </div>
      <div className="mt-8 ">
        <ScatterPlot />{" "}
      </div>
    </div>
  );
}

export default App;

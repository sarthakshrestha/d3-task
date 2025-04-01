import "./App.css";
import Menu from "./reusable/menu";
import FirstChart from "./pages/PrimaryBox";

function App() {
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
      <div className="mt-8 px-4">
        <FirstChart />{" "}
      </div>
    </>
  );
}

export default App;

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

      <div className="mt-8 ">
        <FirstChart />{" "}
      </div>
    </>
  );
}

export default App;

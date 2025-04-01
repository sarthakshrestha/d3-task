import "./App.css";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Menu from "./reusable/menu";
import FirstChart from "./pages/BarChart";
import ScatterPlot from "./pages/ScatterPlot";
import { ChevronLeft, ChevronRight } from "lucide-react";

function App() {
  // Optimized for mobile with better touch response
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false,
    dragFree: false, // Changed to false for better snapping on mobile
    inViewThreshold: 0.7, // Better for mobile viewport
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update button states and selected index when slide changes
  const onSelect = () => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  };

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect(); // Set initial values
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <div className="bg-zinc-900 overflow-x-hidden min-h-screen">
      <header className="flex items-center justify-between p-4 bg-transparent">
        <div className="text-white text-xl font-semibold">D3 Dashboard</div>
        <Menu />
      </header>

      <div className="mt-4 text-center px-4">
        <h1 className="text-2xl sm:text-3xl text-white font-light">
          Interactive Data{" "}
          <span className="font-bold text-blue-400">Visualization</span>
        </h1>
        <h2 className="text-lg sm:text-xl text-zinc-400 font-light mt-1">
          built by <span className="font-bold">Sarthak</span>
        </h2>
      </div>

      {/* Dots Indicator - Larger touch targets for mobile */}
      <div className="flex justify-center gap-3 my-6">
        {[
          { name: "Bar Chart", icon: "📊" },
          { name: "Scatter Plot", icon: "🔵" },
        ].map((item, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-9 rounded-full transition-all flex items-center justify-center ${
              selectedIndex === index
                ? "bg-transparent outline-2 rounded-full px-4 text-white"
                : "bg-zinc-800 w-9 text-zinc-400"
            }`}
            aria-label={`Go to ${item.name}`}
          >
            {selectedIndex === index ? item.name : item.icon}
          </button>
        ))}
      </div>

      {/* Carousel - First shows Bar Chart, then Scatter Plot */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {/* First slide - Bar Chart */}
            <div className="flex-[0_0_100%] min-w-0 px-4">
              <FirstChart />
            </div>
            {/* Second slide - Scatter Plot */}
            <div className="flex-[0_0_100%] min-w-0 px-4">
              <ScatterPlot />
            </div>
          </div>
        </div>

        {/* Navigation buttons - only shown on desktop */}
        <button
          onClick={scrollPrev}
          disabled={!prevBtnEnabled}
          className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-zinc-800/70 hover:bg-zinc-700/80 text-white p-3 rounded-full border border-zinc-700 ${
            !prevBtnEnabled ? "opacity-30 cursor-not-allowed" : ""
          }`}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={scrollNext}
          disabled={!nextBtnEnabled}
          className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-800/70 hover:bg-zinc-700/80 text-white p-3 rounded-full border border-zinc-700 ${
            !nextBtnEnabled ? "opacity-30 cursor-not-allowed" : ""
          }`}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile-friendly swipe instructions with icons */}
      <div className="text-center text-white mt-6 px-4 pb-12">
        <div className="flex justify-center">
          {/* Desktop version */}
          <div className="hidden sm:flex items-center gap-2 outline-2 outline-white px-4 rounded-full py-2">
            {selectedIndex === 0 ? (
              <>
                Swipe left to see Scatter Plot
                <ChevronRight className="w-5 h-5 animate-pulse" />
              </>
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 animate-pulse" />
                Swipe right to see Bar Chart
              </>
            )}
          </div>

          {/* Mobile version */}
          <div className="flex sm:hidden items-center gap-1">
            {selectedIndex === 0 ? (
              <>
                Swipe for Scatter Plot
                <ChevronRight className="w-4 h-4 animate-pulse" />
              </>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 animate-pulse" />
                Swipe for Bar Chart
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

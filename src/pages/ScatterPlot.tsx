import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
const csvDataUrl = import.meta.env.BASE_URL + "data/data.csv";

import {
  CompanyData,
  createTooltip,
  fetchCompanyData,
  filterAndSortData,
  debounce,
} from "@/utils/d3-helper";

import {
  renderScatterChart,
  addPointsToChart,
  addLegend,
} from "@/utils/d3-scatter";

const ScatterPlot = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<CompanyData[]>([]);
  const [filteredData, setFilteredData] = useState<CompanyData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [countries, setCountries] = useState<string[]>(["All"]);

  // Scatter plot specific states
  const [xAxis, setXAxis] = useState<string>("marketcap");
  const [yAxis, setYAxis] = useState<string>("price");
  const [colorTheme, setColorTheme] = useState<string>("blue");

  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Load CSV data
  useEffect(() => {
    const loadData = async () => {
      try {
        const formattedData = await fetchCompanyData(csvDataUrl);
        setData(formattedData);

        const uniqueCountries = [
          "All",
          ...Array.from(new Set(formattedData.map((d) => d.country))).sort(),
        ];
        setCountries(uniqueCountries);

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    loadData();

    // Create tooltip
    if (!tooltipRef.current) {
      tooltipRef.current = createTooltip();
    }

    return () => {
      // Clean up tooltip
      if (tooltipRef.current) {
        d3.select(tooltipRef.current).remove();
        tooltipRef.current = null;
      }
    };
  }, []);

  // Filter data based on selected country
  useEffect(() => {
    const filtered = filterAndSortData(data, selectedCountry, "rank");
    setFilteredData(filtered);
    setCurrentPage(0); // Reset to first page when filter changes
  }, [selectedCountry, data]);

  // Pagination data
  const paginatedData = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Total pages calculation
  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData, itemsPerPage]
  );

  // Render scatter plot
  useEffect(() => {
    if (paginatedData.length === 0 || !svgRef.current || !tooltipRef.current)
      return;

    const renderChart = () => {
      if (!svgRef.current || !tooltipRef.current) return;

      // Render the scatter chart
      const chartElements = renderScatterChart(svgRef.current, paginatedData, {
        xAxis,
        yAxis,
        colorTheme,
      });

      // Add points to the chart
      addPointsToChart(chartElements, paginatedData, {
        tooltip: d3.select(tooltipRef.current),
      });

      // Add title/legend
      addLegend(chartElements, {
        title: `${yAxis === "marketcap" ? "Market Cap" : "Stock Price"} vs ${
          xAxis === "marketcap" ? "Market Cap" : "Stock Price"
        }`,
      });
    };

    const renderChartDebounced = debounce(renderChart, 250);
    renderChart();

    // Handle window resize
    const resizeObserver = new ResizeObserver(() => {
      renderChartDebounced();
    });

    if (svgRef.current.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [paginatedData, xAxis, yAxis, colorTheme]);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
  };

  const handleXAxisChange = (value: string) => {
    setXAxis(value);
    // Make sure X and Y axes are different
    if (value === yAxis) {
      setYAxis(value === "marketcap" ? "price" : "marketcap");
    }
  };

  const handleYAxisChange = (value: string) => {
    setYAxis(value);
    // Make sure X and Y axes are different
    if (value === xAxis) {
      setXAxis(value === "marketcap" ? "price" : "marketcap");
    }
  };

  const handleColorThemeChange = (value: string) => {
    setColorTheme(value);
  };

  const handleItemsPerPageChange = (value: number[]) => {
    setItemsPerPage(value[0]);
    setCurrentPage(0); // Reset to first page
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return (
      <Card className=" bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-6 h-6 mr-2 animate-spin text-zinc-200" />
            <p className="text-zinc-200">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-none bg-zinc-900 border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-zinc-100">
            Video Game Companies Scatter Plot
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Interactive visualization comparing market cap and stock prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6 justify-center items-center">
            <div className="w-full sm:w-48 text-center mx-auto">
              <label className="text-sm font-medium block mb-2 text-zinc-300">
                Filter by Country
              </label>
              <Select
                value={selectedCountry}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className="h-9 mx-auto bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48 text-center mx-auto">
              <label className="text-sm font-medium block mb-2 text-zinc-300">
                X Axis
              </label>
              <Select value={xAxis} onValueChange={handleXAxisChange}>
                <SelectTrigger className="h-9 mx-auto bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="X Axis" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectItem value="marketcap">Market Cap</SelectItem>
                  <SelectItem value="price">Stock Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48 text-center mx-auto">
              <label className="text-sm font-medium block mb-2 text-zinc-300">
                Y Axis
              </label>
              <Select value={yAxis} onValueChange={handleYAxisChange}>
                <SelectTrigger className="h-9 mx-auto bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Y Axis" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectItem value="marketcap">Market Cap</SelectItem>
                  <SelectItem value="price">Stock Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48 text-center mx-auto">
              <label className="text-sm font-medium block mb-2 text-zinc-300">
                Color Theme
              </label>
              <Select value={colorTheme} onValueChange={handleColorThemeChange}>
                <SelectTrigger className="h-9 mx-auto bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-64 text-center mx-auto">
              <label className="text-sm font-medium block mb-2 text-zinc-300">
                Data points: {itemsPerPage}
              </label>
              <div className="px-2">
                <Slider
                  value={[itemsPerPage]}
                  min={10}
                  max={100}
                  step={10}
                  onValueChange={handleItemsPerPageChange}
                  className="mt-3 mx-auto"
                />
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto bg-zinc-800 rounded-md p-4">
            <svg ref={svgRef} className="w-full h-auto min-h-[500px]"></svg>
          </div>

          {filteredData.length > itemsPerPage && (
            <div className="flex-col items-center justify-between mt-4">
              <div className="text-sm text-zinc-400">
                Showing {currentPage * itemsPerPage + 1} to{" "}
                {Math.min(
                  (currentPage + 1) * itemsPerPage,
                  filteredData.length
                )}{" "}
                of {filteredData.length} companies
              </div>
              <div className="flex items-center justify-center space-x-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <span className="text-sm text-zinc-400">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage >= totalPages - 1}
                  className="border-zinc-700  hover:bg-zinc-800 hover:text-zinc-100 text-zinc-800"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-zinc-500 border-t border-zinc-800 pt-4">
          Scatter plot showing relationship between market cap and stock price
        </CardFooter>
      </Card>
    </div>
  );
};

export default ScatterPlot;

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
import {
  AlertCircle,
  Loader2,
  BarChart3,
  RefreshCcw,
  Info,
} from "lucide-react";
import {
  renderBarChart,
  addBarsToChart,
  addBarLabels,
  debounce,
} from "@/utils/d3-helper";
import {
  WorldBankData,
  IndicatorKey,
  indicators,
  majorCountries,
  availableYears,
  fetchWorldBankData,
  createWorldBankTooltip,
  formatNumber,
} from "@/utils/d3-fetch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const FetchPlot = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<d3.Selection<
    HTMLDivElement,
    unknown,
    any,
    any
  > | null>(null);
  const [data, setData] = useState<WorldBankData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [colorTheme, setColorTheme] = useState<string>("blue");
  const [selectedIndicator, setSelectedIndicator] =
    useState<IndicatorKey>("GDP (current US$)");
  const [year, setYear] = useState<string>("2020");

  // Format the current indicator for display
  const formattedIndicatorValue = useMemo(() => {
    if (data.length === 0) return "";

    // Get the highest value
    const maxValue = data[0].marketcap;
    return formatNumber(maxValue);
  }, [data]);

  // Fetch data handler
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the indicator code from our mapping
      const indicatorCode = indicators[selectedIndicator];

      // Use utility function from d3-fetch.ts
      const worldBankData = await fetchWorldBankData(
        majorCountries,
        indicatorCode,
        year
      );

      // Check if we got data back
      if (worldBankData.length === 0) {
        setError("No data available for the selected criteria");
        setData([]);
      } else {
        setData(worldBankData);

        // Show success toast using sonner
        toast.success("Data loaded successfully", {
          description: `Showing ${selectedIndicator} data for ${year}`,
          duration: 3000,
        });
      }
    } catch (err) {
      console.error("Failed to load World Bank data:", err);
      setError(
        "Failed to fetch data from World Bank API. Please try again later."
      );

      // Show error toast using sonner
      toast.error("Failed to load data", {
        description: "Could not fetch World Bank data at this time.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    // Create tooltip if it doesn't exist
    if (!tooltipRef.current) {
      tooltipRef.current = createWorldBankTooltip();
    }

    fetchData();

    return () => {
      // Clean up tooltip on unmount
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, [selectedIndicator, year]);

  useEffect(() => {
    if (data.length === 0 || !svgRef.current) return;

    const renderChart = () => {
      if (!svgRef.current) return;

      // Clear previous chart
      d3.select(svgRef.current).selectAll("*").remove();

      // Create a D3 tooltip if it doesn't exist yet
      if (!tooltipRef.current) {
        tooltipRef.current = createWorldBankTooltip();
      }

      const chartElements = renderBarChart(svgRef.current, data, {
        sortBy: "marketcap",
        colorTheme,
      });

      // Pass the D3 tooltip selection directly
      addBarsToChart(chartElements, data, {
        sortBy: "marketcap",
        tooltip: tooltipRef.current, // Use D3 selection directly
      });

      addBarLabels(chartElements, data, {
        sortBy: "marketcap",
        showCountryLabels: true, // Enable country labels for clearer visualization
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
  }, [data, colorTheme]);

  // Handle refresh button click
  const handleRefresh = () => {
    toast("Refreshing data...");
    fetchData();
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="shadow-lg bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 mb-4 animate-spin text-blue-500" />
            <p className="text-zinc-200">Loading World Bank data...</p>
            <p className="text-zinc-400 text-sm mt-2">This may take a moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="shadow-lg bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
            <p className="text-zinc-200 text-center mb-4">{error}</p>
            <Button
              variant="outline"
              className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
              onClick={handleRefresh}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-lg bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-center text-zinc-100 flex ">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                World Bank Data Visualization
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Interactive chart showing {selectedIndicator} for top economies
                ({year})
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    onClick={handleRefresh}
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>

        <CardContent>
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6 justify-center items-center">
            <div className="w-full sm:w-64 text-center mx-auto">
              <label className="text-sm font-medium block mb-2 text-zinc-300">
                Select Indicator
              </label>
              <Select
                value={selectedIndicator}
                onValueChange={(value) =>
                  setSelectedIndicator(value as IndicatorKey)
                }
              >
                <SelectTrigger className="h-9 mx-auto bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Select indicator" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  {Object.keys(indicators).map((indicator) => (
                    <SelectItem key={indicator} value={indicator}>
                      {indicator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48 text-center mx-auto">
              <label className="text-sm font-medium block mb-2 text-zinc-300">
                Select Year
              </label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-9 mx-auto bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TooltipProvider>
              <div className="w-full sm:w-48 text-center mx-auto">
                <label className="text-sm font-medium block mb-2 text-zinc-300">
                  Color Theme
                </label>
                <Select value={colorTheme} onValueChange={setColorTheme}>
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
            </TooltipProvider>
          </div>

          {/* Stats summary */}
          {data.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 cursor-help">
                      <div className="text-sm text-zinc-400 text-center">
                        Highest Value
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold text-white">
                          {formattedIndicatorValue}
                        </div>
                        <span className="text-sm text-zinc-500 mt-1">
                          {data[0]?.Name}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Highest value among the selected countries</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                <div className="text-sm text-zinc-400">Countries</div>
                <div className="text-2xl font-bold text-white">
                  {data.length}
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 sm:col-span-2 lg:col-span-1 cursor-help">
                      <div className="text-sm text-zinc-400">Indicator</div>
                      <div className="text-xl font-semibold text-white truncate">
                        {selectedIndicator}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>World Bank development indicator</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Chart */}
          <div className="w-full overflow-x-auto bg-zinc-800/70 rounded-md p-4 border border-zinc-700/30">
            <svg ref={svgRef} className="w-full h-auto min-h-[500px]"></svg>
          </div>
        </CardContent>

        <CardFooter className="text-xs text-zinc-500 pt-4 flex justify-between">
          <span>Data source: World Bank Open Data</span>
          <div className="flex items-center">
            <Info className="w-3 h-3 mr-1" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FetchPlot;

import { useEffect, useRef, useState } from "react";
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
import { Slider } from "@/components/ui/slider";
import { LineChart as LineChartIcon, RefreshCw, Info } from "lucide-react";
import {
  CompanyData,
  createTooltip,
  fetchCompanyData,
  debounce,
} from "@/utils/d3-helper";
import {
  prepareLineChartData,
  renderLineChart,
  addLineChartTooltips,
} from "@/utils/d3-linechart";

const csvDataUrl = import.meta.env.BASE_URL + "data/data.csv";

const LineChart = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Fix: Use a more flexible type for the tooltip ref
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<CompanyData[]>([]);
  const [processedData, setProcessedData] = useState<
    {
      country: string;
      companies: number;
      totalMarketCap: number;
      avgPrice: number;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>("marketcap");
  const [colorTheme, setColorTheme] = useState<string>("blue");
  const [metric, setMetric] = useState<"totalMarketCap" | "avgPrice">(
    "totalMarketCap"
  );
  const [topCountries, setTopCountries] = useState<number>(10);

  // Load CSV data
  useEffect(() => {
    const loadData = async () => {
      try {
        const formattedData = await fetchCompanyData(csvDataUrl);
        setData(formattedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    loadData();

    // Create tooltip div
    if (!tooltipRef.current) {
      tooltipRef.current = createTooltip();
    }

    return () => {
      // Clean up tooltip when component unmounts
      if (tooltipRef.current) {
        d3.select(tooltipRef.current).remove();
        tooltipRef.current = null;
      }
    };
  }, []);

  // Process data for line chart
  useEffect(() => {
    if (data.length === 0) return;

    const groupedData = prepareLineChartData(data, sortBy);
    setProcessedData(groupedData);
  }, [data, sortBy]);

  // Render chart
  useEffect(() => {
    if (processedData.length === 0 || !svgRef.current || !tooltipRef.current) {
      return;
    }

    const renderChartWithData = () => {
      if (!svgRef.current || !tooltipRef.current) return;

      const chartElements = renderLineChart(svgRef.current, processedData, {
        sortBy,
        colorTheme,
        metric,
        topCountries,
      });

      // Fix: Use a type assertion for the tooltip
      addLineChartTooltips(chartElements, processedData, {
        tooltip: d3.select(tooltipRef.current) as d3.Selection<
          HTMLDivElement,
          unknown,
          null,
          undefined
        >,
        metric,
      });
    };

    const renderChartDebounced = debounce(renderChartWithData, 250);
    renderChartWithData();

    const resizeObserver = new ResizeObserver(() => {
      renderChartDebounced();
    });

    if (svgRef.current.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [processedData, sortBy, colorTheme, metric, topCountries]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleColorThemeChange = (value: string) => {
    setColorTheme(value);
  };

  const handleMetricChange = (value: "totalMarketCap" | "avgPrice") => {
    setMetric(value);
  };

  const handleTopCountriesChange = (value: number[]) => {
    setTopCountries(value[0]);
  };

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-none shadow-none">
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
        <CardHeader className="pb-2 border-zinc-800">
          <CardTitle className="text-xl text-zinc-100 flex items-center">
            <LineChartIcon className="w-5 h-5 mr-2 text-blue-400" />
            Gaming Industry by Country
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Line chart visualization of gaming companies grouped by country
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 mb-6 justify-center items-center">
            <div className="w-full sm:w-48 text-center mx-auto">
              <label className="text-sm font-medium block mb-2 text-zinc-300">
                Sort Countries By
              </label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="h-9 mx-auto bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectItem value="marketcap">Market Cap</SelectItem>
                  <SelectItem value="companies">Number of Companies</SelectItem>
                  <SelectItem value="avgPrice">Average Stock Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48 text-center mx-auto">
              <label className="text-sm font-medium block mb-2 text-zinc-300">
                Display Metric
              </label>
              <Select
                value={metric}
                onValueChange={(v) =>
                  handleMetricChange(v as "totalMarketCap" | "avgPrice")
                }
              >
                <SelectTrigger className="h-9 mx-auto bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Choose metric" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectItem value="totalMarketCap">
                    Total Market Cap
                  </SelectItem>
                  <SelectItem value="avgPrice">Average Stock Price</SelectItem>
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
                Top Countries: {topCountries}
              </label>
              <div className="px-2">
                <Slider
                  value={[topCountries]}
                  min={5}
                  max={20}
                  step={1}
                  onValueChange={handleTopCountriesChange}
                  className="mt-3 mx-auto"
                />
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto bg-zinc-800 rounded-md p-4">
            <svg ref={svgRef} className="w-full h-auto min-h-[400px]"></svg>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-zinc-500 border-t border-zinc-800 pt-4 flex justify-between">
          <span>Data source: Gaming companies market capitalization</span>
          <div className="flex items-center">
            <Info className="w-3 h-3 mr-1" />
            <span>
              {metric === "totalMarketCap"
                ? "Total market cap by country"
                : "Average stock price by country"}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LineChart;

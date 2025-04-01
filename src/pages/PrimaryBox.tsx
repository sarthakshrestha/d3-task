import React, { useEffect, useRef, useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import {
  CompanyData,
  colorSchemes,
  createTooltip,
  showTooltip,
  hideTooltip,
  renderBarChart,
  addBarsToChart,
  addBarLabels,
  fetchCompanyData,
  filterAndSortData,
  debounce,
} from "@/utils/d3-helper";

const FirstChart = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<CompanyData[]>([]);
  const [filteredData, setFilteredData] = useState<CompanyData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("marketcap");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [countries, setCountries] = useState<string[]>(["All"]);

  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Color theme
  const [colorTheme, setColorTheme] = useState<string>("blue");

  // Load CSV data dynamically using our helper function
  useEffect(() => {
    const loadData = async () => {
      try {
        const formattedData = await fetchCompanyData("/src/data/data.csv");
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

    // Create tooltip div using our helper
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

  // Process data based on filters using our helper
  useEffect(() => {
    const filtered = filterAndSortData(data, selectedCountry, sortBy);
    setFilteredData(filtered);
    setCurrentPage(0); // Reset to first page when filter changes
  }, [selectedCountry, sortBy, data]);

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

  // Chart rendering using our helper functions
  useEffect(() => {
    if (paginatedData.length === 0 || !svgRef.current || !tooltipRef.current)
      return;

    const renderChartWithData = () => {
      // Render the base chart
      if (!svgRef.current || !tooltipRef.current) return;

      const chartElements = renderBarChart(svgRef.current, paginatedData, {
        sortBy,
        colorTheme,
      });

      // Add interactive bars
      addBarsToChart(chartElements, paginatedData, {
        sortBy,
        tooltip: d3.select(tooltipRef.current!),
      });

      // Add labels
      addBarLabels(chartElements, paginatedData, { sortBy });
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
  }, [paginatedData, colorTheme, sortBy]);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
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
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-6 h-6 mr-2 animate-spin" />
            <p>Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-zinc-800">
            Largest Video Game Companies by Market Cap
          </CardTitle>
          <CardDescription className="text-gray-600">
            Interactive visualization of top gaming companies sorted by market
            capitalization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6 justify-center items-center">
            <div className="w-full sm:w-48 text-center mx-auto">
              <label className="text-sm font-medium block mb-2">
                Filter by Country
              </label>
              <Select
                value={selectedCountry}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className="h-9 mx-auto">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48 text-center mx-auto">
              <label className="text-sm font-medium block mb-2">Sort By</label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="h-9 mx-auto">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Rank</SelectItem>
                  <SelectItem value="marketcap">Market Cap</SelectItem>
                  <SelectItem value="price">Stock Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48 text-center mx-auto">
              <label className="text-sm font-medium block mb-2">
                Color Theme
              </label>
              <Select value={colorTheme} onValueChange={handleColorThemeChange}>
                <SelectTrigger className="h-9 mx-auto">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-64 text-center mx-auto">
              <label className="text-sm font-medium block mb-2">
                Companies per page: {itemsPerPage}
              </label>
              <div className="px-2">
                <Slider
                  value={[itemsPerPage]}
                  min={5}
                  max={20}
                  step={5}
                  onValueChange={handleItemsPerPageChange}
                  className="mt-3 mx-auto"
                />
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto bg-gray-50 rounded-md p-4">
            <svg ref={svgRef} className="w-full h-auto"></svg>
          </div>

          {filteredData.length > itemsPerPage && (
            <div className="flex-col items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
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
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-gray-500 border-t pt-4">
          Data source: Gaming companies market capitalization
        </CardFooter>
      </Card>
    </div>
  );
};

export default FirstChart;

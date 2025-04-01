import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the type for the data
type CompanyData = {
  Rank: number;
  Name: string;
  Symbol: string;
  marketcap: number;
  price: number;
  country: string;
};

const FirstChart = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<CompanyData[]>([]);
  const [filteredData, setFilteredData] = useState<CompanyData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("marketcap");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [countries, setCountries] = useState<string[]>(["All"]);

  // Load CSV data dynamically using d3.csv
  useEffect(() => {
    d3.csv("/src/data/data.csv").then((parsedData) => {
      const formattedData: CompanyData[] = parsedData.map((row) => ({
        Rank: parseInt(row["Rank"] || "0"),
        Name: row["Name"] || "",
        Symbol: row["Symbol"] || "",
        marketcap: parseFloat(row["marketcap"] || "0"),
        price: parseFloat(row["price (USD)"] || "0"),
        country: row["country"] || "",
      }));

      setData(formattedData);
      setFilteredData(formattedData);

      const uniqueCountries = [
        "All",
        ...new Set(formattedData.map((d) => d.country)),
      ];
      setCountries(uniqueCountries);

      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    let filtered =
      selectedCountry === "All"
        ? [...data]
        : data.filter((d) => d.country === selectedCountry);

    filtered.sort((a, b) => {
      if (sortBy === "marketcap") return b.marketcap - a.marketcap;
      if (sortBy === "price") return b.price - a.price;
      return a.Rank - b.Rank;
    });

    setFilteredData(filtered);
  }, [selectedCountry, sortBy, data]);

  useEffect(() => {
    if (filteredData.length === 0) return;
    renderChart();

    window.addEventListener("resize", renderChart);
    return () => window.removeEventListener("resize", renderChart);
  }, [filteredData]);

  const renderChart = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const containerWidth = svgRef.current?.parentElement?.clientWidth || 800;
    const margin = { top: 30, right: 30, bottom: 70, left: 80 };
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const formatNumber = d3.format(",.2s");

    const g = svg
      .attr("width", containerWidth)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand<string>()
      .domain(filteredData.map((d) => d.Name))
      .range([0, width])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.marketcap) || 0])
      .range([height, 0]);

    const colorScale = d3
      .scaleOrdinal<string, string>()
      .domain([...new Set(data.map((d) => d.country))])
      .range(d3.schemeCategory10);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px");

    g.append("g")
      .call(d3.axisLeft(y).tickFormat((d) => formatNumber(d as number)))
      .selectAll("text")
      .style("font-size", "12px");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Market Cap (USD)");

    g.selectAll(".bar")
      .data(filteredData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.Name) || 0)
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", (d) => colorScale(d.country) || "#000")
      .attr("rx", 4)
      .attr("ry", 4)
      .transition()
      .duration(800)
      .attr("y", (d) => y(d.marketcap))
      .attr("height", (d) => height - y(d.marketcap));
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Largest Video Game Companies by Market Cap</CardTitle>
          <CardDescription>
            Interactive visualization of top gaming companies sorted by market
            capitalization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="w-48">
              <label className="text-sm font-medium block mb-2">
                Filter by Country
              </label>
              <Select
                value={selectedCountry}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
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

            <div className="w-48">
              <label className="text-sm font-medium block mb-2">Sort By</label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Rank</SelectItem>
                  <SelectItem value="marketcap">Market Cap</SelectItem>
                  <SelectItem value="price">Stock Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg ref={svgRef} className="w-full"></svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirstChart;

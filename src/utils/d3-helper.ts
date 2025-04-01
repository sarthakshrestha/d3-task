import * as d3 from "d3";

// Types
export type CompanyData = {
  Rank: number;
  Name: string;
  Symbol: string;
  marketcap: number;
  price: number;
  country: string;
};

// Color Schemes
export const colorSchemes = {
  blue: d3.interpolateBlues,
  green: d3.interpolateGreens,
  purple: d3.interpolatePurples,
  orange: d3.interpolateOranges,
  red: d3.interpolateReds,
};

// Formatting utilities
export const formatNumber = d3.format(",.2s");
export const formatCurrency = (value: number) => `$${formatNumber(value)}`;

// Tooltip utilities
export const createTooltip = () => {
  return d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "white")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("z-index", "10")
    .node();
};

export const showTooltip = (
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>,
  event: MouseEvent,
  data: CompanyData
) => {
  tooltip
    .style("visibility", "visible")
    .html(
      `
      <div>
        <strong>${data.Name} (${data.Symbol})</strong><br/>
        <span>Rank: ${data.Rank}</span><br/>
        <span>Country: ${data.country}</span><br/>
        <span>Market Cap: ${formatCurrency(data.marketcap)}</span><br/>
        <span>Stock Price: $${data.price.toFixed(2)}</span>
      </div>
    `
    )
    .style("left", `${event.pageX + 10}px`)
    .style("top", `${event.pageY - 28}px`);
};

export const hideTooltip = (
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>
) => {
  tooltip.style("visibility", "hidden");
};

// Chart rendering utilities
export const renderBarChart = (
  svgRef: SVGSVGElement,
  data: CompanyData[],
  options: {
    sortBy: string;
    colorTheme: string;
  }
) => {
  const svg = d3.select(svgRef);
  svg.selectAll("*").remove();

  const containerWidth = svgRef.parentElement?.clientWidth || 800;
  const margin = { top: 30, right: 30, bottom: 120, left: 80 };
  const width = containerWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create main group
  const g = svg
    .attr("width", containerWidth)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create scales
  const x = d3
    .scaleBand<string>()
    .domain(data.map((d) => d.Name))
    .range([0, width])
    .padding(0.3);

  const maxValue =
    d3.max(data, (d) =>
      options.sortBy === "marketcap" ? d.marketcap : d.price
    ) || 0;

  const y = d3
    .scaleLinear()
    .domain([0, maxValue * 1.1]) // Add 10% padding at top
    .range([height, 0]);

  // Create color scale
  const colorScale = d3
    .scaleSequential()
    .domain([0, data.length - 1])
    .interpolator(
      colorSchemes[options.colorTheme as keyof typeof colorSchemes]
    );

  // Add grid lines
  g.append("g")
    .attr("class", "grid-lines")
    .selectAll("line")
    .data(y.ticks(5))
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "rgba(0, 0, 0, 0.1)")
    .attr("stroke-dasharray", "3,3");

  // Add X axis
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "12px")
    .style("font-weight", "500");

  // Add Y axis
  g.append("g")
    .attr("class", "y-axis")
    .call(
      d3
        .axisLeft(y)
        .tickFormat((d) => formatCurrency(d as number))
        .ticks(5)
    )
    .selectAll("text")
    .style("font-size", "12px");

  // Add Y axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(
      options.sortBy === "marketcap" ? "Market Cap (USD)" : "Stock Price (USD)"
    );

  // Return objects needed for interactions
  return {
    g,
    x,
    y,
    height,
    colorScale,
    width,
  };
};

export const addBarsToChart = (
  chartElements: ReturnType<typeof renderBarChart>,
  data: CompanyData[],
  options: {
    sortBy: string;
    tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  }
) => {
  const { g, x, y, height, colorScale } = chartElements;
  const { sortBy, tooltip } = options;

  // Add bars with animations and interaction
  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.Name) || 0)
    .attr("width", x.bandwidth())
    .attr("y", height)
    .attr("height", 0)
    .attr("fill", (_, i) => colorScale(i))
    .attr("rx", 4)
    .attr("ry", 4)
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 0.8)
        .attr("stroke", "#000")
        .attr("stroke-width", 1);
      showTooltip(tooltip, event, d);
    })
    .on("mousemove", function (event, d) {
      showTooltip(tooltip, event, d);
    })
    .on("mouseleave", function () {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 1)
        .attr("stroke", "none");
      hideTooltip(tooltip);
    })
    .transition()
    .duration(800)
    .delay((_, i) => i * 50)
    .attr("y", (d) => y(sortBy === "marketcap" ? d.marketcap : d.price))
    .attr(
      "height",
      (d) => height - y(sortBy === "marketcap" ? d.marketcap : d.price)
    );
};

export const addBarLabels = (
  chartElements: ReturnType<typeof renderBarChart>,
  data: CompanyData[],
  options: {
    sortBy: string;
  }
) => {
  const { g, x, y } = chartElements;
  const { sortBy } = options;

  // Add value labels on top of bars
  g.selectAll(".value-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "value-label")
    .attr("x", (d) => (x(d.Name) || 0) + x.bandwidth() / 2)
    .attr("y", (d) => y(sortBy === "marketcap" ? d.marketcap : d.price) - 5)
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", "#555")
    .style("opacity", 0)
    .text((d) =>
      sortBy === "marketcap"
        ? formatCurrency(d.marketcap)
        : `$${d.price.toFixed(2)}`
    )
    .transition()
    .duration(800)
    .delay((_, i) => i * 50 + 400)
    .style("opacity", 1);

  // Add country labels
  g.selectAll(".country-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "country-label")
    .attr("x", (d) => (x(d.Name) || 0) + x.bandwidth() / 2)
    .attr("y", chartElements.height + 60)
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", "#777")
    .text((d) => d.country);
};

// Data processing utilities
export const fetchCompanyData = async (
  csvUrl: string
): Promise<CompanyData[]> => {
  try {
    const parsedData = await d3.csv(csvUrl);

    return parsedData.map((row) => ({
      Rank: parseInt(row["Rank"] || "0"),
      Name: row["Name"] || "",
      Symbol: row["Symbol"] || "",
      marketcap: parseFloat(row["marketcap"] || "0"),
      price: parseFloat(row["price (USD)"] || "0"),
      country: row["country"] || "",
    }));
  } catch (error) {
    console.error("Error loading data:", error);
    return [];
  }
};

export const filterAndSortData = (
  data: CompanyData[],
  selectedCountry: string,
  sortBy: string
): CompanyData[] => {
  if (data.length === 0) return [];

  let filtered =
    selectedCountry === "All"
      ? [...data]
      : data.filter((d) => d.country === selectedCountry);

  filtered.sort((a, b) => {
    if (sortBy === "marketcap") return b.marketcap - a.marketcap;
    if (sortBy === "price") return b.price - a.price;
    return a.Rank - b.Rank;
  });

  return filtered;
};

// General utilities
export const debounce = (fn: Function, ms = 100) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

import * as d3 from "d3";
import { CompanyData, colorSchemes, formatCurrency } from "./d3-helper";

// Chart rendering utilities for scatter plots
export const renderScatterChart = (
  svgRef: SVGSVGElement,
  data: CompanyData[],
  options: {
    xAxis: string;
    yAxis: string;
    colorTheme: string;
  }
) => {
  const svg = d3.select(svgRef);
  svg.selectAll("*").remove();

  const containerWidth = svgRef.parentElement?.clientWidth || 800;
  const margin = { top: 40, right: 30, bottom: 70, left: 80 };
  const width = containerWidth - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create main group
  const g = svg
    .attr("width", containerWidth)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Get values based on selected axes
  const getXValue = (d: CompanyData) =>
    options.xAxis === "marketcap" ? d.marketcap : d.price;

  const getYValue = (d: CompanyData) =>
    options.yAxis === "marketcap" ? d.marketcap : d.price;

  // Create scales
  const xMax = d3.max(data, getXValue) || 0;
  const yMax = d3.max(data, getYValue) || 0;

  // Use log scale for better visualization of large ranges
  const x = d3
    .scaleLog()
    .domain([1, xMax * 1.1]) // Add 10% padding, start from 1 to avoid log(0)
    .range([0, width])
    .nice();

  const y = d3
    .scaleLog()
    .domain([1, yMax * 1.1]) // Add 10% padding, start from 1 to avoid log(0)
    .range([height, 0])
    .nice();

  // Create color scale based on company rank
  const colorScale = d3
    .scaleSequential()
    .domain([1, data.length])
    .interpolator(
      colorSchemes[options.colorTheme as keyof typeof colorSchemes]
    );

  // Add grid lines for dark background
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
    .attr("stroke", "rgba(255, 255, 255, 0.1)")
    .attr("stroke-dasharray", "3,3");

  g.append("g")
    .attr("class", "grid-lines")
    .selectAll("line")
    .data(x.ticks(5))
    .enter()
    .append("line")
    .attr("y1", 0)
    .attr("y2", height)
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("stroke", "rgba(255, 255, 255, 0.1)")
    .attr("stroke-dasharray", "3,3");

  // Add X axis with white text
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(x)
        .tickFormat((d) => formatCurrency(d as number))
        .ticks(5)
    )
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "12px")
    .style("font-weight", "500")
    .style("fill", "#e5e7eb");

  // Style X-axis lines for dark mode
  g.selectAll(".x-axis line, .x-axis path").style("stroke", "#6b7280");

  // Add X axis label
  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 60)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("fill", "#f3f4f6")
    .text(
      options.xAxis === "marketcap" ? "Market Cap (USD)" : "Stock Price (USD)"
    );

  // Add Y axis with white text
  g.append("g")
    .attr("class", "y-axis")
    .call(
      d3
        .axisLeft(y)
        .tickFormat((d) => formatCurrency(d as number))
        .ticks(5)
    )
    .selectAll("text")
    .style("font-size", "12px")
    .style("fill", "#e5e7eb");

  // Style Y-axis lines for dark mode
  g.selectAll(".y-axis line, .y-axis path").style("stroke", "#6b7280");

  // Add Y axis label with white text
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("fill", "#f3f4f6")
    .text(
      options.yAxis === "marketcap" ? "Market Cap (USD)" : "Stock Price (USD)"
    );

  return {
    g,
    x,
    y,
    height,
    width,
    colorScale,
    getXValue,
    getYValue,
  };
};

export const addPointsToChart = (
  chartElements: ReturnType<typeof renderScatterChart>,
  data: CompanyData[],
  options: {
    tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  }
) => {
  const { g, x, y, height, colorScale, getXValue, getYValue } = chartElements;
  const { tooltip } = options;

  // Add scatter points with animations and interaction
  g.selectAll(".point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("cx", (d) => x(Math.max(1, getXValue(d)))) // Ensure min value is 1 for log scale
    .attr("cy", height) // Start from bottom for animation
    .attr("r", 0) // Start with radius 0 for animation
    .attr("fill", (d) => colorScale(d.Rank))
    .attr("opacity", 0.8)
    .attr("stroke", "#525252")
    .attr("stroke-width", 1)
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 8)
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 2);

      // Show tooltip with company information
      tooltip
        .style("visibility", "visible")
        .html(
          `
          <div>
            <strong style="color: #93c5fd">${d.Name} (${d.Symbol})</strong><br/>
            <span>Rank: ${d.Rank}</span><br/>
            <span>Country: ${d.country}</span><br/>
            <span>Market Cap: ${formatCurrency(d.marketcap)}</span><br/>
            <span>Stock Price: $${d.price.toFixed(2)}</span>
          </div>
        `
        )
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseleave", function () {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 6)
        .attr("stroke", "#525252")
        .attr("stroke-width", 1);

      tooltip.style("visibility", "hidden");
    })
    .transition()
    .duration(800)
    .delay((_, i) => i * 30)
    .attr("cy", (d) => y(Math.max(1, getYValue(d)))) // Ensure min value is 1 for log scale
    .attr("r", 6);
};

export const addLegend = (
  chartElements: ReturnType<typeof renderScatterChart>,
  options: {
    title: string;
  }
) => {
  const { g, width } = chartElements;

  // Add chart title
  g.append("text")
    .attr("x", width / 2)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("fill", "#f3f4f6")
    .text(options.title);
};

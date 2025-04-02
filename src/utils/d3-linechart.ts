import * as d3 from "d3";
import {
  CompanyData,
  colorSchemes,
  formatCurrency,
  formatNumber,
} from "./d3-helper";

// Group data by country for line chart
export const prepareLineChartData = (
  data: CompanyData[],
  sortBy: string = "marketcap"
): {
  country: string;
  companies: number;
  totalMarketCap: number;
  avgPrice: number;
}[] => {
  // Group by country
  const groupedByCountry = d3.group(data, (d) => d.country);

  // Calculate metrics for each country
  const countryData = Array.from(groupedByCountry).map(
    ([country, companies]) => {
      const totalMarketCap = d3.sum(companies, (d) => d.marketcap);
      const avgPrice = d3.mean(companies, (d) => d.price) || 0;

      return {
        country,
        companies: companies.length,
        totalMarketCap,
        avgPrice,
      };
    }
  );

  // Sort the data based on the chosen metric
  if (sortBy === "marketcap") {
    countryData.sort((a, b) => b.totalMarketCap - a.totalMarketCap);
  } else if (sortBy === "companies") {
    countryData.sort((a, b) => b.companies - a.companies);
  } else if (sortBy === "avgPrice") {
    countryData.sort((a, b) => b.avgPrice - a.avgPrice);
  }

  return countryData;
};

// Render the line chart
export const renderLineChart = (
  svgRef: SVGSVGElement,
  data: {
    country: string;
    companies: number;
    totalMarketCap: number;
    avgPrice: number;
  }[],
  options: {
    sortBy: string;
    colorTheme: string;
    metric: "totalMarketCap" | "avgPrice";
    topCountries: number;
  }
) => {
  const svg = d3.select(svgRef);
  svg.selectAll("*").remove();

  // Take only the top N countries based on the selected metric
  const topData = data.slice(0, options.topCountries);

  const containerWidth = svgRef.parentElement?.clientWidth || 800;
  const margin = { top: 30, right: 150, bottom: 90, left: 80 };
  const width = containerWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create main group
  const g = svg
    .attr("width", containerWidth)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define scales
  const x = d3
    .scalePoint<string>()
    .domain(topData.map((d) => d.country))
    .range([0, width])
    .padding(0.5);

  const metricValues = topData.map((d) =>
    options.metric === "totalMarketCap" ? d.totalMarketCap : d.avgPrice
  );
  const yMax = d3.max(metricValues) || 0;

  const y = d3
    .scaleLinear()
    .domain([0, yMax * 1.1]) // Add 10% padding at top
    .range([height, 0]);

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
    .attr("stroke", "rgba(255, 255, 255, 0.1)")
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
    .style("fill", "#e5e7eb");

  // Style X-axis lines
  g.selectAll(".x-axis line, .x-axis path").style("stroke", "#6b7280");

  // Add Y axis
  g.append("g")
    .attr("class", "y-axis")
    .call(
      d3
        .axisLeft(y)
        .tickFormat((d) => {
          const value = d as number;
          return options.metric === "totalMarketCap"
            ? formatCurrency(value)
            : `$${value.toFixed(2)}`;
        })
        .ticks(5)
    )
    .selectAll("text")
    .style("font-size", "12px")
    .style("fill", "#e5e7eb");

  // Style Y-axis lines
  g.selectAll(".y-axis line, .y-axis path").style("stroke", "#6b7280");

  // Add Y axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("fill", "#f3f4f6")
    .text(
      options.metric === "totalMarketCap"
        ? "Total Market Cap (USD)"
        : "Average Stock Price (USD)"
    );

  // Define color scale
  const colorInterpolator =
    colorSchemes[options.colorTheme as keyof typeof colorSchemes];
  const colorScale = (index: number) => {
    return colorInterpolator(index / (topData.length - 1 || 1));
  };

  // Create line generator
  const line = d3
    .line<{ country: string; value: number }>()
    .x((d) => x(d.country) || 0)
    .y((d) => y(d.value))
    .curve(d3.curveMonotoneX);

  // Create area generator for area under the line
  const area = d3
    .area<{ country: string; value: number }>()
    .x((d) => x(d.country) || 0)
    .y0(height)
    .y1((d) => y(d.value))
    .curve(d3.curveMonotoneX);

  // Create points for connecting with line
  const lineData = topData.map((d) => ({
    country: d.country,
    value: options.metric === "totalMarketCap" ? d.totalMarketCap : d.avgPrice,
  }));

  // Add the area under the line
  g.append("path")
    .datum(lineData)
    .attr("fill", `url(#line-gradient)`)
    .attr("opacity", 0.3)
    .attr("d", area)
    .attr("class", "area");

  // Create gradient for area
  const gradient = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "line-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0)
    .attr("y1", y(0))
    .attr("x2", 0)
    .attr("y2", y(yMax * 0.8));

  // Add color stops to gradient
  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colorInterpolator(0.2))
    .attr("stop-opacity", 0);

  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colorInterpolator(0.8))
    .attr("stop-opacity", 0.5);

  // Draw the line with animation
  const path = g
    .append("path")
    .datum(lineData)
    .attr("fill", "none")
    .attr("stroke", colorInterpolator(0.7))
    .attr("stroke-width", 3)
    .attr("class", "line")
    .attr("d", line);

  // Add animated drawing effect
  const pathLength = path.node()!.getTotalLength();
  path
    .attr("stroke-dasharray", pathLength + " " + pathLength)
    .attr("stroke-dashoffset", pathLength)
    .transition()
    .duration(1500)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  // Add data points with hover effect
  g.selectAll(".data-point")
    .data(lineData)
    .enter()
    .append("circle")
    .attr("class", "data-point")
    .attr("cx", (d) => x(d.country) || 0)
    .attr("cy", (d) => y(d.value))
    .attr("r", 6)
    .attr("fill", colorInterpolator(0.5))
    .attr("stroke", "#18181b")
    .attr("stroke-width", 2)
    .style("opacity", 0)
    .transition()
    .delay((_, i) => i * 150 + 500)
    .duration(300)
    .style("opacity", 1);

  // Add value labels above points
  g.selectAll(".value-label")
    .data(lineData)
    .enter()
    .append("text")
    .attr("class", "value-label")
    .attr("x", (d) => x(d.country) || 0)
    .attr("y", (d) => y(d.value) - 15)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .style("fill", "#d1d5db")
    .style("opacity", 0)
    .text((d) =>
      options.metric === "totalMarketCap"
        ? formatNumber(d.value)
        : `$${d.value.toFixed(1)}`
    )
    .transition()
    .delay((_, i) => i * 150 + 800)
    .duration(300)
    .style("opacity", 1);

  // Add legend
  const legend = g
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + 20}, 0)`);

  // Add legend title
  legend
    .append("text")
    .attr("x", 0)
    .attr("y", 15)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("fill", "#e5e7eb")
    .text("Top Countries");

  // Add legend items for countries
  topData.forEach((d, i) => {
    const legendItem = legend
      .append("g")
      .attr("transform", `translate(0, ${i * 25 + 35})`);

    legendItem.append("circle").attr("r", 6).attr("fill", colorScale(i));

    legendItem
      .append("text")
      .attr("x", 15)
      .attr("y", 4)
      .style("font-size", "12px")
      .style("fill", "#d1d5db")
      .text(d.country);

    legendItem
      .append("text")
      .attr("x", 15)
      .attr("y", 18)
      .style("font-size", "10px")
      .style("fill", "#9ca3af")
      .text(`${d.companies} companies`);
  });

  return {
    g,
    x,
    y,
    height,
    width,
    topData,
    colorScale,
  };
};

export const addLineChartTooltips = (
  chartElements: ReturnType<typeof renderLineChart>,
  processedData: {
    country: string;
    companies: number;
    totalMarketCap: number;
    avgPrice: number;
  }[],
  options: {
    tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    metric: "totalMarketCap" | "avgPrice";
  }
) => {
  const { g, topData } = chartElements;
  const { tooltip } = options;
  console.log(processedData);

  g.selectAll(".data-point")
    .on("mouseover", function (event, d: any) {
      // Find the full data for this country
      const countryData = topData.find((item) => item.country === d.country);

      if (!countryData) return;

      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 8)
        .attr("stroke-width", 2);

      tooltip
        .style("visibility", "visible")
        .html(
          `
          <div>
            <strong style="color: #93c5fd">${d.country}</strong><br/>
            <span>Companies: ${countryData.companies}</span><br/>
            <span>Total Market Cap: ${formatCurrency(
              countryData.totalMarketCap
            )}</span><br/>
            <span>Avg Stock Price: $${countryData.avgPrice.toFixed(2)}</span>
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
        .attr("stroke-width", 2);

      tooltip.style("visibility", "hidden");
    });

  // Add interactive behavior to line
  g.select(".area")
    .on("mouseenter", () => {
      g.selectAll(".data-point").transition().duration(200).attr("r", 7);
    })
    .on("mouseleave", () => {
      g.selectAll(".data-point").transition().duration(200).attr("r", 6);
    });
};

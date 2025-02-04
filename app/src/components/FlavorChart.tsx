import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import useResizeObserver from "@react-hook/resize-observer";

interface Cocktail {
  name: string;
  sweetness: number;
  booziness: number;
}

interface FlavorChartProps {
  cocktails?: Cocktail[];
  onSelect?: (sweetness: number | null, booziness: number | null) => void;
  showExamples?: boolean;
}

export default function FlavorChart({
  cocktails = [],
  onSelect,
  showExamples = false,
}: FlavorChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
    sweetness: number;
    booziness: number;
  } | null>(null);

  // Handle resize with aspect ratio
  useResizeObserver(chartRef, (entry) => {
    const { width } = entry.contentRect;
    // Maintain a 16:9 aspect ratio based on width
    const height = Math.min(width * (9 / 16), window.innerHeight * 0.8);
    setDimensions({ width, height });
  });

  // Add vertical margin for labels
  const margin = { top: 20, right: 0, bottom: 20, left: 0 };

  // Add this function to handle click/drag events
  const handleChartInteraction = useCallback(
    (event: any) => {
      if (!chartRef.current) return;

      const { width, height } = dimensions;
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Get mouse/touch position relative to the chart
      const rect = chartRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top - margin.top;

      // Update scales to use -1 to 1
      const xScale = d3.scaleLinear().domain([-1, 1]).range([0, innerWidth]);
      const yScale = d3.scaleLinear().domain([-1, 1]).range([innerHeight, 0]);

      const sweetness = xScale.invert(x);
      const booziness = yScale.invert(y);

      // Only record selection if within valid range
      if (
        sweetness >= -1 &&
        sweetness <= 1 &&
        booziness >= -1 &&
        booziness <= 1
      ) {
        const point = {
          x,
          y: y + margin.top,
          sweetness: Math.round(sweetness * 10) / 10,
          booziness: Math.round(booziness * 10) / 10,
        };

        setSelectedPoint(point);
        if (onSelect) {
          onSelect(point.sweetness, point.booziness);
        }
      } else {
        setSelectedPoint(null);
        if (onSelect) {
          onSelect(null, null);
        }
      }
    },
    [dimensions, onSelect],
  );

  // Add this useEffect to handle event listeners
  useEffect(() => {
    if (!chartRef.current) return;

    const svg = d3.select(chartRef.current).select("svg");

    // Add event listeners
    svg.on("click", handleChartInteraction).on("mousemove", (event) => {
      if (event.buttons === 1) {
        // Only when dragging
        handleChartInteraction(event);
      }
    });

    return () => {
      svg.on("click", null).on("mousemove", null);
    };
  }, [handleChartInteraction]);

  // Add example cocktails
  const exampleCocktails = showExamples
    ? [
        { name: "Margarita", sweetness: -0.7, booziness: 0.7 }, // Lime-forward
        { name: "Mojito", sweetness: 0.1, booziness: 0.3 }, // Balanced with mint/sugar
        { name: "Old Fashioned", sweetness: 0.4, booziness: 0.9 }, // Sugar cube with bitters
        { name: "Cosmopolitan", sweetness: 0.3, booziness: 0.4 }, // Cranberry/orange sweetness
        { name: "Martini", sweetness: -0.1, booziness: 0.9 }, // Dry vermouth
        { name: "Manhattan", sweetness: 0.5, booziness: 0.9 }, // Sweet vermouth
        { name: "Daiquiri", sweetness: -0.5, booziness: 0.6 }, // Lime/sugar balance
        { name: "Whiskey Sour", sweetness: 0.0, booziness: 0.6 }, // Lemon/sugar mix
        { name: "Negroni", sweetness: -0.5, booziness: 0.8 }, // Bitter Campari
        { name: "Aperol Spritz", sweetness: 0.3, booziness: -0.3 }, // Aperol's mild sweetness
        { name: "Gin & Tonic", sweetness: -0.1, booziness: 0.2 }, // Tonic's slight sweetness
        // { name: "Moscow Mule", sweetness: 0.2, booziness: 0.3 }, // Ginger beer sweetness
        { name: "Piña Colada", sweetness: 0.9, booziness: -0.5 }, // Very sweet coconut/pineapple
        { name: "Bloody Mary", sweetness: -0.8, booziness: 0.2 }, // Savory/umami profile
        // { name: "Mai Tai", sweetness: 0.5, booziness: 0.6 }, // Orgeat syrup sweetness
        // { name: "Long Island Iced Tea", sweetness: 0.7, booziness: 0.8 }, // Multiple liqueurs
        // { name: "French 75", sweetness: 0.1, booziness: 0.4 }, // Lemon/champagne balance
        // { name: "Sazerac", sweetness: 0.2, booziness: 0.9 }, // Peychaud's bitters/sugar
        // { name: "White Russian", sweetness: 0.6, booziness: 0.5 }, // Cream and coffee liqueur
        // { name: "Espresso Martini", sweetness: 0.4, booziness: 0.7 }, // Coffee liqueur sweetness
      ]
    : [];

  // Combine provided cocktails with examples
  const allCocktails = [...cocktails, ...exampleCocktails];

  useEffect(() => {
    if (!chartRef.current || dimensions.width === 0) return;

    const { width, height } = dimensions;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current).select("svg");
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .style("background", "transparent");

    // Update scales to use -1 to 1
    const xScale = d3.scaleLinear().domain([-1, 1]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([-1, 1]).range([innerHeight, 0]);

    // Create chart group with vertical margin
    const chart = svg
      .append("g")
      .attr("transform", `translate(0,${margin.top})`);

    // Add horizontal line (X-axis) in the middle
    chart
      .append("line")
      .attr("x1", 0)
      .attr("y1", yScale(0))
      .attr("x2", innerWidth)
      .attr("y2", yScale(0))
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    // Add vertical line (Y-axis) in the middle
    chart
      .append("line")
      .attr("x1", xScale(0))
      .attr("y1", 0)
      .attr("x2", xScale(0))
      .attr("y2", innerHeight)
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    // Update sweetnessZones and boozinessZones
    const sweetnessZones = [
      { value: -1, label: "Very Sour" },
      { value: -0.5, label: "Tart" },
      { value: 0, label: "Balanced" },
      { value: 0.5, label: "Sweet" },
      { value: 1, label: "Very Sweet" },
    ];

    const boozinessZones = [
      { value: -1, label: "Very Light" },
      { value: -0.5, label: "Light" },
      { value: 0, label: "Medium" },
      { value: 0.5, label: "Strong" },
      { value: 1, label: "Very Strong" },
    ];

    // Update zoneValues
    const zoneValues = [-1, -0.5, 0, 0.5, 1];

    // Sweetness zone labels
    sweetnessZones.forEach((zone) => {
      chart
        .append("text")
        .attr("x", xScale(zone.value))
        .attr("y", yScale(0) + 20)
        .text(zone.label)
        .style(
          "text-anchor",
          zone.value === -1 ? "start" : zone.value === 1 ? "end" : "middle",
        )
        .style("fill", "white")
        .style("font-size", "0.8em");
    });

    // Booziness zone labels
    boozinessZones.forEach((zone) => {
      chart
        .append("text")
        .attr("x", xScale(0) - 10)
        .attr("y", yScale(zone.value) + 5)
        .text(zone.label)
        .style("text-anchor", "end")
        .style("fill", "white")
        .style("font-size", "0.8em");
    });

    // Zone lines
    zoneValues.forEach((value) => {
      if (value !== 0) {
        // Skip center line
        chart
          .append("line")
          .attr("x1", xScale(value))
          .attr("y1", 0)
          .attr("x2", xScale(value))
          .attr("y2", innerHeight)
          .attr("stroke", "rgba(255, 255, 255, 0.2)")
          .attr("stroke-width", 1);
      }
    });

    zoneValues.forEach((value) => {
      if (value !== 0) {
        // Skip center line
        chart
          .append("line")
          .attr("x1", 0)
          .attr("y1", yScale(value))
          .attr("x2", innerWidth)
          .attr("y2", yScale(value))
          .attr("stroke", "rgba(255, 255, 255, 0.2)")
          .attr("stroke-width", 1);
      }
    });

    // Create color gradient
    const gradient = chart
      .append("defs")
      .append("linearGradient")
      .attr("id", "chart-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    // Add gradient stops
    gradient
      .append("stop")
      .attr("offset", "0%")
      .style("stop-color", "#fde047") // Brighter yellow
      .style("stop-opacity", 0.5); // Increased opacity

    gradient
      .append("stop")
      .attr("offset", "25%")
      .style("stop-color", "#4ade80") // Brighter green
      .style("stop-opacity", 0.5); // Increased opacity

    gradient
      .append("stop")
      .attr("offset", "50%")
      .style("stop-color", "#7dd3fc") // Brighter light blue
      .style("stop-opacity", 0.5); // Increased opacity

    gradient
      .append("stop")
      .attr("offset", "75%")
      .style("stop-color", "#f472b6") // Brighter pink
      .style("stop-opacity", 0.5); // Increased opacity

    gradient
      .append("stop")
      .attr("offset", "100%")
      .style("stop-color", "#dc2626") // Brighter red
      .style("stop-opacity", 0.5); // Increased opacity

    // Add gradient background
    chart
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .style("fill", "url(#chart-gradient)")
      .style("opacity", 0.5); // Increased opacity

    // Add cocktail points and labels
    const cocktailGroup = chart
      .selectAll(".cocktail-group")
      .data(allCocktails)
      .enter()
      .append("g")
      .attr("class", "cocktail-group")
      .attr(
        "transform",
        (d) => `translate(${xScale(d.sweetness)},${yScale(d.booziness)})`,
      );

    // Add circle for each cocktail
    cocktailGroup
      .append("circle")
      .attr("r", 5)
      .attr("fill", "white")
      .style("opacity", (d) => (exampleCocktails.includes(d) ? 0.5 : 1))
      .append("title")
      .text((d) => d.name);

    // Add labels for example cocktails
    if (showExamples) {
      cocktailGroup
        .filter((d) => exampleCocktails.includes(d))
        .append("text")
        .attr("x", (d) => (d.sweetness > 0.5 ? -8 : 8))
        .attr("y", -8)
        .text((d) => d.name)
        .style("fill", "white")
        .style("font-size", "0.7em")
        .style("opacity", 0.5)
        .style("text-anchor", (d) => (d.sweetness > 0.5 ? "end" : "start"))
        .style("pointer-events", "none");
    }

    // Add selection circle
    const selectionCircle = svg
      .append("circle")
      .attr("r", 5)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("fill", "transparent")
      .style("pointer-events", "none")
      .style("display", "none");

    // Update selection circle position when selectedPoint changes
    if (selectedPoint) {
      selectionCircle
        .attr("cx", selectedPoint.x)
        .attr("cy", selectedPoint.y)
        .style("display", "block");
    } else {
      selectionCircle.style("display", "none");
    }
  }, [dimensions, allCocktails, selectedPoint, onSelect, showExamples]);

  return (
    <div>
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: "16/9",
          minHeight: "200px",
          padding: 0,
        }}
      >
        <svg style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

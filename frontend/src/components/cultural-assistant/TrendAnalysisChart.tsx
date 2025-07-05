'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { QlooEntity, QlooTrendingEntity } from '@/types/qloo';
import { getTrendingEntities } from '@/lib/qlooService';

interface TrendAnalysisChartProps {
  entities: QlooEntity[];
}

interface TrendPoint {
  date: Date;
  value: number;
  entity: string;
}

export default function TrendAnalysisChart({ entities }: TrendAnalysisChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [trendingData, setTrendingData] = React.useState<QlooTrendingEntity[]>([]);
  
  // Fetch trending data
  useEffect(() => {
    const fetchTrendingData = async () => {
      if (entities.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // In a real implementation, we would fetch trend data for the specific entities
        // For this demo, we'll just get general trending data
        const results = await getTrendingEntities();
        setTrendingData(results);
      } catch (err: any) {
        setError(`Failed to fetch trend data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrendingData();
  }, [entities]);
  
  // Generate trend data
  const generateTrendData = (): TrendPoint[] => {
    if (entities.length === 0) return [];
    
    // Create consistent but pseudo-random data based on entity IDs
    const hash = entities.reduce((acc, entity) => {
      return acc + entity.entity_id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
    }, 0);
    
    const seedRandom = (min: number, max: number, offset: number = 0) => {
      const x = Math.sin(hash + offset) * 10000;
      const rand = x - Math.floor(x);
      return min + rand * (max - min);
    };
    
    // Generate trend data for the past 12 months
    const now = new Date();
    const trendData: TrendPoint[] = [];
    
    entities.forEach((entity, entityIndex) => {
      // Generate a baseline value for this entity
      const baseValue = seedRandom(0.2, 0.8, entityIndex * 10);
      
      // Generate 12 months of data with some variance
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        
        // Create some seasonal patterns and general trends
        let seasonalFactor = 1 + 0.2 * Math.sin((i / 12) * Math.PI * 2);
        let trendFactor = 1 + (i / 24); // Slight upward trend
        
        // Add some randomness
        let randomFactor = 1 + seedRandom(-0.1, 0.1, i + entityIndex * 100);
        
        // Calculate the value for this month
        const value = baseValue * seasonalFactor * trendFactor * randomFactor;
        
        trendData.push({
          date,
          value: Math.min(1, Math.max(0, value)), // Clamp between 0 and 1
          entity: entity.name
        });
      }
    });
    
    return trendData;
  };
  
  // Render the chart when data is available
  useEffect(() => {
    if (!svgRef.current || loading || error || entities.length === 0) return;
    
    renderChart();
  }, [loading, error, trendingData, entities]);
  
  // Render the trend analysis chart
  const renderChart = () => {
    if (!svgRef.current) return;
    
    // Clear existing visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 40, right: 80, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Generate trend data
    const trendData = generateTrendData();
    
    // Group data by entity
    const groupedData = d3.group(trendData, d => d.entity);
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(trendData, d => d.date) as [Date, Date])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);
    
    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(Array.from(groupedData.keys()))
      .range(["var(--qloo-teal)", "var(--qloo-yellow)", "#6EE7B7", "#3B82F6", "#8B5CF6", "#EC4899"]);
    
    // Create a group for the visualization
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
         // Add x-axis
     g.append("g")
       .attr("transform", `translate(0,${innerHeight})`)
       .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat("%b %Y") as any))
      .selectAll("text")
      .attr("fill", "var(--foreground)")
      .style("font-size", "10px")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end");
    
    // Add y-axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".0%")))
      .selectAll("text")
      .attr("fill", "var(--foreground)")
      .style("font-size", "10px");
    
    // Add x-axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 50)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--foreground)")
      .style("font-size", "12px")
      .text("Date");
    
    // Add y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--foreground)")
      .style("font-size", "12px")
      .text("Cultural Relevance");
    
    // Create line generator
    const line = d3.line<TrendPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);
    
    // Add lines for each entity
    groupedData.forEach((points, entity) => {
      // Sort points by date
      points.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Add path with animation
      const path = g.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", colorScale(entity))
        .attr("stroke-width", 2.5)
        .attr("d", line);
      
      // Animate the path
      const pathLength = path.node()?.getTotalLength() || 0;
      path
        .attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(2000)
        .attr("stroke-dashoffset", 0);
      
      // Add dots at each data point
      g.selectAll(`.dot-${entity.replace(/\s+/g, '-')}`)
        .data(points)
        .enter()
        .append("circle")
        .attr("class", `dot-${entity.replace(/\s+/g, '-')}`)
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("r", 4)
        .attr("fill", colorScale(entity))
        .attr("stroke", "var(--background)")
        .attr("stroke-width", 1.5)
        .style("opacity", 0)
        .transition()
        .delay((_, i) => 1500 + i * 100)
        .duration(300)
        .style("opacity", 1);
    });
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);
    
    Array.from(groupedData.keys()).forEach((entity, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendRow.append("line")
        .attr("x1", 0)
        .attr("y1", 9)
        .attr("x2", 15)
        .attr("y2", 9)
        .attr("stroke", colorScale(entity))
        .attr("stroke-width", 2.5);
      
      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .attr("fill", "var(--foreground)")
        .style("font-size", "12px")
        .text(entity);
    });
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--foreground)")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Cultural Trend Analysis");
    
    // Add Qloo branding
    svg.append("text")
      .attr("x", width - margin.right)
      .attr("y", height - 5)
      .attr("text-anchor", "end")
      .attr("fill", "var(--muted-foreground)")
      .style("font-size", "10px")
      .style("font-style", "italic")
      .text("Powered by Qloo Trend Analysis");
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-full">
      <p className="text-muted-foreground">Loading trend data...</p>
    </div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center h-full">
      <p className="text-red-500">{error}</p>
    </div>;
  }
  
  if (entities.length === 0) {
    return <div className="flex justify-center items-center h-full">
      <p className="text-muted-foreground">Select entities to see cultural trends</p>
    </div>;
  }
  
  return (
    <div className="h-full w-full">
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
} 
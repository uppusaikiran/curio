'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { QlooEntity } from '@/types/qloo';

interface CrossCategoryAffinityProps {
  entities: QlooEntity[];
}

interface AffinityData {
  category: string;
  subcategories: {
    name: string;
    affinity: number;
  }[];
}

export default function CrossCategoryAffinity({ entities }: CrossCategoryAffinityProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Generate cross-category affinity data
  const generateAffinityData = (): AffinityData[] => {
    if (entities.length === 0) return [];
    
    // This is a simplified simulation - in a real app, this data would come from Qloo's API
    // For demo purposes, we'll generate data that showcases Qloo's cross-category capabilities
    
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
    
    // Define cultural categories that Qloo can analyze across
    const categories = [
      {
        category: "Music",
        subcategories: [
          { name: "Pop", affinity: seedRandom(0.2, 0.9, 1) },
          { name: "Rock", affinity: seedRandom(0.2, 0.9, 2) },
          { name: "Hip Hop", affinity: seedRandom(0.2, 0.9, 3) },
          { name: "Electronic", affinity: seedRandom(0.2, 0.9, 4) },
          { name: "Classical", affinity: seedRandom(0.2, 0.9, 5) }
        ]
      },
      {
        category: "Movies",
        subcategories: [
          { name: "Action", affinity: seedRandom(0.2, 0.9, 6) },
          { name: "Drama", affinity: seedRandom(0.2, 0.9, 7) },
          { name: "Comedy", affinity: seedRandom(0.2, 0.9, 8) },
          { name: "Sci-Fi", affinity: seedRandom(0.2, 0.9, 9) },
          { name: "Horror", affinity: seedRandom(0.2, 0.9, 10) }
        ]
      },
      {
        category: "Dining",
        subcategories: [
          { name: "Italian", affinity: seedRandom(0.2, 0.9, 11) },
          { name: "Japanese", affinity: seedRandom(0.2, 0.9, 12) },
          { name: "Mexican", affinity: seedRandom(0.2, 0.9, 13) },
          { name: "Fine Dining", affinity: seedRandom(0.2, 0.9, 14) },
          { name: "Fast Casual", affinity: seedRandom(0.2, 0.9, 15) }
        ]
      },
      {
        category: "Travel",
        subcategories: [
          { name: "Beach", affinity: seedRandom(0.2, 0.9, 16) },
          { name: "Urban", affinity: seedRandom(0.2, 0.9, 17) },
          { name: "Adventure", affinity: seedRandom(0.2, 0.9, 18) },
          { name: "Cultural", affinity: seedRandom(0.2, 0.9, 19) },
          { name: "Luxury", affinity: seedRandom(0.2, 0.9, 20) }
        ]
      }
    ];
    
    return categories;
  };
  
  // Render visualization when entities change
  useEffect(() => {
    if (!svgRef.current || entities.length === 0) return;
    
    renderVisualization();
  }, [entities]);
  
  // Render the cross-category affinity visualization
  const renderVisualization = () => {
    if (!svgRef.current) return;
    
    // Clear existing visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 40, right: 120, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Generate affinity data
    const affinityData = generateAffinityData();
    
    // Create a group for the visualization
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleBand()
      .domain(affinityData.flatMap(d => d.subcategories.map(s => `${d.category}: ${s.name}`)))
      .range([0, innerHeight])
      .padding(0.2);
    
    // Create color scale by category
    const colorScale = d3.scaleOrdinal<string>()
      .domain(affinityData.map(d => d.category))
      .range(["var(--qloo-teal)", "var(--qloo-yellow)", "#6EE7B7", "#3B82F6"]);
    
    // Add y-axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "var(--foreground)")
      .style("font-size", "10px");
    
    // Add x-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(".0%")))
      .selectAll("text")
      .attr("fill", "var(--foreground)")
      .style("font-size", "10px");
    
    // Add x-axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 30)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--foreground)")
      .style("font-size", "12px")
      .text("Affinity Score");
    
    // Flatten the data for easier rendering
    const flatData = affinityData.flatMap(category => 
      category.subcategories.map(subcategory => ({
        category: category.category,
        subcategory: subcategory.name,
        affinity: subcategory.affinity
      }))
    );
    
    // Add bars
    g.selectAll(".bar")
      .data(flatData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => yScale(`${d.category}: ${d.subcategory}`) || 0)
      .attr("height", yScale.bandwidth())
      .attr("x", 0)
      .attr("width", 0)
      .attr("fill", d => colorScale(d.category))
      .attr("opacity", 0.8)
      .transition()
      .duration(1000)
      .attr("width", d => xScale(d.affinity));
    
    // Add affinity score labels
    g.selectAll(".score")
      .data(flatData)
      .enter()
      .append("text")
      .attr("class", "score")
      .attr("x", d => xScale(d.affinity) + 5)
      .attr("y", d => (yScale(`${d.category}: ${d.subcategory}`) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("fill", "var(--foreground)")
      .style("font-size", "10px")
      .style("opacity", 0)
      .text(d => d3.format(".0%")(d.affinity))
      .transition()
      .duration(1000)
      .style("opacity", 1);
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);
    
    affinityData.forEach((category, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale(category.category));
      
      legendRow.append("text")
        .attr("x", 15)
        .attr("y", 9)
        .attr("fill", "var(--foreground)")
        .style("font-size", "12px")
        .text(category.category);
    });
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--foreground)")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Cross-Category Cultural Affinities");
    
    // Add Qloo branding
    svg.append("text")
      .attr("x", width - margin.right)
      .attr("y", height - 5)
      .attr("text-anchor", "end")
      .attr("fill", "var(--muted-foreground)")
      .style("font-size", "10px")
      .style("font-style", "italic")
      .text("Powered by Qloo's Cross-Domain Intelligence");
  };
  
  if (entities.length === 0) {
    return <div className="flex justify-center items-center h-full">
      <p className="text-muted-foreground">Select entities to see cross-category affinities</p>
    </div>;
  }
  
  return (
    <div className="h-full w-full">
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
} 
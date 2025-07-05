'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { QlooEntity } from '@/types/qloo';

interface GeoVisualizationProps {
  entities: QlooEntity[];
}

interface RegionInfluence {
  region: string;
  score: number;
}

export default function GeoVisualization({ entities }: GeoVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Generate geographic influence data from entities
  const generateGeoData = (): Record<string, number> => {
    if (entities.length === 0) return {};
    
    // This is a simplified simulation - in a real app, you would get this data from an API
    // For demo purposes, we'll generate random influence scores for different regions
    const regions = [
      'north-america', 'south-america', 'europe', 'africa', 
      'asia', 'oceania', 'middle-east', 'southeast-asia'
    ];
    
    const regionScores: Record<string, number> = {};
    
    // Initialize all regions with a base score
    regions.forEach(region => {
      regionScores[region] = 0.1;
    });
    
    // For each entity, add influence to regions based on entity properties
    entities.forEach(entity => {
      // Generate pseudo-random but consistent values based on entity_id
      const hash = entity.entity_id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      // Assign influence to 2-3 regions based on the hash
      const numRegions = 2 + (Math.abs(hash) % 2);
      const shuffledRegions = [...regions].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numRegions; i++) {
        const region = shuffledRegions[i];
        const influenceScore = 0.3 + (Math.abs(hash + i) % 100) / 100 * 0.7;
        regionScores[region] = Math.max(regionScores[region], influenceScore);
      }
    });
    
    return regionScores;
  };
  
  // Render map when entities change
  useEffect(() => {
    if (!svgRef.current || entities.length === 0) return;
    
    renderMap();
  }, [entities]);
  
  // Render the geographic visualization
  const renderMap = () => {
    if (!svgRef.current) return;
    
    // Clear existing visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Generate geographic data
    const geoData = generateGeoData();
    
    // Create a group for the visualization
    const g = svg.append("g");
    
    // Create a simple world map representation
    // Note: In a real implementation, you would use GeoJSON data and d3-geo projections
    
    // Define regions with simple polygon shapes
    const regions = [
      { id: 'north-america', name: 'North America', path: 'M50,80 L150,80 L180,150 L120,200 L40,150 Z' },
      { id: 'south-america', name: 'South America', path: 'M120,200 L180,200 L200,300 L120,350 L80,300 Z' },
      { id: 'europe', name: 'Europe', path: 'M300,80 L380,80 L400,150 L350,180 L280,150 Z' },
      { id: 'africa', name: 'Africa', path: 'M300,180 L380,180 L400,300 L330,350 L280,300 Z' },
      { id: 'asia', name: 'Asia', path: 'M400,80 L550,80 L580,200 L450,250 L400,150 Z' },
      { id: 'oceania', name: 'Oceania', path: 'M500,250 L580,250 L580,320 L530,350 L480,320 Z' },
      { id: 'middle-east', name: 'Middle East', path: 'M380,150 L450,150 L450,220 L380,220 Z' },
      { id: 'southeast-asia', name: 'Southeast Asia', path: 'M480,200 L550,200 L550,250 L480,250 Z' }
    ];
    
    // Create color scale for influence
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 1])
      .range(["#e0f2f1", "var(--qloo-teal)"]);
    
    // Draw regions
    regions.forEach(region => {
      const influence = geoData[region.id] || 0;
      
      g.append("path")
        .attr("d", region.path)
        .attr("fill", colorScale(influence))
        .attr("stroke", "var(--border)")
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
      
      // Add region name
      const centroid = getPathCentroid(region.path);
      
      g.append("text")
        .attr("x", centroid.x)
        .attr("y", centroid.y)
        .attr("text-anchor", "middle")
        .attr("fill", influence > 0.5 ? "white" : "var(--foreground)")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text(region.name)
        .transition()
        .delay(500)
        .duration(500)
        .style("opacity", 1);
      
      // Add influence score
      if (influence > 0.1) {
        g.append("text")
          .attr("x", centroid.x)
          .attr("y", centroid.y + 15)
          .attr("text-anchor", "middle")
          .attr("fill", influence > 0.5 ? "white" : "var(--foreground)")
          .style("font-size", "9px")
          .style("opacity", 0)
          .text(`${Math.round(influence * 100)}% influence`)
          .transition()
          .delay(800)
          .duration(500)
          .style("opacity", 1);
      }
    });
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 120}, 20)`);
    
    // Legend title
    legend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("fill", "var(--foreground)")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .text("Cultural Influence");
    
    // Legend gradient
    const legendSteps = 5;
    for (let i = 0; i < legendSteps; i++) {
      const value = i / (legendSteps - 1);
      legend.append("rect")
        .attr("x", 0)
        .attr("y", 10 + i * 15)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorScale(value));
      
      legend.append("text")
        .attr("x", 20)
        .attr("y", 10 + i * 15 + 10)
        .attr("fill", "var(--foreground)")
        .style("font-size", "9px")
        .text(`${Math.round(value * 100)}%`);
    }
  };
  
  // Helper function to estimate the centroid of a path
  const getPathCentroid = (pathString: string): {x: number, y: number} => {
    // Simple centroid calculation for demo purposes
    // Extract points from the path string
    const points = pathString.split(/[ML,\s]/).filter(p => p && !isNaN(Number(p))).map(Number);
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    
    for (let i = 0; i < points.length; i += 2) {
      if (i + 1 < points.length) {
        sumX += points[i];
        sumY += points[i + 1];
        count++;
      }
    }
    
    return {
      x: sumX / count,
      y: sumY / count
    };
  };
  
  if (entities.length === 0) {
    return <div className="flex justify-center items-center h-full">
      <p className="text-muted-foreground">Select entities to see geographic influence</p>
    </div>;
  }
  
  return (
    <div className="h-full w-full">
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
} 
'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { QlooEntity } from '@/types/qloo';

interface WordCloudVisualizationProps {
  entities: QlooEntity[];
}

interface WordCloudItem {
  text: string;
  size: number;
  color: string;
}

export default function WordCloudVisualization({ entities }: WordCloudVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Generate word cloud data from entities
  const generateWordCloudData = (): WordCloudItem[] => {
    if (entities.length === 0) return [];
    
    // Extract tags and properties from entities
    const words: Record<string, number> = {};
    
    entities.forEach(entity => {
      // Add entity name
      addWord(words, entity.name, 10);
      
      // Add entity type
      addWord(words, entity.type.replace('urn:entity:', ''), 8);
      
      // Add entity subtype if available
      if (entity.subtype) {
        addWord(words, entity.subtype, 7);
      }
      
      // Add tags if available
      if (entity.tags && entity.tags.length > 0) {
        entity.tags.forEach(tag => {
          addWord(words, tag.name, 6);
        });
      }
      
      // Add properties if available
      if (entity.properties) {
        // Add description words
        if (entity.properties.description) {
          const descriptionWords = entity.properties.description
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word));
          
          descriptionWords.forEach(word => {
            addWord(words, word, 3);
          });
        }
        
        // Add other properties
        if (entity.properties.content_rating) {
          addWord(words, entity.properties.content_rating, 5);
        }
        
        if (entity.properties.production_companies) {
          entity.properties.production_companies.forEach(company => {
            addWord(words, company, 4);
          });
        }
      }
    });
    
    // Convert to array and sort by frequency
    const sortedWords = Object.entries(words)
      .map(([text, count]) => ({ text, size: count }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 50); // Limit to 50 words
    
    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(sortedWords.map(d => d.text))
      .range(["var(--qloo-teal)", "var(--qloo-yellow)", "#6EE7B7", "#3B82F6", "#8B5CF6", "#EC4899"]);
    
    // Add color to each word
    return sortedWords.map(word => ({
      ...word,
      color: colorScale(word.text)
    }));
  };
  
  // Helper to add word to the frequency map
  const addWord = (words: Record<string, number>, word: string, weight: number = 1) => {
    const cleanWord = word.toLowerCase().trim();
    if (cleanWord && !stopWords.includes(cleanWord)) {
      words[cleanWord] = (words[cleanWord] || 0) + weight;
    }
  };
  
  // Common English stop words to filter out
  const stopWords = [
    'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
    'his', 'her', 'they', 'from', 'she', 'will', 'one', 'all', 'would', 'there',
    'their', 'what', 'out', 'about', 'who', 'get', 'which', 'when', 'make', 'can',
    'like', 'time', 'just', 'him', 'know', 'take', 'into', 'year', 'your', 'good',
    'some', 'could', 'them', 'than', 'then', 'now', 'look', 'only', 'come', 'its',
    'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work'
  ];
  
  // Render word cloud when entities change
  useEffect(() => {
    if (!svgRef.current || entities.length === 0) return;
    
    renderWordCloud();
  }, [entities]);
  
  // Render the word cloud visualization
  const renderWordCloud = () => {
    if (!svgRef.current) return;
    
    // Clear existing visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Generate word cloud data
    const words = generateWordCloudData();
    
    // Create a group for the visualization
    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);
    
    // Create a simple word cloud layout
    // Note: In a real implementation, you might want to use d3-cloud library
    // for more sophisticated word cloud layouts
    const fontScale = d3.scaleLinear()
      .domain([
        d3.min(words, d => d.size) || 1,
        d3.max(words, d => d.size) || 10
      ])
      .range([12, 40]);
    
    // Calculate positions (simple circular layout)
    const radius = Math.min(width, height) / 2 - 50;
    const angleStep = (2 * Math.PI) / words.length;
    
    words.forEach((word, i) => {
      const angle = i * angleStep;
      const distance = radius * (0.3 + 0.7 * Math.random()); // Vary distance from center
      
      const x = distance * Math.cos(angle);
      const y = distance * Math.sin(angle);
      
      g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("font-size", `${fontScale(word.size)}px`)
        .attr("fill", word.color)
        .attr("opacity", 0)
        .style("font-weight", word.size > 5 ? "bold" : "normal")
        .style("font-family", "sans-serif")
        .text(word.text)
        .transition()
        .delay(i * 20)
        .duration(500)
        .attr("opacity", 1)
        .attr("transform", `rotate(${Math.random() * 40 - 20}, ${x}, ${y})`);
    });
  };
  
  if (entities.length === 0) {
    return <div className="flex justify-center items-center h-full">
      <p className="text-muted-foreground">Select entities to generate a word cloud</p>
    </div>;
  }
  
  return (
    <div className="h-full w-full">
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
} 
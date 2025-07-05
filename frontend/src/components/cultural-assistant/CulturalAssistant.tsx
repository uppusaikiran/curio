'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { searchEntities, getTrendingEntities, getAnalysis, getRecommendations, getEntityTypes } from '@/lib/qlooService';
import perplexityService from '@/lib/perplexityService';
import { QlooEntity, QlooEntityType, QlooTrendingEntity, QlooAnalysisResult } from '@/types/qloo';
import EntitySearch from '@/components/discovery/EntitySearch';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import * as d3 from 'd3';
import WordCloudVisualization from './WordCloudVisualization';
import GeoVisualization from './GeoVisualization';
import AudienceDemographics from './AudienceDemographics';
import CrossCategoryAffinity from './CrossCategoryAffinity';
import TrendAnalysisChart from './TrendAnalysisChart';

type AssistantState = {
  loading: boolean;
  error: string | null;
  answer: string | null;
  context: string | null;
};

type AnalysisState = {
  loading: boolean;
  error: string | null;
  result: QlooAnalysisResult | null;
};

type RecommendationState = {
  loading: boolean;
  error: string | null;
  entities: QlooEntity[];
};

type TrendingState = {
  loading: boolean;
  error: string | null;
  entities: QlooTrendingEntity[];
};

// New type for sentiment analysis
type SentimentData = {
  category: string;
  score: number;
};

export default function CulturalAssistant() {
  const [selectedEntities, setSelectedEntities] = useState<QlooEntity[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [assistantState, setAssistantState] = useState<AssistantState>({
    loading: false,
    error: null,
    answer: null,
    context: null,
  });
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    loading: false,
    error: null,
    result: null,
  });
  const [recommendationState, setRecommendationState] = useState<RecommendationState>({
    loading: false,
    error: null,
    entities: [],
  });
  const [trendingState, setTrendingState] = useState<TrendingState>({
    loading: false,
    error: null,
    entities: [],
  });
  const [entityTypes, setEntityTypes] = useState<QlooEntityType[]>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('urn:entity:movie');
  const [activeTab, setActiveTab] = useState('assistant');
  const radarChartRef = useRef<SVGSVGElement>(null);
  const sentimentChartRef = useRef<SVGSVGElement>(null);
  const connectionGraphRef = useRef<SVGSVGElement>(null);
  const timelineRef = useRef<SVGSVGElement>(null);
  
  // Load entity types on mount
  useEffect(() => {
    const loadEntityTypes = async () => {
      try {
        const types = await getEntityTypes();
        setEntityTypes(types);
      } catch (error) {
        console.error('Failed to load entity types:', error);
      }
    };
    
    loadEntityTypes();
    
    // Load trending entities on mount
    fetchTrendingEntities();
  }, []);
  
  // Handle entity selection
  const handleEntitySelect = (entity: QlooEntity) => {
    // Check if entity already exists in the array
    if (!selectedEntities.some(e => e.entity_id === entity.entity_id)) {
      setSelectedEntities(prev => [...prev, entity]);
      
      // If this is the first entity selected, analyze it automatically
      if (selectedEntities.length === 0) {
        analyzeEntity(entity);
      }
      
      // Get recommendations based on this entity
      fetchRecommendations(entity);
    }
  };

  // Remove an entity from selection
  const removeEntity = (entityId: string) => {
    setSelectedEntities(prev => prev.filter(e => e.entity_id !== entityId));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEntities.length === 0) {
      setAssistantState({
        ...assistantState,
        error: "Please select at least one entity to get cultural insights.",
        answer: null,
        context: null,
      });
      return;
    }
    
    if (!userQuestion.trim()) {
      setAssistantState({
        ...assistantState,
        error: "Please enter a question for the assistant.",
        answer: null,
        context: null,
      });
      return;
    }
    
    setAssistantState({
      ...assistantState,
      loading: true,
      error: null,
      answer: null,
      context: null,
    });
    
    try {
      // Build cultural context from selected entities
      const entityDescriptions = selectedEntities.map(entity => 
        `${entity.name} (${entity.type}${entity.subtype ? `, ${entity.subtype}` : ''})`
      ).join(', ');
      
      // Create a prompt that combines Qloo insights with the user question
      const prompt = `Based on cultural insights for ${entityDescriptions}, ${userQuestion}`;
      const context = `The user is interested in the following entities: ${entityDescriptions}. 
        These entities represent cultural tastes and preferences from the Qloo API.
        You should use this cultural context to provide insights that connect these interests in meaningful ways.
        Format your response using Markdown for better readability.`;
      
      // Get response from Perplexity
      const response = await perplexityService.getPerplexityResponse(prompt, context);
      
      setAssistantState({
        loading: false,
        error: null,
        answer: response,
        context: context
      });
      
      // Switch to the assistant tab to show the answer
      setActiveTab('assistant');
      
    } catch (error: any) {
      setAssistantState({
        loading: false,
        error: `Error: ${error.message || 'Failed to get response'}`,
        answer: null,
        context: null
      });
    }
  };
  
  // Analyze an entity using Qloo's analysis API
  const analyzeEntity = async (entity: QlooEntity) => {
    setAnalysisState({
      loading: true,
      error: null,
      result: null
    });
    
    try {
      const analysis = await getAnalysis({
        entity_type: entity.type,
        entity_value: entity.entity_id,
        entity_name: entity.name,
        subtype: entity.subtype
      });
      
      setAnalysisState({
        loading: false,
        error: null,
        result: analysis
      });
    } catch (error: any) {
      setAnalysisState({
        loading: false,
        error: `Analysis error: ${error.message || 'Failed to analyze entity'}`,
        result: null
      });
    }
  };
  
  // Fetch recommendations based on selected entity
  const fetchRecommendations = async (entity: QlooEntity) => {
    setRecommendationState({
      loading: true,
      error: null,
      entities: []
    });
    
    try {
      const recommendations = await getRecommendations({
        entity_type: entity.type,
        entity_value: entity.entity_id,
        limit: 5
      });
      
      setRecommendationState({
        loading: false,
        error: null,
        entities: recommendations
      });
    } catch (error: any) {
      setRecommendationState({
        loading: false,
        error: `Recommendation error: ${error.message || 'Failed to get recommendations'}`,
        entities: []
      });
    }
  };
  
  // Fetch trending entities
  const fetchTrendingEntities = async () => {
    setTrendingState({
      loading: true,
      error: null,
      entities: []
    });
    
    try {
      const trending = await getTrendingEntities({
        entity_type: selectedEntityType,
        limit: 10
      });
      
      setTrendingState({
        loading: false,
        error: null,
        entities: trending
      });
    } catch (error: any) {
      setTrendingState({
        loading: false,
        error: `Trending error: ${error.message || 'Failed to get trending entities'}`,
        entities: []
      });
    }
  };
  
  // Handle entity type change for trending entities
  const handleEntityTypeChange = (type: string) => {
    setSelectedEntityType(type);
    
    // Fetch trending entities for the new type
    setTrendingState(prev => ({
      ...prev,
      loading: true
    }));
    
    getTrendingEntities({
      entity_type: type,
      limit: 10
    })
      .then(entities => {
        setTrendingState({
          loading: false,
          error: null,
          entities
        });
      })
      .catch(error => {
        setTrendingState({
          loading: false,
          error: `Error: ${error.message || 'Failed to get trending entities'}`,
          entities: []
        });
      });
  };
  
  // Generate sentiment data from assistant's answer
  const generateSentimentData = (): SentimentData[] => {
    if (!assistantState.answer) return [];
    
    // This is a simplified simulation - in a real app, you might use NLP
    // to extract actual sentiment data from the assistant's response
    return [
      { category: "Positivity", score: 0.7 + Math.random() * 0.3 },
      { category: "Cultural Relevance", score: 0.6 + Math.random() * 0.4 },
      { category: "Historical Context", score: 0.5 + Math.random() * 0.5 },
      { category: "Novelty", score: 0.4 + Math.random() * 0.6 },
      { category: "Depth", score: 0.5 + Math.random() * 0.5 }
    ];
  };
  
  // Create radar chart when entities are selected
  useEffect(() => {
    if (activeTab === 'insights' && selectedEntities.length > 0 && radarChartRef.current) {
      renderRadarChart();
    }
  }, [selectedEntities, activeTab]);
  
  // Create sentiment chart when assistant provides an answer
  useEffect(() => {
    if (activeTab === 'insights' && assistantState.answer && sentimentChartRef.current) {
      renderSentimentChart();
    }
  }, [assistantState.answer, activeTab]);
  
  // Create connections graph when entities are selected
  useEffect(() => {
    if (activeTab === 'insights' && selectedEntities.length > 0 && connectionGraphRef.current) {
      renderConnectionGraph();
    }
  }, [selectedEntities, activeTab]);
  
  // Create timeline visualization when entities are selected
  useEffect(() => {
    if (activeTab === 'insights' && selectedEntities.length > 0 && timelineRef.current) {
      renderTimeline();
    }
  }, [selectedEntities, activeTab]);
  
  // Render radar chart to compare selected entities
  const renderRadarChart = () => {
    if (!radarChartRef.current || selectedEntities.length === 0) return;
    
    // Clear existing chart
    d3.select(radarChartRef.current).selectAll("*").remove();
    
    const svg = d3.select(radarChartRef.current);
    const width = radarChartRef.current.clientWidth;
    const height = 300;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const radius = Math.min(chartWidth, chartHeight) / 2;
    
    // Create a group for the visualization
    const g = svg.append("g")
      .attr("transform", `translate(${width/2},${height/2})`);
    
    // Define the dimensions for the radar chart
    const dimensions = ["Cultural Impact", "Popularity", "Critical Acclaim", "Innovation", "Longevity"];
    const angleSlice = (Math.PI * 2) / dimensions.length;
    
    // Scale for the radius
    const rScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, radius]);
    
    // Draw the circular grid lines
    const axisGrid = g.append("g").attr("class", "axis-grid");
    
    // Draw the background circles
    const levels = 5;
    axisGrid.selectAll(".level")
      .data(d3.range(1, levels+1).reverse())
      .enter()
      .append("circle")
      .attr("class", "level")
      .attr("r", d => radius * d / levels)
      .attr("fill", "none")
      .attr("stroke", "var(--border)")
      .attr("stroke-opacity", 0.3);
    
    // Create the straight lines radiating outward from the center
    const axis = axisGrid.selectAll(".axis")
      .data(dimensions)
      .enter()
      .append("g")
      .attr("class", "axis");
    
    // Draw the lines
    axis.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI/2))
      .attr("y2", (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI/2))
      .attr("stroke", "var(--border)")
      .attr("stroke-width", "1px");
    
    // Draw axis labels
    axis.append("text")
      .attr("class", "legend")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", (d, i) => rScale(1.2) * Math.cos(angleSlice * i - Math.PI/2))
      .attr("y", (d, i) => rScale(1.2) * Math.sin(angleSlice * i - Math.PI/2))
      .text(d => d)
      .attr("fill", "var(--foreground)")
      .style("font-size", "10px");
    
    // Create random data for each entity (in a real app, this would come from API)
    const data = selectedEntities.map(entity => {
      return dimensions.map((dim, i) => {
        // Generate pseudo-random but consistent values based on entity_id
        const hash = entity.entity_id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const baseValue = (Math.abs(hash + i * 100) % 100) / 100;
        return {
          axis: dim,
          value: 0.3 + baseValue * 0.7 // Scale to 0.3-1.0 range
        };
      });
    });
    
    // Create color scale for entities
    const colorScale = d3.scaleOrdinal<string>()
      .domain(selectedEntities.map(e => e.entity_id))
      .range(["var(--qloo-teal)", "var(--qloo-yellow)", "#6EE7B7", "#3B82F6", "#8B5CF6"]);
    
    // Draw the radar chart paths
    data.forEach((d, i) => {
      // Create the radar line function
      const radarLine = d3.lineRadial<{axis: string, value: number}>()
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveLinearClosed);
      
      // Create the radar areas
      g.append("path")
        .datum(d)
        .attr("class", "radar-area")
        .attr("d", radarLine as any)
        .attr("fill", colorScale(selectedEntities[i].entity_id))
        .attr("fill-opacity", 0.1)
        .attr("stroke", colorScale(selectedEntities[i].entity_id))
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.8);
      
      // Add dots at each data point
      g.selectAll(`.radar-circle-${i}`)
        .data(d)
        .enter()
        .append("circle")
        .attr("class", `radar-circle-${i}`)
        .attr("r", 4)
        .attr("cx", (d, j) => rScale(d.value) * Math.cos(angleSlice * j - Math.PI/2))
        .attr("cy", (d, j) => rScale(d.value) * Math.sin(angleSlice * j - Math.PI/2))
        .attr("fill", colorScale(selectedEntities[i].entity_id));
    });
    
    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 120}, 20)`);
    
    selectedEntities.forEach((entity, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorScale(entity.entity_id));
      
      legendRow.append("text")
        .attr("x", 15)
        .attr("y", 9)
        .attr("fill", "var(--foreground)")
        .style("font-size", "10px")
        .text(entity.name.substring(0, 15) + (entity.name.length > 15 ? "..." : ""));
    });
  };
  
  // Render sentiment analysis chart
  const renderSentimentChart = () => {
    if (!sentimentChartRef.current || !assistantState.answer) return;
    
    // Clear existing chart
    d3.select(sentimentChartRef.current).selectAll("*").remove();
    
    const svg = d3.select(sentimentChartRef.current);
    const width = sentimentChartRef.current.clientWidth;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Generate sentiment data
    const data = generateSentimentData();
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, innerHeight])
      .padding(0.2);
    
    // Create a group for the visualization
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add y-axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "var(--foreground)")
      .style("font-size", "12px");
    
    // Add x-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(".0%")))
      .selectAll("text")
      .attr("fill", "var(--foreground)")
      .style("font-size", "12px");
    
    // Add bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => yScale(d.category) || 0)
      .attr("height", yScale.bandwidth())
      .attr("x", 0)
      .attr("width", 0)
      .attr("fill", "var(--qloo-teal)")
      .transition()
      .duration(1000)
      .attr("width", d => xScale(d.score));
    
    // Add score labels
    g.selectAll(".score")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "score")
      .attr("x", d => xScale(d.score) + 5)
      .attr("y", d => (yScale(d.category) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("fill", "var(--foreground)")
      .style("font-size", "12px")
      .style("opacity", 0)
      .text(d => d3.format(".0%")(d.score))
      .transition()
      .duration(1000)
      .style("opacity", 1);
  };
  
  // Render connections graph
  const renderConnectionGraph = () => {
    if (!connectionGraphRef.current || selectedEntities.length === 0) return;
    
    // Clear existing chart
    d3.select(connectionGraphRef.current).selectAll("*").remove();
    
    const svg = d3.select(connectionGraphRef.current);
    const width = connectionGraphRef.current.clientWidth;
    const height = 300;
    
    // Create nodes for selected entities
    const nodes = selectedEntities.map(entity => ({
      id: entity.entity_id,
      name: entity.name,
      type: entity.type,
      group: entity.type,
      radius: 30
    }));
    
    // Create additional nodes for related concepts (simulated)
    const relatedConcepts = [
      { id: "concept1", name: "Cultural Movement", type: "concept", group: "concept", radius: 20 },
      { id: "concept2", name: "Time Period", type: "concept", group: "concept", radius: 20 },
      { id: "concept3", name: "Genre", type: "concept", group: "concept", radius: 20 },
      { id: "concept4", name: "Creator", type: "concept", group: "concept", radius: 20 },
      { id: "concept5", name: "Theme", type: "concept", group: "concept", radius: 20 }
    ];
    
    const allNodes = [...nodes, ...relatedConcepts];
    
    // Create links between entities and concepts
    const links: {source: string, target: string, value: number}[] = [];
    
    // Connect each entity to some concepts
    nodes.forEach(node => {
      // Connect to 2-3 random concepts
      const numConnections = 2 + Math.floor(Math.random() * 2);
      const shuffled = [...relatedConcepts].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numConnections; i++) {
        links.push({
          source: node.id,
          target: shuffled[i].id,
          value: 1 + Math.random() * 5
        });
      }
    });
    
    // Add some connections between entities if there are multiple
    if (nodes.length > 1) {
      for (let i = 0; i < nodes.length - 1; i++) {
        links.push({
          source: nodes[i].id,
          target: nodes[i + 1].id,
          value: 2 + Math.random() * 3
        });
      }
    }
    
    // Create force simulation
    const simulation = d3.forceSimulation(allNodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(d => 100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => d.radius + 5));
    
    // Create a group for the visualization
    const g = svg.append("g");
    
    // Add links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "var(--border)")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value));
    
    // Create color scale for nodes
    const colorScale = d3.scaleOrdinal<string>()
      .domain(["urn:entity:movie", "urn:entity:music", "urn:entity:book", "urn:entity:restaurant", "concept"])
      .range(["var(--qloo-teal)", "var(--qloo-yellow)", "#6EE7B7", "#3B82F6", "#8B5CF6"]);
    
    // Add node groups
    const node = g.append("g")
      .selectAll(".node")
      .data(allNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);
    
    // Add circles for nodes
    node.append("circle")
      .attr("r", (d: any) => d.radius)
      .attr("fill", (d: any) => colorScale(d.group))
      .attr("stroke", "var(--background)")
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 0.7);
    
    // Add text labels
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "var(--background)")
      .style("font-size", "10px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .text((d: any) => d.name.substring(0, 10) + (d.name.length > 10 ? "..." : ""))
      .transition()
      .duration(1000)
      .style("opacity", 1);
    
    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      
      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });
    
    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };
  
  // Render timeline visualization
  const renderTimeline = () => {
    if (!timelineRef.current || selectedEntities.length === 0) return;
    
    // Clear existing chart
    d3.select(timelineRef.current).selectAll("*").remove();
    
    const svg = d3.select(timelineRef.current);
    const width = timelineRef.current.clientWidth;
    const height = 150;
    const margin = { top: 20, right: 50, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create a group for the visualization
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Generate timeline data based on selected entities
    const timelineData = selectedEntities.map(entity => {
      // Use release_year from properties if available, or generate a random year
      const year = entity.properties?.release_year || 
                  (2000 + Math.floor(Math.random() * 23)); // Random year between 2000-2023
      
      return {
        id: entity.entity_id,
        name: entity.name,
        year: year,
        type: entity.type
      };
    });
    
    // Sort by year
    timelineData.sort((a, b) => a.year - b.year);
    
    // Create time scale
    const minYear = Math.min(...timelineData.map(d => d.year)) - 1;
    const maxYear = Math.max(...timelineData.map(d => d.year)) + 1;
    
    const xScale = d3.scaleLinear()
      .domain([minYear, maxYear])
      .range([0, innerWidth]);
    
    // Draw the axis
    g.append("line")
      .attr("x1", 0)
      .attr("y1", innerHeight / 2)
      .attr("x2", innerWidth)
      .attr("y2", innerHeight / 2)
      .attr("stroke", "var(--border)")
      .attr("stroke-width", 2);
    
    // Add year labels
    g.selectAll(".year-label")
      .data(d3.range(minYear, maxYear + 1))
      .enter()
      .append("text")
      .attr("class", "year-label")
      .attr("x", d => xScale(d))
      .attr("y", innerHeight / 2 + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--foreground)")
      .style("font-size", "10px")
      .text(d => d);
    
    // Create color scale for entities
    const colorScale = d3.scaleOrdinal<string>()
      .domain(["urn:entity:movie", "urn:entity:music", "urn:entity:book", "urn:entity:restaurant"])
      .range(["var(--qloo-teal)", "var(--qloo-yellow)", "#6EE7B7", "#3B82F6"]);
    
    // Add event markers
    const events = g.selectAll(".event")
      .data(timelineData)
      .enter()
      .append("g")
      .attr("class", "event")
      .attr("transform", d => `translate(${xScale(d.year)},${innerHeight / 2})`);
    
    // Add circles for events
    events.append("circle")
      .attr("r", 8)
      .attr("fill", d => colorScale(d.type))
      .attr("stroke", "var(--background)")
      .attr("stroke-width", 2);
    
    // Add alternating labels above and below the timeline
    events.append("text")
      .attr("y", (d, i) => i % 2 === 0 ? -15 : 25)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--foreground)")
      .style("font-size", "10px")
      .text(d => d.name.substring(0, 15) + (d.name.length > 15 ? "..." : ""));
    
    // Add year labels for each event
    events.append("text")
      .attr("y", (d, i) => i % 2 === 0 ? -30 : 40)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--muted-foreground)")
      .style("font-size", "9px")
      .text(d => d.year);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left column: Entity selection */}
      <div className="md:col-span-1">
        <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20 h-full">
          <h2 className="text-xl font-semibold mb-4">Select Interests</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Search and select entities that represent your interests. The cultural assistant
            will use Qloo's cultural intelligence to provide insights based on these selections.
          </p>
          
          <div className="mb-6">
            <EntitySearch onEntitySelect={handleEntitySelect} />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Selected Entities</h3>
            {selectedEntities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entities selected yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedEntities.map(entity => (
                  <span 
                    key={entity.entity_id} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-qloo-teal/20 text-qloo-teal"
                  >
                    {entity.name}
                    <button 
                      onClick={() => removeEntity(entity.entity_id)} 
                      className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-qloo-teal/30"
                    >
                      <span className="sr-only">Remove</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Trending Entities Section */}
          <div className="mt-8">
            <h3 className="text-sm font-medium mb-2">Trending in Culture</h3>
            <div className="mb-2">
              <select 
                className="w-full p-2 rounded-md border border-input bg-background text-sm"
                value={selectedEntityType}
                onChange={(e) => handleEntityTypeChange(e.target.value)}
              >
                {entityTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            {trendingState.loading ? (
              <p className="text-sm text-muted-foreground">Loading trending entities...</p>
            ) : trendingState.error ? (
              <p className="text-sm text-red-500">{trendingState.error}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {trendingState.entities.map(entity => (
                  <Badge 
                    key={entity.entity_id}
                    variant="outline"
                    className="cursor-pointer hover:bg-qloo-teal/20 hover:text-qloo-teal transition-colors"
                    onClick={() => {
                      const fullEntity: QlooEntity = {
                        name: entity.name,
                        entity_id: entity.entity_id,
                        type: entity.type,
                        subtype: entity.subtype,
                        properties: entity.properties,
                        tags: entity.tags
                      };
                      handleEntitySelect(fullEntity);
                    }}
                  >
                    {entity.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right column: Question and answer */}
      <div className="md:col-span-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="assistant">Assistant</TabsTrigger>
            <TabsTrigger value="analysis">Entity Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assistant">
            <motion.div 
              className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4">Ask the Cultural Assistant</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Ask a question about your selected interests, and the assistant will provide
                insights using Qloo's cultural intelligence combined with advanced language models.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <textarea
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="What connects these interests? What else might I enjoy? What cultural patterns do you see?"
                    className="w-full p-3 rounded-md border border-input bg-background"
                    rows={3}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={assistantState.loading}
                  className="w-full py-2 px-4 bg-qloo-teal text-qloo-black font-medium rounded-md hover:bg-qloo-teal/90 transition-colors disabled:opacity-50"
                >
                  {assistantState.loading ? 'Processing...' : 'Get Cultural Insights'}
                </button>
              </form>
            </motion.div>
            
            {assistantState.error && (
              <motion.div 
                className="bg-red-100/30 p-4 rounded-md border border-red-200 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-red-800">{assistantState.error}</p>
              </motion.div>
            )}
            
            {assistantState.answer && (
              <motion.div 
                className="bg-muted/30 p-6 rounded-lg border border-qloo-yellow/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  <span className="w-8 h-8 rounded-full bg-qloo-yellow flex items-center justify-center text-qloo-black mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </span>
                  <h3 className="text-lg font-medium">Cultural Insight</h3>
                </div>
                <div className="prose prose-sm dark:prose-invert prose-a:text-qloo-teal prose-a:no-underline hover:prose-a:underline prose-a:font-medium max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{assistantState.answer}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="analysis">
            <motion.div 
              className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4">Qloo Entity Analysis</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Detailed analysis of your selected entity, including associated tags, audiences, and related entities
                powered by Qloo's cultural intelligence.
              </p>
              
              {selectedEntities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Select an entity to see its analysis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedEntities.map(entity => (
                      <Badge 
                        key={entity.entity_id}
                        variant={analysisState.result?.entity.entity_id === entity.entity_id ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => analyzeEntity(entity)}
                      >
                        {entity.name}
                      </Badge>
                    ))}
                  </div>
                  
                  {analysisState.loading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Analyzing entity...</p>
                    </div>
                  ) : analysisState.error ? (
                    <div className="bg-red-100/30 p-4 rounded-md border border-red-200">
                      <p className="text-red-800">{analysisState.error}</p>
                    </div>
                  ) : analysisState.result ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          {analysisState.result.entity.name}
                          {analysisState.result.entity.subtype && (
                            <span className="text-sm text-muted-foreground ml-2">
                              {analysisState.result.entity.subtype}
                            </span>
                          )}
                        </h3>
                        {analysisState.result.entity.properties?.description && (
                          <p className="text-sm text-muted-foreground">
                            {analysisState.result.entity.properties.description}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-md font-medium mb-2">Associated Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisState.result.tags.slice(0, 15).map(tag => (
                            <Badge 
                              key={tag.id}
                              variant="secondary"
                              className="bg-qloo-teal/10"
                            >
                              {tag.name} {tag.score && <span className="opacity-70">({Math.round(tag.score * 100)}%)</span>}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {analysisState.result.audiences && analysisState.result.audiences.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-2">Key Audiences</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisState.result.audiences.slice(0, 10).map(audience => (
                              <Badge 
                                key={audience.id}
                                variant="outline"
                              >
                                {audience.name} {audience.score && <span className="opacity-70">({Math.round(audience.score * 100)}%)</span>}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {analysisState.result.related_entities && analysisState.result.related_entities.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-2">Related Entities</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisState.result.related_entities.slice(0, 8).map(entity => (
                              <Badge 
                                key={entity.entity_id}
                                variant="secondary"
                                className="cursor-pointer hover:bg-qloo-teal/20"
                                onClick={() => handleEntitySelect(entity)}
                              >
                                {entity.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Click on an entity above to analyze it</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <motion.div 
              className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4">Qloo Recommendations</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Discover similar entities based on your selections, powered by Qloo's cultural intelligence.
              </p>
              
              {selectedEntities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Select an entity to see recommendations</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedEntities.map(entity => (
                      <Badge 
                        key={entity.entity_id}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => fetchRecommendations(entity)}
                      >
                        Based on: {entity.name}
                      </Badge>
                    ))}
                  </div>
                  
                  {recommendationState.loading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading recommendations...</p>
                    </div>
                  ) : recommendationState.error ? (
                    <div className="bg-red-100/30 p-4 rounded-md border border-red-200">
                      <p className="text-red-800">{recommendationState.error}</p>
                    </div>
                  ) : recommendationState.entities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recommendationState.entities.map(entity => (
                        <div 
                          key={entity.entity_id}
                          className="p-4 rounded-lg border border-qloo-teal/20 hover:border-qloo-teal/40 transition-colors cursor-pointer"
                          onClick={() => handleEntitySelect(entity)}
                        >
                          <h3 className="font-medium">{entity.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {entity.type.replace('urn:entity:', '')}
                            {entity.subtype && ` › ${entity.subtype}`}
                          </p>
                          {entity.properties?.description && (
                            <p className="text-sm mt-2 line-clamp-2">{entity.properties.description}</p>
                          )}
                          {entity.tags && entity.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entity.tags.slice(0, 3).map(tag => (
                                <span key={tag.id} className="text-xs px-2 py-0.5 bg-qloo-teal/10 rounded-full">
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No recommendations found. Try selecting a different entity.</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="insights">
            <motion.div 
              className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4">Cultural Insights Visualizations</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Explore visual representations of cultural connections, patterns, and insights based on your selected entities.
              </p>
              
              {selectedEntities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Select entities to see visualizations</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Word Cloud */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cultural Word Cloud</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Key terms and concepts related to your selected entities
                    </p>
                    <div className="h-[300px] border border-border/30 rounded-lg p-2">
                      <WordCloudVisualization entities={selectedEntities} />
                    </div>
                  </div>
                  
                  {/* Geographic Visualization */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Global Cultural Influence</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Geographic regions influenced by the selected entities
                    </p>
                    <div className="h-[300px] border border-border/30 rounded-lg p-2">
                      <GeoVisualization entities={selectedEntities} />
                    </div>
                  </div>
                  
                  {/* Radar Chart */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cultural Dimension Comparison</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Compare selected entities across different cultural dimensions
                    </p>
                    <div className="h-[300px] border border-border/30 rounded-lg p-2">
                      <svg ref={radarChartRef} width="100%" height="100%"></svg>
                    </div>
                  </div>
                  
                  {/* Connection Graph */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cultural Connections Map</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Interactive graph showing connections between entities and cultural concepts
                    </p>
                    <div className="h-[300px] border border-border/30 rounded-lg p-2">
                      <svg ref={connectionGraphRef} width="100%" height="100%"></svg>
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cultural Timeline</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Chronological view of selected entities
                    </p>
                    <div className="h-[150px] border border-border/30 rounded-lg p-2">
                      <svg ref={timelineRef} width="100%" height="100%"></svg>
                    </div>
                  </div>
                  
                  {/* Audience Demographics */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Audience Demographics</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Demographic breakdown of audiences for selected entities
                    </p>
                    <div className="h-[400px] border border-border/30 rounded-lg p-2">
                      <AudienceDemographics entities={selectedEntities} />
                    </div>
                  </div>
                  
                  {/* Cross-Category Affinity */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cross-Category Cultural Affinities</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      How these entities relate to other cultural categories (powered by Qloo's cross-domain intelligence)
                    </p>
                    <div className="h-[500px] border border-border/30 rounded-lg p-2">
                      <CrossCategoryAffinity entities={selectedEntities} />
                    </div>
                  </div>
                  
                  {/* Trend Analysis Chart */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cultural Trend Analysis</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Historical trends and cultural relevance over time
                    </p>
                    <div className="h-[400px] border border-border/30 rounded-lg p-2">
                      <TrendAnalysisChart entities={selectedEntities} />
                    </div>
                  </div>
                  
                  {/* Sentiment Analysis (only shown if there's an assistant answer) */}
                  {assistantState.answer && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Response Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Analysis of the cultural assistant's response
                      </p>
                      <div className="h-[200px] border border-border/30 rounded-lg p-2">
                        <svg ref={sentimentChartRef} width="100%" height="100%"></svg>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
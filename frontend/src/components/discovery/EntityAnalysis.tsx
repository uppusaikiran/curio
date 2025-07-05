'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { getAnalysis } from '@/lib/qlooService';
import { QlooEntity, QlooAnalysisResult } from '@/types/qloo';
import CulturalContext from './CulturalContext';
import CrossDomainRecommendations from './CrossDomainRecommendations';

interface EntityAnalysisProps {
  entity: QlooEntity | null;
}

export default function EntityAnalysis({ entity }: EntityAnalysisProps) {
  const [analysis, setAnalysis] = useState<QlooAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'tags' | 'audiences' | 'related' | 'cultural' | 'cross-domain'>('tags');
  const svgRef = useRef<SVGSVGElement>(null);

  // Fetch analysis when entity changes
  useEffect(() => {
    if (!entity) return;
    
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      setErrorDetails(null);
      try {
        // Generate a valid entity ID if it's missing
        let entityId = entity.entity_id;
        
        if (!entityId) {
          // Create a valid entity ID from the entity type and name
          const sanitizedName = entity.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
            
          entityId = `${entity.type}:${sanitizedName}`;
          console.log('Generated fallback entity ID:', entityId);
        }
        
        console.log('Fetching analysis for entity:', {
          type: entity.type,
          id: entityId,
          name: entity.name
        });
        
        const result = await getAnalysis({
          entity_type: entity.type,
          entity_value: entityId,
          subtype: entity.subtype,
          entity_name: entity.name,
          tags: entity.tags
        });
        setAnalysis(result);
      } catch (error: any) {
        console.error('Error fetching entity analysis:', error);
        
        // Create a more user-friendly error message
        let errorMessage = 'Failed to load entity analysis. ';
        
        // Store detailed error information
        const errorDetails = {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          entity: entity,
          stack: error.stack
        };
        setErrorDetails(errorDetails);
        
        // Check for specific error types
        if (error.message?.includes('Entity not found in Qloo')) {
          // Only log to console, don't show to user
          console.log('Entity not found in Qloo database:', entity.entity_id);
          // Don't set error message for the user
        } else if (error.message?.includes('signal.interests.entities parameter contains invalid entity ids')) {
          errorMessage += 'The entity ID format is invalid. This might be a configuration issue.';
          setError(errorMessage);
        } else if (error.message?.includes('rate limit')) {
          errorMessage += 'API rate limit exceeded. Please try again later.';
          setError(errorMessage);
        } else if (error.response?.status === 404) {
          // Only log to console, don't show to user
          console.log('Entity not found (404):', entity.entity_id);
          // Don't set error message for the user
        } else if (error.response?.status === 403 || error.response?.status === 401) {
          errorMessage += 'Authentication error. Your API key may be invalid or expired.';
          setError(errorMessage);
        } else {
          errorMessage += 'Please check your API key and connection.';
          setError(errorMessage);
        }
        
        setAnalysis(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [entity]);

  // Render visualization when analysis data changes
  useEffect(() => {
    if (!analysis || !svgRef.current || !['tags', 'audiences', 'related'].includes(activeTab)) return;
    
    renderVisualization();
  }, [analysis, activeTab]);

  // Render the D3 visualization
  const renderVisualization = () => {
    if (!analysis || !svgRef.current) return;
    
    // Clear existing visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create a group for the visualization
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Different visualization based on active tab
    if (activeTab === 'tags' && analysis.tags) {
      // Sort tags by score
      const sortedTags = [...analysis.tags].sort((a, b) => b.score - a.score).slice(0, 10);
      
      // Create scales
      const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, innerWidth]);
      
      const yScale = d3.scaleBand()
        .domain(sortedTags.map(d => d.name))
        .range([0, innerHeight])
        .padding(0.2);
      
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
        .data(sortedTags)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.name) || 0)
        .attr("height", yScale.bandwidth())
        .attr("x", 0)
        .attr("width", 0)
        .attr("fill", "var(--qloo-teal)")
        .transition()
        .duration(1000)
        .attr("width", d => xScale(d.score));
      
      // Add score labels
      g.selectAll(".score")
        .data(sortedTags)
        .enter()
        .append("text")
        .attr("class", "score")
        .attr("x", d => xScale(d.score) + 5)
        .attr("y", d => (yScale(d.name) || 0) + yScale.bandwidth() / 2 + 4)
        .attr("fill", "var(--foreground)")
        .style("font-size", "12px")
        .style("opacity", 0)
        .text(d => d3.format(".0%")(d.score))
        .transition()
        .duration(1000)
        .style("opacity", 1);
      
      // Add tag type labels
      g.selectAll(".tag-type")
        .data(sortedTags)
        .enter()
        .append("text")
        .attr("class", "tag-type")
        .attr("x", d => 5)
        .attr("y", d => (yScale(d.name) || 0) - 5)
        .attr("fill", "var(--muted-foreground)")
        .style("font-size", "10px")
        .style("opacity", 0)
        .text(d => d.type)
        .transition()
        .duration(1000)
        .style("opacity", 1);
      
    } else if (activeTab === 'audiences' && analysis.audiences) {
      // Create a pie chart for audiences
      const pie = d3.pie<any>()
        .value(d => d.score)
        .sort(null);
      
      const radius = Math.min(innerWidth, innerHeight) / 2;
      
      const arc = d3.arc<any>()
        .innerRadius(radius * 0.4)
        .outerRadius(radius * 0.8);
      
      const labelArc = d3.arc<any>()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);
      
      const pieG = g.append("g")
        .attr("transform", `translate(${innerWidth / 2},${innerHeight / 2})`);
      
      // Create color scale
      const colors = ["var(--qloo-teal)", "var(--qloo-yellow)", "#6EE7B7", "#3B82F6", "#8B5CF6"];
      const colorScale = d3.scaleOrdinal<string>()
        .domain(analysis.audiences.map(a => a.id))
        .range(colors);
      
      // Add pie segments
      const arcs = pieG.selectAll(".arc")
        .data(pie(analysis.audiences))
        .enter()
        .append("g")
        .attr("class", "arc");
      
      arcs.append("path")
        .attr("fill", d => colorScale(d.data.id))
        .attr("stroke", "var(--background)")
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 1)
        .attrTween("d", function(d) {
          const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
          return function(t) {
            return arc(interpolate(t)) || '';
          };
        });
      
      // Add labels
      arcs.append("text")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", "var(--foreground)")
        .style("font-size", "12px")
        .style("opacity", 0)
        .text(d => `${d.data.name} (${d3.format(".0%")(d.data.score)})`)
        .transition()
        .delay(1000)
        .duration(500)
        .style("opacity", 1);
      
    } else if (activeTab === 'related' && analysis.related_entities) {
      // Create force simulation for related entities
      const nodes = analysis.related_entities.map(entity => ({
        id: entity.entity_id,
        name: entity.name,
        type: entity.type,
        radius: 40,
        // Add these properties to satisfy SimulationNodeDatum
        index: undefined,
        x: undefined,
        y: undefined,
        vx: undefined,
        vy: undefined,
        fx: undefined,
        fy: undefined
      }));
      
      // Add central entity
      nodes.unshift({
        id: analysis.entity.entity_id,
        name: analysis.entity.name,
        type: analysis.entity.type,
        radius: 50,
        // Add these properties to satisfy SimulationNodeDatum
        index: undefined,
        x: undefined,
        y: undefined,
        vx: undefined,
        vy: undefined,
        fx: undefined,
        fy: undefined
      });
      
      // Create links from central entity to all others
      const links = nodes.slice(1).map(node => ({
        source: nodes[0].id,
        target: node.id
      }));
      
      // Create force simulation
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2))
        .force("collision", d3.forceCollide().radius((d: any) => d.radius));
      
      // Add links
      const link = g.append("g")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", "var(--border)")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2);
      
      // Add node groups
      const node = g.append("g")
        .selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag<SVGGElement, typeof nodes[0]>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended) as any);
      
      // Add circles for nodes
      node.append("circle")
        .attr("r", (d: any) => d.radius)
        .attr("fill", (d: any, i) => i === 0 ? "var(--qloo-yellow)" : "var(--qloo-teal)")
        .attr("stroke", "var(--background)")
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
      
      // Add text labels
      node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .attr("fill", "var(--background)")
        .style("font-size", "10px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .text((d: any) => d.name.substring(0, 15) + (d.name.length > 15 ? "..." : ""))
        .transition()
        .duration(1000)
        .style("opacity", 1);
      
      // Add type labels
      node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.6em")
        .attr("fill", "var(--background)")
        .style("font-size", "8px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .text((d: any) => d.type)
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
    }
  };

  // If no entity is provided, show message
  if (!entity) {
    return <div>Select an entity to view analysis</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-muted/30 rounded-lg p-6 border border-qloo-teal/20 h-full"
    >
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <span className="w-10 h-10 rounded-full bg-qloo-teal flex items-center justify-center text-qloo-black mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </span>
        Analysis: {entity.name}
      </h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100/30 text-red-800 rounded-md border border-red-200 flex flex-col">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              {error}
              {errorDetails && (
                <button 
                  onClick={() => setShowErrorDetails(!showErrorDetails)} 
                  className="text-xs ml-2 text-qloo-teal hover:text-qloo-teal/80 underline"
                >
                  {showErrorDetails ? 'Hide Debug Info' : 'Show Debug Info'}
                </button>
              )}
              <div className="mt-2 text-sm">
                <button 
                  onClick={() => {
                    if (entity) {
                      setIsLoading(true);
                      setError(null);
                      setErrorDetails(null);
                      
                      // Generate a valid entity ID if it's missing
                      let entityId = entity.entity_id;
                      
                      if (!entityId) {
                        // Create a valid entity ID from the entity type and name
                        const sanitizedName = entity.name
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '_')
                          .replace(/_+/g, '_')
                          .replace(/^_|_$/g, '');
                          
                        entityId = `${entity.type}:${sanitizedName}`;
                        console.log('Generated fallback entity ID for retry:', entityId);
                      }
                      
                      console.log('Retrying analysis for entity:', {
                        type: entity.type,
                        id: entityId,
                        name: entity.name
                      });
                      
                      getAnalysis({
                        entity_type: entity.type,
                        entity_value: entityId,
                        subtype: entity.subtype,
                        entity_name: entity.name,
                        tags: entity.tags
                      })
                        .then(result => setAnalysis(result))
                        .catch(err => {
                          console.error('Retry failed:', err);
                          
                          // Store detailed error information
                          const errorDetails = {
                            message: err.message,
                            status: err.response?.status,
                            statusText: err.response?.statusText,
                            data: err.response?.data,
                            entity: entity,
                            stack: err.stack
                          };
                          setErrorDetails(errorDetails);
                          
                          // Check for specific error types
                          if (err.message?.includes('Entity not found in Qloo') || err.response?.status === 404) {
                            // Only log to console, don't show to user
                            console.log('Entity not found during retry:', entity.entity_id);
                            // Don't set error message for the user
                          } else {
                            setError(`Retry failed: ${err.message}`);
                          }
                        })
                        .finally(() => setIsLoading(false));
                    }
                  }}
                  className="text-qloo-teal hover:text-qloo-teal/80 underline mr-3"
                >
                  Retry
                </button>
                
                {error.includes('rate limit') && (
                  <button 
                    onClick={() => {
                      if (entity) {
                        setError("Waiting 5 seconds before retry...");
                        setTimeout(() => {
                          setIsLoading(true);
                          setError(null);
                          setErrorDetails(null);
                          
                          // Generate a valid entity ID if it's missing
                          let entityId = entity.entity_id;
                          
                          if (!entityId) {
                            // Create a valid entity ID from the entity type and name
                            const sanitizedName = entity.name
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, '_')
                              .replace(/_+/g, '_')
                              .replace(/^_|_$/g, '');
                              
                            entityId = `${entity.type}:${sanitizedName}`;
                            console.log('Generated fallback entity ID for delayed retry:', entityId);
                          }
                          
                          console.log('Retrying analysis after delay for entity:', {
                            type: entity.type,
                            id: entityId,
                            name: entity.name
                          });
                          
                          getAnalysis({
                            entity_type: entity.type,
                            entity_value: entityId,
                            subtype: entity.subtype,
                            entity_name: entity.name,
                            tags: entity.tags
                          })
                            .then(result => setAnalysis(result))
                            .catch(err => {
                              console.error('Delayed retry failed:', err);
                              
                              // Store detailed error information
                              const errorDetails = {
                                message: err.message,
                                status: err.response?.status,
                                statusText: err.response?.statusText,
                                data: err.response?.data,
                                entity: entity,
                                stack: err.stack
                              };
                              setErrorDetails(errorDetails);
                              
                              // Check for specific error types
                              if (err.message?.includes('Entity not found in Qloo') || err.response?.status === 404) {
                                // Only log to console, don't show to user
                                console.log('Entity not found during delayed retry:', entity.entity_id);
                                // Don't set error message for the user
                              } else {
                                setError(`Delayed retry failed: ${err.message}`);
                              }
                            })
                            .finally(() => setIsLoading(false));
                        }, 5000);
                      }
                    }}
                    className="text-qloo-yellow hover:text-qloo-yellow/80 underline mr-3"
                  >
                    Retry with 5s Delay
                  </button>
                )}
             
              </div>
              {showErrorDetails && errorDetails && (
                <div className="mt-4 p-3 bg-gray-100 rounded overflow-auto max-h-48 text-xs text-gray-800 font-mono">
                  <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-muted">
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-3 py-1 text-sm font-medium transition-colors rounded-md ${
            activeTab === 'tags' ? 'bg-qloo-teal text-qloo-black' : 'bg-muted/50 hover:bg-muted'
          }`}
        >
          Tags
        </button>
        <button
          onClick={() => setActiveTab('audiences')}
          className={`px-3 py-1 text-sm font-medium transition-colors rounded-md ${
            activeTab === 'audiences' ? 'bg-qloo-teal text-qloo-black' : 'bg-muted/50 hover:bg-muted'
          }`}
        >
          Audiences
        </button>
        <button
          onClick={() => setActiveTab('related')}
          className={`px-3 py-1 text-sm font-medium transition-colors rounded-md ${
            activeTab === 'related' ? 'bg-qloo-teal text-qloo-black' : 'bg-muted/50 hover:bg-muted'
          }`}
        >
          Network
        </button>
        <button
          onClick={() => setActiveTab('cultural')}
          className={`px-3 py-1 text-sm font-medium transition-colors rounded-md ${
            activeTab === 'cultural' ? 'bg-qloo-teal text-qloo-black' : 'bg-muted/50 hover:bg-muted'
          }`}
        >
          Cultural Context
        </button>
        <button
          onClick={() => setActiveTab('cross-domain')}
          className={`px-3 py-1 text-sm font-medium transition-colors rounded-md ${
            activeTab === 'cross-domain' ? 'bg-qloo-teal text-qloo-black' : 'bg-muted/50 hover:bg-muted'
          }`}
        >
          Cross Domain
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading analysis...</div>
        </div>
      ) : analysis ? (
        <>
          {(activeTab === 'tags' || activeTab === 'audiences' || activeTab === 'related') && (
            <div className="h-[300px] mb-4">
              <svg ref={svgRef} width="100%" height="100%"></svg>
            </div>
          )}
          
          {activeTab === 'cultural' && (
            <CulturalContext entityType={entity.type} entityName={entity.name} />
          )}
          
          {activeTab === 'cross-domain' && (
            <CrossDomainRecommendations entityType={entity.type} entityName={entity.name} />
          )}
        </>
      ) : !error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No analysis data available.</p>
        </div>
      ) : null}
      
      {/* Description */}
      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          Explore detailed analysis of {entity.name} across different dimensions including tags, audience demographics, and cultural context.
          Click on different tabs to discover more insights.
        </p>
      </div>
    </motion.div>
  );
} 
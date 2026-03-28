import React, { useState, useEffect } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const geoUrl = "/india.json";

function IndiaMap() {
    const [institutesByState, setInstitutesByState] = useState({});
    const [allInstitutes, setAllInstitutes] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/nirf-data") 
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    console.error("Backend error:", data.error);
                    return;
                }
                
                console.log("Data received from backend:", data); // DEBUG: Check your browser console
                setAllInstitutes(data);
                
                const grouped = data.reduce((acc, institute) => {
                    const stateName = institute.state ? institute.state.trim().toLowerCase() : "unknown";
                    if (!acc[stateName]) {
                        acc[stateName] = [];
                    }
                    acc[stateName].push(institute);
                    return acc;
                }, {});
                
                setInstitutesByState(grouped);
            })
            .catch((error) => console.error("Error fetching NIRF data:", error));
    }, []);

    const getStateTooltip = (geoName) => {
        if (!geoName) return "Unknown State";
        
        const normalizedName = geoName.trim().toLowerCase();
        const stateInstitutes = institutesByState[normalizedName] || [];

        if (stateInstitutes.length === 0) {
            return `<strong>${geoName}</strong><br/>No 2025 Overall Data`;
        }

        const sortedInstitutes = stateInstitutes.sort((a, b) => a.rank - b.rank);
        const listHtml = sortedInstitutes
            // Limiting to top 5 per state in the state tooltip so it doesn't get massive
            .slice(0, 5) 
            .map(inst => `• ${inst.name} (Rank: ${inst.rank})`)
            .join("<br/>");
            
        const extra = stateInstitutes.length > 5 ? `<br/><em>+ ${stateInstitutes.length - 5} more...</em>` : "";

        return `<strong>${geoName}</strong><br/>${listHtml}${extra}`;
    };

    return (
        <div className="IndiaMap" style={{
            width: "100%", height: "100%", display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center",
        }}>
            <h1>NIRF 2025 Overall Rankings</h1>
            
            <div style={{ width: "800px", borderStyle: "double", padding: "10px" }}>
                <ComposableMap projection="geoMercator" projectionConfig={{ scale: 1000, center: [80, 22] }}>
                    <ZoomableGroup zoom={1}>
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const stateName = geo.properties.st_nm || geo.properties.state_name;
                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            data-tooltip-id="map-tooltip"
                                            data-tooltip-html={getStateTooltip(stateName)} 
                                            style={{
                                                default: { fill: "#D6D6DA", stroke: "#FFFFFF", strokeWidth: 0.5, outline: "none" },
                                                hover: { fill: "#F53", outline: "none", cursor: "pointer" },
                                                pressed: { fill: "#E42", outline: "none" }
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                        
                        {/* Markers for individual colleges */}
                        {allInstitutes.map((inst, index) => {
                            if (inst.longitude && inst.latitude) {
                                return (
                                    <Marker 
                                        key={inst.id || index} 
                                        coordinates={[inst.longitude, inst.latitude]}
                                    >
                                        <circle 
                                            r={3} 
                                            fill="#002244" 
                                            stroke="#ffffff" 
                                            strokeWidth={1}
                                            data-tooltip-id="map-tooltip"
                                            // Individual College Tooltip
                                            data-tooltip-html={`
                                                <div style="text-align: center;">
                                                    <strong>${inst.name}</strong><br/>
                                                    Rank: ${inst.rank} | Score: ${inst.total}<br/>
                                                    City: ${inst.city}
                                                </div>
                                            `}
                                            style={{ cursor: "pointer", outline: "none" }}
                                        />
                                    </Marker>
                                );
                            }
                            return null;
                        })}
                    </ZoomableGroup>
                </ComposableMap>
            </div>
            
            {/* Global Tooltip component handling both states and markers */}
            <Tooltip id="map-tooltip" />
        </div>
    );
}

export default IndiaMap;
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
import { API_BASE } from "../lib/api";

const geoUrl = "/india.json";

function IndiaMap() {
    const [institutesByState, setInstitutesByState] = useState({});
    const [allInstitutes, setAllInstitutes] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE}/api/nirf-data`)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    console.error("Backend error:", data.error);
                    return;
                }
                if (!Array.isArray(data)) return;

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
            return `<strong>${geoName}</strong><br/>No 2025 overall data`;
        }

        const sortedInstitutes = stateInstitutes.sort((a, b) => a.rank - b.rank);
        const listHtml = sortedInstitutes
            .slice(0, 5)
            .map(inst => `• ${inst.name} (Rank: ${inst.rank})`)
            .join("<br/>");

        const extra = stateInstitutes.length > 5 ? `<br/><em>+ ${stateInstitutes.length - 5} more...</em>` : "";

        return `<strong>${geoName}</strong><br/>${listHtml}${extra}`;
    };

    return (
        <div className="flex w-full flex-col items-stretch gap-4">
            <h2
                className="text-sm font-extrabold uppercase tracking-widest drop-shadow-sm"
                style={{ color: "#0f1f3d" }}
            >
                NIRF 2025 — overall (map)
            </h2>
            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 sm:p-4 shadow-sm">
                <div className="mx-auto w-full min-w-[280px] max-w-[900px]">
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ scale: 1000, center: [80, 22] }}
                        className="h-auto w-full [&_svg]:block [&_svg]:max-h-[min(55vh,520px)] [&_svg]:w-full"
                    >
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
                                                default: { fill: "#f1f5f9", stroke: "#cbd5ef", strokeWidth: 0.5, outline: "none" },
                                                hover: { fill: "#bae6fd", outline: "none", cursor: "pointer", transition: "all 0.2s ease" },
                                                }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>

                            {allInstitutes.map((inst, index) => {
                                if (inst.longitude && inst.latitude) {
                                    return (
                                        <Marker
                                            key={inst.id || index}
                                            coordinates={[inst.longitude, inst.latitude]}
                                        >
                                            <circle
                                                r={3}
                                                fill="#22d3ee"
                                                stroke="#ffffff"
                                                strokeWidth={1}
                                                data-tooltip-id="map-tooltip"
                                                data-tooltip-html={`
                                                <div style="text-align: left;">
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
            </div>
            <Tooltip id="map-tooltip" className="!max-w-xs !text-left" />
        </div>
    );
}

export default IndiaMap;

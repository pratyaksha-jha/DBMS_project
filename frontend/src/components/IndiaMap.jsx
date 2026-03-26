import React from "react";
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
const markers = [
    {
        markerOffset: -15,
        name: "IITG",
        coordinates: [91.6916, 26.1878] }
];

function IndiaMap() {
    return (
        <div className="IndiaMap" style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <h1>NIRF Dashboard Map</h1>
            
            <div style={{ width: "800px", borderStyle: "double", padding: "10px" }}>
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: 1000,
                        center: [80, 22]
                    }}
                >
                    <ZoomableGroup zoom={1}>
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        data-tooltip-id="my-tooltip"
                                        // Update this property name to match your specific JSON file!
                                        data-tooltip-content={geo.properties.st_nm || geo.properties.name || "State"} 
                                        style={{
                                            default: { fill: "#D6D6DA", stroke: "#FFFFFF", strokeWidth: 0.5, outline: "none" },
                                            hover: { fill: "#F53", outline: "none", cursor: "pointer" },
                                            pressed: { fill: "#E42", outline: "none" }
                                        }}
                                    />
                                ))
                            }
                        </Geographies>
                        
                        {
                            
                        }
                        {markers.map(({ name, coordinates, markerOffset }) => (
                            <Marker key={name} coordinates={coordinates}>
                                <circle r={5} fill="#F00" stroke="#fff" strokeWidth={2} />
                                <text 
                                    textAnchor="middle" 
                                    y={markerOffset} 
                                    style={{ fontFamily: "system-ui", fill: "#5D5A6D" }}
                                >
                                    {name}
                                </text>
                            </Marker>
                        ))}
                    </ZoomableGroup>
                </ComposableMap>
            </div>
            <Tooltip id="my-tooltip" />
        </div>
    );
}

export default IndiaMap;
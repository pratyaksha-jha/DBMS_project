import React from 'react';

import IndiaMap from '../components/IndiaMap'; 

export default function Dashboard() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard Overview</h1>
            
            <div style={{ border: '1px solid #ccc', marginTop: '20px', padding: '10px' }}>
                <IndiaMap />
            </div>
            
        </div>
    );
}
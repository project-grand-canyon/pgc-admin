import React, { Component } from 'react';

const CustomToolTip = ({ active, payload}) => {
    if (active) {
        let callers = payload[0].value;
        let calls = payload[1].value;
        let rate = '' + (calls * 100 /callers) + '%'; 
        return (
          <div className="custom-tooltip" style={viewBoxStyle} >
            <p className="callers" style={{color: '#8884d8'}} > Callers : {`${callers}`} </p>
            <p className="calls" style={{color: '#901111'}} > Calls : {`${calls}`} </p>
            <p className="completion">Completion : {`${rate}`} </p>
          </div>
        );
    }
    return null;
};

const viewBoxStyle = { 
    'background-color': 'rgba(256, 256, 256, 0.7)',
    'padding': '10px',
    'font-size': '10.5pt',
};

export default CustomToolTip;
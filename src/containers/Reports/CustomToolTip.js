import React from 'react';

const CustomToolTip = ({ active, payload}) => {
    if (active && payload && payload.length > 1) {
        let callers = payload[0].value;
        let calls = payload[1].value;

        let completionRate = 0; 
        if(callers > 0 && calls > 0)
            completionRate = (calls/callers* 100).toFixed(1); 
        return (
          <div className="custom-tooltip" style={viewBoxStyle} >
            <p id="callers" style={{color: '#8884d8'}} > Callers : {`${callers}`} </p>
            <p id="calls" style={{color: '#901111'}} > Calls : {`${calls}`} </p>
            <p id="completion">Completion : {completionRate}%</p>
          </div>
        );
    }
    return null;
};

const viewBoxStyle = { 
    'backgroundColor': 'rgba(256, 256, 256, 0.7)',
    'padding': '10px',
    'fontSize': '10.5pt',
};

export default CustomToolTip;
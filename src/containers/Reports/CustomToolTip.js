import React from 'react';

const CustomToolTip = ({ active, payload}) => { 
    if (active && payload && payload.length > 0) {
        let callers = payload[0].payload['Callers']; 
        let reminders = payload[0].payload['Reminders']; 

        let completion = 0; 
        if(callers > reminders)
            completion = 100; 
        else if(callers > 0 && reminders > 0)
            completion = (callers/reminders* 100).toFixed(1);
        
        return (
          <div className="custom-tooltip" style={viewBoxStyle} >
            <p id="callers" style={{color: '#8884d8'}} > Active Callers : {`${callers}`} </p>
            <p id="reminders" style={{color: '#901111'}} > Reminders Sent : {`${reminders}`} </p>
            <p id="completion">Completion : {`${completion}`}%</p>
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
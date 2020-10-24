import React from "react";

const CustomToolTip = ({ active, payload, isSenator }) => {
  if (active && payload && payload.length > 0) {
    const callStats = payload.reduce((acc, el) => {
      const name = el.name;
      const color = el.stroke;
      const value = el.value;
      acc[name] = {
        color: color,
        value: value,
      };
      return acc;
    }, {});

    const {
      Callers: totalCallers = {color: "#000000", value: 0},
      Calls: calls = {color: "#000000", value: 0},
      Reminders: reminders = {color: "#000000", value: 0},
    } = callStats;

    let completion = 0;
    if (calls.value > reminders.value) {
        completion = 100;
    } else if (calls.value > 0 && reminders.value > 0){
        completion = ((calls.value / reminders.value) * 100).toFixed(1);
    }

    return (
      <div className="custom-tooltip" style={viewBoxStyle}>
        <p id="totalCallers" style={{ color: totalCallers.color }}>
          {" "}
          Total Callers : {`${totalCallers.value}`}{" "}
        </p>
        <p id="reminders" style={{ color: reminders.color }}>
          {" "}
          Reminders Sent : {`${reminders.value}`}{" "}
        </p>
        <p id="activecallers" style={{ color: calls.color }}>
          {" "}
          Calls : {`${calls.value}`}{" "}
        </p>
        {isSenator ? null : <p id="completion">Completion : {`${completion}`}%</p>}
      </div>
    );
  }
  return null;
};

const viewBoxStyle = {
  backgroundColor: "rgba(256, 256, 256, 0.7)",
  padding: "10px",
  fontSize: "10.5pt",
};

export default CustomToolTip;

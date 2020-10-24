import React from "react";
import { Col, Row, Popover, Typography } from "antd";

const explainerTexts = {
  totalCallers: {
    rep:
      "Total Callers is the count of callers in this district who are not paused.",
    senator:
      "Total Callers is the count of callers in the entire state who are not paused.",
  },
  activeCallers: {
    rep:
      "Active Callers is the count of callers in this district who made at least 1 call to either their Senators or Representative.",
    senator:
      "Active Callers is the count of callers in the state who made at least 1 call to either their Senators or Representative.",
  },
  completionRate:
    "Completion Rate is the percentage of the total callers who are active",
};

const explainer = ({ isSenator }) => {
  const totalCallers =
    explainerTexts["totalCallers"][isSenator ? "senator" : "rep"];
  const activeCallers =
    explainerTexts["activeCallers"][isSenator ? "senator" : "rep"];
  const completionRate = isSenator ? null : (
    <Typography.Paragraph>
      {explainerTexts["completionRate"]}
    </Typography.Paragraph>
  );

  return (
    <>
      <Typography.Paragraph>{totalCallers}</Typography.Paragraph>
      <Typography.Paragraph>
        Total Calls is the count of calls made to this Member of Congress.
      </Typography.Paragraph>
      <Typography.Paragraph>{activeCallers}</Typography.Paragraph>
      {completionRate}
    </>
  );
};

export default explainer;

export { explainerTexts };

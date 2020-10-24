import "@testing-library/jest-dom";

const senatorStats = require("../../fixtures/senatorStats.json")
const senatorDistrict = require("../../fixtures/clientProcessedSenator.json")
const repStats = require("../../fixtures/repStats.json")
const repDistrict = require("../../fixtures/clientProcessedRep.json")

import React from "react";
import { render, screen } from "@testing-library/react";
import DistrictReport from "./DistrictReport";

test("Hides Senator Completion Rate", () => {
  render(<DistrictReport district={senatorDistrict} stats={senatorStats} />);
  const completionRate = screen.queryByText("Completion Rate");
  expect(completionRate).not.toBeInTheDocument();
});

test("Shows Rep Completion Rate", () => {
    render(<DistrictReport district={repDistrict} stats={repStats} />);
    const completionRate = screen.queryByText("Completion Rate");
    expect(completionRate).toBeInTheDocument();
  });

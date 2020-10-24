import "@testing-library/jest-dom";
import { getByText, getNodeText } from "@testing-library/dom";

import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import Explainer, { explainerTexts } from "./Explainer";

test("Shows Senator explainer text", () => {
  render(<Explainer isSenator={true} />);
  const totalCallersText = screen.getByText(
    explainerTexts["totalCallers"]["senator"]
  );
  const activeCallersText = screen.getByText(
    explainerTexts["activeCallers"]["senator"]
  );
  const completionRate = screen.queryByText(explainerTexts["completionRate"]);
  expect(totalCallersText).toBeInTheDocument();
  expect(activeCallersText).toBeInTheDocument();
  expect(completionRate).not.toBeInTheDocument();
});

test("Shows Rep explainer text", () => {
  render(<Explainer isSenator={false} />);
  const totalCallersText = screen.getByText(
    explainerTexts["totalCallers"]["rep"]
  );
  const activeCallersText = screen.getByText(
    explainerTexts["activeCallers"]["rep"]
  );
  const completionRate = screen.getByText(explainerTexts["completionRate"]);
  expect(totalCallersText).toBeInTheDocument();
  expect(activeCallersText).toBeInTheDocument();
  expect(completionRate).toBeInTheDocument();
});

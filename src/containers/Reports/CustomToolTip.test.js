import "@testing-library/jest-dom";
import { getByText, getNodeText } from "@testing-library/dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import CustomToolTip from "./CustomToolTip";

test("0 calls and 0 reminders", () => {
	const payload = [{name: "Calls", value: 0}, {name: "Reminders", value: 0 }];
	let active = true;
	
	const container = render(CustomToolTip({ active, payload }));
	const text = getNodeText(document.getElementById("completion"));
	
	expect(text).toBe("Completion : 0%");
});

test("More than 0 calls and 0 reminders", () => {
	let payload = [ {name: "Calls", value: 1}, {name: "Reminders", value: 0 }];
	let active = true;
	
	const container = render(CustomToolTip({ active, payload }));
	const text = getNodeText(document.getElementById("completion"));
	console.log(text)	
	expect(text).toBe("Completion : 100%");
});

test("0 calls, more than 0 reminders sent", () => {
	let payload = [ {name: "Calls", value: 0}, {name: "Reminders", value: 1 }];
	let active = true;
	
	const container = render(CustomToolTip({ active, payload }));
	const text = getNodeText(document.getElementById("completion"));
	
	expect(text).toBe("Completion : 0%");
});

test("More calls than reminders sent (both above 0)", () => {
	let payload = [ {name: "Calls", value: 2}, {name: "Reminders", value: 1 }];
	let active = true;
	
	const container = render(CustomToolTip({ active, payload }));
	const text = getNodeText(document.getElementById("completion"));
	
	expect(text).toBe("Completion : 100%");
});

test("Fewer calls than reminders sent (both above 0)", () => {
	let payload = [ {name: "Calls", value: 1}, {name: "Reminders", value: 2 }];
	let active = true;
	
	const container = render(CustomToolTip({ active, payload }));
	const text = getNodeText(document.getElementById("completion"));
	
	expect(text).toBe("Completion : 50.0%");
});

test("Senator District", () => {
	const payload = [ {name: "Calls", value: 1}, {name: "Reminders", value: 2 }];
	const active = true;
	const isSenator = true;
	
	render(CustomToolTip({ active, payload, isSenator }));
	const text = screen.queryByText(/^Completion/);	
	expect(text).not.toBeInTheDocument();
});

test("empty payload", () => {
	let payload = [];
	let active = true;
	
	render(CustomToolTip({ active, payload }));
	const ctt = screen.queryByText("Callers");
	expect(ctt).toBeNull();
});

test("active is false", () => {
	let payload = [ {name: "Calls", value: 1}, {name: "Reminders", value: 2 }];
	let active = false;
	
	render(CustomToolTip({ active, payload }));
	const ctt = screen.queryByText("Callers");
	expect(ctt).toBeNull();
});

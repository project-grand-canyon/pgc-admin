import "@testing-library/jest-dom";
import { getByText, getNodeText } from "@testing-library/dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import CustomToolTip from "./CustomToolTip";

test("0 active callers and 0 reminders", () => {
	let payload = [{ payload: { Callers: 0, Reminders: 0 } }]
	let active = true;

	const container = render(CustomToolTip({ active, payload }));
	const text = getNodeText(document.getElementById("completion"));

	expect(text).toBe('Completion : 0%');
});

test('More than 0 active callers and 0 reminders', () => {
	let payload = [{ payload: { Callers: 1, Reminders: 0 } }]
	let active = true

	const container = render( CustomToolTip( { active, payload }) ) 
	const text = getNodeText(document.getElementById('completion') )

	expect(text).toBe('Completion : 100%')

})	

test('0 callers, more than 0 reminders sent', () => {
	let payload = [{ payload: { Callers: 0, Reminders: 1 } }]
	let active = true

	const container = render( CustomToolTip( { active, payload }) ) 
	const text = getNodeText(document.getElementById('completion') )

	expect(text).toBe('Completion : 0%')

})	

test('More callers than reminders sent (both above 0)', () => {
	let payload = [{ payload: { Callers: 2, Reminders: 1 } }]
	let active = true

	const container = render( CustomToolTip( { active, payload }) ) 
	const text = getNodeText(document.getElementById('completion') )

	expect(text).toBe('Completion : 100%')

})	

test('Less callers than reminders sent (both above 0)', () => {
	let payload = [{ payload: { Callers: 1, Reminders: 2 } }]
	let active = true

	const container = render( CustomToolTip( { active, payload }) ) 
	const text = getNodeText(document.getElementById('completion') )

	expect(text).toBe('Completion : 50.0%')

})	

test('empty payload', () => {
	let payload = []
	let active = true

	render( CustomToolTip( { active, payload }) )
	const ctt = screen.queryByText('Callers')
	expect(ctt).toBeNull()

})	

test('active is false', () => {
	let payload = [{ payload: { Callers: 1, Reminders: 2 } }]
	let active = false

	render( CustomToolTip( { active, payload }) )
	const ctt = screen.queryByText('Callers')
	expect(ctt).toBeNull()

})	

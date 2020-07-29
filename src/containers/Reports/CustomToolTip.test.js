import '@testing-library/jest-dom'
import { getByText, getNodeText } from '@testing-library/dom'

import React from 'react'
import {render, screen} from '@testing-library/react'
import CustomToolTip from './CustomToolTip'


test('0 callers and 0 calls', () => {
	let payload = [{ value: 0 }, {value: 0}]
	let active = true

	const container = render( CustomToolTip( { active, payload }) ) 
	const text = getNodeText(document.getElementById('completion') )

	expect(text).toBe('Completion : 0%')

})	

test('More than 0 callers and 0 calls', () => {
	let payload = [{ value: 1}, {value: 0}]
	let active = true

	const container = render( CustomToolTip( { active, payload }) ) 
	const text = getNodeText(document.getElementById('completion') )

	expect(text).toBe('Completion : 0%')

})	

test('0 callers, more than 0 calls made', () => {
	let payload = [{ value: 0}, {value: 1}]
	let active = true

	const container = render( CustomToolTip( { active, payload }) ) 
	const text = getNodeText(document.getElementById('completion') )

	expect(text).toBe('Completion : 0%')

})	

test('More than 0 callers, more than 0 calls made', () => {
	let payload = [{ value: 2}, {value: 1}]
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
	let payload = [{ value: 2}, {value: 1}]
	let active = false

	render( CustomToolTip( { active, payload }) )
	const ctt = screen.queryByText('Callers')
	expect(ctt).toBeNull()

})	


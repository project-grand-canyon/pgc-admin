import "@testing-library/jest-dom";
import userEvent from '@testing-library/user-event'
import { render, screen } from "@testing-library/react";
import DelegationSection from "./DelegationSection";

const district = require('../../fixtures/hydrated_district.json')

describe('Delegation Section', () => {
    test("shows header", () => {
        render(DelegationSection({ district, isSaving: false, onDelegationChanged: null }));
        expect(screen.getByText("Delegate to CCL Staff?")).toBeVisible()
    });

    test("invokes callback", () => {
        let invocationCount = 0
        render(DelegationSection({ district, isSaving: false, onDelegationChanged: () => {
            invocationCount +=1
        } }));
        const checkbox = screen.getByLabelText("I want CCL to manage the script for this district")
        expect(checkbox).toBeVisible()
        userEvent.click(checkbox)
        expect(invocationCount).toEqual(1)
    });

    test("is checked", () => {
        const delegatedDistrict = {...district}
        delegatedDistrict['delegateScript'] = true
        render(DelegationSection({ district: delegatedDistrict, isSaving: false, onDelegationChanged: null}));
        const checkbox = screen.getByLabelText("I want CCL to manage the script for this district")
        expect(checkbox.checked).toEqual(true)
    });
})

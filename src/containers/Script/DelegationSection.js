import React from "react";

import { Checkbox, Typography, Spin} from 'antd';

const DelegationSection = ({district, isSaving, onDelegationChanged}) => {
    if (district === null) {
        return <></>
    }

    const heading = (
        <>
            <Typography.Title level={3}>Delegate to CCL Staff?</Typography.Title>
            <Typography.Paragraph>Don't want to deal with updating this district's script every month? You can delegate this work to CCL staffmembers, who will use more general, nationally applicable talking points.</Typography.Paragraph>
            <Typography.Paragraph>WARNING: After selecting this option, this script is subject to change by CCL staff at any time.</Typography.Paragraph>
        </>
    )
    const wantsDelegation = district && district.delegateScript

    const checkbox = <Checkbox checked={wantsDelegation} onChange={onDelegationChanged}>I want CCL to manage the script for this district</Checkbox>
    const info = isSaving ? <Spin /> : checkbox

    return <div style={{marginTop: "1em"}}>
        {heading}
        {info}        
    </div>
}

export default DelegationSection
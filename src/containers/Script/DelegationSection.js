import React from "react";

import { Checkbox, Typography, Spin} from 'antd';

const DelegationSection = ({className, district, isSaving, onDelegationChanged}) => {
    if (district === null) {
        return <></>
    }

    const heading = (
        <>
            <Typography.Title level={3}>Delegate to CCL Staff?</Typography.Title>
            <Typography.Paragraph>Don't want to deal with updating this district's script every month? You can delegate this work to CCL staffmembers, who will fill your script with nationally relevant talking points that are applicable but not tailored to your Member of Congress.</Typography.Paragraph>
            <Typography.Paragraph>WARNING: After selecting this option, you may still make updates the script, but it is subject to change by CCL staff at any time.</Typography.Paragraph>
        </>
    )
    const wantsDelegation = district && district.delegateScript
    const checkbox = <Checkbox checked={wantsDelegation} onChange={onDelegationChanged}>I want CCL to manage the script for this district</Checkbox>
    const info = isSaving ? <Spin /> : checkbox

    return <div className={className}>
        {heading}
        {info}        
    </div>
}

export default DelegationSection

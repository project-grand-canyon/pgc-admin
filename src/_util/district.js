const isSenatorDistrict = (district) => {
    return district && district.number < 0;
}

const displayName = (district) => {
    if (!district) {
        return null;
    }

    if (district.number >= 0) {
        return `${district.state}-${district.number}`
    }

    return `${district.state}-Sen (${Math.abs(district.number)})`
}

const comparator = (d1, d2) => {
    const state1 = d1.state;
    const state2 = d2.state;
    const dist1 = d1.number;
    const dist2 = d2.number;
    if(state1 < state2) {
        return -1;
    } else if (state1 > state2) {
        return 1;
    } else {
        if (dist1 < 0 && dist2 < 0) {
            return (dist1 == -1) ? -1 : 1;
        }
        if (dist1 >= 0 && dist2 >= 0) {
            if (dist1 < dist2) {
                return -1;
            } else if (dist1 > dist2) {
                return 1;
            }
        }
        if (dist1 < 0) {
            return 1;
        } else {
            return -1;
        }
    }
    return 0;
}

const getAssociatedSenators = (district, districts) => {
    if (!district || !districts) {
        return []
    }
    return districts.filter(el => {
        return isSenatorDistrict(el) && el.state == district.state && el.number != district.number;
    })
}

export {
    isSenatorDistrict as isSenatorDistrict,
    displayName as displayName,
    comparator as comparator,
    getAssociatedSenators as getAssociatedSenators,
};
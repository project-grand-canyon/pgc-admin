const isSenatorDistrict = (district) => {
  return district && district.number < 0;
};

const displayName = (district) => {
  if (!district) {
    return null;
  }

  if (district.number >= 0) {
    return `${district.state}-${district.number}`;
  }

  const junsen = Math.abs(district.number) === 1 ? "Sen." : "Jun.";

  return `${district.state}-${junsen} Senator`;
};

const comparator = (d1, d2) => {
  const state1 = d1.state;
  const state2 = d2.state;
  const dist1 = d1.number;
  const dist2 = d2.number;
  if (state1 < state2) {
    return -1;
  } else if (state1 > state2) {
    return 1;
  } else {
    if (dist1 < 0 && dist2 < 0) {
      return dist1 === -1 ? -1 : 1;
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
};

const getAssociatedSenators = (district, districts) => {
  //By convention Jun Senator = -2. Sen Senator = -1. Representatives >= 0
  if (!district || !districts) {
    return [];
  }
  return districts.filter((el) => {
    return (
      isSenatorDistrict(el) &&
      el.state === district.state &&
      el.number !== district.number
    );
  });
};

export { isSenatorDistrict, displayName, comparator, getAssociatedSenators };

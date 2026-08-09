import locations from "../data/locations";

export function getStates() {
    return Object.keys(locations);
}

export function getCities(state) {

    if (!state) return [];

    return Object.keys(locations[state]);
}

export function getLocations(state, city) {

    if (!state || !city) return [];

    return locations[state][city] || [];

}
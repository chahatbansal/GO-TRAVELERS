const loadbalancer = {}

const distance = (lat1, lon1, lat2, lon2) => {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;
    return dist;
}

const compare = (location1, location2) => {
    if (location1.distance < location2.distance)
        return -1;
    if (location1.distance > location2.distance)
        return 1;
    return 0;
}

loadbalancer.NEAREST_SERVER = (instances, userLocation) => {
    instances.forEach(instance => {
        instance.distance = distance(userLocation[0], userLocation[1], instance.coordinates[0], instance.coordinates[1]);
    });
    instances = instances.sort(compare)
    return instances[0];
}

module.exports = loadbalancer;
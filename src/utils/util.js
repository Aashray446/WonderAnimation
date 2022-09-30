function calcPosFromLatLonRad(lat, lon, radius) {

    var phi = (90 - lat) * (Math.PI / 180);
    var theta = (lon + 180) * (Math.PI / 180);

    x = -(radius * Math.sin(phi) * Math.cos(theta));
    z = (radius * Math.sin(phi) * Math.sin(theta));
    y = (radius * Math.cos(phi));

    return [x, y, z];

}

function calcPosFromLatLonRad(radius, lat, lon) {

    var spherical = new THREE.Spherical(
        radius,
        THREE.Math.degToRad(90 - lon),
        THREE.Math.degToRad(lat)
    );

    var vector = new THREE.Vector3();
    vector.setFromSpherical(spherical);

    console.log(vector.x, vector.y, vector.z);
    return vector;
}
const axios = require('axios');
const { getSatelliteInfo } = require("tle.js");
const moment = require('moment');

let long, lat, height, velocity, vector;


// Should be periodically fetched from api
// https://celestrak.org/NORAD/elements/stations.txt
const tle = `ISS (ZARYA)             
1 25544U 98067A   22274.89635759 -.00065216  00000+0 -11607-2 0  9997
2 25544  51.6407 167.9021 0003213 257.6590 179.5260 15.49594169361737`;


// this should be taken from user to get the location of the satellite on desired date and time
let ts = moment("10/15/2014 9:00:59", "M/D/YYYY H:mm:ss").valueOf();



const getPositionOfISS = async () => {
    // get the position of the satellite at current time
    const optionalTimeStamp = moment().valueOf();
    const stateLiteInfo = getSatelliteInfo(tle, optionalTimeStamp);

    long = stateLiteInfo.lng;
    lat = stateLiteInfo.lat;
    height = stateLiteInfo.height / 1000;
    velocity = stateLiteInfo.velocity;

}



const updateLatLong = () => {
    return new Promise((resolve, reject) => {
        getPositionOfISS()
        resolve(convertLatLangToCartersian(lat, long, height))
    })
}



function convertLatLangToCartersian(lat, lon, alt) {
    const radius = 0.64 + alt;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return { x, y, z }
}


export default (function keepUpdating() {

    // your function code here
    updateLatLong().then((result) => {
        vector = result;
    })

    setTimeout(keepUpdating, 3000);
})();



export const getxyzComponent = () => vector;
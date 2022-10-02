import { getGroundTracks, getSatelliteInfo } from 'tle.js';
const moment = require('moment');
const tle = require('./tleData').tle;
import { Vector3 } from 'three';

let long, lat, height, velocity, vector;

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


// const convertTocoordinates = async () => {

//    const threeOrbitsArr =  await getGroundTracks({tle: tle, stepMS: 10000, isLngLatFormat: true });

//     threeOrbitsArr.forEach(orbits => {

//    });

// }

export const getOrbits = () => {
    let pathDetails = [];
    return new Promise((resolve, reject) => {
        getGroundTracks({
            tle: tle,
            stepMS: 100000,
            isLngLatFormat: true,
        }).then(async function (threeOrbitsArr) {
            // Do stuff with three orbits array here.
            await threeOrbitsArr.map(async (orbit) => {
                const orbits = [];
                await orbit.forEach(element => {
                    const { x, y, z } = convertLatLangToCartersian(element[1], element[0], height)
                    orbits.push(new Vector3(x, y, z))
                });
                pathDetails.push(orbits)
            })
            resolve(pathDetails)
        });

    })
}

export default (function keepUpdating() {

    // your function code here
    updateLatLong().then((result) => {
        vector = result;
    })

    setTimeout(keepUpdating, 3000);
})();




export const getxyzComponent = () => vector;
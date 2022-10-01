const axios = require('axios');

let long, lat;

let vector;

const getPositionOfISS = async () => {
    const response = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
    long = response.data.longitude;
    lat = response.data.latitude;
}



const updateLatLong = () => {
    return new Promise((resolve, reject) => {
        getPositionOfISS()
        resolve(convertLatLangToCartersian(lat, long, 0.4))
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
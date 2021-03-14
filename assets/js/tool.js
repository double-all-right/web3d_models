import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js';

export {getObjectSize}
 function getObjectSize (obj) {
    let objectBox = new THREE.Box3();
    objectBox.setFromObject(obj);
    return objectBox.max.clone().sub(objectBox.min);
};

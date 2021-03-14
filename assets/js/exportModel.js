import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js';

export {
    setupModel_scene_ani0, setupModel_scene_ani2, setupModel_scene_ani1,

    setupModel_child_ani0,
    createCube
}

function createCube(size) {
    const geometry = new THREE.BoxGeometry(...size);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    const radiansPerSecond = THREE.MathUtils.degToRad(30);
    console.log('radiansPerSecond', radiansPerSecond);
    // each frame, rotate the entire group of spheres
    cube.tick = (delta) => {
        // console.log('delta',delta);
        cube.rotation.x += delta * radiansPerSecond;
        cube.rotation.y += delta * radiansPerSecond;
    };
    return cube;
}

function setupModel_scene_ani0(data) {
    const model = data.scene;
    if (data.animations.length > 0) {
        const clip = data.animations[0];
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(clip);
        action.play();
        model.tick = (delta) => mixer.update(delta);
    }
    return model;
}

function setupModel_child_ani0(data) {
    const model = data.scene.children[0];
    if (data.animations.length > 0) {
        const clip = data.animations[0];
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(clip);
        action.play();
        model.tick = (delta) => mixer.update(delta);
    }
    return model;
}
function setupModel_scene_ani1(data) {
    const model = data.scene;
    if (data.animations.length > 0) {
        const clip = data.animations[1];
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(clip);
        action.play();
        model.tick = (delta) => mixer.update(delta);
    }

    return model;
}

function setupModel_scene_ani2(data) {
    const model = data.scene;
    if (data.animations.length > 0) {
        const clip = data.animations[2];
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(clip);
        action.play();
        model.tick = (delta) => mixer.update(delta);
    }

    return model;
}

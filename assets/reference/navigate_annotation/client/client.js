 
import * as THREE from 'https://unpkg.com/three@0.119.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.119.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://unpkg.com/three@0.119.0/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://unpkg.com/three@0.119.0/examples/jsm/loaders/MTLLoader.js';
import Stats from 'https://unpkg.com/three@0.119.0/examples/jsm/libs/stats.module.js';
import { TWEEN } from 'https://unpkg.com/three@0.119.0/examples/jsm/libs/tween.module.min.js';
import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.119.0/examples/jsm/renderers/CSS2DRenderer.js';
let annotations;
const annotationMarkers = [];

//场景，灯光，相机，渲染器
const scene = new THREE.Scene();
var light = new THREE.DirectionalLight();
light.position.set(-30, 30, 30);
scene.add(light);
var light2 = new THREE.DirectionalLight();
light2.position.set(30, 30, -30);
scene.add(light2);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 10;
camera.position.y = 5;
camera.position.z = 8;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// 轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.dampingFactor = .2;
controls.enableDamping = true;
controls.target.set(8, 3, 4);


const raycaster = new THREE.Raycaster();
const sceneMeshes = new Array();
const circleTexture = new THREE.TextureLoader().load("img/circle.png");
const mtlLoader = new MTLLoader();
mtlLoader.load('models/house_water.mtl', (materials) => {
    materials.preload();
    const progressBar = document.getElementById('progressBar');
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('models/house_water.obj', (object) => {
        object.scale.set(.01, .01, .01);
        scene.add(object);
        sceneMeshes.push(object);
        const annotationsDownload = new XMLHttpRequest();
        annotationsDownload.open('GET', './data/annotations.json');
        annotationsDownload.onreadystatechange = function () {
            if (annotationsDownload.readyState === 4) {
                annotations = JSON.parse(annotationsDownload.responseText);
                const annotationsPanel = document.getElementById("annotationsPanel");
                const ul = document.createElement("UL");
                const ulElem = annotationsPanel.appendChild(ul);
                Object.keys(annotations).forEach(a => {
                    //创造左侧控制面板，并绑定相机跳转函数gotoAnnotation
                    const li = document.createElement("UL");
                    const liElem = ulElem.appendChild(li);
                    const button = document.createElement("BUTTON");
                    button.innerHTML = a + " : " + annotations[a].title;
                    button.className = "annotationButton";
                    button.addEventListener("click", function () { gotoAnnotation(annotations[a]); });
                    liElem.appendChild(button);

                    // 创造标签，0、1、2、3、4
                    const annotationSpriteMaterial = new THREE.SpriteMaterial({
                        map: circleTexture,
                        depthTest: false,
                        depthWrite: false,
                        sizeAttenuation: false
                    });
                    const annotationSprite = new THREE.Sprite(annotationSpriteMaterial);
                  
                    let size=0.166;
                    annotationSprite.scale.set(size,size, size);//设置标签大小
                    annotationSprite.position.copy(annotations[a].lookAt);//设置标签位置
                    annotationSprite.userData.id = a;
                    console.log('a',a);
                    scene.add(annotationSprite);
                    annotationMarkers.push(annotationSprite);

                    // 设置详细描述方框的位置
                    const annotationDiv = document.createElement('div');
                    annotationDiv.className = 'annotationLabel';
                    annotationDiv.innerHTML = a;//0、1、2、3、4
                    const annotationLabel = new CSS2DObject(annotationDiv);
                    annotationLabel.position.copy(annotations[a].lookAt);
                    scene.add(annotationLabel);
                    //如果有描述，就创造元素，显示描述
                    if (annotations[a].description) {
                        const annotationDescriptionDiv = document.createElement('div');
                        annotationDescriptionDiv.className = 'annotationDescription';
                        annotationDescriptionDiv.innerHTML = annotations[a].description;
                        annotationDiv.appendChild(annotationDescriptionDiv);
                        annotations[a].descriptionDomElement = annotationDescriptionDiv;
                    }
                });
                progressBar.style.display = "none";
            }
        };
        annotationsDownload.send();
    }, (xhr) => {
        if (xhr.lengthComputable) {
            let percentComplete = xhr.loaded / xhr.total * 100;
            progressBar.value = percentComplete;
            progressBar.style.display = "block";
        }
    }, (error) => {
        console.log('An error happened');
    });
}, (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, (error) => {
    console.log('An error happened');
});
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
renderer.domElement.addEventListener('click', onClick, false);
//相机跳转函数
function onClick(event) {
    console.log('clicking');
    raycaster.setFromCamera({
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    }, camera);
    const intersects = raycaster.intersectObjects(annotationMarkers, true);
    if (intersects.length > 0) {
        if (intersects[0].object.userData && intersects[0].object.userData.id) {
            gotoAnnotation(annotations[intersects[0].object.userData.id]);
        }
    }
}
renderer.domElement.addEventListener('dblclick', onDoubleClick, false);
//双击屏幕可以调整视野
function onDoubleClick(event) {
    raycaster.setFromCamera({
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    }, camera);
    const intersects = raycaster.intersectObjects(sceneMeshes, true);
    if (intersects.length > 0) {
        const p = intersects[0].point;
        new TWEEN.Tween(controls.target)
            .to({
            x: p.x,
            y: p.y,
            z: p.z
        }, 500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
    }
}
//使用tweenjs实现相机视野跟随
function gotoAnnotation(a) {
    new TWEEN.Tween(camera.position)
        .to({
        x: a.camPos.x,
        y: a.camPos.y,
        z: a.camPos.z
    }, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    new TWEEN.Tween(controls.target)
        .to({
        x: a.lookAt.x,
        y: a.lookAt.y,
        z: a.lookAt.z
    }, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    Object.keys(annotations).forEach(annotation => {
        if (annotations[annotation].descriptionDomElement) {
            annotations[annotation].descriptionDomElement.style.display = "none";
        }
    });
    if (a.descriptionDomElement) {
        console.log(a.descriptionDomElement.style.display);
        a.descriptionDomElement.style.display = "block";
    }
}
const stats = Stats();
document.body.appendChild(stats.dom);
var animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    render();
    stats.update();
};
function render() {
    labelRenderer.render(scene, camera);
    renderer.render(scene, camera);
}
animate();

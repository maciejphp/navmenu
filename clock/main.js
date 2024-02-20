import * as THREE from 'three';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const maxTemperature = 200;


const width = window.innerWidth, height = window.innerHeight;

const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 100 );
camera.position.z = 2;
camera.rotation.y = 20 * Math.PI/180;

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x1c343f);
scene.background = new THREE.Color( 0xfce4ec );

const ambient = new THREE.HemisphereLight( 0xffffff, 0xbfd4d2, 3 );
scene.add( ambient );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
directionalLight.position.set( 1, 4, 3 ).multiplyScalar( 3 );
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.setScalar( 2048 );
directionalLight.shadow.bias = - 1e-4;
directionalLight.shadow.normalBias = 1e-4;
scene.add( directionalLight );



const loader = new FontLoader();
function loadFont(url) {
    return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
    })
}
const font = await loadFont('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json');

//text
function createText(textLetters, position) {
    let material = new THREE.MeshStandardMaterial({color: 0xff9800, roughness: 1, metalness: 0});
    if (!position) material = new THREE.MeshNormalMaterial();
    const textGeo = new TextGeometry( textLetters, {
        font: font,
        size: .2,
        height: 0.2,
    });
    const text = new THREE.Mesh(textGeo, material);
    textGeo.computeBoundingBox()
    textGeo.computeVertexNormals()
    textGeo.boundingBox.getCenter(text.position).multiplyScalar(-1)
    if (!position) {
        text.position.x = -textGeo.boundingBox.max.x / 2 - 1
        text.position.y = 1
        text.position.z = -1
    }else {
        text.position.x = position.x - textGeo.boundingBox.max.x / 2;
        text.position.y = position.y - textGeo.boundingBox.max.y / 2;
        text.position.z = position.z;
    }
    scene.add(text);
    return text;
}
function refreshText(text, newText) {
    scene.remove(text);
    textMesh = createText("Temperatuur: " + newText);
}
let textMesh = createText("Temperatuur: 0");

//clock getalen
createText("0", new THREE.Vector3(-.5, 0, -.05));
createText(Math.round(maxTemperature * .25) + "", new THREE.Vector3(0, .5, -.05));
createText(Math.round(maxTemperature * .5) + "", new THREE.Vector3(.5, 0, -.05));
createText(Math.round(maxTemperature * .75) + "", new THREE.Vector3(0, -.5, -.05));

//clock
const clockGeo = new THREE.CylinderGeometry(.45, .6, .2);
const clockMesh = new THREE.Mesh(clockGeo, new THREE.MeshStandardMaterial({color: 0x80cbc4, roughness: 0, metalness: 0}));
clockMesh.rotation.x = 90 * Math.PI/180;

//wijzer
const wijzerGeo = new THREE.BoxGeometry(.05, .3, .15);
const wijzerkMesh = new THREE.Mesh(wijzerGeo, new THREE.MeshStandardMaterial({color: 0xff9800, roughness: 0, metalness: 0}));
wijzerkMesh.position.z = .08;


scene.add(clockMesh, wijzerkMesh);

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( width, height );
document.body.appendChild( renderer.domElement );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.render(scene, camera)

// renderer.setPixelRatio( window.devicePixelRatio );

function render() {
    renderer.render(scene, camera);
}

const controls = new OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render );
controls.minDistance = 1;
controls.maxDistance = 50;
controls.enablePan = false;



let temperature = 0;
let displayTemperature = 0;
document.addEventListener("keydown", (key)=> {
    if (key.key == 1 || key.key == 2 || key.key == 3 || key.key == 4 || key.key == 5 || key.key == 6 || key.key == 7 || key.key == 8 || key.key == 9 || key.key == 0) {
        temperature += key.key;
    }
    if (key.key === "Backspace") {
        temperature += "";
        temperature = temperature.substring(0, temperature.length - 1);
    }
    temperature = Math.min(Number(temperature), maxTemperature);
    console.log(temperature);
    refreshText(textMesh, temperature + "");
})


function animate() {
	requestAnimationFrame( animate );
    displayTemperature += Math.sign(temperature - displayTemperature);
    rotate(wijzerkMesh, displayTemperature * 360 / maxTemperature);
    
	renderer.render( scene, camera );

    //kleur veranderen
    clockMesh.color = new THREE.Color(0xffffff);
}

animate();

function rotate(mesh, degrees) {
        let radians = (90 - degrees) * Math.PI / 180;

        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.rotation.z = radians;

        //get lookdirection
        const matrix = new THREE.Matrix4();
        matrix.extractRotation(mesh.matrix );
        const direction = new THREE.Vector3( 0, 1, 0 );
        direction.applyMatrix4(matrix)

    
        mesh.position.x += direction.x * .15;
        mesh.position.y += direction.y * .15;
}


window.addEventListener( 'resize', onWindowResize );
function onWindowResize() {

    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = ( window.innerWidth / window.innerHeight );
    camera.updateProjectionMatrix();

}
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export const setSkySphere_HDR = ( scene, imagePath) => {

   let hdrTexture = new RGBELoader().load(imagePath)
   
   let skySphereGeometry = new THREE.SphereGeometry(300, 60, 60);
   
   let skySphereMaterial = new THREE.MeshPhongMaterial({
     map: hdrTexture
   });
   
   skySphereMaterial.side = THREE.BackSide;
   let skySphereMesh = new THREE.Mesh(skySphereGeometry, skySphereMaterial);

   scene.add(skySphereMesh)
 
 }

 export const setSkySphere_JPG = (scene, imagePath) => {
    let textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(imagePath, (jpgTexture) => {
      let skySphereGeometry = new THREE.SphereGeometry(1000, 60, 60);
    
      let skySphereMaterial = new THREE.MeshBasicMaterial({
        map: jpgTexture
      });
    
      skySphereMaterial.side = THREE.BackSide;
      let skySphereMesh = new THREE.Mesh(skySphereGeometry, skySphereMaterial);
 
      scene.add(skySphereMesh);
    });
 };
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js"; // Make sure to import the Water class

export const LoadGLTFByPath = (scene, startingModelPath, gltfStore) => {
  return new Promise((resolve, reject) => {
    // Create a loader
    const loader = new GLTFLoader();

    // Load the GLTF file
    loader.load(
      startingModelPath,
      (gltf) => {
        scene.add(gltf.scene);
        gltfStore.animations = gltf.animations;

        resolve();
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
};

export const SetEnvMapping = (scene) => {
  const textureLoader = new THREE.TextureLoader();
  const envMap = textureLoader.load("./src/models/environmentMap.JPG");
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  envMap.encoding = THREE.sRGBEncoding;

  scene.traverse((object) => {
    if (object.isMesh) {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => {
        material.envMap = envMap;
        material.needsUpdate = true;
      });
    }
  });
};

export const SetAmbientLighting = (scene) => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 4); // Color: white, Intensity: 0.5
  scene.add(ambientLight);
};

export const GetWater = (scene) => {
  let waterObjects = [];
  let water;

  scene.traverse((object) => {
    if (object.isMesh && object.name == "WaterPlane") {
      waterObjects.push(object);
    }
  });

  waterObjects.forEach((object) => {
    const objectSize = new THREE.Vector3();
    object.geometry.computeBoundingBox();
    object.geometry.boundingBox.getSize(objectSize);

    const waterGeometry = new THREE.PlaneGeometry(1000, 1000);

    water = new Water(
      // object.geometry
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load(
          "./src/textures/waternormals.jpg",
          function (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }
        ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x00faff,
        distortionScale: 3.7,
        fog: scene.fog !== undefined,
      }
    );

    water.rotation.x = -Math.PI / 2;
    water.position.copy(object.position); // Set water's position to the original object's position
    object.parent.remove(object); // Remove the existing object from its parent
    scene.add(water); // Add the water object to the scene
  });

  return water;
};

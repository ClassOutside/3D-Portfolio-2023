import * as THREE from "three";
import {
  LoadGLTFByPath,
  SetEnvMapping,
  SetAmbientLighting,
  GetWater,
} from "../helpers/ModelHelper.js";
import PositionAlongPathState from "../positionAlongPathTools/PositionAlongPathState.js";
import {
  handleScroll,
  updatePosition,
  newStaticPositionSelected,
  prepareToExitStaticPositionAndReturnToCurvePath,
} from "../positionAlongPathTools/PositionAlongPathMethods.js";
import { loadCurveFromJSON } from "../curveTools/CurveMethods.js";
import { setupRenderer } from "../helpers/RendererHelper.js";
import {
  PerspectiveCameraForResizableWindow,
  handleCameraRotation,
  handleMouseMovement,
} from "../CameraRotation/CameraWithMouseRotation.js";
import CameraOrientationState from "../CameraRotation/CameraOrientationState.js";
import {
  getMouseVector2,
  checkRayIntersections,
} from "../helpers/RayCastHelper.js";
import { setSkySphere_JPG } from "../helpers/SkysphereHelper.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import {
  getOutlineEffect,
  configureOutlineEffectSettings_Default,
  addOutlinesBasedOnIntersections,
} from "../helpers/OutlineHelper.js";
import {
  updateAnimation,
  startLinkAnimation,
  startLinkAnimation_Reversed,
} from "../helpers/AnimationHelper.js";
import ButtonLinkAddresses from "../Routing/ButtonLinkAddresses.js";

const startingModelPath = "./src/models/scene.gltf";
const curvePathJSON = "./src/models/curvePath.json";
const skySphereImagePath = "./src/textures/sunflowers_puresky.jpg";

export async function setupScene(canvas) {
  //Scene is container for objects, cameras, and lights
  const scene = new THREE.Scene();
  let mousePointer = new THREE.Vector2();
  const renderer = setupRenderer();
  const raycaster = new THREE.Raycaster();
  raycaster.far = 15; //set max Raycast distance
  let water;
  let gltfStore = {};
  let mixer;
  let clock = new THREE.Clock();
  let currentSelectedObject = {
    selectedObjects: [],
  };
  let buttonLinkAddresses = new ButtonLinkAddresses();

  await LoadGLTFByPath(scene, startingModelPath, gltfStore);

  SetEnvMapping(scene);
  SetAmbientLighting(scene);
  water = GetWater(scene);

  let curvePath = await loadCurveFromJSON(scene, curvePathJSON);

  const camera = PerspectiveCameraForResizableWindow(75, 0.1, 1000, renderer);
  const cameraHolder = new THREE.Object3D();

  cameraHolder.add(camera);
  cameraHolder.position.copy(curvePath.curve.getPointAt(0));
  cameraHolder.lookAt(curvePath.curve.getPointAt(0.01));
  cameraHolder.rotateY(Math.PI); // Math.PI is 180 degrees in radians

  scene.add(cameraHolder);

  let positionAlongPathState = new PositionAlongPathState();
  let cameraOrientationState = new CameraOrientationState();

  window.addEventListener("wheel", onMouseScroll, false);
  document.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("click", onMouseClick, false);

  setSkySphere_JPG(scene, skySphereImagePath);

  let composer = new EffectComposer(renderer);
  //Setup renderPass and add it to the composer
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  //Setup outlinePass, configure outlinePass settings, add it to the composer
  let outlinePass = getOutlineEffect(window, scene, camera);
  configureOutlineEffectSettings_Default(outlinePass);
  composer.addPass(outlinePass);

  function updateSelectableObjects(
    mousePointer,
    camera,
    raycaster,
    scene,
    outlinePass
  ) {
    let intersection = checkRayIntersections(
      mousePointer,
      camera,
      raycaster,
      scene
    );
    addOutlinesBasedOnIntersections(intersection, outlinePass);
  }

  function onMouseScroll(event) {
    if (positionAlongPathState.currentlyOnTrack == false) {
      prepareToExitStaticPositionAndReturnToCurvePath(
        cameraHolder,
        curvePath,
        positionAlongPathState
      );
      mixer = startLinkAnimation_Reversed(
        scene,
        mixer,
        gltfStore,
        currentSelectedObject
      );
    } else {
      handleScroll(event, positionAlongPathState);
    }

    updateSelectableObjects(
      mousePointer,
      camera,
      raycaster,
      scene,
      outlinePass
    );
  }

  function onMouseMove(event) {
    mousePointer = getMouseVector2(event, window);

    handleMouseMovement(mousePointer.x, mousePointer.y, cameraOrientationState);

    updateSelectableObjects(
      mousePointer,
      camera,
      raycaster,
      scene,
      outlinePass
    );
  }

  function onMouseClick(event) {
    if (outlinePass.selectedObjects.length > 0) {
      const selectedObjectName = outlinePass.selectedObjects[0].userData.name;

      if (
        selectedObjectName.includes("Button") &&
        !selectedObjectName.includes("Link")
      ) {
        newStaticPositionSelected(
          outlinePass,
          positionAlongPathState,
          cameraHolder,
          scene
        );
        mixer = startLinkAnimation(scene, mixer, gltfStore, outlinePass);
        currentSelectedObject.selectedObjects = [
          outlinePass.selectedObjects[0],
        ];
      } else if (
        selectedObjectName.includes("Button") &&
        selectedObjectName.includes("Link")
      ) {
        if (selectedObjectName.includes("001")) {
          window.location.href = buttonLinkAddresses.default_button_address;
        } else if (selectedObjectName.includes("002")) {
          window.location.href = buttonLinkAddresses.button_002_address;
        }
      }
    }
  }

  // Animate the scene
  function animate() {
    requestAnimationFrame(animate);

    updateAnimation(clock, mixer);

    updatePosition(curvePath, cameraHolder, positionAlongPathState);
    handleCameraRotation(camera, cameraOrientationState);

    //if camera is off Track, look at specified object
    if (
      cameraHolder.position.x ==
      curvePath.curve.getPointAt(positionAlongPathState.currentPercentageOnPath)
        .x
    ) {
      let timeElapsed =
        performance.now() - positionAlongPathState.lastScrollTime;
      if (timeElapsed > positionAlongPathState.movementDuration) {
        positionAlongPathState.currentlyOnTrack = true;
      }
    }

    water.material.uniforms["time"].value += 1.0 / 360.0;

    document.body.style.cursor =
      outlinePass.selectedObjects.length > 0 ? "pointer" : "default";

    composer.render();
  }
  animate();
}

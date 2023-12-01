import * as THREE from "three";

export function updateAnimation(clock, mixer) {
  var delta = clock.getDelta();
  if (mixer) mixer.update(delta);
}

export function startLinkAnimation(scene, mixer, gltfStore, outlinePass) {
  const animationName = getAnimationName(outlinePass);
  const animationToPlay = getAnimation(gltfStore, animationName);
  let yourObject = {};
  yourObject = getArmature(scene, yourObject, animationName);
  mixer = playAnimationForArmature(animationToPlay, mixer, yourObject);

  return mixer;
}

export function startLinkAnimation_Reversed(
  scene,
  mixer,
  gltfStore,
  currentSelectedObject
) {
  const animationName = getAnimationName(currentSelectedObject);
  const animationToPlay = getAnimation(gltfStore, animationName);
  let yourObject = {};
  yourObject = getArmature(scene, yourObject, animationName);
  mixer = playAnimationForArmature_Reversed(animationToPlay, mixer, yourObject);

  return mixer;
}

function playAnimationForArmature(animationToPlay, mixer, yourObject) {
  if (animationToPlay) {
    // Create an animation mixer for the object you want to animate (replace yourObject).
    mixer = new THREE.AnimationMixer(yourObject); // Replace yourObject with the object you want to animate.

    // Create an action for the animation.
    const action = mixer.clipAction(animationToPlay);

    // Set the animation to loop.
    action.setLoop(THREE.LoopRepeat);

    // Set the number of times the animation should repeat (0 for stopping after one play).
    action.repetitions = 0;
    action.clampWhenFinished = true;

    // Start the animation.
    action.play();
  } else {
    console.log("Animation with 'button' not found.");
  }
  return mixer;
}

function playAnimationForArmature_Reversed(animationToPlay, mixer, yourObject) {
  if (animationToPlay) {
    // Create an animation mixer for the object you want to animate (replace yourObject).
    mixer = new THREE.AnimationMixer(yourObject);

    // Create an action for the animation.
    const action = mixer.clipAction(animationToPlay);

    // Set the animation to loop.
    action.setLoop(THREE.LoopRepeat);

    // Set the number of times the animation should repeat (0 for stopping after one play).
    action.repetitions = 0;
    action.clampWhenFinished = true;

    // Set the animation's time to the end frame.
    action.time = action.getClip().duration;

    // Start the animation.
    action.play();

    // Play the animation in reverse by setting the time scale to a negative value.
    action.setEffectiveTimeScale(-1);
  } else {
    console.log("Animation with 'button' not found.");
  }
  return mixer;
}

function getArmature(scene, yourObject, animationName) {
  scene.traverse(function (object) {
    if (object instanceof THREE.Object3D) {
      if (
        typeof object.userData.name != "undefined" &&
        object.userData.name.includes("Armature") &&
        object.userData.name
          .replace(/\./g, "")
          .includes(animationName.replace(/\./g, ""))
      ) {
        console.log(object.userData.name);
        yourObject = object;
      }
    }
  });
  return yourObject;
}

function getAnimation(gltfStore, animationName) {
  //Animations retain the . in their name, while meshes and armatures do not. The regex function is necessary for this
  return gltfStore.animations.find((animation) =>
    animation.name.replace(/\./g, "").includes(animationName.replace(/\./g, ""))
  );
}

function getAnimationName(outlinePass) {
  let selectedObject = outlinePass.selectedObjects[0];
  let animationName = selectedObject.name + "_Link";

  return animationName;
}

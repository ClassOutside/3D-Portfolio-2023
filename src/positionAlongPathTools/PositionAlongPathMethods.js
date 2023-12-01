import * as THREE from "three";

export function handleScroll(event, positionAlongPathState) {
  positionAlongPathState.lastScrollTime = performance.now();

  //When a new scroll starts, set the starting distance along the path to whatever the object's current distance is.
  positionAlongPathState.startingDistance =
    positionAlongPathState.currentDistanceOnPath;

  const changeInScroll = Math.sign(event.deltaY);

  positionAlongPathState.targetDistance -=
    changeInScroll / positionAlongPathState.lengthToScroll;
}

export function updatePosition(curvePath, object, positionAlongPathState) {
  let timeElapsed = performance.now() - positionAlongPathState.lastScrollTime;

  if (timeElapsed < positionAlongPathState.movementDuration) {
    if (positionAlongPathState.currentlyOnTrack) {
      interpolatePositionAlongPath(
        positionAlongPathState,
        curvePath,
        object,
        timeElapsed
      );
    } else {
      interpolateBetweenTwoPositions(
        positionAlongPathState,
        object,
        timeElapsed
      );
    }
  }
}

export function newStaticPositionSelected(
  outlinePass,
  positionAlongPathState,
  object,
  scene
) {
  let selectedObject = outlinePass.selectedObjects[0];
  positionAlongPathState.lookAtPosition = selectedObject.position;

  let cameraHolderDestinationName = selectedObject.name + "_CameraPosition";
  const objectByName = scene.getObjectByName(cameraHolderDestinationName);

  positionAlongPathState.lastScrollTime = performance.now();
  positionAlongPathState.currentlyOnTrack = false;
  positionAlongPathState.startingPosition = object.position;
  positionAlongPathState.endPosition = objectByName.position;
}

export function prepareToExitStaticPositionAndReturnToCurvePath(
  object,
  curvePath,
  positionAlongPathState
) {
  let timeElapsed = performance.now() - positionAlongPathState.lastScrollTime;

  //Only consider new scroll if position move is complete
  if (timeElapsed > positionAlongPathState.movementDuration) {
    positionAlongPathState.lastScrollTime = performance.now();
    positionAlongPathState.startingPosition = object.position;
    positionAlongPathState.endPosition = curvePath.curve.getPointAt(
      positionAlongPathState.currentPercentageOnPath
    );
  }
}

function interpolatePositionAlongPath(
  positionAlongPathState,
  curvePath,
  object,
  timeElapsed
) {
  // The percentage complete towards the total time to animate, movementDuration.
  const timeLeftPercentage =
    timeElapsed / positionAlongPathState.movementDuration;

  const minimumDegreeOfChange = 0.005;
  const maximumDegreeOfChange = 0.9;

  let interpolationFactor = Math.max(timeLeftPercentage, minimumDegreeOfChange);
  interpolationFactor = Math.min(interpolationFactor, maximumDegreeOfChange);

  let interpolatedPositionOnPath =
    (1 - interpolationFactor) * positionAlongPathState.startingDistance +
    interpolationFactor * positionAlongPathState.targetDistance;

  positionAlongPathState.currentDistanceOnPath = interpolatedPositionOnPath;
  positionAlongPathState.currentPercentageOnPath =
    positionAlongPathState.currentDistanceOnPath < 0
      ? 1 - (Math.abs(positionAlongPathState.currentDistanceOnPath) % 1)
      : positionAlongPathState.currentDistanceOnPath % 1;

  if (typeof positionAlongPathState.currentPercentageOnPath === "undefined") {
    currentPercentageOnPath = 0.001;
  }

  const newPosition = curvePath.curve.getPointAt(
    positionAlongPathState.currentPercentageOnPath
  );
  const newLookAt = getCurveLookAtPosition(curvePath, positionAlongPathState);

  object.position.copy(newPosition);
  object.lookAt(newLookAt);
}

function interpolateBetweenTwoPositions(
  positionAlongPathState,
  object,
  timeElapsed
) {
  let progress = Math.min(
    timeElapsed / positionAlongPathState.movementDuration,
    1
  );
  let nextPosition = object.position.clone();
  nextPosition.lerp(positionAlongPathState.endPosition, progress);

  positionAlongPathState.currentPosition = nextPosition;
  object.position.copy(nextPosition);

  object.lookAt(positionAlongPathState.lookAtPosition);

  // Rotate the object by 180 degrees around the up axis (Y-axis)
  // Strange but the cameraholder and camera seem backwards
  const upAxis = new THREE.Vector3(0, 1, 0);
  const angle = Math.PI; // 180 degrees in radians
  object.rotateOnAxis(upAxis, angle);
}

export function getCurveLookAtPosition(curvePath, positionAlongPathState) {
  let lookAtPosition =
    positionAlongPathState.currentPercentageOnPath - 0.0000001;

  if (typeof lookAtPosition === "undefined") {
    lookAtPosition = 0.001;
  }

  const newLookAt = curvePath.curve.getPointAt(lookAtPosition);

  return newLookAt;
}

import * as THREE from 'three';

export function getMouseVector2(event, window){
    let mousePointer = new THREE.Vector2()

    mousePointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	mousePointer.y = (event.clientY / window.innerHeight) * 2 - 1;

    return mousePointer;
}

export function checkRayIntersections(mousePointer, camera, raycaster, scene) {

    // //Since MousePointer.y is inverted for camera rotations, it needs to be flipped here for proper intersecting.
    let mousePointer_invertedY = getMousePointerWithInvertedY(mousePointer);

    raycaster.setFromCamera(mousePointer_invertedY, camera);

    let intersections = raycaster.intersectObjects(scene.children, true);

    return intersections;
}

function getMousePointerWithInvertedY(mousePointer){
    let mousePointer_invertedY = mousePointer
    mousePointer_invertedY.y = mousePointer_invertedY.y + 1
    mousePointer_invertedY.y = mousePointer_invertedY.y / 2
    mousePointer_invertedY.y = -mousePointer_invertedY.y * 2 + 1

    return mousePointer_invertedY;
}
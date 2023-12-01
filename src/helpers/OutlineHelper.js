import * as THREE from 'three';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'

export function getOutlineEffect(window, scene, camera){
    let outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );

    return outlinePass;
}

export function configureOutlineEffectSettings_Default(outlinePass){

    outlinePass.edgeStrength = 5;
    outlinePass.edgeGlow = 0.9;
    outlinePass.edgeThickness = 4;
    outlinePass.pulsePeriod = 9;
    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.hiddenEdgeColor.set('#190a05');

}

export function addOutlinesBasedOnIntersections(intersections, outlinePass){

    outlinePass.selectedObjects = [];

    if(intersections.length > 0){
        let firstObject = intersections[0].object
        
        if (typeof firstObject.userData.name !== 'undefined') {
            let objectName = firstObject.userData.name;
    
            if(objectName.includes("Button")){
                outlinePass.selectedObjects = [firstObject];
            }
        }
    }
}
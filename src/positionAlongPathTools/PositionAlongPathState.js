import { Vector3 } from "three";

class PositionAlongPathState {
  constructor() {
    this.startingDistance = 0.000001;
    this.currentDistanceOnPath = 0.000001;
    this.currentPercentageOnPath = 0.000001;
    this.targetDistance = 0;
    this.movementDuration = 1000; // how long it should take
    this.lengthToScroll = 100; //How many scroll ticks are required to complete the loop.
    this.lastScrollTime = 0;

    this.currentlyOnTrack = true;
    this.startingPosition = new Vector3();
    this.currentPosition = new Vector3();
    this.endPosition = new Vector3();
    this.preparingToExitStaticPosition = false;
    this.lookAtPosition = new Vector3();
  }
}

export default PositionAlongPathState;

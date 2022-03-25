import * as THREE from 'three'

export class Keyframe
{
    public timestamp: number;
    public position: THREE.Vector3;

    constructor(timestamp = 0, position = new THREE.Vector3())
    {
        this.timestamp = timestamp;
        this.position = new THREE.Vector3();
        this.position.copy(position);
    }
}
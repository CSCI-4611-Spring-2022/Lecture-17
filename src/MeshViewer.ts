import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import * as IK from 'ikts'
import { GUI } from 'dat.gui'
import { GraphicsApp } from './GraphicsApp'
import { RobotPart } from './RobotPart';
import { KeyframeAnimation } from './KeyframeAnimation'

export class MeshViewer extends GraphicsApp
{ 
    // State variables
    private debugMode: boolean;
    private motionMode: string;

    // The root node of the robot
    private robotRoot: RobotPart;
    private robotChain: IK.Chain3D;
    private ikSolver: IK.Structure3D;

    // Draggable target mesh
    private targetMesh: THREE.Mesh;
    private transformControls: TransformControls;

    // Holds all the keyframes
    private animation: KeyframeAnimation;

    constructor()
    {
        // Pass in the aspect ratio to the constructor
        super(60, 1920/1080, 0.1, 10);

        this.debugMode = false;
        this.motionMode = 'Linear';

        this.ikSolver = new IK.Structure3D();
        this.robotChain = new IK.Chain3D();
        this.robotRoot = new RobotPart('root', this.robotChain);

        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.targetMesh = new THREE.Mesh();
        this.animation = new KeyframeAnimation(this.targetMesh);
    }

    createScene(): void
    {
        // Setup camera
        this.camera.position.set(0, 0, 1.5);
        this.camera.lookAt(0, 0, 0);
        this.camera.up.set(0, 1, 0);

        const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        // Create an ambient light
        const ambientLight = new THREE.AmbientLight('white', 0.3);
        this.scene.add(ambientLight);

        // Create a directional light
        const directionalLight = new THREE.DirectionalLight('white', .6);
        directionalLight.position.set(0, 2, 1);
        this.scene.add(directionalLight)

        // Create the GUI
        const gui = new GUI();

        const animationControls = gui.addFolder('Animation');
        animationControls.open();

        const motionModeControl = animationControls.add(this, 'motionMode', ["Linear", "Spline"]);
        motionModeControl.name('Motion');

        const keyframeButton = animationControls.add(this, 'addKeyframe');
        keyframeButton.name('Add Keyframe');

        const animationButton = animationControls.add(this, 'playAnimation');
        animationButton.name('Play Animation');
        
        const debugControls = gui.addFolder('Debugging');
        debugControls.open();

        const debugController = debugControls.add(this, 'debugMode');
        debugController.name('Debug Mode');
        debugController.onChange((value: boolean) => { this.toggleDebugMode(value) });

        // Add the target mesh to the scene
        this.targetMesh.geometry = new THREE.SphereGeometry(0.02);
        this.targetMesh.material = new THREE.MeshLambertMaterial({color: 'skyblue'});
        this.targetMesh.position.set(0.5, 0, -0.5)
        this.scene.add(this.targetMesh);

        // Add a transform control to move the target object around
        this.transformControls.setSize(0.5);
        this.transformControls.attach(this.targetMesh);
        this.transformControls.addEventListener('mouseDown', ()=>{
            orbitControls.enabled = false;
        });
        this.transformControls.addEventListener('mouseUp', ()=>{
            orbitControls.enabled = true;
        });
        this.scene.add(this.transformControls);

        // Create a grid helper for the ground plane
        const gridHelper = new THREE.GridHelper(10, 10);
        this.scene.add( gridHelper );
        gridHelper.translateY(-0.6);

        // Create the robot skeleton
        this.robotRoot.createSkeleton();

        // Create all the meshes for the robot
        this.robotRoot.createMeshes();

        // Initialize the IK structure
        this.ikSolver.add(this.robotChain, new IK.V3(this.targetMesh.position.x, this.targetMesh.position.y, this.targetMesh.position.z));

        // Move the entire robot down to the ground plane
        this.robotRoot.translateY(-0.6);

        // Add the robot root transform to the scene
        this.scene.add(this.robotRoot);
    }

    update(deltaTime: number): void
    {
        this.animation.update(deltaTime, this.motionMode=='Spline');

        this.transformControls.visible = !this.animation.playing;
        this.targetMesh.visible = !this.animation.playing;

        this.ikSolver.targets[0].set(this.targetMesh.position.x, this.targetMesh.position.y, this.targetMesh.position.z);
        this.ikSolver.update();
        this.robotRoot.update();
    }

    private toggleDebugMode(debugMode: boolean): void
    {
        this.robotRoot.setDebugMode(debugMode);
    }

    private addKeyframe(): void
    {
        this.animation.addKeyframe(this.targetMesh.position);
    }

    private playAnimation(): void
    {
        this.animation.play();
    }
}

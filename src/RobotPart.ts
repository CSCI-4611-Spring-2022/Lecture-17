import * as THREE from 'three'
import * as IK from 'ikts'

export class RobotPart extends THREE.Group
{
    public name: string;

    private chain: IK.Chain3D;
    private boneLength: number;
    private boneId: number;

    private defaultMaterial: THREE.MeshLambertMaterial;
    private debugHelper: THREE.AxesHelper;

    constructor(name: string, chain: IK.Chain3D)
    {
        super();

        this.name = name;
        this.defaultMaterial = new THREE.MeshLambertMaterial();
        this.defaultMaterial.wireframe = false;

        // Create a visual representation of the axes
        this.debugHelper = new THREE.AxesHelper(0.07);
        this.debugHelper.visible = false;
        this.add(this.debugHelper);

        this.chain = chain;
        this.boneId = -1;
        this.boneLength = 0;
    }

    createSkeleton(): void
    {
        const direction = new IK.V3();

        if(this.name == 'root')
        {
            this.add(new RobotPart('upperArm', this.chain));
        }
        else if(this.name == 'upperArm')
        {
            this.add(new RobotPart('middleArm', this.chain));

            this.boneLength = 0.5;

            const bone = new IK.Bone3D(new IK.V3(0, 0.05, 0), undefined, new IK.V3(0, 1, 0), this.boneLength);
            this.chain.addBone(bone);
            this.boneId = this.chain.bones.length-1;
        }
        else if(this.name == 'middleArm')
        {
            this.add(new RobotPart('lowerArm', this.chain));

            this.boneLength = 0.4;

            this.chain.addConsecutiveBone(new IK.V3(0, 1, 0), this.boneLength);
            this.boneId = this.chain.bones.length-1;
        }
        else if(this.name == 'lowerArm')
        {
            this.add(new RobotPart('endEffector', this.chain));

            this.boneLength = 0.4;

            this.chain.addConsecutiveBone(new IK.V3(0, 1, 0), this.boneLength);
            this.boneId = this.chain.bones.length-1;
        }
        else if(this.name == 'endEffector')
        {
            this.boneLength = 0.2;

            this.chain.addConsecutiveBone(new IK.V3(0, 1, 0), this.boneLength);
            this.boneId = this.chain.bones.length-1;
        }

        // Recursively call this function for each child robot part
        this.children.forEach((child: THREE.Object3D)=>{
            if(child instanceof RobotPart)
            {
                child.createSkeleton();
            }
        });
    }

    createMeshes(): void
    {
        if(this.name == 'root')
        {
            // Create the base at the root node
            const geometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
            const mesh = new THREE.Mesh(geometry, this.defaultMaterial);
            mesh.translateY(0.025);
            this.add(mesh);

            const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2);
            const sphereMesh = new THREE.Mesh(sphereGeometry, this.defaultMaterial);
            sphereMesh.translateY(0.05);
            this.add(sphereMesh);
        }
        if(this.name == 'upperArm')
        {
            const geometry = new THREE.BoxGeometry(0.05, this.boneLength, 0.05);
            const mesh = new THREE.Mesh(geometry, this.defaultMaterial);
            mesh.translateY(0.25);
            this.add(mesh);

            const sphereGeometry = new THREE.SphereGeometry(0.05);
            const sphereMesh = new THREE.Mesh(sphereGeometry, this.defaultMaterial);
            sphereMesh.translateY(0.5);
            this.add(sphereMesh);
        }
        else if(this.name == 'middleArm')
        {
            this.translateY(0.5);
            this.rotateZ(45 * Math.PI / 180);

            const geometry = new THREE.BoxGeometry(0.05, this.boneLength, 0.05);
            const mesh = new THREE.Mesh(geometry, this.defaultMaterial);
            mesh.translateY(0.2);
            this.add(mesh);

            const sphereGeometry = new THREE.SphereGeometry(0.05);
            const sphereMesh = new THREE.Mesh(sphereGeometry, this.defaultMaterial);
            sphereMesh.translateY(0.4);
            this.add(sphereMesh);
        }
        else if(this.name == 'lowerArm')
        {
            this.translateY(0.4);
            this.rotateZ(45 * Math.PI / 180);

            const geometry = new THREE.BoxGeometry(0.05, this.boneLength, 0.05);
            const mesh = new THREE.Mesh(geometry, this.defaultMaterial);
            mesh.translateY(0.2);
            this.add(mesh);

            const sphereGeometry = new THREE.SphereGeometry(0.05);
            const sphereMesh = new THREE.Mesh(sphereGeometry, this.defaultMaterial);
            sphereMesh.translateY(0.4);
            this.add(sphereMesh);
        }
        else if(this.name == 'endEffector')
        {
            this.translateY(0.4);
            this.rotateZ(45 * Math.PI / 180);
            this.rotateY(90 * Math.PI / 180);

            const pincherLength = this.boneLength / 1.5;

            const geometry = new THREE.BoxGeometry(0.025, pincherLength, 0.025);

            const leftMesh1 = new THREE.Mesh(geometry, this.defaultMaterial);
            leftMesh1.rotateZ(45 * Math.PI / 180);
            leftMesh1.translateY(this.boneLength/4 + 0.04);
            this.add(leftMesh1);

            const leftMesh2 = new THREE.Mesh(geometry, this.defaultMaterial);
            leftMesh2.translateY(pincherLength/2);
            leftMesh2.rotateZ(-75 * Math.PI / 180);
            leftMesh2.translateY(pincherLength/2 - 0.01225);
            leftMesh1.add(leftMesh2);

            const rightMesh1 = new THREE.Mesh(geometry, this.defaultMaterial);
            rightMesh1.rotateZ(-45 * Math.PI / 180);
            rightMesh1.translateY(pincherLength/2 + 0.04);
            this.add(rightMesh1);

            const rightMesh2 = new THREE.Mesh(geometry, this.defaultMaterial);
            rightMesh2.translateY(pincherLength/2);
            rightMesh2.rotateZ(75 * Math.PI / 180);
            rightMesh2.translateY(pincherLength/2 - 0.01225);
            rightMesh1.add(rightMesh2);
        }
 
        // Recursively call this function for each child robot part
        this.children.forEach((child: THREE.Object3D)=>{
            if(child instanceof RobotPart)
            {
                child.createMeshes();
            }
        });
    }
    

    update(): void
    {
        if(this.boneId >= 0)
        {
            const bone = this.chain.bones[this.boneId];
            this.lookAt(bone.end.x, bone.end.y, bone.end.z);
            this.rotateX(Math.PI / 2);
        }
 
        // Recursively call this function for each child robot part
        this.children.forEach((child: THREE.Object3D)=>{
            if(child instanceof RobotPart)
            {
                child.update();
            }
        });
    }

    setRotation(name: string, rotation: THREE.Euler): void
    {
        if(this.name == name)
        {
            this.setRotationFromEuler(rotation);
        }
        else
        {
            // Recursively call this function for each child robot part
            this.children.forEach((child: THREE.Object3D)=>{
                if(child instanceof RobotPart)
                {
                    child.setRotation(name, rotation);
                }
            });
        }
    }

    setDebugMode(debugMode: boolean): void
    {
        this.defaultMaterial.wireframe = debugMode;
        this.debugHelper.visible = debugMode;

        // Recursively call this function for each child robot part
        this.children.forEach((child: THREE.Object3D)=>{
            if(child instanceof RobotPart)
            {
                child.setDebugMode(debugMode);
            }
        });
    }
}
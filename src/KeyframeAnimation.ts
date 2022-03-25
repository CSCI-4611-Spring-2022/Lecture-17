import * as THREE from 'three'
import { Keyframe } from "./Keyframe";

export class KeyframeAnimation
{
    private animatedObject: THREE.Object3D;
    private keyframes: Keyframe[];

    private curve: THREE.CatmullRomCurve3;
    private curveKeyframes: Keyframe[];
    private curveFps: number;

    public playing: boolean;
    private currentTime: number;
    private currentKeyframe: number;

    constructor(animatedObject: THREE.Object3D)
    {
        this.animatedObject = animatedObject;
        
        this.keyframes = [];
        this.keyframes.push(new Keyframe());

        this.curve = new THREE.CatmullRomCurve3()
        this.curve.points.push(new THREE.Vector3());

        this.curveKeyframes = [];
        this.curveFps = 30;

        this.currentTime = 0;  
        this.currentKeyframe = 0;
        this.playing = false;
    }

    addKeyframe(position: THREE.Vector3): void
    {
        const keyframePosition = position.clone();

        // One second between keyframes
        const keyframe = new Keyframe(this.keyframes[this.keyframes.length-1].timestamp + 1, keyframePosition);
        this.keyframes.push(keyframe);

        // Add the key point to the curve
        this.curve.points.push(keyframePosition);
    }

    play(): void
    {
        // Nothing to play, return
        if(this.keyframes.length <= 1)
        {
            console.log("No animation to play.  Please add a keyframe.")
            return;
        }

        this.keyframes[0].position.copy(this.animatedObject.position);
        this.curve.points[0].copy(this.animatedObject.position);

        if(this.keyframes.length >= 3)
        {
            const animationTime = this.keyframes[this.keyframes.length - 1].timestamp;
            const divisions = Math.ceil(this.curveFps * animationTime);
            const curvePoints = this.curve.getPoints(divisions);
            
            this.curveKeyframes = [];
            for(let i=0; i < curvePoints.length; i++)
            {
                this.curveKeyframes.push(new Keyframe(i * (animationTime / divisions), curvePoints[i])); 
            }
        }
        else
        {
            console.log("Insufficient frames to generate a curve; only linear interpolation will be available.");
        }

        this.currentTime = 0;
        this.currentKeyframe = 1;
        this.playing = true;
    }

    stop(): void
    {
        this.playing = false;
    }

    update(deltaTime: number, useCurve = true): void
    {
        if(this.playing)
        {
            this.currentTime += deltaTime;

            if(this.currentTime <= this.keyframes[this.currentKeyframe].timestamp)
            {
                if(useCurve && this.keyframes.length >= 3)
                    this.lerpCurveKeyframes();
                else
                    this.lerpKeyframe();
            }
            else if(this.currentKeyframe < this.keyframes.length - 1)
            {
                this.currentKeyframe++;
                
                if(useCurve && this.keyframes.length >= 3)
                    this.lerpCurveKeyframes();
                else
                    this.lerpKeyframe();
            }
            else
            {
                this.playing = false;
            }
        }
    }

    private lerpKeyframe(): void
    {
        const alpha = (this.currentTime - this.keyframes[this.currentKeyframe-1].timestamp) / 
            (this.keyframes[this.currentKeyframe].timestamp - this.keyframes[this.currentKeyframe-1].timestamp);
        
        this.animatedObject.position.lerpVectors(
            this.keyframes[this.currentKeyframe-1].position, 
            this.keyframes[this.currentKeyframe].position,
            alpha);
    }

    private lerpCurveKeyframes(): void
    {
        const frame = Math.ceil(this.currentTime * this.curveFps);

        const alpha = (this.currentTime - this.curveKeyframes[frame-1].timestamp) / 
            (this.curveKeyframes[frame].timestamp - this.curveKeyframes[frame-1].timestamp);
        
        this.animatedObject.position.lerpVectors(
            this.curveKeyframes[frame-1].position, 
            this.curveKeyframes[frame].position,
            alpha);
    }
}
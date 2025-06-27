<script lang="ts">
	import { T } from '@threlte/core';
	import { help } from 'mathjs';
    import { MathUtils, Euler, Color,ArrowHelper, Object3D, EllipseCurve, ArcCurve, BufferGeometry, Group, Vector3, Line, AxesHelper, Matrix4, LineBasicMaterial, LineDashedMaterial, Material } from 'three';
    
	interface Props {
        vector: [number, number, number]
	}

	let {
        vector
    }: Props = $props();


    // Example usage
    const origin = new Vector3(0,0,0);
    const Xaxis = new Vector3(1,0,0);
    const Yaxis = new Vector3(0,0,1);
    const Zaxis = new Vector3(0,1,0);
    
    let ARC_RADIUS = 0.2; // Radius of the arcs
    let LINE_RADIUS = 1; // Radius at which the lines connected to the arcs should end
    // Function to create an arc
function createArc(radius: number, startAngle: number, endAngle: number, color: number): Line {
    const points: Vector3[] = [];
    const segments = 100; // Number of segments for the arc

    for (let i = 0; i <= segments; i++) {
        const angle = startAngle + (endAngle - startAngle) * (i / segments);
        const x = radius * Math.sin(angle);
        const y = radius * Math.cos(angle);
        points.push(new Vector3(x, y, 0));
    }

    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ color: color });
    return new Line(geometry, material);
}

    let blochVector = $derived(new Vector3(...vector).normalize()); // Replace with your Bloch vector
    let theta = $derived(Math.acos(blochVector.y));
    let phi = $derived(blochVector.z >= 0 ? Math.atan2(blochVector.z, blochVector.x) : Math.atan2(blochVector.z, blochVector.x)+ 2*Math.PI ) 
    let arcsGroup = $state(new Object3D());
    let arcTheta = $derived(createArc(ARC_RADIUS, 0, theta, 0x000000)); // Red arc for theta
    let arcPhi = $derived(createArc(ARC_RADIUS, 0, phi, 0x000000)); // Blue arc for phi
    $effect(()=>{
        arcTheta.rotation.y = -phi ; // Rotate to align with the z-axis
        arcPhi.rotation.x = -Math.PI / 2; // Rotate to align with the y-axis
        arcPhi.rotation.z = -Math.PI / 2; // Rotate to align with the y-axis
    })

    function createSegment(point1:Vector3, point2: Vector3, material: Material):Line {
        const geometry = new BufferGeometry().setFromPoints([point1, point2]);
        return new Line(geometry, material).computeLineDistances()
    }

    // Material for the dashed lines
    const DashedMaterial = new LineDashedMaterial({color: "black", dashSize: 0.05, gapSize: 0.04});

    // Coordinates of the point on the equatorial plane that lays below the Bloch vector
    // at distance RADIUS from the origin
    let BVProjectionAtRADIUS: Vector3 = $derived(blochVector.clone().setComponent(1, 0));
    
    //  Line from the origin towards the z axis
    let XLine = createSegment(origin, Xaxis.clone().setLength(LINE_RADIUS), DashedMaterial);
    // Line from the origin towards the z axis    
    let ZLine = createSegment(origin, Zaxis.clone().setLength(LINE_RADIUS), DashedMaterial);
    // Line from the origin towards the projection of the Bloch Vector on the equatorial plane    
    let HLine = $derived(createSegment(origin, BVProjectionAtRADIUS, DashedMaterial));
    // Line from the projection of the Bloch Vector on the equatorial plane to the bloch vector itself
    let VLine = $derived(createSegment(BVProjectionAtRADIUS, BVProjectionAtRADIUS.clone().setComponent(1,Math.sin(blochVector.y)), DashedMaterial));
</script>

<!-- <T.Line
is={arc}
</T.Line>
> -->

{#snippet dashedLineMaterial()}
    <T.LineDashedMaterial
    color={"red"}
    dashSize={0.1}
    gapSize={0.1}
    />
{/snippet}

<T.Object3D is={arcsGroup}></T.Object3D>
<T.Line is={arcPhi}></T.Line>
<T.Line is={arcTheta}></T.Line>

<!-- Line from the origin towards the x axis -->    
<T is={XLine}></T>

<!-- Line from the origin towards the z axis     -->
<T is={ZLine}></T>

<!-- Line from the origin towards the projection of the Bloch Vector on the equatorial plane     -->
<T is={HLine}></T>

<!-- Line from the projection of the Bloch Vector on the equatorial plane to the bloch vector itself -->
<T is={VLine}></T>
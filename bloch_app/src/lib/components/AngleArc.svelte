<script lang="ts">
	import { T } from '@threlte/core';
	import { cos, help } from 'mathjs';
    import { MathUtils, Euler, Color,ArrowHelper, Object3D, EllipseCurve, ArcCurve, BufferGeometry, Group, Vector3, Line, AxesHelper, Matrix4, LineBasicMaterial, LineDashedMaterial, Material, Path, CurvePath, Curve } from 'three';
    import {Billboard, SVG} from '@threlte/extras'
    
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
    
    // Function to create an arc, it returns also the midpoint to allow to place a label there
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
    
    function createSegment(point1:Vector3, point2: Vector3, material: Material):Line {
        const geometry = new BufferGeometry().setFromPoints([point1, point2]);
        return new Line(geometry, material).computeLineDistances()
    }
    
    function getLineCenter(line: Line): Vector3 {
        const geometry = line.geometry as BufferGeometry;
        const positionAttribute = geometry.getAttribute('position');

        // Assicurati che ci siano almeno due punti
        if (positionAttribute.count < 2) {
            return new Vector3();
        }

        // Ottieni i punti di inizio e fine
        const center = new Vector3().fromBufferAttribute(positionAttribute, Math.floor(positionAttribute.count/2));
        return center;
    }
    function getArcMidpoint(arcLine: Line) {
    // Get the geometry from the arc line
    const geometry = arcLine.geometry;
    
    // Get the position attribute (which contains the vertex positions)
    const positions = geometry.attributes.position.array;

    // Calculate the number of points
    const numPoints = positions.length / 3; // Each point has 3 components (x, y, z)

    // Get the first and last points
    const firstPoint = new Vector3(positions[0], positions[1], positions[2]);
    const lastPoint = new Vector3(positions[positions.length - 3], positions[positions.length - 2], positions[positions.length - 1]);

    // Calculate the midpoint
    const midpoint = new Vector3(
        (firstPoint.x + lastPoint.x) / 2,
        (firstPoint.y + lastPoint.y) / 2,
        (firstPoint.z + lastPoint.z) / 2
    );

    return midpoint;
}

    let blochVector = $derived(new Vector3(...vector).normalize()); // Replace with your Bloch vector
    let theta = $derived(Math.acos(blochVector.y));
    let phi = $derived(blochVector.z >= 0 ? Math.atan2(blochVector.z, blochVector.x) : Math.atan2(blochVector.z, blochVector.x)+ 2*Math.PI ) 
    let arcTheta = $derived(createArc(ARC_RADIUS, 0, theta, 0x000000));
    let arcPhi = $derived(createArc(ARC_RADIUS, 0, phi, 0x000000)); 
    $effect(()=>{
        arcTheta.rotation.y = -phi;
        arcPhi.rotation.x = -Math.PI / 2;
        arcPhi.rotation.z = -Math.PI / 2;
    })

    let midPhi = $derived(getArcMidpoint(arcPhi));

    // Material for the dashed lines
    const DashedMaterial = new LineDashedMaterial({color: "black", dashSize: 0.02, gapSize: 0.03});

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

    const rotAxis = $derived(Xaxis.clone().applyMatrix4(new Matrix4().makeRotationAxis(Zaxis, Math.PI/2 - phi)))
    const rotationMatrix = $derived(new Matrix4().makeRotationAxis(rotAxis, -theta/2));
    let midTheta = $derived(blochVector.clone().applyMatrix4(rotationMatrix).setLength(ARC_RADIUS));
</script>

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


<Billboard
    follow={true}
    position.x = {ARC_RADIUS*Math.cos(phi/2)}
    position.z = {ARC_RADIUS*Math.sin(phi/2)}
>
    <SVG src={`/phi.svg`} scale={0.0001} position={[-0.04, 0,0]} />
</Billboard>

<Billboard
    follow={true}
    position.y= {midTheta.y}
    position.x= {midTheta.x}
    position.z= {midTheta.z}

>
    <SVG src={`/theta.svg`} scale={0.0001} position={[-0.02, 0,0]} />
</Billboard>
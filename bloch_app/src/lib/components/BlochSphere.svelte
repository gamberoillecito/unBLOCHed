<script lang="ts">
  import { T } from '@threlte/core'
  import { MathUtils, Color } from 'three';
  
  // interface BlochSphereProps {
  //   lat_long_color: Color;
  //   sphere_color: Color;
  //   sphere_opacity?: number;
  //   sphere_radius?: number;
  //   num_latitudes?: number;
  //   num_longitudes?: number;
  //   lat_long_thickness?: number;
  //   lat_long_opacity?: number;
  // }

  let {
    lat_long_color="black",
    sphere_color="green",
    sphere_opacity=0.3,
    sphere_radius=1,
    num_latitudes=5,
    num_longitudes=5,
    lat_long_thickness=0.002,
    lat_long_opacity=1,
  } = $props();

  function latitudeSpacing(sphereRad:number, numLatitudes:number) {
    let spacing = (sphereRad * 2) / (numLatitudes + 1);
    return spacing;
  }

  function latitudeOffset(sphereRad:number, prog:number, numLatitudes:number) {
    let spacing = latitudeSpacing(sphereRad, numLatitudes);
    let offset = -(sphereRad - spacing) + spacing*prog;
    return offset;
  }

  function latitudeRadius(sphereRad:number, prog:number, numLatitudes:number) {
    let spacing = latitudeSpacing(sphereRad, numLatitudes);
    let rad = Math.sqrt(sphereRad**2 - ((prog - Math.floor(numLatitudes/2)) * spacing )**2);
    return rad;
  }
</script>

<T.Group>
    <!-- Latitudes -->
    {#each Array(num_latitudes) as _, iter }
     <T.Mesh
       rotation.x = {MathUtils.degToRad(90)}
       position.y={latitudeOffset(sphere_radius, iter, num_latitudes)}
     >
       <T.TorusGeometry
       args={[latitudeRadius(sphere_radius, iter, num_latitudes),lat_long_thickness]}
       />
 
       <T.MeshLambertMaterial
         castshadow={false}
         receiveshadow={false}
         color = {lat_long_color}
         transparent
         opacity={lat_long_opacity}
       />
     </T.Mesh>
 
   {/each}
 
   <!-- Longitudes -->
    {#each Array(num_latitudes) as _, iter }
   
     <T.Mesh
       rotation.y = {MathUtils.degToRad(360/num_longitudes*iter)}
     >
       <T.TorusGeometry
       args={[sphere_radius,lat_long_thickness]}
       />
 
       <T.MeshPhongMaterial
         castshadow={false}
         receiveshadow={false}
         color = {lat_long_color}
         transparent
         opacity={lat_long_opacity}
       />
     </T.Mesh>
   {/each}
 
   <!-- Transparent mesh -->
   <T.Mesh>
     <T.SphereGeometry/>
     <T.MeshPhongMaterial
       color= {sphere_color}
       transparent
       castShadow
       opacity={sphere_opacity}
     />
   </T.Mesh>
 </T.Group>  
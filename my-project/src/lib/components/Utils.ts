function latitudeSpacing(sphereRad:number, numLatitudes:number) {
   let spacing = (sphereRad * 2) / (numLatitudes + 1);
   return spacing;
}

export function latitudeOffset(sphereRad:number, prog:number, numLatitudes:number) {
   let spacing = latitudeSpacing(sphereRad, numLatitudes);
   let offset = -(sphereRad - spacing) + spacing*prog;
   return offset;
}

export function latitudeRadius(sphereRad:number, prog:number, numLatitudes:number) {
   let spacing = latitudeSpacing(sphereRad, numLatitudes);
   let rad = Math.sqrt(sphereRad**2 - ((prog - Math.floor(numLatitudes/2)) * spacing )**2);
   console.log(spacing);
   return rad;
}

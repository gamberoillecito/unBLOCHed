<script lang="ts">
	import { T } from '@threlte/core';
	import type { Color } from 'three';
    interface Props{
        position: [number, number, number];
        size: number;
        hide: boolean;
        color: Color;
    }
    
    let {
        position, size, hide = $bindable(), color = $bindable()
    }:Props = $props()
</script>
<T.Mesh {position}>
	<T.CircleGeometry args={[size, 40]} />
	<T.MeshBasicMaterial {color} transparent opacity={hide ? 0 : 0.4} />
</T.Mesh>

<script lang="ts">
    interface Props {
        withSubTitle?: boolean,
    }
    
    let {
        withSubTitle = true,
    }: Props = $props();
</script>
<span class=""
    ><span class="font-normal">un</span><span class="font-semibold">BLOCH</span><span
        class="font-normal">ed</span
    > 
    {#if withSubTitle}
        <span class="font-light">- Bloch sphere simulator</span>
    {/if}
    </span>
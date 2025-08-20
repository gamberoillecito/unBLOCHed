<script lang="ts">
	interface Props {
		subtitle?: boolean;
		title?: boolean;
	}

	let { subtitle = true, title = true }: Props = $props();
</script>

<span class="">

    {#if title}
    <span class="font-normal">un</span><span class="font-semibold">BLOCH</span><span
		class="font-normal">ed</span
	>
    {/if}
	{#if subtitle}
		<span class="font-light">- Bloch sphere simulator</span>
	{/if}
</span>

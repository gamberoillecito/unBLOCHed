<script lang="ts">
	interface Props {
		subtitle?: boolean;
		title?: boolean;
	}

	let { subtitle = true, title = true }: Props = $props();
</script>

<!--
@component
Renders the application title "unBLOCHed" and an optional subtitle. The visibility of each part can be controlled via props.

**Props:**
- `title?: boolean` (default: `true`)
  If `true`, displays the main "unBLOCHed" title.

- `subtitle?: boolean` (default: `true`)
  If `true`, displays the "- Bloch sphere simulator" subtitle.

**Usage:**
The component can be used with different prop combinations to show or hide parts of the title.
-->

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

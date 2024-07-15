<script>
  import { createDialog, melt } from "@melt-ui/svelte";
  import Draw from "./Draw.svelte";
  import { setContext } from "svelte";

  const {
    elements: { trigger, portalled, content, close },
    states: { open },
  } = createDialog();
</script>

<button class="button" {...$trigger} use:trigger>Draw</button>

{#if $open}
  <div {...$portalled} use:portalled>
    <div
      class="fixed bottom-0 left-0 z-30 w-screen h-screen bg-primary focus:outline-none"
      {...$content}
      use:content
    >
      <Draw />
    </div>
  </div>
{/if}

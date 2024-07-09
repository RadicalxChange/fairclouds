<script>
  // Assuming `content` is passed as a prop to this Svelte component
  export let content = [];
</script>

<div class="space-y-8">
  {#each content as block}
    {#if block.type === "paragraph"}
      <p>{block.data.text}</p>
    {:else if block.type === "heading"}
      <h2>{block.data.text}</h2>
    {:else if block.type === "quote"}
      <blockquote>
        <p>{block.data.text}</p>
        <footer>
          —<cite>{block.data.caption}</cite>
        </footer>
      </blockquote>
    {:else if block.type === "image"}
      <img src={block.url} alt={block.alt} />
    {:else}
      <!-- Return null or an appropriate fallback for unknown types -->
    {/if}
  {/each}
</div>

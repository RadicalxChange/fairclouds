<script>
  import { createDialog, melt } from "@melt-ui/svelte";
  import Draw from "./Draw.svelte";

  const {
    elements: { trigger, portalled, content, close },
    states: { open },
  } = createDialog();

  let title = "";
  let author = "";
  let location = "";
  let isSubmitted = false;

  function handleSubmit() {
    // Handle the form submission here
    // For example, log the form data to the console
    console.log({ title, author, location });
    isSubmitted = true;
  }
</script>

<button class="button" {...$trigger} use:trigger>Submit</button>

{#if $open}
  <div
    class="shadow-cloud p-5 absolute z-50 top-[120%] w-screen max-w-lg rounded-default bg-primary"
    {...$content}
    use:content
  >
    {#if !isSubmitted}
      <form class="space-y-5" on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label class="sr-only" for="title">Title</label>
          <input
            id="title"
            type="text"
            bind:value={title}
            placeholder="Title"
          />
        </div>
        <div class="form-group">
          <label class="sr-only" for="author">Author</label>
          <input
            id="author"
            type="text"
            bind:value={author}
            placeholder="Author"
          />
        </div>
        <div class="form-group">
          <label class="sr-only" for="location">Location</label>
          <input
            id="location"
            type="text"
            bind:value={location}
            placeholder="Location"
          />
        </div>
        <button type="submit" class="button float-right">Submit</button>
      </form>
    {:else}
      <p>Thank you for your submission!</p>
    {/if}
  </div>
{/if}

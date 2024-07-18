<script>
  import { createDialog, createSelect, melt } from "@melt-ui/svelte";
  import Login from "./Login.svelte";
  import Blocks from "./BlocksSvelte.svelte";

  const {
    elements: { trigger, overlay, content },
    states: { open },
  } = createDialog();

  export let drawings;

  let title;
  let location;
  let category;
  let all = true;
  // let drawings;

  console.log(drawings);

  $: filteredDrawings = drawings.filter((drawing) => {
    // Filter by title if title is not empty
    const matchesTitle = title
      ? drawing.name.toLowerCase().includes(title.toLowerCase())
      : true;
    // Filter by location if location is not empty
    const matchesLocation = location ? drawing.location === location : true;
    // Filter by category if category is not empty
    const matchesCategory = category ? drawing.category === category : true;

    // add all filter

    return matchesTitle && matchesLocation && matchesCategory;
  });
</script>

<!-- <button {...$trigger} use:trigger>treemap</button> -->

<!-- {#if !$open} -->
<div
  class="absolute flex flex-col rounded-default top-4 right-4 z-50 h-[85vh] w-full max-w-[360px] bg-primary shadow-cloud p-7 pb-1 focus:outline-none"
>
  <h2 class="text-menu-languages mb-4">Filter</h2>
  <form class="flex flex-col gap-4">
    <input bind:value={title} id="title" type="text" placeholder="Title" />
    <select bind:value={location} id="location">
      <option value="">Location</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
    </select>
    <select bind:value={category} id="category">
      <option value="">Category</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
    </select>
    <label class="flex gap-2.5 items-center cursor-pointer">
      <span class="opacity-60 text-menu-languages mt-1">Available</span>
      <input
        bind:checked={all}
        id="all"
        type="checkbox"
        value="flflf"
        class="sr-only peer"
      />
      <div
        class="relative w-[46px] h-6 sm:w-[81px] sm:h-[45px] bg-primary shadow-cloud rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[3px] sm:after:top-[5px] sm:after:start-[6px] after:bg-white after:rounded-full after:w-5 after:h-5 sm:after:h-[35px] sm:after:w-[35px] after:transition-all"
      ></div>
      <span class="opacity-60 text-menu-languages mt-1">All</span>
      <span
        class="sr-only ms-3 text-sm font-medium text-gray-900 dark:text-gray-300"
        >Accessibility mode toggle me</span
      >
    </label>
  </form>
  <hr class="my-9" />
  <div class="tree px-2.5 grow overflow-y-auto custom-scrollbar">
    <ul>
      {#each filteredDrawings as drawing}
        <li>
          <details>
            <summary>{drawing.name}</summary>
            <ul>
              <li>
                <details>
                  <summary>Drawing</summary>
                  Image goes here
                </details>
              </li>
              <li>
                <details>
                  <summary>Info</summary>
                  Info goes here
                </details>
              </li>
            </ul>
            <button class="button -ml-3">Become a steward</button>
          </details>
        </li>
      {/each}
    </ul>
  </div>
</div>

<!-- {/if} -->

<style>
  .tree {
    --spacing: 20px;
    --radius: 10px;
    margin-left: 0px;
  }

  .tree li {
    display: block;
    position: relative;
    padding-left: calc(2 * var(--spacing) - var(--radius) - 2px);
    margin-bottom: 8px;
  }

  .tree ul {
    margin-left: calc(var(--radius) - var(--spacing));
    padding-left: 0;
  }

  .tree ul li ul li {
    /* border-left: 2px solid #ddd; */
  }

  .tree ul li:last-child {
    border-color: transparent;
  }

  .tree ul li::before {
    content: "";
    display: block;
    position: absolute;
    top: 11px;
    left: -2px;
    width: 0px;
    height: 100%;
    border-left: solid #fff;
    border-width: 0 0 2px 2px;
    margin-left: 11px;
  }

  .tree ul li ul li:before {
    top: calc((var(--spacing) / 2));
    left: calc((var(--spacing) / -1));
    width: calc(var(--spacing));
    height: 100%;
    border-right: solid #fff;
    border-left: 0px;
    border-top: solid #fff;
    border-bottom: 0px;
  }

  .tree summary {
    display: block;
    cursor: pointer;
  }

  .tree summary::marker,
  .tree summary::-webkit-details-marker {
    display: none;
  }

  .tree summary:focus {
    outline: none;
  }

  .tree summary:focus-visible {
    outline: 1px dotted #000;
  }

  .tree li::after,
  .tree summary::before {
    content: "";
    display: block;
    position: absolute;
    top: calc(var(--spacing) / 2 - var(--radius));
    left: 0px;
    width: calc(2 * var(--radius));
    height: calc(2 * var(--radius));
    border-radius: 50%;
  }

  .tree summary::before {
    z-index: 1;
    background: rgba(255, 255, 255, 0.02) url("/plus.svg") 0 0;
    box-shadow: inset 0px 0px 10px 3px #ffffff;
  }

  .tree details[open] > summary::before {
    background: rgba(255, 255, 255, 0.02) url("/minus.svg") 0 0;
    box-shadow: inset 0px 0px 10px 3px #ffffff;
  }
</style>

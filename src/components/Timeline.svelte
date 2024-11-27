<script>
  import { createDialog, melt } from "@melt-ui/svelte";
  import { slide } from "svelte/transition";
  import { quartOut } from "svelte/easing";

  const {
    elements: { trigger, overlay, content, portalled },
    states: { open },
  } = createDialog({ forceVisible: true });
</script>

<div class="relative grow hidden lg:block has-hint">
  <div
    class="w-full h-full bg-primary rounded-full shadow-cloud flex justify-center items-center relative"
  >
    <span class="opacity-50">Timeline</span>
    <img
      class="absolute left-[14%] flex justify-center items-cente rounded-full text-serif text-small h-7 w-7"
      src="/icons/cloud.svg"
      alt=""
    />
    <div
      class="absolute bg-white border-l border-white h-full left-[10%]"
    ></div>
    <div
      class="absolute bg-white border-l border-white h-full right-[10%]"
    ></div>
    <!-- <div
      class="absolute left-8 flex justify-center items-center bg-white rounded-full border-primary border text-primary text-serif text-small h-7 w-7"
    >
      <span>C2</span>
    </div>
    <div class="absolute bg-white border-l border-white h-full left-24"></div>

    <div
      class="absolute left-6 flex justify-center items-center bg-white rounded-full border-primary border text-primary text-serif text-small h-7 w-7"
    >
      <span>C3</span>
    </div> -->
  </div>
  <div role="tooltip" class="hint top-[-100%] left-0 -mt-2">
    Each stewardship cycle lasts one year. 30 days before the end of the cycle,
    the Fairclouds community will revalue the cells and stewards will need to
    decide to either renew, or transfer their licence to the next steward.
  </div>

  {#if $open}
    <div {...$overlay} use:overlay />
    <div class="absolute bottom-0 left-0 z-50 w-full" {...$content} use:content>
      <div
        class="w-full h-[43px] bg-primary rounded-full shadow-cloud flex justify-center items-center relative"
        transition:slide={{ easing: quartOut, delay: 80 }}
      >
        <span class="opacity-50">Cycle 1</span>
        <div
          class="absolute left-1/4 flex justify-center items-center bg-white rounded-full border-primary border text-primary text-serif text-small h-7 w-7"
        >
          <span>C1</span>
        </div>
        <div
          class="absolute bg-white border-l border-white h-full left-24"
        ></div>
        <div
          class="absolute bg-white border-l border-white h-full right-24"
        ></div>
      </div>
      <div
        class="w-full h-[43px] bg-primary rounded-full shadow-cloud flex justify-center items-center relative"
        transition:slide={{ easing: quartOut, delay: 60 }}
      >
        <span class="opacity-50">Cycle 2</span>
        <div
          class="absolute left-8 flex justify-center items-center bg-white rounded-full border-primary border text-primary text-serif text-small h-7 w-7"
        >
          <span>C2</span>
        </div>
        <div
          class="absolute bg-white border-l border-white h-full left-24"
        ></div>
        <div
          class="absolute bg-white border-l border-white h-full right-24"
        ></div>
      </div>
      <div
        class="w-full h-[43px] bg-primary rounded-full shadow-cloud flex justify-center items-center relative"
        transition:slide={{ easing: quartOut, delay: 40 }}
      >
        <span class="opacity-50">Cycle 3</span>
        <div
          class="absolute left-6 flex justify-center items-center bg-white rounded-full border-primary border text-primary text-serif text-small h-7 w-7"
        >
          <span>C3</span>
        </div>
        <div
          class="absolute bg-white border-l border-white h-full left-24"
        ></div>
        <div
          class="absolute bg-white border-l border-white h-full right-24"
        ></div>
      </div>
      <div
        class="w-full bg-primary rounded-default px-3 py-2.5 shadow-cloud"
        transition:slide={{ easing: quartOut }}
      >
        <div class="flex justify-between mb-5 gap-3">
          <div class="flex-1">
            <h4 class="opacity-60">Cycle 1</h4>
            <p class="text-small">
              <span class="font-bold">Available:</span> 100
            </p>
            <p class="text-small">
              <span class="font-bold">Renewal date:</span> July 2025
            </p>
          </div>
          <div class="flex-1">
            <h4 class="opacity-60">Cycle 2</h4>
            <p class="text-small">
              Available: 0 (Released Sept 2024) Renewal date: Sept 2025
            </p>
          </div>
          <div class="flex-1">
            <h4 class="opacity-60">Cycle 2</h4>
            <p class="text-small">
              Available: 0 (Released Sept 2024) Renewal date: Sept 2025
            </p>
          </div>
        </div>
        <p class="col-span-3 text-small opacity-60">
          Each stewardship cycle lasts one year. In the last month (magenta
          zone), the community will revalue the cells and stewards will need to
          decide to either renew, or sell their licence.
        </p>
      </div>
    </div>
  {/if}
</div>

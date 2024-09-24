<script>
  import { createDialog, melt } from "@melt-ui/svelte";
  import Draw from "./Draw.svelte";
  import { setContext } from "svelte";
  import { onMount, getContext } from "svelte";
  import Submit from "./Submit.svelte";

  const {
    elements: { trigger, portalled, content, close },
    states: { open },
  } = createDialog();

  let width = window.innerWidth;
  let height = window.innerHeight;
  let color = "#FFFFFF";
  let background = "61A2E3";
  let clouds = ["/cloud.jpg", "/cloud2.jpg"];
  let cloudVisible = true;
  let strokeSize = 2;

  let cloud;
  let canvas;
  let context;
  let isDrawing;
  let start;

  let t, l;

  function changeCloud() {
    cloud = clouds[Math.floor(Math.random() * clouds.length)]; // Pick a random cloud
    setCloudBg();
  }

  function setCloudBg() {
    const image = new Image(); // Create a new image element
    image.src = cloud; // Set the source of the image to the random cloud
    image.onload = () => {
      // Calculate the aspect ratio of the image
      const imageAspectRatio = image.width / image.height;

      // Always scale the image to take up the full height of the canvas
      const renderHeight = height;
      const renderWidth = image.width * (renderHeight / image.height);
      const offsetX = (width - renderWidth) / 2; // Center the image horizontally
      const offsetY = 0; // No vertical offset needed as we're taking up full height

      // Clear the canvas and draw the image centered
      context.clearRect(0, 0, width, height);
      context.drawImage(image, offsetX, offsetY, renderWidth, renderHeight);
    };
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        cloud = e.target.result;
        setCloudBg();
      };
      reader.readAsDataURL(file);
    }
  }

  function clearCanvas() {
    if (context) {
      context.clearRect(0, 0, width, height);
    }
    setCloudBg();
  }

  $: if (context) {
    context.strokeStyle = color;
  }

  const handleStart = ({ offsetX: x, offsetY: y }) => {
    if (color === background) {
      context.clearRect(0, 0, width, height);
    } else {
      isDrawing = true;
      start = { x, y };
    }
  };

  const handleEnd = () => {
    isDrawing = false;
  };

  const handleMove = ({ offsetX: x1, offsetY: y1 }) => {
    if (!isDrawing) return;

    const { x, y } = start;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x1, y1);
    context.lineWidth = strokeSize; // Use the strokeSize variable
    context.closePath();
    context.stroke();

    start = { x: x1, y: y1 };
  };

  const handleSize = () => {
    const { top, left } = canvas.getBoundingClientRect();
    t = top;
    l = left;

    clearCanvas();

    width = window.innerWidth;
    height = window.innerHeight;
  };

  $: if ($open) {
    if (canvas) {
      context = canvas.getContext("2d");
      context.lineWidth = 3;
      changeCloud();
    }
  }
</script>

<svelte:window on:resize={handleSize} />

<button class="button" {...$trigger} use:trigger>Draw</button>

{#if $open}
  <div {...$portalled} use:portalled>
    <div
      class="fixed bottom-0 left-0 z-30 w-screen h-screen bg-primary focus:outline-none"
      {...$content}
      use:content
    >
      <!-- <div class="h-full flex flex-col justify-between"> -->
      <div class="flex gap-5 justify-end fixed top-4 right-4">
        <Submit />
        <button on:click={clearCanvas} class="icon-button"
          ><span class="sr-only">Clear</span>
          <img src="/icons/clear.svg" alt="" />
        </button>
        <button class="icon-button" {...$close} use:close
          ><span class="sr-only">Close</span>
          <img src="/icons/close.svg" alt="" />
        </button>
      </div>
      <!-- <div
        class="aspect-video shadow-cloud max-w-[800px] w-full mx-auto rounded-default"
        style="background-image: url({cloudVisible
          ? cloud
          : ''}); background-size: cover; background-position: center;"
      > -->
      <!-- <img
          src={cloud}
          class="w-full h-full object-cover absolute top-0 left-0 z-40 shadow-cloud rounded-default"
          alt="cloud"
          style="display: {cloudVisible ? 'block' : 'none'};"
        /> -->
      <canvas
        {width}
        {height}
        style:background
        class="cursor-crosshair w-screen h-screen"
        bind:this={canvas}
        on:mousedown={handleStart}
        on:touchstart={(e) => {
          const { clientX, clientY } = e.touches[0];
          handleStart({
            offsetX: clientX - l,
            offsetY: clientY - t,
          });
        }}
        on:mouseup={handleEnd}
        on:touchend={handleEnd}
        on:mouseleave={handleEnd}
        on:mousemove={handleMove}
        on:touchmove={(e) => {
          const { clientX, clientY } = e.touches[0];
          handleMove({
            offsetX: clientX - l,
            offsetY: clientY - t,
          });
        }}
      />
      <!-- </div> -->
      <div class="flex gap-2.5 justify-start fixed bottom-4 left-4">
        <button
          class="icon-button"
          on:click={() => {
            cloudVisible = !cloudVisible;
          }}
          ><span class="sr-only">Toggle cloud</span>
          <img src="/icons/cloud.svg" alt="" />
        </button>
        <button class="icon-button" on:click={changeCloud}
          ><span class="sr-only">Shuffle</span>
          <img src="/icons/shuffle.svg" alt="" />
        </button>
        <label
          for="file-upload"
          class="bg-white/5 shadow-cloud rounded-full w-11 h-11 cursor-pointer flex items-center hover-blur"
        >
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            on:change={handleFileChange}
            class="bg-white/5 shadow-cloud rounded-full w-11 h-11 sr-only"
          /><span class="sr-only">Upload</span>
          <img src="/icons/upload.svg" alt="" />
        </label>
        <input type="range" min="1" max="6" step="1" bind:value={strokeSize} />
      </div>
    </div>
  </div>
{/if}

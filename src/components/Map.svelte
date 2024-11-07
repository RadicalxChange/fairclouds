<script>
  import { onMount } from "svelte";
  import CloudModal from "./CloudModal.svelte";
  export let clouds;
  const height = 982;
  const scaleFactor = 1.32;
  let selectedCloud;

  // set active drawing index to 0
  clouds.forEach((cloud) => {
    cloud.activeDrawingIndex = 0;
  });

  onMount(() => {
    const screenScale = window.innerHeight / 982;

    const canvases = document.querySelectorAll(".cloud-canvas");
    const parallaxClouds = document.querySelectorAll(".parallax-cloud");

    const bgImg = document.getElementById("bgImg");

    canvases.forEach((canvas, index) => {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // Set canvas size
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      const sourceX = canvas.dataset.x;
      const sourceY = canvas.dataset.y;
      const sourceWidth = canvas.dataset.width;
      const sourceHeight = canvas.dataset.height;
      const destX = 0;
      const destY = 0;
      const destWidth = canvas.width;
      const destHeight = canvas.height;

      ctx.drawImage(
        bgImg,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destX,
        destY,
        destWidth,
        destHeight,
      );

      canvas.addEventListener("mousemove", (event) => {
        // ensure drawing img is visible
        const drawingImg = canvas.previousSibling.previousSibling;
        drawingImg.classList.remove("fade-out");

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const radius = 10;

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fill();

        // Check if 10% or more of the canvas has been erased
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let erasedPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) {
            // Check if the alpha channel is 0 (erased pixel)
            erasedPixels++;
          }
        }

        const totalPixels = canvas.width * canvas.height;
        const erasedPercentage = (erasedPixels / totalPixels) * 100;

        if (erasedPercentage >= 10) {
          // enable button
          const button = canvas.closest("button");
          if (button) {
            button.disabled = false;
          }
        }
      });

      canvas.addEventListener("mouseleave", () => {
        const drawingImg = canvas.previousSibling.previousSibling;

        drawingImg.classList.add("fade-out");
        clouds[index].fadeTimeout = setTimeout(() => {
          ctx.globalCompositeOperation = "source-over";

          ctx.drawImage(
            bgImg,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            destX,
            destY,
            destWidth,
            destHeight,
          );
          let newActiveDrawingIndex = clouds[index].activeDrawingIndex + 1;
          if (newActiveDrawingIndex >= clouds[index].drawings.length) {
            clouds[index].activeDrawingIndex = 0;
          } else {
            clouds[index].activeDrawingIndex = newActiveDrawingIndex;
          }
          // disable button
          const button = canvas.closest("button");
          if (button) {
            button.disabled = true;
          }
        }, 7001);
      });

      canvas.addEventListener("mouseenter", () => {
        if (clouds[index].fadeTimeout) {
          clearTimeout(clouds[index].fadeTimeout);
          clouds[index].fadeTimeout = null;
        }
      });
    });

    // requestAnimationFrame(redraw);

    // Parallax effect
    window.addEventListener("scroll", function () {
      const scrollPosition = window.scrollX;
      parallaxClouds.forEach((cloud) => {
        const speed = parseFloat(cloud.getAttribute("data-speed"));
        cloud.style.transform = `translateX(${scrollPosition * speed}px)`;
      });
    });
  });

  function handleCloudClick(cloud) {
    selectedCloud = {
      id: cloud.id,
      name: cloud.name,
    };
  }
</script>

<div class="bg-primary h-screen max-h-screen inline-block relative">
  <!-- sky/clouds container -->
  <img
    src="/v3/bg.jpg"
    alt=""
    class="h-screen max-h-screen w-auto object-top max-w-none"
    id="bgImg"
  />
  <div class="absolute w-full h-full top-0 left-0 z-10">
    <!-- clouds layer -->
    {#each clouds as cloud, index (cloud.id)}
      <button
        class="absolute cloud-button"
        style="left: {(cloud.x / height) * 100}vh; top: {(cloud.y / height) *
          100}vh; width: {(cloud.width / height) *
          100}vh; height: {(cloud.height / height) * 100}vh;"
        disabled
        on:click={() => handleCloudClick(cloud)}
      >
        <div class="relative w-full h-full">
          <img
            src={`https://cms.fairclouds.life/assets/` +
              cloud.drawings[cloud.activeDrawingIndex].map_drawing}
            alt=""
            class="absolute top-0 w-full h-full cloud-drawing"
          />
          <canvas
            data-id={cloud.id}
            data-x={cloud.x * scaleFactor}
            data-y={cloud.y * scaleFactor}
            data-width={cloud.width * scaleFactor}
            data-height={cloud.height * scaleFactor}
            class="absolute top-0 left-0 z-10 cloud-canvas w-full h-full"
          />
        </div>
      </button>
    {/each}

    <!-- Parallax clouds -->
    <img
      src="/v3/parallax-clouds-1.png"
      class="w-[73vh] left-[2vh] top-[8vh] absolute h-auto parallax-cloud blur-[10px] z-30 pointer-events-none"
      data-speed="-0.2"
      alt
    />
    <img
      src="/v3/parallax-clouds-2.png"
      class="w-[160vh] left-[128vh] top-[33vh] absolute h-auto parallax-cloud blur-[10px] z-30 pointer-events-none"
      data-speed="-0.3"
      alt
    />
    <img
      src="/v3/parallax-clouds-3.png"
      class="w-[127vh] left-[288vh] top-[55vh] absolute h-auto parallax-cloud blur-[10px] z-30 pointer-events-none"
      data-speed="-0.1"
      alt
    />
    <img
      src="/v3/parallax-clouds-4.png"
      class="w-[99vh] left-[277vh] top-[16vh] absolute h-auto parallax-cloud blur-[10px] z-30 pointer-events-none"
      data-speed="-0.25"
      alt
    />

    <CloudModal cloud={selectedCloud} />
  </div>

  <!-- horizon -->
  <img
    src="/v3/horizon.png"
    alt=""
    class="fixed w-screen object-cover object-top h-[14vh] bottom-0 left-0"
  />
</div>
<div></div>

<script>
    import { onMount } from "svelte";
    export let cloud;
    export let height;
    export let scaleFactor;
    export let handleCloudClick;

    cloud.activeDrawingIndex = Math.floor(Math.random() * cloud.drawings.length);
  
    // Create a reactive image source that updates when cloud.activeDrawingIndex changes.
    $: mapDrawingSrc = `https://cms.fairclouds.life/assets/${cloud.drawings[cloud.activeDrawingIndex].map_drawing}`;
  
    // References to the canvas and image elements.
    let canvasElement;
    let drawingImgElement;
    let ctx;
    let buttonDisabled = true; // Initially, the button is disabled until the user reveals enough of the canvas.
  
    // Clear any fade timeout on this cloud.
    function clearFadeTimeout() {
        if (cloud.fadeTimeout) {
            clearTimeout(cloud.fadeTimeout);
            cloud.fadeTimeout = null;
        }
    }

    // Reveal drawing logic – erases part of the canvas where the user interacts.
    function handleDrawingReveal(clientX, clientY) {
        // Remove any fade-out effect.
        drawingImgElement.classList.remove("fade-out");

        const rect = canvasElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const radius = 10;

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fill();

        // Check if at least 10% of the canvas is erased.
        const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
        let erasedPixels = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] === 0) {
                erasedPixels++;
            }
        }
        const totalPixels = canvasElement.width * canvasElement.height;
        const erasedPercentage = (erasedPixels / totalPixels) * 100;
        if (erasedPercentage >= 10) {
            buttonDisabled = false; // Enable the button when enough of the canvas is erased.
        }
    }

    // Fade out the drawing and reset the canvas.
    function handleFadeOutAndReset() {
        drawingImgElement.classList.add("fade-out");

        cloud.fadeTimeout = setTimeout(() => {
            ctx.globalCompositeOperation = "source-over";
            const { x: sourceX, y: sourceY, width: sourceWidth, height: sourceHeight } = canvasElement.dataset;
            // Use the global background image (assumed to have id "bgImg")
            const bgImg = document.getElementById("bgImg");
            ctx.drawImage(bgImg, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvasElement.width, canvasElement.height);

            let newIndex = cloud.activeDrawingIndex + 1;
            cloud.activeDrawingIndex = newIndex >= cloud.drawings.length ? 0 : newIndex;
            buttonDisabled = true; // Disable the button again.
        }, 7001);
    }
  
    onMount(() => {
        // Get the canvas 2D context.
        ctx = canvasElement.getContext("2d", { willReadFrequently: true });
    
        // Set the canvas size to match its rendered dimensions.
        canvasElement.width = canvasElement.clientWidth;
        canvasElement.height = canvasElement.clientHeight;
    
        // The canvas element has data attributes for the image region. (They are set via attributes below.)
        // Draw the initial image from the background image (assumed to be present in the page with id "bgImg").
        const bgImg = document.getElementById("bgImg");

        ctx.drawImage(
            bgImg,
            canvasElement.dataset.x,
            canvasElement.dataset.y,
            canvasElement.dataset.width,
            canvasElement.dataset.height,
            0,
            0,
            canvasElement.width,
            canvasElement.height
        );
        // Render hidden drawing once canvas is prepared. (this prevents drawings from flashing on load).
        drawingImgElement.classList.remove("hidden");
  
        // Attach event listeners.
        canvasElement.addEventListener("mousemove", (event) => {
            handleDrawingReveal(event.clientX, event.clientY);
        });
        canvasElement.addEventListener("mouseleave", () => {
            handleFadeOutAndReset();
        });
        canvasElement.addEventListener("mouseenter", () => {
            clearFadeTimeout();
        });
        canvasElement.addEventListener("touchstart", (event) => {
            if (event.touches.length === 1) {
                clearFadeTimeout();
            }
        });
        canvasElement.addEventListener("touchmove", (event) => {
            if (event.touches.length === 1) {
                event.preventDefault(); // Prevent one-finger scrolling.
                const touch = event.touches[0];
                handleDrawingReveal(touch.clientX, touch.clientY);
            }
        });
        canvasElement.addEventListener("touchend", (event) => {
            if (event.touches.length === 0) {
                handleFadeOutAndReset();
            }
        });
        canvasElement.addEventListener("touchcancel", (event) => {
            if (event.touches.length === 0) {
                handleFadeOutAndReset();
            }
        });
    });
</script>
  
<button
    id="cloud-button-{cloud.id}"
    class="absolute cloud-button eraser-tool"
    style="left: {(cloud.x / height) * 100}vh; top: {(cloud.y / height) *
        100}vh; width: {(cloud.width / height) *
        100}vh; height: {(cloud.height / height) * 100}vh;"
    disabled={buttonDisabled}
    on:click={() => handleCloudClick(cloud)}
>
    <div class="relative w-full h-full">
        <!-- Reactive image: updates when cloud.activeDrawingIndex changes -->
        <img
            bind:this={drawingImgElement}
            src={mapDrawingSrc}
            alt=""
            class="absolute top-0 w-full h-full cloud-drawing hidden"
        />
        <!-- Bind the canvas element for drawing -->
        <canvas
            bind:this={canvasElement}
            class="absolute top-0 left-0 z-10 cloud-canvas w-full h-full"
            data-x={cloud.x * scaleFactor}
            data-y={cloud.y * scaleFactor}
            data-width={cloud.width * scaleFactor}
            data-height={cloud.height * scaleFactor}
        />
    </div>
</button>
  
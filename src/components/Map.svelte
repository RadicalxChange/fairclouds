<script>
  import { onMount } from "svelte";
  import CloudModal from "./CloudModal.svelte";
  export let clouds;
  export let currentUser;
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

  async function getActivePrices(cloud) {
    const prices = cloud.prices;
    const activePrices = prices.filter(price => price.cycle_id.prices_status === "active");
    const earlyAccessPrices = prices.filter(price => price.cycle_id.prices_status === "early_access");

    let newPriceData = []; // Holds data for us to create new prices with if necessary.
    let newPrices = []; // Holds any new prices we create.

    // Check if all active prices are stewarded. If yes, prepare to create a new price.
    if (!activePrices.find(price => price.licenses.length === 0)) {

      const basePrice = activePrices.find(price => price.tier === 1);

      let nextTier = activePrices.length + 1;
      const nextIndex = activePrices.sort((a,b) => a.tier - b.tier).findIndex((x,i) => x.tier !== i+1);
      
      if (nextIndex !== -1) {
        nextTier = nextIndex + 1
      }

      if (basePrice) {
        newPriceData.push({
          base_price: basePrice,
          tier: nextTier,
          num_drawings: cloud.drawings.length,
        });
      }
    }

    // If user is not logged in, display standard prices. Otherwise proceed.
    if (currentUser) {

      const renewableLicenses = currentUser.licenses.filter(license => license.price_id.cloud_id === cloud.id && license.price_id.cycle_id.renewal_active === true);

      // If user has no renewable licenses, display standard prices. Otherwise proceed.
      if (renewableLicenses.length !== 0) {

        const renewalIsEarlyAccess = renewableLicenses[0].price_id.cycle_id.prices_status === "active";

        // If new prices are not ready, display standard prices. Otherwise proceed.
        if (!renewalIsEarlyAccess || earlyAccessPrices.length !== 0) {

          // Prepare to display any renewal prices.
          renewableLicenses.forEach(license => {

            if (renewalIsEarlyAccess) {

              const newPrice = earlyAccessPrices.find(price => price.cloud_id === license.price_id.cloud_id && price.tier === license.price_id.tier);

              if (newPrice) {
                newPrice.isRenewalPrice = true;

                const index = activePrices.findIndex(activePrice =>
                  activePrice.cloud_id === newPrice.cloud_id &&
                  activePrice.tier === newPrice.tier
                );
                
                if (index !== -1) {
                  // Replace the existing active price with the renewal price.
                  activePrices[index] = newPrice;
                } else {
                  // No matching active price; add the renewal price to the result array.
                  activePrices.push(newPrice);
                }
              }
            } else {
              const index = activePrices.findIndex(activePrice =>
                activePrice.cloud_id === license.price_id.cloud_id &&
                activePrice.tier === license.price_id.tier
              );
                
              // If the price exists and hasn't already been stewarded, replace the existing active price with the renewal price.
              if (index !== -1) {
                if (activePrices[index].licenses.length === 0) {
                  activePrices[index].isRenewalPrice = true;
                }
              // If the price does not exist, prepare to create it.
              } else {
                // If we already added this data to newPriceData, mark it as a renewal price.
                const index = newPriceData.findIndex(data => data.tier === license.price_id.tier);
                if (index !== -1) {
                  newPriceData[index].isRenewalPrice = true;
                  // If we didn't already add this data to newPriceData, add it now.
                } else {
                  const basePrice = activePrices.find(price => price.tier === 1);

                  if (basePrice) {
                    newPriceData.push({
                      base_price: basePrice,
                      tier: license.price_id.tier,
                      num_drawings: cloud.drawings.length,
                    });
                  }
                }
              }
            }
          });
        }
      }
    }

    // Create new renewal prices if necessary.
    if (newPriceData.length !== 0) {
      try {
        console.log("Creating new prices...");
        const response = await fetch("/api/create-prices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: newPriceData,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        newPrices = data.prices;

      } catch (error) {
        console.error("Failed to create new prices:", error);
      }
        
      // We have to mark renewal prices again. For efficiency, start by building a lookup object from newPriceData.
      const renewalLookup = newPriceData.reduce((lookup, data) => {
        if (data.isRenewalPrice) {
          lookup[data.tier] = true;
        }
        return lookup;
      }, {});

      // Mark any renewal prices that we created as such.
      newPrices.forEach(price => {
        if (renewalLookup[price.tier]) {
          price.isRenewalPrice = true;
        }
      });

      // Add the newly created prices to the result array to be displayed in CloudModal.
      activePrices.push(...newPrices);

      // Add the newly created renewal prices to the top-level prices array for idempotency.
      cloud.prices.push(...newPrices);
    }
    
    return activePrices;
  }

  async function handleCloudClick(cloud) {
    selectedCloud = {
      id: cloud.id,
      name: cloud.name,
      product_id: cloud.product_id,
      drawings: cloud.drawings,
      prices: await getActivePrices(cloud),
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

    <CloudModal cloud={selectedCloud} currentUser={currentUser} />
  </div>

  <!-- horizon -->
  <img
    src="/v3/horizon.png"
    alt=""
    class="fixed w-screen object-cover object-top h-[14vh] bottom-0 left-0"
  />
</div>
<div></div>

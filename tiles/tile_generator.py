from PIL import Image
Image.MAX_IMAGE_PIXELS = None
import os

def create_tiles(image_path, output_dir, tile_size=512, min_zoom=1, max_zoom=7):
    print(f'Starting tile creation for {image_path}')
    img = Image.open(image_path)
    img_width, img_height = img.size
    print(f'Image size: {img_width}x{img_height}')

    # Calculate the base scale factor to ensure zoom level 0 is 256x256
    base_scale_factor = max(img_width, img_height) / tile_size

    for zoom in range(min_zoom, max_zoom + 1):
        scale_factor = base_scale_factor / (2 ** zoom)
        scaled_width = int(img_width / scale_factor)
        scaled_height = int(img_height / scale_factor)
        scaled_img = img.resize((scaled_width, scaled_height), Image.Resampling.NEAREST)
        zoom_dir = os.path.join(output_dir, str(zoom))
        os.makedirs(zoom_dir, exist_ok=True)
        print(f'Processing zoom level {zoom}: scaled size {scaled_width}x{scaled_height}')

        total_tiles = (scaled_width // tile_size + 1) * (scaled_height // tile_size + 1)
        tile_count = 0

        for x in range(0, scaled_width, tile_size):
            for y in range(0, scaled_height, tile_size):
                box = (x, y, min(x + tile_size, scaled_width), min(y + tile_size, scaled_height))
                tile = scaled_img.crop(box)
                tile.save(os.path.join(zoom_dir, f'{x // tile_size}_{y // tile_size}.png'), format='PNG', optimize=True)
                tile_count += 1
                print(f'Zoom level {zoom}: Exported tile {tile_count}/{total_tiles}')

    print('Tile creation completed')

# Usage
create_tiles("satellite-map.png", "output_tiles_sat")
import os
from PIL import Image, ImageChops
import math

# override the safety limit for large images
Image.MAX_IMAGE_PIXELS = None

# converts EPSG:3857 to EPSG:4326
def meters_to_lat_lon(x, y):
    R = 6378137.0
    lon = (x / R) * (180 / math.pi)
    lat = (y / R) * (180 / math.pi)
    lat = (2 * math.atan(math.exp(lat * (math.pi / 180))) - (math.pi / 2)) * (180 / math.pi)
    return lat, lon

# checks if an image is blank, so we don't export it - saving bandwidth.
def is_blank(image, threshold=10):
    bg = Image.new(image.mode, image.size, image.getpixel((0, 0)))
    diff = ImageChops.difference(image, bg)
    return diff.getbbox() is None or diff.getbbox()[2] * diff.getbbox()[3] < threshold


# converts lat/lon to pixel coordinates
def lat_lon_to_pixels(lat, lon, zoom):
    siny = math.sin(lat * math.pi / 180.0)
    siny = min(max(siny, -0.9999), 0.9999)
    x = 512 * (0.5 + lon / 360.0)
    y = 512 * (0.5 - math.log((1 + siny) / (1 - siny)) / (4 * math.pi))
    scale = 1 << zoom
    return int(x * scale), int(y * scale)

def create_tiles(image_path, output_dir, tile_size=512, min_zoom=11, max_zoom=13):
    # base/master extent taken from qgis.
    extent = [-7379800.2343, -2733780.6108, -7326079.674, -2680060.0505]

    min_x, min_y, max_x, max_y = extent

    min_lat, min_lon = meters_to_lat_lon(min_x, min_y)
    max_lat, max_lon = meters_to_lat_lon(max_x, max_y)

    print(f'Converted Extent to Lat/Lon: min_lat={min_lat}, min_lon={min_lon}, max_lat={max_lat}, max_lon={max_lon}')

    img = Image.open(image_path)
    img_width, img_height = img.size
    print(f'Image size: {img_width}x{img_height}')

    for zoom in range(min_zoom, max_zoom + 1):
        zoom_dir = os.path.join(output_dir, str(zoom))
        os.makedirs(zoom_dir, exist_ok=True)
        print(f'Processing zoom level {zoom}')

        resampling = Image.Resampling.LANCZOS
        if zoom < 13:
            resampling = Image.Resampling.NEAREST

        min_x, min_y = lat_lon_to_pixels(max_lat, min_lon, zoom)
        max_x, max_y = lat_lon_to_pixels(min_lat, max_lon, zoom)

        for x in range(min_x // tile_size, (max_x // tile_size) + 1):
            for y in range(min_y // tile_size, (max_y // tile_size) + 1):
                left = x * tile_size
                upper = y * tile_size
                right = left + tile_size
                lower = upper + tile_size

                # Calculate the corresponding pixel coordinates in the original image
                img_left = int((left - min_x) * img_width / (max_x - min_x))
                img_upper = int((upper - min_y) * img_height / (max_y - min_y))
                img_right = int((right - min_x) * img_width / (max_x - min_x))
                img_lower = int((lower - min_y) * img_height / (max_y - min_y))

                box = (img_left, img_upper, img_right, img_lower)
                tile = img.crop(box).resize((tile_size, tile_size), resampling)

                if not is_blank(tile):
                    tile_filename = f'{x}_{y}.png'
                    tile.save(os.path.join(zoom_dir, tile_filename), format='PNG', optimize=True)
                    print(f'Zoom level {zoom}: Exported tile {tile_filename} at ({x}, {y})')
                else:
                    print(f'Zoom level {zoom}: Skipping blank tile at ({x}, {y})')

    print('Tile creation completed')

create_tiles("v3/241010_FC_drawings.png", "drawings")
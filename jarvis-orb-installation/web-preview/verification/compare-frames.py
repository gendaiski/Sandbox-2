"""Compare animation.cjs screenshots. Requires Pillow. Usage: python compare-frames.py DIR"""
from pathlib import Path
import json
import sys
from PIL import Image, ImageChops, ImageStat

root = Path(sys.argv[1])
results = []
for route in ['desktop', 'homepage']:
    for timestamp in ['0', '1000', '3000', '8000', 'pointer']:
        original = Image.open(root / f'original-{timestamp}.png').convert('RGB')
        actual = Image.open(root / f'{route}-{timestamp}.png').convert('RGB')
        assert original.size == actual.size == (300, 300)
        diff = ImageChops.difference(original, actual)
        mean = max(ImageStat.Stat(diff).mean)
        changed = sum(pixel != (0, 0, 0) for pixel in diff.get_flattened_data())
        assert mean < 0.1, (route, timestamp, mean)
        results.append({'route': route, 'time': timestamp, 'mean_channel_difference': mean,
                        'changed_pixels': changed, 'total_pixels': 90000})

for timestamp in ['1000', '3000', '8000']:
    first = Image.open(root / 'original-0.png').convert('RGB')
    later = Image.open(root / f'original-{timestamp}.png').convert('RGB')
    assert ImageChops.difference(first, later).getbbox(), 'Animation must change over time.'

(root / 'pixel-comparison.json').write_text(json.dumps(results, indent=2) + '\n')
print(f'PASS {len(results)} frame comparisons; max mean channel difference: '
      f'{max(item["mean_channel_difference"] for item in results):.6f}/255')
print('Pixel-identical comparisons:', sum(item['changed_pixels'] == 0 for item in results))

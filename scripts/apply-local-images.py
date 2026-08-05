import re

src_path = '/Users/tang/Library/Application Support/TRAE SOLO CN/ModularData/ai-agent/work-mode-projects/6a47323e5925b695a3aa23d9/src/data/destinations.js'

with open(src_path, 'r', encoding='utf-8') as f:
    content = f.read()

cities = [
    {'id': 'beijing', 'prefix': 'bj', 'attrs': 21, 'shops': 3, 'hotels': 3},
    {'id': 'shanghai', 'prefix': 'sh', 'attrs': 8, 'shops': 3, 'hotels': 3},
    {'id': 'chengdu', 'prefix': 'cd', 'attrs': 8, 'shops': 2, 'hotels': 2},
    {'id': 'chongqing', 'prefix': 'cq', 'attrs': 8, 'shops': 2, 'hotels': 2},
]

replacements = []

for city in cities:
    p = city['prefix']

    city_img_pattern = rf"(id: '{city['id']}',\s*name: '[^']*',\s*lat: [\d.]+,\s*lon: [\d.]+,\s*description: '[^']*',\s*image: )'[^']*'"
    content = re.sub(city_img_pattern, rf"\1'/images/real/{p}-00.jpg'", content)
    replacements.append(f'{p} city image')

    hero_pattern = rf"(id: '{city['id']}',[\s\S]*?heroImage: )'[^']*'"
    content = re.sub(hero_pattern, rf"\1'/images/real/{p}-01.jpg'", content)
    replacements.append(f'{p} hero image')

    for i in range(1, city['attrs'] + 1):
        attr_id = f"{p}-{i}"
        img_file = f"{p}-a{i}.jpg"
        pattern = rf"(id: '{attr_id}',\s*name: '[^']*',\s*description: '[^']*',\s*image: )'[^']*'"
        if re.search(pattern, content):
            content = re.sub(pattern, rf"\1'/images/real/{img_file}'", content)
            replacements.append(f'{attr_id} -> {img_file}')

    for i in range(1, city['shops'] + 1):
        shop_id = f"{p}-s{i}"
        img_file = f"{p}-s{i}.jpg"
        pattern = rf"(id: '{shop_id}',\s*name: '[^']*',\s*description: '[^']*',\s*image: )'[^']*'"
        if re.search(pattern, content):
            content = re.sub(pattern, rf"\1'/images/real/{img_file}'", content)
            replacements.append(f'{shop_id} -> {img_file}')

    for i in range(1, city['hotels'] + 1):
        hotel_id = f"{p}-a{i}"
        img_file = f"{p}-h{i}.jpg"
        pattern = rf"(id: '{hotel_id}',\s*name: '[^']*',\s*description: '[^']*',\s*image: )'[^']*'"
        if re.search(pattern, content):
            content = re.sub(pattern, rf"\1'/images/real/{img_file}'", content)
            replacements.append(f'{hotel_id} -> {img_file}')

with open(src_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Total replacements: {len(replacements)}')

unsplash_count = content.count('images.unsplash.com')
print(f'Remaining Unsplash URLs (food only): {unsplash_count}')

trae_count = content.count('trae-api-cn') + content.count('text_to_image') + content.count('mchost')
print(f'Remaining generated image URLs: {trae_count}')

local_count = content.count('/images/real/')
print(f'Local image references: {local_count}')

import re
import urllib.parse

def get_svg_url(text, color1='EAF7F4', color2='81C784', width=1200, height=800):
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="{}" height="{}">\n'.format(width, height)
    svg += '  <defs>\n'
    svg += '    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">\n'
    svg += '      <stop offset="0%" style="stop-color:#{}"/>\n'.format(color1)
    svg += '      <stop offset="100%" style="stop-color:#{}"/>\n'.format(color2)
    svg += '    </linearGradient>\n'
    svg += '  </defs>\n'
    svg += '  <rect width="{}" height="{}" fill="url(#bg)"/>\n'.format(width, height)
    svg += '  <text x="{}" y="{}" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="#333">{}</text>\n'.format(width//2, height//2, text)
    svg += '</svg>'
    return 'data:image/svg+xml,' + urllib.parse.quote(svg)

with open('src/data/destinations.js', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
new_lines = []

city_colors = {
    '北京': ('E8F5E9', '81C784'),
    '上海': ('E3F2FD', '64B5F6'),
    '成都': ('F1F8E9', '66BB6A'),
    '重庆': ('ECEFF1', '78909C'),
}

current_city = '北京'
current_city_name = '北京'
replaced = 0

for i, line in enumerate(lines):
    if 'id: \'beijing\'' in line:
        current_city = '北京'
        current_city_name = '北京'
    elif 'id: \'shanghai\'' in line:
        current_city = '上海'
        current_city_name = '上海'
    elif 'id: \'chengdu\'' in line:
        current_city = '成都'
        current_city_name = '成都'
    elif 'id: \'chongqing\'' in line:
        current_city = '重庆'
        current_city_name = '重庆'
    
    name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", line)
    if name_match:
        current_item_name = name_match.group(1)
    else:
        current_item_name = current_city_name
    
    if 'image:' in line or 'heroImage:' in line:
        is_hero = 'heroImage:' in line
        
        if is_hero:
            item_name = current_city_name
        elif name_match:
            item_name = current_item_name
        elif i > 0:
            prev_line = lines[i-1]
            name_match_prev = re.search(r"name:\s*['\"]([^'\"]+)['\"]", prev_line)
            item_name = name_match_prev.group(1) if name_match_prev else current_city_name
        else:
            item_name = current_city_name
        
        base_color = city_colors.get(current_city, ('EAF7F4', '81C784'))
        color1, color2 = base_color
        
        if any(food_word in line for food_word in ['美食', 'food', '烤鸭', '火锅', '面', '包子', '串串', '豆腐', '抄手', '鸡', '粉', '鱼', '驴打滚', '卤煮', '豆汁', '涮肉']):
            color1, color2 = 'FFF3E0', 'FFB74D'
        elif any(shop_word in line for shop_word in ['购物', 'shopping', '商圈', '路', '太古里', '环球港']):
            color1, color2 = 'F3E5F5', 'CE93D8'
        elif any(acc_word in line for acc_word in ['住宿', 'accommodation', '酒店', '民宿']):
            color1, color2 = 'E8EAF6', '9FA8DA'
        
        url = get_svg_url(item_name, color1, color2)
        
        if is_hero:
            line = re.sub(r"heroImage:\s*['\"][^'\"]*['\"]", "heroImage: '" + url + "'", line)
        else:
            line = re.sub(r"image:\s*['\"][^'\"]*['\"]", "image: '" + url + "'", line)
        
        replaced += 1
        if is_hero:
            print("HeroImage: {}".format(item_name))
        else:
            print("Replaced: {} - {}".format(current_city, item_name))
    
    new_lines.append(line)

with open('src/data/destinations.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print("\nTotal replaced:", replaced)
print("Done!")

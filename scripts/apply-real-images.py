import re

UNSPLASH_PARAMS = '?auto=format&fit=crop&w=1600&q=80'

def u(photo_id):
    return f"https://images.unsplash.com/photo-{photo_id}{UNSPLASH_PARAMS}"

real_images = {
    "beijing": {
        "北京": u("1701668910380-b44dcc028525"),
        "故宫博物院": u("1701668910380-b44dcc028525"),
        "长城（八达岭）": u("1528132032628-89493baa1e29"),
        "颐和园": u("1603120527222-33f28c2ce89e"),
        "天坛公园": u("1590301729964-23833732ee04"),
        "南锣鼓巷": u("1587825338028-f1d568e0dbb3"),
        "798艺术区": u("1554415707-6e8cfc93fe23"),
        "什刹海": u("1625195374697-0bf5cbc5c5f8"),
        "鸟巢水立方": u("1534289692939-517196a71585"),
        "中国国家博物馆": u("1509265226434-5f4ddbdb2f7a"),
        "天安门广场": u("1547981609-4b6bfe67ca0b"),
        "圆明园": u("1577706881850-bf7c7d8906a5"),
        "北大清华校园": u("1589895009255-67c7cb06de4e"),
        "奥林匹克公园": u("1534289692939-517196a71585"),
        "雍和宫": u("1604477853852-8573d663e1e4"),
        "王府井步行街": u("1587824801761-da19de24e046"),
        "北海公园": u("1592620540259-75b9f6500187"),
        "朝阳公园": u("1469474968028-56623f02e42e"),
        "三里屯太古里": u("1554415707-6e8cfc93fe23"),
        "国贸CBD": u("1554415707-6e8cfc93fe23"),
        "簋街": u("1496116218417-1a781b1c416c"),
        "潘家园旧货市场": u("1554415707-6e8cfc93fe23"),
        "北京烤鸭": u("1547592166-23ac5d493c61"),
        "炸酱面": u("1556742524-750f2ab99913"),
        "铜锅涮肉": u("1614104030967-5ca61a54247b"),
        "豆汁焦圈": u("1496116218417-1a781b1c416c"),
        "驴打滚": u("1496116218417-1a781b1c416c"),
        "卤煮火烧": u("1556742524-750f2ab99913"),
        "王府井商圈": u("1587824801761-da19de24e046"),
        "三里屯/国贸": u("1554415707-6e8cfc93fe23"),
        "胡同精品民宿": u("1590490360182-c33d57733427"),
    },
    "shanghai": {
        "上海": u("1538428494232-9c0d8a3ab403"),
        "外滩": u("1538428494232-9c0d8a3ab403"),
        "东方明珠": u("1545487868-836a12a7fb08"),
        "豫园": u("1484961387514-05253f779744"),
        "田子坊": u("1554415707-6e8cfc93fe23"),
        "上海迪士尼": u("1556740755-8292401c4761"),
        "武康路": u("1554415707-6e8cfc93fe23"),
        "南京路步行街": u("1554415707-6e8cfc93fe23"),
        "陆家嘴三件套": u("1545487868-836a12a7fb08"),
        "小笼包": u("1565299624946-b28f40a0ae38"),
        "生煎包": u("1496116218417-1a781b1c416c"),
        "本帮红烧肉": u("1490645935967-10de6ba17061"),
        "葱油拌面": u("1556742524-750f2ab99913"),
        "蟹粉小笼": u("1565299624946-b28f40a0ae38"),
        "白斩鸡": u("1490645935967-10de6ba17061"),
        "南京西路": u("1538428494232-9c0d8a3ab403"),
        "淮海路": u("1538428494232-9c0d8a3ab403"),
        "环球港": u("1545487868-836a12a7fb08"),
        "外滩/南京东路": u("1538428494232-9c0d8a3ab403"),
        "陆家嘴": u("1545487868-836a12a7fb08"),
        "法租界民宿": u("1590490360182-c33d57733427"),
    },
    "chengdu": {
        "成都": u("1526716173434-a1b560f2065d"),
        "大熊猫繁育研究基地": u("1526716173434-a1b560f2065d"),
        "宽窄巷子": u("1547981609-4b6bfe67ca0b"),
        "锦里古街": u("1554415707-6e8cfc93fe23"),
        "武侯祠": u("1604477853852-8573d663e1e4"),
        "杜甫草堂": u("1484961387514-05253f779744"),
        "春熙路": u("1554415707-6e8cfc93fe23"),
        "青城山": u("1469474968028-56623f02e42e"),
        "都江堰": u("1469474968028-56623f02e42e"),
        "火锅": u("1614104030967-5ca61a54247b"),
        "串串香": u("1614104030967-5ca61a54247b"),
        "担担面": u("1556742524-750f2ab99913"),
        "麻婆豆腐": u("1547592166-23ac5d493c61"),
        "龙抄手": u("1496116218417-1a781b1c416c"),
        "兔头": u("1496116218417-1a781b1c416c"),
        "春熙路/IFS": u("1554415707-6e8cfc93fe23"),
        "太古里": u("1554415707-6e8cfc93fe23"),
        "春熙路/太古里": u("1554415707-6e8cfc93fe23"),
        "宽窄巷子周边": u("1590490360182-c33d57733427"),
    },
    "chongqing": {
        "重庆": u("1547981609-4b6bfe67ca0b"),
        "洪崖洞": u("1547981609-4b6bfe67ca0b"),
        "解放碑": u("1554415707-6e8cfc93fe23"),
        "李子坝轻轨": u("1554415707-6e8cfc93fe23"),
        "磁器口古镇": u("1547981609-4b6bfe67ca0b"),
        "长江索道": u("1554415707-6e8cfc93fe23"),
        "武隆天坑": u("1469474968028-56623f02e42e"),
        "南山一棵树": u("1538428494232-9c0d8a3ab403"),
        "十八梯": u("1547981609-4b6bfe67ca0b"),
        "重庆火锅": u("1614104030967-5ca61a54247b"),
        "小面": u("1556742524-750f2ab99913"),
        "酸辣粉": u("1556742524-750f2ab99913"),
        "毛血旺": u("1547592166-23ac5d493c61"),
        "钵钵鸡": u("1614104030967-5ca61a54247b"),
        "烤鱼": u("1547592166-23ac5d493c61"),
        "解放碑商圈": u("1554415707-6e8cfc93fe23"),
        "观音桥": u("1554415707-6e8cfc93fe23"),
        "解放碑/洪崖洞": u("1547981609-4b6bfe67ca0b"),
        "江北嘴": u("1566073771259-6a8506099945"),
    },
}

city_names = {
    'beijing': '北京',
    'shanghai': '上海',
    'chengdu': '成都',
    'chongqing': '重庆',
}

with open('src/data/destinations.js', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
new_lines = []

current_city = 'beijing'
replaced = 0

for i, line in enumerate(lines):
    if "id: 'beijing'" in line:
        current_city = 'beijing'
    elif "id: 'shanghai'" in line:
        current_city = 'shanghai'
    elif "id: 'chengdu'" in line:
        current_city = 'chengdu'
    elif "id: 'chongqing'" in line:
        current_city = 'chongqing'
    
    if 'image:' in line or 'heroImage:' in line:
        item_name = None
        
        name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", line)
        if name_match:
            item_name = name_match.group(1)
        else:
            for j in range(i-1, max(-1, i-5), -1):
                name_match_prev = re.search(r"name:\s*['\"]([^'\"]+)['\"]", lines[j])
                if name_match_prev:
                    item_name = name_match_prev.group(1)
                    break
        
        if item_name is None:
            item_name = city_names.get(current_city)
        
        if item_name:
            city_images = real_images.get(current_city, {})
            real_url = None
            
            if item_name in city_images:
                real_url = city_images[item_name]
            else:
                for key in city_images:
                    if key in item_name or item_name in key:
                        real_url = city_images[key]
                        break
            
            if real_url:
                if 'heroImage:' in line:
                    line = re.sub(r"heroImage:\s*['\"][^'\"]*['\"]", "heroImage: '" + real_url + "'", line)
                else:
                    line = re.sub(r"image:\s*['\"][^'\"]*['\"]", "image: '" + real_url + "'", line)
                replaced += 1
                print(f"Replaced: {current_city} - {item_name}")
    
    new_lines.append(line)

with open('src/data/destinations.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print(f"\nTotal replaced: {replaced}")
print("Done!")
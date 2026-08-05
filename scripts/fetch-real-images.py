import json
import urllib.request
import urllib.parse
import time

AMAP_KEY = '942f298093937afa211f61802dbb9e87'

city_name_map = {
    'beijing': '北京',
    'shanghai': '上海',
    'chengdu': '成都',
    'chongqing': '重庆',
}

items_to_fetch = [
    ('beijing', ['北京', '故宫博物院', '长城', '颐和园', '天坛', '南锣鼓巷', '798艺术区', '什刹海', '鸟巢', '国家博物馆', '天安门', '圆明园', '北京大学', '奥林匹克公园', '雍和宫', '王府井', '北海公园', '朝阳公园', '三里屯', '国贸CBD', '簋街', '潘家园', '北京烤鸭', '炸酱面', '铜锅涮肉', '豆汁焦圈', '驴打滚', '卤煮火烧']),
    ('shanghai', ['上海', '外滩', '东方明珠', '豫园', '田子坊', '上海迪士尼', '武康路', '南京路', '陆家嘴', '小笼包', '生煎包', '红烧肉', '葱油拌面', '蟹粉小笼', '白斩鸡']),
    ('chengdu', ['成都', '宽窄巷子', '锦里', '熊猫基地', '春熙路', '太古里', '杜甫草堂', '武侯祠', '人民公园', '火锅', '串串香', '担担面', '兔头', '钟水饺']),
    ('chongqing', ['重庆', '洪崖洞', '解放碑', '长江索道', '磁器口', '李子坝', '朝天门', '火锅', '小面', '酸辣粉', '烤鱼']),
]

results = {}

for city_id, keywords in items_to_fetch:
    city_name = city_name_map[city_id]
    results[city_id] = {}
    
    for keyword in keywords:
        try:
            url = f"https://restapi.amap.com/v3/place/text?keywords={urllib.parse.quote(keyword)}&city={urllib.parse.quote(city_name)}&output=json&key={AMAP_KEY}&offset=1&page=1&extensions=all"
            with urllib.request.urlopen(url, timeout=10) as response:
                data = json.loads(response.read().decode('utf-8'))
            
            if data.get('status') == '1' and data.get('pois') and len(data['pois']) > 0:
                poi = data['pois'][0]
                if poi.get('photos') and len(poi['photos']) > 0:
                    photo_url = poi['photos'][0]['url']
                    results[city_id][keyword] = photo_url
                    print(f"OK: {city_name} - {keyword}")
                else:
                    print(f"NO PHOTO: {city_name} - {keyword}")
            else:
                print(f"NO RESULT: {city_name} - {keyword}")
            
            time.sleep(0.5)
        except Exception as e:
            print(f"ERROR: {city_name} - {keyword}: {e}")

print("\n" + "="*50)
print("RESULTS:")
print(json.dumps(results, ensure_ascii=False, indent=2))

import json
import urllib.request
import urllib.parse
import time

AMAP_KEY = '942f298093937afa211f61802dbb9e87'

def get_real_image(keyword, city_name):
    try:
        url = f"https://restapi.amap.com/v3/place/text?keywords={urllib.parse.quote(keyword)}&city={urllib.parse.quote(city_name)}&output=json&key={AMAP_KEY}&offset=1&page=1&extensions=all"
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
        if data.get('status') == '1' and data.get('pois') and len(data['pois']) > 0:
            poi = data['pois'][0]
            if poi.get('photos') and len(poi['photos']) > 0:
                return poi['photos'][0]['url']
    except Exception as e:
        print(f"ERROR: {city_name} {keyword}: {e}")
    return None

city_items = {
    'beijing': {
        'city': ['北京'],
        'attractions': ['故宫博物院', '八达岭长城', '颐和园', '天坛', '南锣鼓巷', '798艺术区', '什刹海', '鸟巢', '国家博物馆', '天安门', '圆明园', '北京大学', '奥林匹克公园', '雍和宫', '王府井', '北海公园', '朝阳公园', '三里屯', '国贸', '簋街', '潘家园'],
        'food': ['北京烤鸭', '炸酱面', '铜锅涮肉', '豆汁焦圈', '驴打滚', '卤煮火烧'],
        'shopping': ['王府井步行街', '三里屯太古里', '潘家园旧货市场'],
        'accommodation': ['王府井', '三里屯', '国贸'],
    },
    'shanghai': {
        'city': ['上海'],
        'attractions': ['外滩', '东方明珠', '豫园', '田子坊', '上海迪士尼', '武康路', '南京路', '陆家嘴'],
        'food': ['小笼包', '生煎包', '红烧肉', '葱油拌面', '蟹粉小笼', '白斩鸡'],
        'shopping': ['南京西路', '淮海路', '环球港'],
        'accommodation': ['外滩', '陆家嘴', '法租界'],
    },
    'chengdu': {
        'city': ['成都'],
        'attractions': ['熊猫基地', '宽窄巷子', '锦里', '武侯祠', '杜甫草堂', '春熙路', '青城山', '都江堰'],
        'food': ['火锅', '串串香', '担担面', '麻婆豆腐', '龙抄手', '兔头'],
        'shopping': ['春熙路', '太古里'],
        'accommodation': ['春熙路', '太古里', '宽窄巷子'],
    },
    'chongqing': {
        'city': ['重庆'],
        'attractions': ['洪崖洞', '解放碑', '李子坝', '磁器口', '长江索道', '武隆天坑', '南山一棵树', '十八梯'],
        'food': ['火锅', '小面', '酸辣粉', '毛血旺', '钵钵鸡', '烤鱼'],
        'shopping': ['解放碑', '观音桥'],
        'accommodation': ['解放碑', '观音桥', '江北嘴'],
    },
}

city_name_map = {'beijing': '北京', 'shanghai': '上海', 'chengdu': '成都', 'chongqing': '重庆'}

results = {}

for city_id, categories in city_items.items():
    city_name = city_name_map[city_id]
    results[city_id] = {}
    
    for category, keywords in categories.items():
        results[city_id][category] = {}
        for keyword in keywords:
            url = get_real_image(keyword, city_name)
            if url:
                results[city_id][category][keyword] = url
                print(f"OK: {city_name} - {category} - {keyword}")
            else:
                print(f"FAIL: {city_name} - {category} - {keyword}")
            time.sleep(0.3)

print("\n" + "="*60)
print("RESULTS:")
print(json.dumps(results, ensure_ascii=False, indent=2))

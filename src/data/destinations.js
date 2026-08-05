const areaLabels = {
  'center': '市中心',
  'north': '北部',
  'south': '南部',
  'east': '东部',
  'west': '西部',
  'northeast': '东北部',
  'northwest': '西北部',
  'southeast': '东南部',
  'southwest': '西南部',
  'suburb': '远郊区',
  'puxi': '浦西',
  'pudong': '浦东',
  'yuzhong': '渝中',
  'shapingba': '沙坪坝',
  'nanan': '南岸',
  'default': '市区',
}

const destinations = [
  {
    id: 'beijing',
    name: '北京',
    lat: 39.9042,
    lon: 116.4074,
    description: '六朝古都，传统与现代交融的千年都城',
    image: '/images/real/bj-00.jpg',
    tags: ['历史文化', '美食之都', '亲子游'],
    heroImage: '/images/real/bj-01.jpg',
    weather: { temp: '18°C', condition: '晴转多云', icon: 'sun', tips: '早晚温差大，建议叠穿外套' },
    pool: {
      attractions: [
        { id: 'bj-1', name: '故宫博物院', description: '世界上现存规模最大的木质结构建筑群', image: '/images/real/bj-a1.jpg', duration: '3-4小时', durationMinutes: 210, location: '东城区景山前街4号', address: '北京市东城区景山前街4号', tags: ['必去', '历史', '拍照'], needsReservation: true, area: 'center', areaLabel: '市中心', lat: 39.9163, lng: 116.3972, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 100 },
        { id: 'bj-2', name: '长城（八达岭）', description: '万里长城最具代表性的一段', image: '/images/real/bj-a2.jpg', duration: '半天', durationMinutes: 240, location: '延庆区八达岭镇', address: '北京市延庆区八达岭镇', tags: ['必去', '户外', '拍照'], needsReservation: true, area: 'north', areaLabel: '北部（远郊）', lat: 40.3576, lng: 116.0206, preferredTime: 'morning', isRemote: true, isFullDay: false, weatherSensitive: true, crowdRisk: 'high', priority: 95 },
        { id: 'bj-3', name: '颐和园', description: '中国现存最大的皇家园林', image: '/images/real/bj-a3.jpg', duration: '2-3小时', durationMinutes: 150, location: '海淀区新建宫门路19号', address: '北京市海淀区新建宫门路19号', tags: ['园林', '历史', '散步'], needsReservation: true, area: 'northwest', areaLabel: '西北部', lat: 39.9999, lng: 116.2755, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: true, crowdRisk: 'medium', priority: 85 },
        { id: 'bj-4', name: '天坛公园', description: '明清两代皇帝祭天祈谷的场所', image: '/images/real/bj-a4.jpg', duration: '2小时', durationMinutes: 120, location: '东城区天坛内东里7号', address: '北京市东城区天坛内东里7号', tags: ['历史', '建筑', '散步'], needsReservation: false, area: 'south', areaLabel: '南部', lat: 39.8822, lng: 116.4108, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 75 },
        { id: 'bj-5', name: '南锣鼓巷', description: '北京最古老的街区之一，胡同文化代表', image: '/images/real/bj-a5.jpg', duration: '1-2小时', durationMinutes: 90, location: '东城区南锣鼓巷', address: '北京市东城区南锣鼓巷', tags: ['胡同', '文艺', '小吃'], needsReservation: false, area: 'center', areaLabel: '市中心', lat: 39.9373, lng: 116.4031, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 70 },
        { id: 'bj-6', name: '798艺术区', description: '当代艺术的聚集地，文艺青年必去', image: '/images/real/bj-a6.jpg', duration: '2-3小时', durationMinutes: 150, location: '朝阳区酒仙桥路4号', address: '北京市朝阳区酒仙桥路4号', tags: ['文艺', '拍照', '展览'], needsReservation: false, area: 'northeast', areaLabel: '东北部', lat: 39.9848, lng: 116.4961, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 65 },
        { id: 'bj-7', name: '什刹海', description: '老北京风情的水域风景区', image: '/images/real/bj-a7.jpg', duration: '2小时', durationMinutes: 120, location: '西城区东起地安门外大街北侧', address: '北京市西城区地安门外大街', tags: ['夜景', '酒吧', '胡同'], needsReservation: false, area: 'center', areaLabel: '市中心', lat: 39.9368, lng: 116.3833, preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 60 },
        { id: 'bj-8', name: '鸟巢水立方', description: '2008年奥运会主体育场', image: '/images/real/bj-a8.jpg', duration: '1-2小时', durationMinutes: 90, location: '朝阳区国家体育场南路1号', address: '北京市朝阳区国家体育场南路1号', tags: ['现代建筑', '拍照', '夜景'], needsReservation: false, area: 'north', areaLabel: '北部', lat: 39.9929, lng: 116.3964, preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 55 },
        { id: 'bj-9', name: '中国国家博物馆', description: '世界上单体建筑面积最大的博物馆', image: '/images/real/bj-a9.jpg', duration: '3-4小时', durationMinutes: 210, location: '东城区东长安街16号', address: '北京市东城区东长安街16号', tags: ['必去', '历史', '文化'], needsReservation: true, area: 'center', areaLabel: '市中心', lat: 39.9046, lng: 116.3973, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 90 },
        { id: 'bj-10', name: '天安门广场', description: '世界上最大的城市广场', image: '/images/real/bj-a10.jpg', duration: '1-2小时', durationMinutes: 90, location: '东城区天安门广场', address: '北京市东城区天安门广场', tags: ['必去', '历史', '打卡'], needsReservation: false, area: 'center', areaLabel: '市中心', lat: 39.9042, lng: 116.3974, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 80 },
        { id: 'bj-11', name: '圆明园', description: '万园之园，中西合璧的皇家园林遗址', image: '/images/real/bj-a11.jpg', duration: '2-3小时', durationMinutes: 150, location: '海淀区清华西路28号', address: '北京市海淀区清华西路28号', tags: ['历史', '园林', '遗址'], needsReservation: true, area: 'northwest', areaLabel: '西北部', lat: 40.0007, lng: 116.2752, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: true, crowdRisk: 'medium', priority: 65 },
        { id: 'bj-12', name: '北大清华校园', description: '中国顶尖高等学府，学术氛围浓厚', image: '/images/real/bj-a12.jpg', duration: '2小时', durationMinutes: 120, location: '海淀区颐和园路5号', address: '北京市海淀区颐和园路5号', tags: ['校园', '打卡', '学术'], needsReservation: true, area: 'northwest', areaLabel: '西北部', lat: 39.9975, lng: 116.3065, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 50 },
        { id: 'bj-13', name: '奥林匹克公园', description: '北京奥林匹克运动会的核心区域', image: '/images/real/bj-a13.jpg', duration: '2小时', durationMinutes: 120, location: '朝阳区科荟路33号', address: '北京市朝阳区科荟路33号', tags: ['公园', '运动', '现代'], needsReservation: false, area: 'north', areaLabel: '北部', lat: 39.9929, lng: 116.3964, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'low', priority: 45 },
        { id: 'bj-14', name: '雍和宫', description: '北京现存规模最大的藏传佛教寺院', image: '/images/real/bj-a14.jpg', duration: '1-2小时', durationMinutes: 90, location: '东城区雍和宫大街12号', address: '北京市东城区雍和宫大街12号', tags: ['宗教', '祈福', '历史'], needsReservation: false, area: 'center', areaLabel: '市中心', lat: 39.9485, lng: 116.4039, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 55 },
        { id: 'bj-15', name: '王府井步行街', description: '北京最著名的商业街', image: '/images/real/bj-a15.jpg', duration: '1-2小时', durationMinutes: 90, location: '东城区王府井大街', address: '北京市东城区王府井大街', tags: ['购物', '打卡', '繁华'], needsReservation: false, area: 'center', areaLabel: '市中心', lat: 39.9097, lng: 116.4106, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 40 },
        { id: 'bj-16', name: '北海公园', description: '中国现存最古老的皇家园林', image: '/images/real/bj-a16.jpg', duration: '2小时', durationMinutes: 120, location: '西城区文津街1号', address: '北京市西城区文津街1号', tags: ['园林', '散步', '历史'], needsReservation: false, area: 'center', areaLabel: '市中心', lat: 39.9242, lng: 116.3811, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: true, crowdRisk: 'medium', priority: 50 },
        { id: 'bj-17', name: '朝阳公园', description: '北京最大的城市公园', image: '/images/real/bj-a17.jpg', duration: '2小时', durationMinutes: 120, location: '朝阳区朝阳公园南路1号', address: '北京市朝阳区朝阳公园南路1号', tags: ['公园', '户外', '休闲'], needsReservation: false, area: 'northeast', areaLabel: '东北部', lat: 39.9380, lng: 116.4834, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: true, crowdRisk: 'low', priority: 35 },
        { id: 'bj-18', name: '三里屯太古里', description: '潮流时尚聚集地，夜生活丰富', image: '/images/real/bj-a18.jpg', duration: '2小时', durationMinutes: 120, location: '朝阳区三里屯路', address: '北京市朝阳区三里屯路', tags: ['潮流', '夜生活', '拍照'], needsReservation: false, area: 'northeast', areaLabel: '东北部', lat: 39.9371, lng: 116.4655, preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 45 },
        { id: 'bj-19', name: '国贸CBD', description: '北京中央商务区，摩天大楼聚集地', image: '/images/real/bj-a19.jpg', duration: '1-2小时', durationMinutes: 90, location: '朝阳区建国门外大街1号', address: '北京市朝阳区建国门外大街1号', tags: ['现代', '商务', '夜景'], needsReservation: false, area: 'northeast', areaLabel: '东北部', lat: 39.9087, lng: 116.4709, preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 40 },
        { id: 'bj-20', name: '簋街', description: '北京著名美食街，夜宵首选', image: '/images/real/bj-a20.jpg', duration: '2小时', durationMinutes: 120, location: '东城区东直门内大街', address: '北京市东城区东直门内大街', tags: ['美食', '夜宵', '热闹'], needsReservation: false, area: 'center', areaLabel: '市中心', lat: 39.9389, lng: 116.4208, preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 35 },
        { id: 'bj-21', name: '潘家园旧货市场', description: '全国最大的古玩旧货市场', image: '/images/real/bj-a21.jpg', duration: '2小时', durationMinutes: 120, location: '朝阳区华威路', address: '北京市朝阳区华威路', tags: ['淘宝', '文化', '特色'], needsReservation: false, area: 'southeast', areaLabel: '东南部', lat: 39.8828, lng: 116.4705, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 30 },
      ],
      food: [
        { id: 'bj-f1', name: '北京烤鸭', description: '皮脆肉嫩，配薄饼甜面酱', image: '', price: '¥150-300', cuisine: '京菜', location: '全城各大连锁店', address: '北京市东城区王府井大街', tags: ['必吃', '招牌'], lat: 39.9163, lng: 116.3972, durationMinutes: 90, area: 'center', areaLabel: '市中心', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 95, mealSubtype: 'restaurantMeal' },
        { id: 'bj-f2', name: '炸酱面', description: '老北京传统面食，酱香浓郁', image: '', price: '¥25-50', cuisine: '面食', location: '胡同小馆', address: '北京市东城区南锣鼓巷', tags: ['地道', '午餐'], lat: 39.9373, lng: 116.4031, durationMinutes: 45, area: 'center', areaLabel: '市中心', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 60, mealSubtype: 'quickMeal' },
        { id: 'bj-f3', name: '铜锅涮肉', description: '冬日必备，清汤涮羊肉', image: '', price: '¥100-200', cuisine: '火锅', location: '牛街、簋街', address: '北京市东城区东直门内大街', tags: ['冬日', '聚餐'], lat: 39.9389, lng: 116.4208, durationMinutes: 90, area: 'center', areaLabel: '市中心', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 70, mealSubtype: 'restaurantMeal' },
        { id: 'bj-f4', name: '豆汁焦圈', description: '老北京早餐经典搭配', image: '', price: '¥10-20', cuisine: '小吃', location: '护国寺小吃', address: '北京市西城区护国寺', tags: ['特色', '早餐'], lat: 39.9368, lng: 116.3833, durationMinutes: 30, area: 'center', areaLabel: '市中心', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'low', priority: 40, mealSubtype: 'quickMeal' },
        { id: 'bj-f5', name: '驴打滚', description: '黄豆面裹糯米豆沙，软糯香甜', image: '', price: '¥15-30', cuisine: '甜点', location: '稻香村', address: '北京市东城区王府井大街', tags: ['伴手礼', '甜点'], lat: 39.9097, lng: 116.4106, durationMinutes: 15, area: 'center', areaLabel: '市中心', preferredTime: 'anytime', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'low', priority: 30, mealSubtype: 'snackBreak' },
        { id: 'bj-f6', name: '卤煮火烧', description: '猪肠猪肺豆腐炖制，重口味爱好者必试', image: '', price: '¥30-50', cuisine: '小吃', location: '门框胡同', address: '北京市西城区门框胡同', tags: ['地道', '重口味'], lat: 39.8828, lng: 116.4705, durationMinutes: 45, area: 'center', areaLabel: '市中心', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 45, mealSubtype: 'quickMeal' },
      ],
      shopping: [
        { id: 'bj-s1', name: '王府井步行街', description: '北京最著名的商业街', image: '/images/real/bj-s1.jpg', type: '商业街', location: '东城区王府井大街', address: '北京市东城区王府井大街', tags: ['购物', '打卡'], lat: 39.9097, lng: 116.4106, durationMinutes: 90, area: 'center', areaLabel: '市中心', preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 50 },
        { id: 'bj-s2', name: '三里屯太古里', description: '潮流时尚聚集地', image: '/images/real/bj-s2.jpg', type: '时尚商圈', location: '朝阳区三里屯路', address: '北京市朝阳区三里屯路', tags: ['潮流', '夜生活'], lat: 39.9371, lng: 116.4655, durationMinutes: 120, area: 'northeast', areaLabel: '东北部', preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 55 },
        { id: 'bj-s3', name: '潘家园旧货市场', description: '全国最大的古玩旧货市场', image: '/images/real/bj-s3.jpg', type: '特色市场', location: '朝阳区华威路', address: '北京市朝阳区华威路', tags: ['淘宝', '文化'], lat: 39.8828, lng: 116.4705, durationMinutes: 120, area: 'southeast', areaLabel: '东南部', preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 40 },
      ],
      accommodation: [
        { id: 'bj-a1', name: '王府井商圈', description: '交通便利，靠近主要景点', image: '/images/real/bj-h1.jpg', priceRange: '¥500-1500', area: '东城区' },
        { id: 'bj-a2', name: '三里屯/国贸', description: '时尚商圈，夜生活丰富', image: '/images/real/bj-h2.jpg', priceRange: '¥600-2000', area: '朝阳区' },
        { id: 'bj-a3', name: '胡同精品民宿', description: '体验老北京四合院生活', image: '/images/real/bj-h3.jpg', priceRange: '¥400-1200', area: '东城区/西城区' },
      ],
    },
  },
  {
    id: 'shanghai',
    name: '上海',
    lat: 31.2304,
    lon: 121.4737,
    description: '东方明珠，摩登与怀旧交织的魔都',
    image: '/images/real/sh-00.jpg',
    tags: ['都市摩登', '美食天堂', '购物圣地'],
    heroImage: '/images/real/sh-01.jpg',
    weather: { temp: '22°C', condition: '多云', icon: 'cloud', tips: '湿度较高，建议轻薄透气衣物' },
    pool: {
      attractions: [
        { id: 'sh-1', name: '外滩', description: '万国建筑博览群，上海地标', image: '/images/real/sh-a1.jpg', duration: '1-2小时', durationMinutes: 90, location: '黄浦区中山东一路', address: '上海市黄浦区中山东一路', tags: ['必去', '夜景', '拍照'], needsReservation: false, area: 'puxi', areaLabel: '浦西', lat: 31.2397, lng: 121.4905, preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 95 },
        { id: 'sh-2', name: '东方明珠', description: '上海标志性建筑，俯瞰全城', image: '/images/real/sh-a2.jpg', duration: '2小时', durationMinutes: 120, location: '浦东新区世纪大道1号', address: '上海市浦东新区世纪大道1号', tags: ['必去', '地标', '观景'], needsReservation: true, area: 'pudong', areaLabel: '浦东', lat: 31.2397, lng: 121.4998, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 90 },
        { id: 'sh-3', name: '豫园', description: '江南古典园林，老城厢代表', image: '/images/real/sh-a3.jpg', duration: '2小时', durationMinutes: 120, location: '黄浦区安仁街132号', address: '上海市黄浦区安仁街132号', tags: ['园林', '历史', '小吃'], needsReservation: false, area: 'puxi', areaLabel: '浦西', lat: 31.2272, lng: 121.4925, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 80 },
        { id: 'sh-4', name: '田子坊', description: '石库门里弄改造的文艺街区', image: '/images/real/sh-a4.jpg', duration: '1-2小时', durationMinutes: 90, location: '黄浦区泰康路210弄', address: '上海市黄浦区泰康路210弄', tags: ['文艺', '小店', '拍照'], needsReservation: false, area: 'puxi', areaLabel: '浦西', lat: 31.2129, lng: 121.4668, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 65 },
        { id: 'sh-5', name: '上海迪士尼', description: '中国大陆首家迪士尼乐园', image: '/images/real/sh-a5.jpg', duration: '一整天', durationMinutes: 480, location: '浦东新区川沙镇黄赵路310号', address: '上海市浦东新区川沙镇黄赵路310号', tags: ['亲子', '主题乐园', '必去'], needsReservation: true, area: 'pudong', areaLabel: '浦东（远郊）', lat: 31.1434, lng: 121.6576, preferredTime: 'morning', isRemote: true, isFullDay: true, weatherSensitive: true, crowdRisk: 'high', priority: 100 },
        { id: 'sh-6', name: '武康路', description: '网红梧桐树大道，名人故居集中', image: '/images/real/sh-a6.jpg', duration: '1小时', durationMinutes: 60, location: '徐汇区武康路', address: '上海市徐汇区武康路', tags: ['梧桐', '文艺', '散步'], needsReservation: false, area: 'puxi', areaLabel: '浦西', lat: 31.2107, lng: 121.4373, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: true, crowdRisk: 'medium', priority: 55 },
        { id: 'sh-7', name: '南京路步行街', description: '中华商业第一街', image: '/images/real/sh-a7.jpg', duration: '1-2小时', durationMinutes: 90, location: '黄浦区南京东路', address: '上海市黄浦区南京东路', tags: ['购物', '打卡', '繁华'], needsReservation: false, area: 'puxi', areaLabel: '浦西', lat: 31.2355, lng: 121.4753, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 70 },
        { id: 'sh-8', name: '陆家嘴三件套', description: '上海摩天大楼群，登顶观景', image: '/images/real/sh-a8.jpg', duration: '1-2小时', durationMinutes: 90, location: '浦东新区陆家嘴', address: '上海市浦东新区陆家嘴', tags: ['现代建筑', '观景', '拍照'], needsReservation: true, area: 'pudong', areaLabel: '浦东', lat: 31.2357, lng: 121.5014, preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 75 },
      ],
      food: [
        { id: 'sh-f1', name: '小笼包', description: '皮薄馅大汤汁多，上海招牌', image: '', price: '¥30-60', cuisine: '本帮菜', location: '南翔馒头店', address: '上海市黄浦区安仁街132号', tags: ['必吃', '招牌'], lat: 31.2272, lng: 121.4925, durationMinutes: 45, area: 'puxi', areaLabel: '浦西', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 85, mealSubtype: 'quickMeal' },
        { id: 'sh-f2', name: '生煎包', description: '底脆馅鲜，一口爆汁', image: '', price: '¥20-40', cuisine: '小吃', location: '小杨生煎', address: '上海市黄浦区南京东路', tags: ['早餐', '地道'], lat: 31.2355, lng: 121.4753, durationMinutes: 30, area: 'puxi', areaLabel: '浦西', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 50, mealSubtype: 'quickMeal' },
        { id: 'sh-f3', name: '本帮红烧肉', description: '浓油赤酱，肥而不腻', image: '', price: '¥60-120', cuisine: '本帮菜', location: '老吉士酒家', address: '上海市徐汇区天平路', tags: ['经典', '正餐'], lat: 31.2107, lng: 121.4373, durationMinutes: 75, area: 'puxi', areaLabel: '浦西', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 70, mealSubtype: 'restaurantMeal' },
        { id: 'sh-f4', name: '葱油拌面', description: '简单却惊艳的上海味道', image: '', price: '¥15-30', cuisine: '面食', location: '弄堂小馆', address: '上海市黄浦区泰康路', tags: ['早餐', '地道'], lat: 31.2129, lng: 121.4668, durationMinutes: 30, area: 'puxi', areaLabel: '浦西', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'low', priority: 40, mealSubtype: 'quickMeal' },
        { id: 'sh-f5', name: '蟹粉小笼', description: '蟹黄满满，秋冬限定', image: '', price: '¥80-150', cuisine: '本帮菜', location: '鼎泰丰', address: '上海市浦东新区陆家嘴', tags: ['季节限定', '高端'], lat: 31.2397, lng: 121.5014, durationMinutes: 60, area: 'pudong', areaLabel: '浦东', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 60, mealSubtype: 'restaurantMeal' },
        { id: 'sh-f6', name: '白斩鸡', description: '皮爽肉嫩，配蘸料一绝', image: '', price: '¥50-80', cuisine: '本帮菜', location: '振鼎鸡', address: '上海市徐汇区漕溪北路', tags: ['家常', '清淡'], lat: 31.2197, lng: 121.4392, durationMinutes: 45, area: 'puxi', areaLabel: '浦西', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'low', priority: 45, mealSubtype: 'quickMeal' },
      ],
      shopping: [
        { id: 'sh-s1', name: '南京西路', description: '高端奢侈品一条街', image: '/images/real/sh-s1.jpg', type: '高端商圈', location: '静安区南京西路', address: '上海市静安区南京西路', tags: ['奢侈品', '高端'], lat: 31.2272, lng: 121.4577, durationMinutes: 120, area: 'puxi', areaLabel: '浦西', preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 50 },
        { id: 'sh-s2', name: '淮海路', description: '时尚潮流与老上海风情', image: '/images/real/sh-s2.jpg', type: '时尚商圈', location: '黄浦区淮海中路', address: '上海市黄浦区淮海中路', tags: ['时尚', '梧桐'], lat: 31.2187, lng: 121.4657, durationMinutes: 120, area: 'puxi', areaLabel: '浦西', preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 45 },
        { id: 'sh-s3', name: '环球港', description: '一站式购物休闲中心', image: '/images/real/sh-s3.jpg', type: '购物中心', location: '普陀区中山北路3300号', address: '上海市普陀区中山北路3300号', tags: ['综合', '亲子'], lat: 31.2377, lng: 121.4137, durationMinutes: 180, area: 'puxi', areaLabel: '浦西', preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'low', priority: 35 },
      ],
      accommodation: [
        { id: 'sh-a1', name: '外滩/南京东路', description: '核心景区，出行便利', image: '/images/real/sh-h1.jpg', priceRange: '¥600-2000', area: '黄浦区' },
        { id: 'sh-a2', name: '陆家嘴', description: '摩天大楼中的奢华酒店', image: '/images/real/sh-h2.jpg', priceRange: '¥800-3000', area: '浦东新区' },
        { id: 'sh-a3', name: '法租界民宿', description: '梧桐树下的老洋房体验', image: '/images/real/sh-h3.jpg', priceRange: '¥500-1500', area: '徐汇区' },
      ],
    },
  },
  {
    id: 'chengdu',
    name: '成都',
    lat: 30.5728,
    lon: 104.0668,
    description: '天府之国，慢生活与美食的天堂',
    image: '/images/real/cd-00.jpg',
    tags: ['美食天堂', '熊猫故乡', '悠闲生活'],
    heroImage: '/images/real/cd-01.jpg',
    weather: { temp: '25°C', condition: '阴转小雨', icon: 'rain', tips: '多阴雨，建议带伞和防滑鞋' },
    pool: {
      attractions: [
        { id: 'cd-1', name: '大熊猫繁育研究基地', description: '近距离观看国宝大熊猫', image: '/images/real/cd-a1.jpg', duration: '半天', durationMinutes: 240, location: '成华区外北熊猫大道1375号', address: '成都市成华区外北熊猫大道1375号', tags: ['必去', '熊猫', '亲子'], needsReservation: true, area: 'north', areaLabel: '北部', lat: 30.6519, lng: 104.1367, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 95 },
        { id: 'cd-2', name: '宽窄巷子', description: '成都古街代表，体验慢生活', image: '/images/real/cd-a2.jpg', duration: '2小时', durationMinutes: 120, location: '青羊区宽窄巷子', address: '成都市青羊区宽窄巷子', tags: ['古街', '文艺', '小吃'], needsReservation: false, area: 'center', areaLabel: '市中心', lat: 30.6605, lng: 104.0463, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 80 },
        { id: 'cd-3', name: '锦里古街', description: '西蜀第一街，三国文化一条街', image: '/images/real/cd-a3.jpg', duration: '1-2小时', durationMinutes: 90, location: '武侯区武侯祠大街231号', address: '成都市武侯区武侯祠大街231号', tags: ['古街', '夜景', '小吃'], needsReservation: false, area: 'south', areaLabel: '南部', lat: 30.6441, lng: 104.0360, preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 70 },
        { id: 'cd-4', name: '武侯祠', description: '纪念诸葛亮的祠堂，三国圣地', image: '/images/real/cd-a4.jpg', duration: '1.5小时', durationMinutes: 90, location: '武侯区武侯祠大街231号', address: '成都市武侯区武侯祠大街231号', tags: ['历史', '三国', '文化'], needsReservation: false, area: 'south', areaLabel: '南部', lat: 30.6441, lng: 104.0360, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 75 },
        { id: 'cd-5', name: '杜甫草堂', description: '诗圣杜甫故居，园林清幽', image: '/images/real/cd-a5.jpg', duration: '1.5小时', durationMinutes: 90, location: '青羊区青华路37号', address: '成都市青羊区青华路37号', tags: ['文化', '园林', '历史'], needsReservation: false, area: 'west', areaLabel: '西部', lat: 30.6660, lng: 104.0197, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: true, crowdRisk: 'low', priority: 60 },
        { id: 'cd-6', name: '春熙路', description: '成都最繁华的商业街', image: '/images/real/cd-a6.jpg', duration: '1-2小时', durationMinutes: 90, location: '锦江区春熙路', address: '成都市锦江区春熙路', tags: ['购物', '繁华', '打卡'], needsReservation: false, area: 'center', areaLabel: '市中心', lat: 30.6575, lng: 104.0666, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 55 },
        { id: 'cd-7', name: '青城山', description: '道教名山，避暑胜地', image: '/images/real/cd-a7.jpg', duration: '大半天', durationMinutes: 360, location: '都江堰市青城山镇', address: '成都市都江堰市青城山镇', tags: ['山水', '道教', '徒步'], needsReservation: false, area: 'suburb', areaLabel: '远郊区', lat: 30.9455, lng: 103.5858, preferredTime: 'morning', isRemote: true, isFullDay: false, weatherSensitive: true, crowdRisk: 'medium', priority: 90 },
        { id: 'cd-8', name: '都江堰', description: '千年水利工程，世界遗产', image: '/images/real/cd-a8.jpg', duration: '3-4小时', durationMinutes: 210, location: '都江堰市公园路', address: '成都市都江堰市公园路', tags: ['历史', '工程奇迹', '世界遗产'], needsReservation: false, area: 'suburb', areaLabel: '远郊区', lat: 30.9897, lng: 103.6248, preferredTime: 'morning', isRemote: true, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 85 },
      ],
      food: [
        { id: 'cd-f1', name: '火锅', description: '麻辣鲜香，成都灵魂美食', image: '', price: '¥80-150', cuisine: '火锅', location: '全城火锅店', address: '成都市锦江区春熙路', tags: ['必吃', '招牌'], lat: 30.6575, lng: 104.0666, durationMinutes: 90, area: 'center', areaLabel: '市中心', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 95, mealSubtype: 'restaurantMeal' },
        { id: 'cd-f2', name: '串串香', description: '数签签的乐趣，麻辣过瘾', image: '', price: '¥50-80', cuisine: '串串', location: '钢管厂五区', address: '成都市锦江区钢管厂五区', tags: ['地道', '夜宵'], lat: 30.6385, lng: 104.0439, durationMinutes: 60, area: 'center', areaLabel: '市中心', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 65, mealSubtype: 'restaurantMeal' },
        { id: 'cd-f3', name: '担担面', description: '麻辣鲜香的经典面食', image: '', price: '¥15-25', cuisine: '面食', location: '陈麻婆豆腐', address: '成都市武侯区武侯祠大街', tags: ['早餐', '经典'], lat: 30.6441, lng: 104.0360, durationMinutes: 30, area: 'south', areaLabel: '南部', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'low', priority: 40, mealSubtype: 'quickMeal' },
        { id: 'cd-f4', name: '麻婆豆腐', description: '麻婆豆腐创始店，百年老字号', image: '', price: '¥40-70', cuisine: '川菜', location: '陈麻婆豆腐', address: '成都市武侯区武侯祠大街', tags: ['经典', '下饭'], lat: 30.6441, lng: 104.0360, durationMinutes: 60, area: 'south', areaLabel: '南部', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 60, mealSubtype: 'restaurantMeal' },
        { id: 'cd-f5', name: '龙抄手', description: '成都特色馄饨，皮薄馅大', image: '', price: '¥20-40', cuisine: '小吃', location: '龙抄手食府', address: '成都市青羊区宽窄巷子', tags: ['早餐', '小吃'], lat: 30.6605, lng: 104.0463, durationMinutes: 30, area: 'center', areaLabel: '市中心', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'low', priority: 45, mealSubtype: 'quickMeal' },
        { id: 'cd-f6', name: '兔头', description: '成都人的夜宵最爱，麻辣五香', image: '', price: '¥30-60', cuisine: '小吃', location: '双流老妈兔头', address: '成都市锦江区钢管厂五区', tags: ['特色', '夜宵'], lat: 30.6385, lng: 104.0439, durationMinutes: 30, area: 'center', areaLabel: '市中心', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 50, mealSubtype: 'snackBreak' },
      ],
      shopping: [
        { id: 'cd-s1', name: '春熙路/IFS', description: '成都核心商圈，爬墙熊猫打卡', image: '/images/real/cd-s1.jpg', type: '核心商圈', location: '锦江区春熙路', address: '成都市锦江区春熙路', tags: ['购物', '打卡'], lat: 30.6575, lng: 104.0666, durationMinutes: 120, area: 'center', areaLabel: '市中心', preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 55 },
        { id: 'cd-s2', name: '太古里', description: '开放式购物街区，时尚文艺', image: '/images/real/cd-s2.jpg', type: '时尚街区', location: '锦江区中纱帽街8号', address: '成都市锦江区中纱帽街8号', tags: ['潮流', '文艺'], lat: 30.6575, lng: 104.0660, durationMinutes: 120, area: 'center', areaLabel: '市中心', preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 50 },
      ],
      accommodation: [
        { id: 'cd-a1', name: '春熙路/太古里', description: '市中心，购物美食便利', image: '/images/real/cd-h1.jpg', priceRange: '¥400-1200', area: '锦江区' },
        { id: 'cd-a2', name: '宽窄巷子周边', description: '老成都风情，闹中取静', image: '/images/real/cd-h2.jpg', priceRange: '¥300-1000', area: '青羊区' },
      ],
    },
  },
  {
    id: 'chongqing',
    name: '重庆',
    lat: 29.4316,
    lon: 106.9123,
    description: '8D魔幻山城，火锅与夜景的城市',
    image: '/images/real/cq-00.jpg',
    tags: ['8D魔幻', '火锅之城', '夜景绝美'],
    heroImage: '/images/real/cq-01.jpg',
    weather: { temp: '28°C', condition: '多云', icon: 'cloud', tips: '湿热多雾，建议透气衣物和舒适鞋子' },
    pool: {
      attractions: [
        { id: 'cq-1', name: '洪崖洞', description: '千与千寻现实版，夜景必看', image: '/images/real/cq-a1.jpg', duration: '1-2小时', durationMinutes: 90, location: '渝中区沧白路69号', address: '重庆市渝中区沧白路69号', tags: ['必去', '夜景', '网红'], needsReservation: false, area: 'yuzhong', areaLabel: '渝中', lat: 29.4329, lng: 106.5861, preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 95 },
        { id: 'cq-2', name: '解放碑', description: '重庆地标，繁华商圈中心', image: '/images/real/cq-a2.jpg', duration: '1小时', durationMinutes: 60, location: '渝中区解放碑', address: '重庆市渝中区解放碑', tags: ['地标', '购物', '打卡'], needsReservation: false, area: 'yuzhong', areaLabel: '渝中', lat: 29.4338, lng: 106.5867, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 85 },
        { id: 'cq-3', name: '李子坝轻轨', description: '穿楼而过的轻轨，魔幻体验', image: '/images/real/cq-a3.jpg', duration: '30分钟', durationMinutes: 30, location: '渝中区李子坝站', address: '重庆市渝中区李子坝站', tags: ['网红', '拍照', '魔幻'], needsReservation: false, area: 'yuzhong', areaLabel: '渝中', lat: 29.4407, lng: 106.5590, preferredTime: 'anytime', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 70 },
        { id: 'cq-4', name: '磁器口古镇', description: '老重庆缩影，千年古镇', image: '/images/real/cq-a4.jpg', duration: '2小时', durationMinutes: 120, location: '沙坪坝区磁器口', address: '重庆市沙坪坝区磁器口', tags: ['古镇', '小吃', '历史'], needsReservation: false, area: 'shapingba', areaLabel: '沙坪坝', lat: 29.4955, lng: 106.4448, preferredTime: 'morning', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 80 },
        { id: 'cq-5', name: '长江索道', description: '空中公交，俯瞰两江景色', image: '/images/real/cq-a5.jpg', duration: '30分钟', durationMinutes: 30, location: '渝中区新华路153号', address: '重庆市渝中区新华路153号', tags: ['体验', '江景', '网红'], needsReservation: true, area: 'yuzhong', areaLabel: '渝中', lat: 29.4314, lng: 106.5901, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: true, crowdRisk: 'medium', priority: 75 },
        { id: 'cq-6', name: '武隆天坑', description: '世界自然遗产，变形金刚取景地', image: '/images/real/cq-a6.jpg', duration: '一整天', durationMinutes: 480, location: '武隆区仙女山镇', address: '重庆市武隆区仙女山镇', tags: ['自然奇观', '世界遗产', '徒步'], needsReservation: false, area: 'suburb', areaLabel: '远郊区', lat: 29.2987, lng: 107.9129, preferredTime: 'morning', isRemote: true, isFullDay: true, weatherSensitive: true, crowdRisk: 'medium', priority: 90 },
        { id: 'cq-7', name: '南山一棵树', description: '重庆夜景最佳观赏点', image: '/images/real/cq-a7.jpg', duration: '1小时', durationMinutes: 60, location: '南岸区南山风景区', address: '重庆市南岸区南山风景区', tags: ['夜景', '观景', '必去'], needsReservation: false, area: 'nanan', areaLabel: '南岸', lat: 29.4131, lng: 106.6246, preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 85 },
        { id: 'cq-8', name: '十八梯', description: '老重庆记忆，上下半城连接', image: '/images/real/cq-a8.jpg', duration: '1-2小时', durationMinutes: 90, location: '渝中区中兴路1号', address: '重庆市渝中区中兴路1号', tags: ['老街', '文艺', '拍照'], needsReservation: false, area: 'yuzhong', areaLabel: '渝中', lat: 29.4246, lng: 106.5858, preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 65 },
      ],
      food: [
        { id: 'cq-f1', name: '重庆火锅', description: '麻辣鲜香，牛油锅底是灵魂', image: '', price: '¥70-130', cuisine: '火锅', location: '珮姐、周师兄、大龙燚', address: '重庆市渝中区解放碑', tags: ['必吃', '招牌'], lat: 29.4338, lng: 106.5867, durationMinutes: 90, area: 'yuzhong', areaLabel: '渝中', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 95, mealSubtype: 'restaurantMeal' },
        { id: 'cq-f2', name: '小面', description: '重庆人的早餐灵魂', image: '', price: '¥10-20', cuisine: '面食', location: '花市豌杂面', address: '重庆市渝中区十八梯', tags: ['早餐', '地道'], lat: 29.4246, lng: 106.5858, durationMinutes: 30, area: 'yuzhong', areaLabel: '渝中', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'low', priority: 60, mealSubtype: 'quickMeal' },
        { id: 'cq-f3', name: '酸辣粉', description: '酸辣开胃，红薯粉劲道', image: '', price: '¥15-25', cuisine: '小吃', location: '好又来酸辣粉', address: '重庆市渝中区洪崖洞', tags: ['小吃', '开胃'], lat: 29.4329, lng: 106.5861, durationMinutes: 15, area: 'yuzhong', areaLabel: '渝中', preferredTime: 'anytime', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 50, mealSubtype: 'snackBreak' },
        { id: 'cq-f4', name: '毛血旺', description: '麻辣鲜香，料足味重', image: '', price: '¥50-80', cuisine: '江湖菜', location: '杨记隆府', address: '重庆市渝中区解放碑', tags: ['江湖菜', '下饭'], lat: 29.4921, lng: 106.5780, durationMinutes: 60, area: 'yuzhong', areaLabel: '渝中', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 70, mealSubtype: 'restaurantMeal' },
        { id: 'cq-f5', name: '钵钵鸡', description: '冷锅串串，藤椒麻辣', image: '', price: '¥30-50', cuisine: '小吃', location: '钵钵鸡店', address: '重庆市沙坪坝区磁器口', tags: ['小吃', '凉食'], lat: 29.4955, lng: 106.4448, durationMinutes: 45, area: 'shapingba', areaLabel: '沙坪坝', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 55, mealSubtype: 'quickMeal' },
        { id: 'cq-f6', name: '烤鱼', description: '万州烤鱼，麻辣鲜香', image: '', price: '¥80-120', cuisine: '江湖菜', location: '万州烤鱼', address: '重庆市南岸区南山', tags: ['夜宵', '聚餐'], lat: 29.4131, lng: 106.6246, durationMinutes: 90, area: 'nanan', areaLabel: '南岸', preferredTime: 'meal', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 65, mealSubtype: 'restaurantMeal' },
      ],
      shopping: [
        { id: 'cq-s1', name: '解放碑商圈', description: '重庆最核心商圈', image: '/images/real/cq-s1.jpg', type: '核心商圈', location: '渝中区解放碑', address: '重庆市渝中区解放碑', tags: ['购物', '繁华'], lat: 29.4338, lng: 106.5867, durationMinutes: 120, area: 'yuzhong', areaLabel: '渝中', preferredTime: 'afternoon', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'high', priority: 55 },
        { id: 'cq-s2', name: '观音桥', description: '北区商业中心', image: '/images/real/cq-s2.jpg', type: '商圈', location: '江北区观音桥', address: '重庆市江北区观音桥', tags: ['购物', '美食'], lat: 29.4627, lng: 106.5471, durationMinutes: 120, area: 'jiangbei', areaLabel: '江北', preferredTime: 'evening', isRemote: false, isFullDay: false, weatherSensitive: false, crowdRisk: 'medium', priority: 50 },
      ],
      accommodation: [
        { id: 'cq-a1', name: '解放碑/洪崖洞', description: '核心景区，夜景便利', image: '/images/real/cq-h1.jpg', priceRange: '¥400-1500', area: '渝中区' },
        { id: 'cq-a2', name: '江北嘴', description: '江景酒店，高端体验', image: '/images/real/cq-h2.jpg', priceRange: '¥500-2000', area: '江北区' },
      ],
    },
  },
]

export function getDestinationById(id) {
  return destinations.find((d) => d.id === id) || destinations[0]
}

export function getAllDestinations() {
  return destinations
}

export function flattenPool(destination) {
  if (!destination || !destination.pool) return []
  const items = []
  const types = {
    attractions: { type: 'attraction', label: '景点', icon: 'Landmark' },
    food: { type: 'food', label: '美食', icon: 'UtensilsCrossed' },
    shopping: { type: 'shopping', label: '购物', icon: 'ShoppingBag' },
    accommodation: { type: 'accommodation', label: '住宿', icon: 'Hotel' },
  }
  Object.keys(destination.pool).forEach((key) => {
    const typeInfo = types[key] || { type: key, label: key, icon: 'MapPin' }
    destination.pool[key].forEach((item) => {
      items.push({
        ...item,
        poolType: key,
        type: typeInfo.type,
        typeLabel: typeInfo.label,
        typeIcon: typeInfo.icon,
      })
    })
  })
  return items
}

export default destinations

import { useState } from 'react'
import { Hotel, MapPin, Star, Check, ChevronRight } from 'lucide-react'

const hotelOptions = {
  北京: [
    { id: 'bj-hotel-1', name: '天安门附近', area: '市中心', description: '靠近故宫、人民广场，交通便利', rating: 4.8, price: '¥600-800/晚', tags: ['交通便利', '景点集中'], lat: 39.9042, lng: 116.3974 },
    { id: 'bj-hotel-2', name: '王府井商圈', area: '王府井', description: '购物天堂，美食云集', rating: 4.6, price: '¥800-1200/晚', tags: ['购物方便', '美食丰富'], lat: 39.9097, lng: 116.4106 },
    { id: 'bj-hotel-3', name: '三里屯区域', area: '朝阳区', description: '年轻人聚集地，夜生活丰富', rating: 4.7, price: '¥700-1000/晚', tags: ['时尚潮流', '夜生活'], lat: 39.9371, lng: 116.4655 },
    { id: 'bj-hotel-4', name: '后海/什刹海', area: '西城区', description: '传统四合院风格，夜景优美', rating: 4.5, price: '¥500-700/晚', tags: ['传统风情', '夜景'], lat: 39.9368, lng: 116.3833 },
    { id: 'bj-hotel-5', name: '国贸CBD', area: '朝阳区', description: '商务中心，高楼林立', rating: 4.9, price: '¥1000-1500/晚', tags: ['商务出行', '高端酒店'], lat: 39.9087, lng: 116.4709 },
    { id: 'bj-hotel-6', name: '五道口', area: '海淀区', description: '高校云集，学术氛围浓厚', rating: 4.4, price: '¥400-600/晚', tags: ['性价比高', '学生友好'], lat: 39.9975, lng: 116.3065 },
  ],
  上海: [
    { id: 'sh-hotel-1', name: '外滩附近', area: '黄浦区', description: '无敌江景，夜景绝佳', rating: 4.9, price: '¥1200-2000/晚', tags: ['江景房', '夜景'], lat: 31.2397, lng: 121.4905 },
    { id: 'sh-hotel-2', name: '南京路商圈', area: '黄浦区', description: '购物方便，交通枢纽', rating: 4.7, price: '¥800-1200/晚', tags: ['购物方便', '交通便利'], lat: 31.2355, lng: 121.4753 },
    { id: 'sh-hotel-3', name: '陆家嘴', area: '浦东新区', description: '金融中心，现代化都市', rating: 4.8, price: '¥1000-1500/晚', tags: ['商务出行', '地标建筑'], lat: 31.2357, lng: 121.5014 },
    { id: 'sh-hotel-4', name: '徐家汇', area: '徐汇区', description: '商业繁华，美食众多', rating: 4.6, price: '¥600-900/晚', tags: ['美食丰富', '交通便利'], lat: 31.2197, lng: 121.4392 },
    { id: 'sh-hotel-5', name: '静安寺', area: '静安区', description: '高端商圈，时尚地标', rating: 4.7, price: '¥900-1300/晚', tags: ['高端购物', '时尚'], lat: 31.2295, lng: 121.4597 },
    { id: 'sh-hotel-6', name: '城隍庙', area: '黄浦区', description: '传统风情，小吃聚集', rating: 4.5, price: '¥500-700/晚', tags: ['传统风情', '美食'], lat: 31.2272, lng: 121.4925 },
  ],
  成都: [
    { id: 'cd-hotel-1', name: '春熙路商圈', area: '锦江区', description: '市中心，购物美食聚集', rating: 4.7, price: '¥500-800/晚', tags: ['购物方便', '美食丰富'], lat: 30.6575, lng: 104.0666 },
    { id: 'cd-hotel-2', name: '宽窄巷子附近', area: '青羊区', description: '传统风情，文化体验', rating: 4.8, price: '¥600-900/晚', tags: ['传统文化', '美食'], lat: 30.6605, lng: 104.0463 },
    { id: 'cd-hotel-3', name: '锦里附近', area: '武侯区', description: '武侯祠旁，夜景美丽', rating: 4.6, price: '¥500-700/晚', tags: ['夜景', '文化景点'], lat: 30.6441, lng: 104.0360 },
    { id: 'cd-hotel-4', name: '太古里', area: '锦江区', description: '潮流地标，网红打卡', rating: 4.7, price: '¥700-1000/晚', tags: ['时尚潮流', '拍照'], lat: 30.6575, lng: 104.0666 },
    { id: 'cd-hotel-5', name: '天府广场', area: '青羊区', description: '市中心，交通便利', rating: 4.5, price: '¥400-600/晚', tags: ['交通便利', '性价比'], lat: 30.5728, lng: 104.0668 },
    { id: 'cd-hotel-6', name: '玉林路', area: '武侯区', description: '小酒馆，文艺气息', rating: 4.4, price: '¥400-600/晚', tags: ['文艺', '夜生活'], lat: 30.6385, lng: 104.0439 },
  ],
  重庆: [
    { id: 'cq-hotel-1', name: '解放碑附近', area: '渝中区', description: '市中心，地标建筑', rating: 4.7, price: '¥500-800/晚', tags: ['交通便利', '地标'], lat: 29.4338, lng: 106.5867 },
    { id: 'cq-hotel-2', name: '洪崖洞夜景', area: '渝中区', description: '夜景绝佳，吊脚楼风情', rating: 4.9, price: '¥600-1000/晚', tags: ['夜景', '特色建筑'], lat: 29.4329, lng: 106.5861 },
    { id: 'cq-hotel-3', name: '江北嘴', area: '江北区', description: 'CBD，现代化都市', rating: 4.6, price: '¥700-1000/晚', tags: ['商务', '江景'], lat: 29.4639, lng: 106.5974 },
    { id: 'cq-hotel-4', name: '磁器口附近', area: '沙坪坝区', description: '古镇风情，美食聚集', rating: 4.5, price: '¥400-600/晚', tags: ['古镇', '美食'], lat: 29.4955, lng: 106.4448 },
    { id: 'cq-hotel-5', name: '南滨路', area: '南岸区', description: '江景房，夜景优美', rating: 4.7, price: '¥600-900/晚', tags: ['江景', '夜景'], lat: 29.4131, lng: 106.6246 },
    { id: 'cq-hotel-6', name: '观音桥', area: '江北区', description: '商圈繁华，美食众多', rating: 4.6, price: '¥500-700/晚', tags: ['购物', '美食'], lat: 29.4921, lng: 106.5780 },
  ],
}

export function getHotelById(destination, hotelId) {
  const hotels = hotelOptions[destination?.name] || []
  return hotels.find(h => h.id === hotelId)
}

export default function AccommodationSelector({ destination, selectedHotel, onSelect }) {
  const [showDetails, setShowDetails] = useState(false)
  const hotels = hotelOptions[destination?.name] || []
  const selected = hotels.find(h => h.id === selectedHotel)

  if (!destination) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-10 h-10 rounded-xl bg-trip-amber-pale flex items-center justify-center">
          <Hotel className="w-5 h-5 text-trip-amber" />
        </div>
        <div>
          <h3 className="font-semibold text-trip-ink">选择住宿区域</h3>
          <p className="text-xs text-trip-muted">选择住宿位置，我们将为你规划最佳出行路线</p>
        </div>
      </div>

      {selected && (
        <div className="bg-trip-amber-pale border border-trip-amber/20 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-trip-amber/20 flex items-center justify-center">
              <Hotel className="w-6 h-6 text-trip-amber" />
            </div>
            <div>
              <div className="font-semibold text-trip-ink">{selected.name}</div>
              <div className="flex items-center gap-2 text-sm text-trip-slate">
                <MapPin className="w-3.5 h-3.5" />
                {selected.area}
                <span className="text-trip-amber font-medium">{selected.price}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm font-semibold text-trip-mint hover:text-trip-mint-light flex items-center gap-1 transition-colors duration-150"
          >
            {showDetails ? '收起' : '更换'}
            <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </button>
        </div>
      )}

      {showDetails || !selected ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotels.map((hotel) => (
            <button
              key={hotel.id}
              onClick={() => onSelect(hotel.id)}
              className={`group p-5 rounded-xl border text-left transition-all duration-150 ${
                selectedHotel === hotel.id
                  ? 'bg-trip-amber-pale border-trip-amber/20 text-trip-amber ring-2 ring-trip-amber/20'
                  : 'bg-trip-surface border-trip-border/50 hover:border-trip-amber/30 hover:shadow-card'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-trip-ink text-lg">{hotel.name}</h3>
                    {selectedHotel === hotel.id && (
                      <div className="w-5 h-5 rounded-full bg-trip-amber flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-trip-slate mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {hotel.area}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-trip-amber/10 px-2 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-trip-amber fill-trip-amber" />
                  <span className="text-xs font-bold text-trip-amber">{hotel.rating}</span>
                </div>
              </div>
              <p className="text-sm text-trip-slate mb-3">{hotel.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {hotel.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-trip-amber">{hotel.price}</span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

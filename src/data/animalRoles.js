export const animalRoles = {
  cat: {
    id: 'cat',
    name: '规划小猫',
    image: '/images/cat-wave-a.png',
    accent: '#6f8062',
    pale: '#eef1e8',
  },
  catPlanning: {
    id: 'catPlanning',
    name: '规划小猫',
    image: '/images/cat-planning.png',
    accent: '#6f8062',
    pale: '#eef1e8',
  },
  catGuide: {
    id: 'catGuide',
    name: '攻略小猫',
    image: '/images/cat-guide.png',
    accent: '#8a7653',
    pale: '#f5efe2',
  },
  catItinerary: {
    id: 'catItinerary',
    name: '行程小猫',
    image: '/images/cat-itinerary.png',
    accent: '#c77947',
    pale: '#faeee2',
  },
  catMap: {
    id: 'catMap',
    name: '地图小猫',
    image: '/images/cat-map.png',
    accent: '#5f8f79',
    pale: '#eaf4ef',
  },
  frog: {
    id: 'frog',
    name: '天气青蛙',
    image: '/images/animals/frog-weather.png',
    accent: '#789667',
    pale: '#edf3e8',
  },
  squirrel: {
    id: 'squirrel',
    name: '打包松鼠',
    image: '/images/animals/squirrel-packing.png',
    accent: '#c78343',
    pale: '#faeddd',
  },
  fox: {
    id: 'fox',
    name: '账本狐狸',
    image: '/images/animals/fox-expense.png',
    accent: '#d46f45',
    pale: '#fbe9df',
  },
  rabbit: {
    id: 'rabbit',
    name: '提醒兔子',
    image: '/images/animals/rabbit-reminder.png',
    accent: '#cf8578',
    pale: '#f9eae7',
  },
  magpie: {
    id: 'magpie',
    name: '收藏喜鹊',
    image: '/images/animals/magpie-favorites.png',
    accent: '#667f8f',
    pale: '#e9eff2',
  },
}

export const pageAnimalRole = {
  home: 'cat',
  'ai-plan': 'catPlanning',
  guide: 'catGuide',
  itinerary: 'catItinerary',
  map: 'catMap',
  placeSearch: 'catItinerary',
  weather: 'frog',
  packing: 'squirrel',
  expense: 'fox',
  reminder: 'rabbit',
  favorites: 'magpie',
}

export function getAnimalRole(roleOrPage = 'cat') {
  const roleId = animalRoles[roleOrPage] ? roleOrPage : pageAnimalRole[roleOrPage]
  return animalRoles[roleId] || animalRoles.cat
}

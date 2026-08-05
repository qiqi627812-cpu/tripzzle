import { describe, it } from 'node:test'
import assert from 'node:assert'
import { generateItinerary } from '../itineraryService.js'

function stableRouteProvider(from, to) {
  return {
    type: 'subway',
    label: '地铁',
    duration: 15,
    description: '地铁前往，约15分钟',
    route: null,
    from: from?.name || '酒店',
    to: to?.name || '目的地',
  }
}

describe('AI 主规划器', async () => {
  const selectedItems = [
    { id: 'bj-1', name: '故宫博物院', type: 'attraction' },
    { id: 'bj-4', name: '天坛公园', type: 'attraction' },
    { id: 'bj-7', name: '什刹海', type: 'attraction' },
    { id: 'bj-14', name: '雍和宫', type: 'attraction' },
    { id: 'bj-f1', name: '北京烤鸭', type: 'food' },
    { id: 'bj-f3', name: '铜锅涮肉', type: 'food' },
  ]
  const preferences = { pace: 'moderate', startTime: '09:00', transport: 'subway' }
  const aiPlan = {
    model: 'test-model',
    planningNotes: ['按照用户要求，把什刹海安排在第二天'],
    days: [
      {
        day: 1,
        theme: '皇城历史线',
        reason: '故宫与天坛组成历史主题',
        orderedPlaceIds: ['bj-1', 'bj-4'],
        lunchItemId: 'bj-f1',
        dinnerItemId: null,
      },
      {
        day: 2,
        theme: '胡同慢游线',
        reason: '雍和宫与什刹海适合慢节奏游览',
        orderedPlaceIds: ['bj-14', 'bj-7'],
        lunchItemId: null,
        dinnerItemId: 'bj-f3',
      },
    ],
  }

  const result = await generateItinerary(
    'beijing',
    selectedItems,
    preferences,
    2,
    null,
    [],
    { aiPlan, routeProvider: stableRouteProvider }
  )

  await it('使用模型决定的逐日分组和主题', () => {
    assert.deepStrictEqual(result.days.map((day) => day.theme), ['皇城历史线', '胡同慢游线'])
    assert.ok(result.days[0].items.some((item) => item.id === 'bj-1'))
    assert.ok(result.days[0].items.some((item) => item.id === 'bj-4'))
    assert.ok(result.days[1].items.some((item) => item.id === 'bj-14'))
    assert.ok(result.days[1].items.some((item) => item.id === 'bj-7'))
  })

  await it('使用模型安排的餐厅，并保留确定性校验', () => {
    const day1Duck = result.days[0].items.find((item) => item.id === 'bj-f1')
    const day2Hotpot = result.days[1].items.find((item) => item.id === 'bj-f3')
    assert.strictEqual(day1Duck?.mealType, 'lunch')
    assert.strictEqual(day2Hotpot?.mealType, 'dinner')
    assert.strictEqual(result.validation.passed, true)
  })

  await it('记录 AI 确实参与了最终规划', () => {
    assert.strictEqual(result.ai.applied, true)
    assert.strictEqual(result.ai.model, 'test-model')
    assert.deepStrictEqual(result.ai.planningNotes, aiPlan.planningNotes)
  })
})

describe('动态目的地', async () => {
  const destination = {
    id: 'amap-610100',
    name: '西安市',
    lat: 34.3416,
    lon: 108.9398,
    source: 'amap',
    pool: { attractions: [], food: [], shopping: [], accommodation: [] },
  }
  const selectedItems = [
    {
      id: 'amap-xa-1',
      name: '西安城墙',
      type: 'attraction',
      area: '碑林区',
      areaLabel: '碑林区',
      lat: 34.2594,
      lng: 108.947,
      duration: '2小时',
    },
    {
      id: 'amap-xa-2',
      name: '大雁塔',
      type: 'attraction',
      area: '雁塔区',
      areaLabel: '雁塔区',
      lat: 34.2186,
      lng: 108.9642,
      duration: '2小时',
    },
  ]

  const result = await generateItinerary(
    destination.id,
    selectedItems,
    { pace: 'moderate', startTime: '09:00', transport: 'subway' },
    2,
    null,
    [],
    { destination, routeProvider: stableRouteProvider },
  )

  await it('不会把高德动态城市回退成北京', () => {
    assert.strictEqual(result.days.length, 2)
    assert.ok(result.days.some((day) => day.theme?.includes('西安市')))
    assert.ok(result.days.flatMap((day) => day.items).some((item) => item.name === '西安城墙'))
  })
})

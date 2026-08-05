import { describe, it } from 'node:test'
import assert from 'node:assert'
import { generateItinerary } from './src/services/itineraryService.js'

describe('验收案例 1：北京 3 天', () => {
  const selectedItems = [
    { id: 'bj-2', name: '长城（八达岭）', type: 'attraction' },
    { id: 'bj-s2', name: '三里屯太古里', type: 'shopping' },
    { id: 'bj-s3', name: '潘家园旧货市场', type: 'shopping' },
    { id: 'bj-19', name: '国贸CBD', type: 'attraction' },
    { id: 'bj-f1', name: '北京烤鸭', type: 'food' },
    { id: 'bj-f3', name: '铜锅涮肉', type: 'food' },
  ]

  it('必须生成3天行程', async () => {
    const result = await generateItinerary(
      'beijing',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    assert.ok(result.days)
    assert.strictEqual(result.days.length, 3)
  })

  it('长城必须被安排，不能丢失', async () => {
    const result = await generateItinerary(
      'beijing',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    const greatWall = result.days.flatMap(d => d.items).find(i => i.name.includes('长城'))
    assert.ok(greatWall)
    assert.ok(result.removed)
    assert.ok(!result.removed.some(r => r.id === 'bj-2'))
  })

  it('长城所在日必须是 remote/fullDay 风格的一天', async () => {
    const result = await generateItinerary(
      'beijing',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    const greatWallDay = result.days.find(d => d.items.some(i => i.name.includes('长城')))
    assert.ok(greatWallDay)
    assert.ok(greatWallDay.isRemoteDay || greatWallDay.isFullDay)
  })

  it('长城所在日必须包含午餐/简餐/自带食物/补给之一', async () => {
    const result = await generateItinerary(
      'beijing',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    const greatWallDay = result.days.find(d => d.items.some(i => i.name.includes('长城')))
    assert.ok(greatWallDay)
    const lunchItems = greatWallDay.items.filter(i => i.mealType === 'lunch')
    assert.ok(lunchItems.length > 0)
    const validSubtypes = ['restaurantMeal', 'quickMeal', 'packedMeal', 'snackBreak']
    lunchItems.forEach(item => {
      assert.ok(validSubtypes.includes(item.mealSubtype))
    })
  })

  it('餐厅不能作为 attraction/shopping 普通地点出现', async () => {
    const result = await generateItinerary(
      'beijing',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    const restaurantItems = result.days.flatMap(d => d.items).filter(i => 
      i.name.includes('北京烤鸭') || i.name.includes('铜锅涮肉')
    )
    assert.ok(restaurantItems.length > 0)
    restaurantItems.forEach(item => {
      assert.strictEqual(item.type, 'food')
      assert.notStrictEqual(item.type, 'attraction')
      assert.notStrictEqual(item.type, 'shopping')
    })
  })

  it('餐厅只能出现在 lunch/dinner/snack/meal slot', async () => {
    const result = await generateItinerary(
      'beijing',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    const restaurantItems = result.days.flatMap(d => d.items).filter(i => 
      i.name.includes('北京烤鸭') || i.name.includes('铜锅涮肉')
    )
    assert.ok(restaurantItems.length > 0)
    restaurantItems.forEach(item => {
      assert.ok(item.isMeal)
      assert.ok(['breakfast', 'lunch', 'dinner', 'snack'].includes(item.mealType))
    })
  })

  it('潘家园 preferredTime 必须是 morning', async () => {
    const result = await generateItinerary(
      'beijing',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    const panjiayuan = result.days.flatMap(d => d.items).find(i => i.name.includes('潘家园'))
    assert.ok(panjiayuan)
    assert.strictEqual(panjiayuan.preferredTime, 'morning')
  })

  it('三里屯 preferredTime 必须是 evening', async () => {
    const result = await generateItinerary(
      'beijing',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    const sanlitun = result.days.flatMap(d => d.items).find(i => i.name.includes('三里屯'))
    assert.ok(sanlitun)
    assert.strictEqual(sanlitun.preferredTime, 'evening')
  })

  it('国贸 CBD preferredTime 必须是 afternoon 或 evening', async () => {
    const result = await generateItinerary(
      'beijing',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    const guomao = result.days.flatMap(d => d.items).find(i => i.name.includes('国贸'))
    assert.ok(guomao)
    assert.ok(['afternoon', 'evening'].includes(guomao.preferredTime))
  })

  it('每天必须有 title 或 theme', async () => {
    const result = await generateItinerary(
      'beijing',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    result.days.forEach(day => {
      assert.ok(day.title || day.theme)
    })
  })

  it('validation 必须通过', async () => {
    const result = await generateItinerary(
      'beijing',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    assert.ok(result.validation)
    assert.strictEqual(result.validation.passed, true, `Validation errors: ${JSON.stringify(result.validation.errors)}`)
  })
})

describe('验收案例 2：上海 2-3 天', () => {
  const selectedItems = [
    { id: 'sh-1', name: '外滩', type: 'attraction' },
    { id: 'sh-2', name: '东方明珠', type: 'attraction' },
    { id: 'sh-3', name: '豫园', type: 'attraction' },
    { id: 'sh-5', name: '上海迪士尼', type: 'attraction' },
  ]

  it('上海迪士尼必须被安排，不能丢失', async () => {
    const result = await generateItinerary(
      'shanghai',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    const disney = result.days.flatMap(d => d.items).find(i => i.name.includes('迪士尼'))
    assert.ok(disney)
    assert.ok(!result.removed.some(r => r.id === 'sh-5'))
  })

  it('上海迪士尼必须独立一天或至少作为 fullDay anchor', async () => {
    const result = await generateItinerary(
      'shanghai',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    const disneyDay = result.days.find(d => d.items.some(i => i.name.includes('迪士尼')))
    assert.ok(disneyDay)
    assert.ok(disneyDay.isRemoteDay || disneyDay.isFullDay)
  })

  it('迪士尼日不能再塞外滩/豫园/东方明珠这类市区景点', async () => {
    const result = await generateItinerary(
      'shanghai',
      selectedItems,
      { pace: 'moderate', startTime: '09:00', transport: 'subway' },
      '3天',
      null,
      []
    )
    const disneyDay = result.days.find(d => d.items.some(i => i.name.includes('迪士尼')))
    assert.ok(disneyDay)
    const cityAttractions = disneyDay.items.filter(i => 
      i.type === 'attraction' && 
      !i.name.includes('迪士尼') &&
      !i.isRemote
    )
    assert.strictEqual(cityAttractions.length
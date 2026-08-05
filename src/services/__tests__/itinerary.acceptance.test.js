import { describe, it } from 'node:test'
import assert from 'node:assert'
import { generateItinerary } from '../itineraryService.js'

// 稳定 routeProvider：返回确定性交通信息，避免高德 API 噪声
// 关键：远郊返回市区使用 45 分钟，市区内使用 15 分钟（测试友好）
function stableRouteProvider(from, to, transportPref, cityName) {
  if (!from || !to) {
    return { type: 'walk', label: '步行', duration: 5, description: '步行前往', route: null }
  }

  // 使用简单的距离估算（度数差乘以 111km）
  const dLat = Math.abs(to.lat - from.lat)
  const dLng = Math.abs(to.lng - from.lng)
  const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111

  const isRemote = distanceKm > 30
  const isShort = distanceKm < 1.5

  // 默认使用地铁
  let type = 'subway'
  let duration = 15
  let label = '地铁'

  if (isRemote) {
    // 远郊：打车，测试环境使用固定 45 分钟（方便安排晚上活动）
    type = 'taxi'
    label = '打车'
    duration = 45
  } else if (isShort) {
    type = 'walk'
    label = '步行'
    duration = Math.max(5, Math.round(distanceKm * 10))
  } else {
    // 市区地铁：固定 15 分钟（测试友好）
    duration = 15
  }

  if (transportPref === 'car' || transportPref === 'taxi') {
    type = 'taxi'
    label = '打车'
    duration = isRemote ? 45 : 20
  }

  return {
    type,
    label,
    duration,
    description: `${label}前往，约${duration}分钟`,
    route: null,
    from: from?.name,
    to: to?.name
  }
}

function parseTimeToMinutes(time) {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  if (!isNaN(h) && !isNaN(m)) return h * 60 + m
  return 0
}

function assertContains(items, predicate, message) {
  const found = items.some(predicate)
  assert.ok(found, message || `expected array to contain matching item`)
}

function assertNotContains(items, predicate, message) {
  const found = items.some(predicate)
  assert.ok(!found, message || `expected array not to contain matching item`)
}

function assertContainsId(items, id, message) {
  assertContains(items, i => i.id === id, message || `expected items to contain id ${id}`)
}

function assertRemovedDoesNotContain(removed, id, message) {
  const found = (removed || []).some(r => r.id === id || (typeof r === 'string' && r === id))
  assert.ok(!found, message || `expected removed not to contain ${id}`)
}

function assertValidationPassed(result) {
  assert.ok(result.validation, 'result should have validation')
  assert.strictEqual(result.validation.passed, true, `validation should pass, errors: ${JSON.stringify(result.validation.errors || [])}`)
  assert.deepStrictEqual(result.removed || [], [], `removed should be empty, got: ${JSON.stringify(result.removed)}`)
}

describe('验收案例 1：北京 3 天', async () => {
  const selectedItems = [
    { id: 'bj-2', name: '长城（八达岭）', type: 'attraction' },
    { id: 'bj-s2', name: '三里屯太古里', type: 'shopping' },
    { id: 'bj-s3', name: '潘家园旧货市场', type: 'shopping' },
    { id: 'bj-19', name: '国贸CBD', type: 'attraction' },
    { id: 'bj-f1', name: '北京烤鸭', type: 'food' },
    { id: 'bj-f3', name: '铜锅涮肉', type: 'food' },
  ]

  const basePrefs = { pace: 'moderate', startTime: '09:00', transport: 'subway' }
  const testOptions = { routeProvider: stableRouteProvider }

  await it('必须生成3天行程', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    assert.ok(result.days, 'days should exist')
    assert.strictEqual(result.days.length, 3, 'should have 3 days')
  })

  await it('长城必须被安排，不能丢失', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const allItems = result.days.flatMap(d => d.items)
    assertContains(allItems, i => i.name.includes('长城'), '长城 should be scheduled')
    assertRemovedDoesNotContain(result.removed, 'bj-2', '长城 should not be silently removed')
  })

  await it('长城所在日必须是 remote/fullDay 风格的一天', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const greatWallDay = result.days.find(d => d.items.some(i => i.name.includes('长城')))
    assert.ok(greatWallDay, 'great wall day should exist')
    assert.ok(greatWallDay.isRemoteDay || greatWallDay.isFullDay, 'great wall day should be remote/fullDay')
  })

  await it('长城所在日必须包含午餐/简餐/自带食物/补给之一', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const greatWallDay = result.days.find(d => d.items.some(i => i.name.includes('长城')))
    assert.ok(greatWallDay, 'great wall day should exist')
    const lunchItems = greatWallDay.items.filter(i => i.mealType === 'lunch')
    assert.ok(lunchItems.length > 0, 'great wall day should have lunch')
    const validSubtypes = ['restaurantMeal', 'quickMeal', 'packedMeal', 'snackBreak']
    lunchItems.forEach(item => {
      assert.ok(validSubtypes.includes(item.mealSubtype), `lunch subtype ${item.mealSubtype} should be valid`)
    })
  })

  await it('长城所在日不能在长城后继续塞多个市区景点', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const greatWallDay = result.days.find(d => d.items.some(i => i.name.includes('长城')))
    assert.ok(greatWallDay, 'great wall day should exist')
    const greatWallIdx = greatWallDay.items.findIndex(i => i.name.includes('长城'))
    const afterGreatWall = greatWallDay.items.slice(greatWallIdx + 1)
    const cityAttractionsAfter = afterGreatWall.filter(i => i.type === 'attraction' && !i.isRemote && !i.isFullDay)
    assert.ok(cityAttractionsAfter.length <= 1, `should not stuff multiple city attractions after great wall, got ${cityAttractionsAfter.length}`)
  })

  await it('餐厅不能作为 attraction/shopping 普通地点出现', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const allItems = result.days.flatMap(d => d.items)
    const restaurantItems = allItems.filter(i => i.name.includes('北京烤鸭') || i.name.includes('铜锅涮肉'))
    assert.ok(restaurantItems.length > 0, 'selected restaurants should appear')
    restaurantItems.forEach(item => {
      assert.strictEqual(item.type, 'food', `${item.name} should be food type`)
      assert.notStrictEqual(item.type, 'attraction')
      assert.notStrictEqual(item.type, 'shopping')
    })
  })

  await it('餐厅只能出现在 lunch/dinner/snack/meal slot', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const allItems = result.days.flatMap(d => d.items)
    const restaurantItems = allItems.filter(i => i.name.includes('北京烤鸭') || i.name.includes('铜锅涮肉'))
    restaurantItems.forEach(item => {
      assert.ok(item.isMeal, `${item.name} should be marked as meal`)
      assert.ok(['breakfast', 'lunch', 'dinner', 'snack'].includes(item.mealType), `${item.name} should be in a meal slot`)
    })
  })

  await it('餐厅不能连续作为"游玩地点"', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    result.days.forEach(day => {
      for (let i = 0; i < day.items.length - 1; i++) {
        const current = day.items[i]
        const next = day.items[i + 1]
        if (current.isMeal && next.isMeal && !current.isTransport && !next.isTransport) {
          const gap = Math.abs(parseTimeToMinutes(next.time) - parseTimeToMinutes(current.time))
          assert.ok(gap > 60, `consecutive meals ${current.name} and ${next.name} are too close`)
        }
      }
    })
  })

  await it('潘家园 preferredTime 必须是 morning', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const allItems = result.days.flatMap(d => d.items)
    const panjiayuan = allItems.find(i => i.id === 'bj-s3')
    assert.ok(panjiayuan, '潘家园 should be scheduled')
    assert.strictEqual(panjiayuan.preferredTime, 'morning', '潘家园 preferredTime should be morning')
    const timeMinutes = parseTimeToMinutes(panjiayuan.time)
    assert.ok(timeMinutes >= 8 * 60, '潘家园 should start no earlier than 08:00')
    assert.ok(timeMinutes < 12 * 60, '潘家园 should start before 12:00')
  })

  await it('三里屯 preferredTime 必须是 evening', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const allItems = result.days.flatMap(d => d.items)
    const sanlitun = allItems.find(i => i.id === 'bj-s2')
    assert.ok(sanlitun, '三里屯 should be scheduled')
    assert.strictEqual(sanlitun.preferredTime, 'evening', '三里屯 preferredTime should be evening')
    const timeMinutes = parseTimeToMinutes(sanlitun.time)
    assert.ok(timeMinutes >= 16 * 60, '三里屯 should start no earlier than 16:00')
    assert.ok(timeMinutes < 22 * 60, '三里屯 should start before 22:00')
  })

  await it('国贸 CBD preferredTime 必须是 afternoon 或 evening', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const allItems = result.days.flatMap(d => d.items)
    const guomao = allItems.find(i => i.id === 'bj-19')
    assert.ok(guomao, '国贸CBD should be scheduled')
    assert.ok(['afternoon', 'evening'].includes(guomao.preferredTime), '国贸CBD preferredTime should be afternoon or evening')
  })

  await it('每天必须有 title 或 theme', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    result.days.forEach((day, idx) => {
      const titleOrTheme = day.title || day.theme
      assert.ok(titleOrTheme, `day ${idx + 1} should have title or theme`)
      assert.notStrictEqual(titleOrTheme, '')
    })
  })

  await it('不允许出现没有 from/to 的 transport item', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const transportItems = result.days.flatMap(d => d.items).filter(i => i.isTransport)
    transportItems.forEach(item => {
      assert.ok(item.name, 'transport should have a name')
      assert.ok(/前往|返回/.test(item.name), 'transport name should indicate direction')
      assert.ok(item.from, `transport ${item.name} should have from`)
      assert.ok(item.to, `transport ${item.name} should have to`)
    })
  })

  await it('不允许出现只有交通没有目的地的 day', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    result.days.forEach((day, idx) => {
      const nonTransportItems = day.items.filter(i => !i.isTransport)
      assert.ok(nonTransportItems.length > 0, `day ${idx + 1} should have non-transport items`)
    })
  })

  await it('validation.passed 必须为 true 且 removed 为空', async () => {
    const result = await generateItinerary('beijing', selectedItems, basePrefs, '3天', null, [], testOptions)
    assertValidationPassed(result)
  })
})

describe('验收案例 2：上海 2-3 天', async () => {
  const selectedItems = [
    { id: 'sh-1', name: '外滩', type: 'attraction' },
    { id: 'sh-2', name: '东方明珠', type: 'attraction' },
    { id: 'sh-3', name: '豫园', type: 'attraction' },
    { id: 'sh-5', name: '上海迪士尼', type: 'attraction' },
  ]

  const basePrefs = { pace: 'moderate', startTime: '09:00', transport: 'subway' }
  const testOptions = { routeProvider: stableRouteProvider }

  await it('上海迪士尼必须被安排，不能丢失', async () => {
    const result = await generateItinerary('shanghai', selectedItems, basePrefs, '3天', null, [], testOptions)
    const allItems = result.days.flatMap(d => d.items)
    assertContains(allItems, i => i.name.includes('迪士尼'), '迪士尼 should be scheduled')
    assertRemovedDoesNotContain(result.removed, 'sh-5', '迪士尼 should not be silently removed')
  })

  await it('上海迪士尼必须独立一天或至少作为 fullDay anchor', async () => {
    const result = await generateItinerary('shanghai', selectedItems, basePrefs, '3天', null, [], testOptions)
    const disneyDay = result.days.find(d => d.items.some(i => i.name.includes('迪士尼')))
    assert.ok(disneyDay, 'disney day should exist')
    assert.ok(disneyDay.isRemoteDay || disneyDay.isFullDay, 'disney day should be remote/fullDay')
  })

  await it('迪士尼日不能再塞外滩/豫园/东方明珠这类市区景点', async () => {
    const result = await generateItinerary('shanghai', selectedItems, basePrefs, '3天', null, [], testOptions)
    const disneyDay = result.days.find(d => d.items.some(i => i.name.includes('迪士尼')))
    assert.ok(disneyDay, 'disney day should exist')
    const cityAttractions = disneyDay.items.filter(i =>
      i.type === 'attraction' &&
      !i.name.includes('迪士尼') &&
      !i.isRemote &&
      !i.isFullDay
    )
    assert.strictEqual(cityAttractions.length, 0, 'disney day should not contain other city attractions')
  })

  await it('外滩 preferredTime 必须是 evening', async () => {
    const result = await generateItinerary('shanghai', selectedItems, basePrefs, '3天', null, [], testOptions)
    const allItems = result.days.flatMap(d => d.items)
    const waitan = allItems.find(i => i.id === 'sh-1')
    assert.ok(waitan, '外滩 should be scheduled')
    assert.strictEqual(waitan.preferredTime, 'evening', '外滩 preferredTime should be evening')
  })

  await it('豫园可以和外滩/南京路/市区点同日', async () => {
    const result = await generateItinerary('shanghai', selectedItems, basePrefs, '3天', null, [], testOptions)
    const yuyuanDay = result.days.find(d => d.items.some(i => i.name.includes('豫园')))
    assert.ok(yuyuanDay, '豫园 day should exist')
    const hasOtherCityPoint = yuyuanDay.items.some(i =>
      i.type === 'attraction' &&
      (i.name.includes('外滩') || i.name.includes('南京路'))
    )
    assert.ok(hasOtherCityPoint, '豫园 should share day with other city points')
  })

  await it('不允许出现"迪士尼结束后再去外滩/东方明珠"的安排', async () => {
    const result = await generateItinerary('shanghai', selectedItems, basePrefs, '3天', null, [], testOptions)
    const disneyDay = result.days.find(d => d.items.some(i => i.name.includes('迪士尼')))
    assert.ok(disneyDay, 'disney day should exist')
    const disneyIdx = disneyDay.items.findIndex(i => i.name.includes('迪士尼'))
    const afterDisney = disneyDay.items.slice(disneyIdx + 1)
    const cityAttractionsAfter = afterDisney.filter(i =>
      i.type === 'attraction' &&
      (i.name.includes('外滩') || i.name.includes('东方明珠'))
    )
    assert.strictEqual(cityAttractionsAfter.length, 0, 'no city attractions should follow disney')
  })

  await it('validation.passed 必须为 true 且 removed 为空', async () => {
    const result = await generateItinerary('shanghai', selectedItems, basePrefs, '3天', null, [], testOptions)
    assertValidationPassed(result)
  })
})

describe('验收案例 3：重庆 3 天', async () => {
  const selectedItems = [
    { id: 'cq-1', name: '洪崖洞', type: 'attraction' },
    { id: 'cq-2', name: '解放碑', type: 'attraction' },
    { id: 'cq-6', name: '武隆天坑', type: 'attraction' },
    { id: 'cq-7', name: '南山一棵树', type: 'attraction' },
  ]

  const basePrefs = { pace: 'moderate', startTime: '09:00', transport: 'subway' }
  const testOptions = { routeProvider: stableRouteProvider }

  await it('武隆天坑必须被安排，不能丢失', async () => {
    const result = await generateItinerary('chongqing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const allItems = result.days.flatMap(d => d.items)
    assertContains(allItems, i => i.name.includes('武隆'), '武隆 should be scheduled')
    assertRemovedDoesNotContain(result.removed, 'cq-6', '武隆 should not be silently removed')
  })

  await it('武隆天坑必须独立一天或作为 fullDay/remote anchor', async () => {
    const result = await generateItinerary('chongqing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const wulongDay = result.days.find(d => d.items.some(i => i.name.includes('武隆')))
    assert.ok(wulongDay, '武隆 day should exist')
    assert.ok(wulongDay.isRemoteDay || wulongDay.isFullDay, '武隆 day should be remote/fullDay')
  })

  await it('洪崖洞 preferredTime 必须是 evening', async () => {
    const result = await generateItinerary('chongqing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const allItems = result.days.flatMap(d => d.items)
    const hongyadong = allItems.find(i => i.id === 'cq-1')
    assert.ok(hongyadong, '洪崖洞 should be scheduled')
    assert.strictEqual(hongyadong.preferredTime, 'evening', '洪崖洞 preferredTime should be evening')
  })

  await it('南山一棵树 preferredTime 必须是 evening', async () => {
    const result = await generateItinerary('chongqing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const allItems = result.days.flatMap(d => d.items)
    const nanshan = allItems.find(i => i.id === 'cq-7')
    assert.ok(nanshan, '南山 should be scheduled')
    assert.strictEqual(nanshan.preferredTime, 'evening', '南山 preferredTime should be evening')
  })

  await it('解放碑可以和洪崖洞同日', async () => {
    const result = await generateItinerary('chongqing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const jiefangbeiDay = result.days.find(d => d.items.some(i => i.name.includes('解放碑')))
    assert.ok(jiefangbeiDay, '解放碑 day should exist')
    const hasHongyadong = jiefangbeiDay.items.some(i => i.name.includes('洪崖洞'))
    assert.ok(hasHongyadong, '解放碑 should share day with 洪崖洞')
  })

  await it('不允许把武隆静默放进 removed，除非 days 不足且 warnings 明确说明原因', async () => {
    const result = await generateItinerary('chongqing', selectedItems, basePrefs, '3天', null, [], testOptions)
    const wulongInRemoved = (result.removed || []).some(r => r.id === 'cq-6' || (typeof r === 'string' && r === 'cq-6'))
    if (wulongInRemoved) {
      const hasWarning = (result.warnings || []).some(w => typeof w === 'string' && w.includes('武隆'))
      assert.ok(hasWarning, 'if 武隆 is removed, warnings should mention it')
    }
  })

  await it('validation.passed 必须为 true 且 removed 为空', async () => {
    const result = await generateItinerary('chongqing', selectedItems, basePrefs, '3天', null, [], testOptions)
    assertValidationPassed(result)
  })
})
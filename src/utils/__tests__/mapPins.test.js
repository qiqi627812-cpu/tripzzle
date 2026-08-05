import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildPinsFromItinerary, projectPinsToMockMap, buildDayRoutes } from '../mapPins.js'

test('buildPinsFromItinerary - 过滤 transport 类型', () => {
  const days = [
    {
      items: [
        { id: 't1', name: '故宫', type: 'attraction', lat: 39.9163, lng: 116.3972 },
        { id: 't2', name: '地铁', type: 'transport', lat: 39.9, lng: 116.4 },
        { id: 't3', name: '午餐', type: 'food', lat: 39.91, lng: 116.38, isTransport: false },
        { id: 't4', name: '出租车', type: 'attraction', lat: 39.92, lng: 116.35, isTransport: true },
      ],
    },
  ]

  const pins = buildPinsFromItinerary(days)

  // 应该过滤掉 type === 'transport' 和 isTransport === true 的项
  assert.strictEqual(pins.length, 2, 'should filter out transport items')
  const names = pins.map(p => p.name)
  assert.ok(names.includes('故宫'), 'should include attraction')
  assert.ok(names.includes('午餐'), 'should include food')
  assert.ok(!names.includes('地铁'), 'should not include transport type')
  assert.ok(!names.includes('出租车'), 'should not include isTransport=true')
})

test('buildPinsFromItinerary - onlyCurrentDay 只返回当前天', () => {
  const days = [
    {
      items: [
        { id: 'd1-a1', name: '故宫', type: 'attraction', lat: 39.9163, lng: 116.3972, time: '09:00' },
      ],
    },
    {
      items: [
        { id: 'd2-a1', name: '长城', type: 'attraction', lat: 40.35, lng: 116.02, time: '08:00' },
      ],
    },
    {
      items: [
        { id: 'd3-a1', name: '颐和园', type: 'attraction', lat: 40.0, lng: 116.3, time: '10:00' },
      ],
    },
  ]

  const allPins = buildPinsFromItinerary(days, { onlyCurrentDay: false })
  assert.strictEqual(allPins.length, 3, 'should return all days when onlyCurrentDay is false')

  const day1Pins = buildPinsFromItinerary(days, { onlyCurrentDay: true, currentDayIndex: 0 })
  assert.strictEqual(day1Pins.length, 1, 'should return only day 1')
  assert.strictEqual(day1Pins[0].name, '故宫', 'should be day 1 attraction')

  const day2Pins = buildPinsFromItinerary(days, { onlyCurrentDay: true, currentDayIndex: 1 })
  assert.strictEqual(day2Pins.length, 1, 'should return only day 2')
  assert.strictEqual(day2Pins[0].name, '长城', 'should be day 2 attraction')
})

test('buildPinsFromItinerary - custom item type 保持 custom', () => {
  const days = [
    {
      items: [
        { id: 'custom-1', name: '自定义地点', type: 'custom', typeLabel: '自定义', lat: 39.9, lng: 116.4, isCustom: true },
        { id: 'normal-1', name: '普通景点', type: 'attraction', lat: 39.91, lng: 116.41 },
      ],
    },
  ]

  const pins = buildPinsFromItinerary(days)

  assert.strictEqual(pins.length, 2, 'should return both items')
  const customPin = pins.find(p => p.id === 'custom-1')
  assert.ok(customPin, 'should have custom pin')
  assert.strictEqual(customPin.type, 'custom', 'custom type should be preserved')
  assert.strictEqual(customPin.isCustom, true, 'isCustom should be true')
})

test('buildPinsFromItinerary - 过滤无坐标的项', () => {
  const days = [
    {
      items: [
        { id: 'a1', name: '故宫', type: 'attraction', lat: 39.9163, lng: 116.3972 },
        { id: 'a2', name: '神秘地点', type: 'attraction' }, // 无坐标
        { id: 'a3', name: '无效坐标', type: 'attraction', lat: 'invalid', lng: null },
        { id: 'a4', name: '天坛', type: 'attraction', lat: 39.88, lng: 116.41 },
      ],
    },
  ]

  const pins = buildPinsFromItinerary(days)

  assert.strictEqual(pins.length, 2, 'should only return items with valid coords')
  const names = pins.map(p => p.name)
  assert.ok(names.includes('故宫'), 'should include item with valid coords')
  assert.ok(names.includes('天坛'), 'should include item with valid coords')
})

test('projectPinsToMockMap - 使用经纬度投影，不用写死 positions', () => {
  const pins = [
    { id: 'p1', name: '故宫', lat: 39.9163, lng: 116.3972 },
    { id: 'p2', name: '长城', lat: 40.35, lng: 116.02 },
    { id: 'p3', name: '颐和园', lat: 40.0, lng: 116.3 },
  ]

  const projected = projectPinsToMockMap(pins)

  assert.strictEqual(projected.length, 3, 'should project all pins')

  // 所有投影点都应该有 left/top 百分比
  projected.forEach(p => {
    assert.ok(p.left, 'should have left position')
    assert.ok(p.top, 'should have top position')
    assert.ok(p.left.endsWith('%'), 'left should be percentage')
    assert.ok(p.top.endsWith('%'), 'top should be percentage')
  })

  // 验证相对位置关系：长城在最北（top 最小），故宫在最南（top 最大）
  const greatWall = projected.find(p => p.name === '长城')
  const forbiddenCity = projected.find(p => p.name === '故宫')
  
  // 长城纬度更高，所以 top 应该更小（更靠上）
  const greatWallTop = parseFloat(greatWall.top)
  const forbiddenCityTop = parseFloat(forbiddenCity.top)
  assert.ok(greatWallTop < forbiddenCityTop, 'higher lat should have smaller top (higher on screen)')
})

test('projectPinsToMockMap - 空数组返回空数组', () => {
  const projected = projectPinsToMockMap([])
  assert.strictEqual(projected.length, 0, 'should return empty array for empty input')
})

test('projectPinsToMockMap - 单个点时返回中心位置', () => {
  const pins = [{ id: 'p1', name: '故宫', lat: 39.9163, lng: 116.3972 }]

  const projected = projectPinsToMockMap(pins)

  assert.strictEqual(projected.length, 1, 'should return single pin')
  // 单个点应该在合理范围内（不是 0 或 100）
  const left = parseFloat(projected[0].left)
  const top = parseFloat(projected[0].top)
  assert.ok(left > 10 && left < 90, 'single pin should be in reasonable horizontal range')
  assert.ok(top > 10 && top < 90, 'single pin should be in reasonable vertical range')
})

test('buildDayRoutes - 按天分组构建路线', () => {
  const pins = [
    { id: 'd1-a1', name: '故宫', lat: 39.9163, lng: 116.3972, day: 1, time: '09:00' },
    { id: 'd1-a2', name: '天坛', lat: 39.88, lng: 116.41, day: 1, time: '14:00' },
    { id: 'd2-a1', name: '长城', lat: 40.35, lng: 116.02, day: 2, time: '08:00' },
    { id: 'd2-a2', name: '颐和园', lat: 40.0, lng: 116.3, day: 2, time: '14:00' },
  ]

  const routes = buildDayRoutes(pins)

  assert.strictEqual(routes.length, 2, 'should have 2 day routes')
  
  const day1Route = routes.find(r => r.day === 1)
  assert.ok(day1Route, 'should have day 1 route')
  assert.strictEqual(day1Route.path.length, 2, 'day 1 should have 2 points')
  
  const day2Route = routes.find(r => r.day === 2)
  assert.ok(day2Route, 'should have day 2 route')
  assert.strictEqual(day2Route.path.length, 2, 'day 2 should have 2 points')
})

test('buildDayRoutes - 按时间排序', () => {
  const pins = [
    { id: 'p1', name: '晚餐', lat: 39.9, lng: 116.4, day: 1, time: '18:00' },
    { id: 'p2', name: '午餐', lat: 39.91, lng: 116.41, day: 1, time: '12:00' },
    { id: 'p3', name: '早餐', lat: 39.92, lng: 116.42, day: 1, time: '08:00' },
  ]

  const routes = buildDayRoutes(pins)

  assert.strictEqual(routes.length, 1, 'should have 1 route')
  assert.strictEqual(routes[0].path.length, 3, 'should have 3 points')
  
  // 验证顺序：早餐 -> 午餐 -> 晚餐（按纬度从北到南）
  const latitudes = routes[0].path.map(p => p[1])
  assert.ok(latitudes[0] > latitudes[2], 'should be sorted by time (breakfast lat > dinner lat)')
})

test('buildDayRoutes - 少于2个点不生成路线', () => {
  const pins = [
    { id: 'p1', name: '故宫', lat: 39.9, lng: 116.4, day: 1, time: '09:00' },
  ]

  const routes = buildDayRoutes(pins)

  assert.strictEqual(routes.length, 0, 'should not create route for single point')
})

test('buildDayRoutes - 支持百分比坐标（projectedPins）', () => {
  const projectedPins = [
    { id: 'p1', name: '故宫', left: '20%', top: '30%', day: 1, time: '09:00' },
    { id: 'p2', name: '天坛', left: '60%', top: '70%', day: 1, time: '14:00' },
  ]

  const routes = buildDayRoutes(projectedPins)

  assert.strictEqual(routes.length, 1, 'should create route from projected pins')
  assert.strictEqual(routes[0].path.length, 2, 'should have 2 points')
  
  // 验证坐标是百分比数值
  const [left1, top1] = routes[0].path[0]
  const [left2, top2] = routes[0].path[1]
  assert.strictEqual(left1, 20, 'first point left should be 20')
  assert.strictEqual(top1, 30, 'first point top should be 30')
  assert.strictEqual(left2, 60, 'second point left should be 60')
  assert.strictEqual(top2, 70, 'second point top should be 70')
})
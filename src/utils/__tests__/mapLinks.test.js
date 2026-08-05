import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildMapLinks } from '../mapLinks.js'

test('buildMapLinks - 有坐标的地点生成所有地图链接', () => {
  const place = {
    name: '故宫博物院',
    lat: 39.9163,
    lng: 116.3972,
    address: '北京市东城区景山前街4号',
  }
  const links = buildMapLinks(place)

  assert.ok(Array.isArray(links), 'links should be an array')
  assert.ok(links.length >= 5, 'should have at least 5 links (5 maps)')

  const ids = links.map(l => l.id)
  assert.ok(ids.includes('amap'), 'should have amap')
  assert.ok(ids.includes('baidu'), 'should have baidu')
  assert.ok(ids.includes('tencent'), 'should have tencent')
  assert.ok(ids.includes('apple'), 'should have apple')
  assert.ok(ids.includes('google'), 'should have google')

  const amap = links.find(l => l.id === 'amap')
  assert.ok(amap.url.includes('39.9163'), 'amap url should contain lat')
  assert.ok(amap.url.includes('116.3972'), 'amap url should contain lng')
  assert.ok(amap.schemeUrl, 'amap should have schemeUrl')
})

test('buildMapLinks - 无坐标的地点使用搜索链接', () => {
  const place = {
    name: '神秘地点',
    address: '某某路123号',
  }
  const links = buildMapLinks(place)

  assert.ok(links.length >= 5, 'should have at least 5 links')

  const amap = links.find(l => l.id === 'amap')
  assert.ok(amap.url.includes('keyword='), 'amap search url should have keyword')
  assert.ok(amap.schemeUrl.includes('search'), 'amap scheme should be search')
})

test('buildMapLinks - 有起点时生成导航链接', () => {
  const place = {
    name: '目的地',
    lat: 39.92,
    lng: 116.40,
  }
  const fromPlace = {
    name: '起点',
    lat: 39.90,
    lng: 116.38,
  }
  const links = buildMapLinks(place, fromPlace)

  const amap = links.find(l => l.id === 'amap')
  assert.ok(amap.navUrl, 'should have navUrl when fromPlace provided')
  assert.ok(amap.navUrl.includes('39.92'), 'navUrl should contain dest lat')
  assert.ok(amap.navUrl.includes('116.38'), 'navUrl should contain from lng')

  const baidu = links.find(l => l.id === 'baidu')
  assert.ok(baidu.navUrl, 'baidu should have navUrl')

  const apple = links.find(l => l.id === 'apple')
  assert.ok(apple.navUrl, 'apple should have navUrl')

  const google = links.find(l => l.id === 'google')
  assert.ok(google.navUrl, 'google should have navUrl')
})

test('buildMapLinks - 起点无坐标时不生成导航链接', () => {
  const place = {
    name: '目的地',
    lat: 39.92,
    lng: 116.40,
  }
  const fromPlace = {
    name: '未知起点',
  }
  const links = buildMapLinks(place, fromPlace)

  const amap = links.find(l => l.id === 'amap')
  assert.ok(!amap.navUrl, 'should not have navUrl when fromPlace has no coords')
})

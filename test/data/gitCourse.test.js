import { describe, expect, it } from 'vitest'
import { GIT_COURSE, getBilibiliPlayerUrl } from '../../src/data/gitCourse.js'

describe('Git course data', () => {
  it('contains six ordered, unique public episodes', () => {
    expect(GIT_COURSE.episodes).toHaveLength(6)
    expect(GIT_COURSE.episodes.map(episode => episode.number)).toEqual(['01', '02', '03', '04', '05', '06'])
    expect(new Set(GIT_COURSE.episodes.map(episode => episode.bvid)).size).toBe(6)

    GIT_COURSE.episodes.forEach((episode) => {
      expect(episode.url).toBe(`https://www.bilibili.com/video/${episode.bvid}/`)
      expect(episode.cover).toMatch(/^\/courses\/git\/ep\d{2}\.webp$/)
    })
  })

  it('builds a privacy-clean Bilibili player URL', () => {
    const url = new URL(getBilibiliPlayerUrl('BV1T9Mj6SEfR'))

    expect(url.origin).toBe('https://player.bilibili.com')
    expect(url.searchParams.get('bvid')).toBe('BV1T9Mj6SEfR')
    expect(url.searchParams.get('danmaku')).toBe('0')
    expect(url.searchParams.has('vd_source')).toBe(false)
  })
})

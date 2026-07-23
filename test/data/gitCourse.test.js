import { describe, expect, it } from 'vitest'
import { GIT_COURSE, getBilibiliPlayerUrl } from '../../src/data/gitCourse.js'

describe('Git course data', () => {
  it('contains eight ordered episodes with seven public releases', () => {
    expect(GIT_COURSE.episodes).toHaveLength(8)
    expect(GIT_COURSE.episodes.map(episode => episode.number)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08'])

    const publishedEpisodes = GIT_COURSE.episodes.filter(episode => episode.url)
    const pendingEpisodes = GIT_COURSE.episodes.filter(episode => !episode.url)

    expect(publishedEpisodes).toHaveLength(7)
    expect(new Set(publishedEpisodes.map(episode => episode.bvid)).size).toBe(7)
    expect(pendingEpisodes.map(episode => episode.number)).toEqual(['08'])
    expect(pendingEpisodes[0].bvid).toBeNull()

    GIT_COURSE.episodes.forEach((episode) => {
      expect(episode.cover).toMatch(/^\/courses\/git\/ep\d{2}\.webp$/)
    })

    publishedEpisodes.forEach((episode) => {
      expect(episode.url).toBe(`https://www.bilibili.com/video/${episode.bvid}/`)
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

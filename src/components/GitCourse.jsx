import { useState } from 'react'
import { motion } from 'motion/react'
import { FaArrowDown, FaExternalLinkAlt, FaPlay, FaTimes } from 'react-icons/fa'
import PageHeader from './PageHeader.jsx'
import GitCourseGraph from './GitCourseGraph.jsx'
import GitCourseTitleMark from './GitCourseTitleMark.jsx'
import { GIT_COURSE, getBilibiliPlayerUrl } from '../data/gitCourse.js'
import './GitCourse.css'

export default function GitCourse() {
  const [playingEpisode, setPlayingEpisode] = useState(null)

  const scrollToEpisodes = () => {
    document.getElementById('episodes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="git-course-page">
      <PageHeader num="04" title="COURSES" />

      <div className="git-course-shell">
        <motion.header
          className="git-course-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="git-course-hero__copy">
            <h1><span className="git-course-title-text">看得见的</span> <GitCourseTitleMark /></h1>
            <p className="git-course-hero__lede">{GIT_COURSE.description}</p>
            <ul className="git-course-facts" aria-label="课程信息">
              <li>6 集</li>
              <li>{GIT_COURSE.totalDuration}</li>
              <li>4K</li>
              <li>中文讲解</li>
            </ul>
            <button type="button" className="git-course-jump" onClick={scrollToEpisodes}>
              浏览课程 <FaArrowDown aria-hidden="true" />
            </button>
          </div>

          <div className="git-course-hero__visual">
            <GitCourseGraph />
          </div>
        </motion.header>

        <div className="git-course-note">
          <p>
            这套课程不从命令清单开始，而是跟着对象、状态和指针的变化建立 Git 心智模型。
            每一集只解决一个核心问题，并用提交图和实际命令相互验证。
          </p>
          <span>Remotion 制作 · Bilibili 播放</span>
        </div>

        <ol id="episodes" className="git-course-episodes">
          {GIT_COURSE.episodes.map((episode) => {
            const isPlaying = playingEpisode === episode.number

            return (
              <motion.li
                key={episode.bvid}
                className={`git-course-episode ${isPlaying ? 'is-playing' : ''}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-64px' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="git-course-episode__media">
                  {isPlaying ? (
                    <>
                      <iframe
                        src={getBilibiliPlayerUrl(episode.bvid)}
                        title={`播放：${episode.title}`}
                        loading="lazy"
                        scrolling="no"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                      <button
                        type="button"
                        className="git-course-episode__close"
                        onClick={() => setPlayingEpisode(null)}
                        aria-label={`收起第 ${episode.number} 集播放器`}
                      >
                        <FaTimes aria-hidden="true" /> 收起
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="git-course-episode__poster"
                      onClick={() => setPlayingEpisode(episode.number)}
                      aria-label={`播放第 ${episode.number} 集：${episode.title}`}
                    >
                      <img
                        src={episode.cover}
                        alt={`《看得见的 Git》第 ${episode.number} 集封面`}
                        loading="lazy"
                        width="1280"
                        height="720"
                      />
                      <span className="git-course-episode__play" aria-hidden="true">
                        <FaPlay />
                      </span>
                      <span className="git-course-episode__duration">{episode.duration}</span>
                    </button>
                  )}
                </div>

                <div className="git-course-episode__copy">
                  <div className="git-course-episode__meta">
                    <span>EP.{episode.number}</span>
                    <span>{episode.topic}</span>
                  </div>
                  <h2>{episode.title}</h2>
                  <p>{episode.description}</p>
                  <div className="git-course-episode__actions">
                    <button type="button" onClick={() => setPlayingEpisode(episode.number)}>
                      <FaPlay aria-hidden="true" /> 在此播放
                    </button>
                    <a href={episode.url} target="_blank" rel="noopener noreferrer">
                      前往 B 站 <FaExternalLinkAlt aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

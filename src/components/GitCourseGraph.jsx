import './GitCourseGraph.css'

export default function GitCourseGraph({ compact = false }) {
  return (
    <svg
      className={`git-course-graph ${compact ? 'git-course-graph--compact' : ''}`}
      viewBox="0 0 760 360"
      role="img"
      aria-labelledby="git-course-graph-title git-course-graph-desc"
    >
      <title id="git-course-graph-title">Git 提交图动画</title>
      <desc id="git-course-graph-desc">提交沿主分支前进，功能分支汇入主分支，HEAD 指针随提交移动。</desc>

      <g className="git-course-graph__grid" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <path key={`v-${index}`} d={`M${40 + index * 64} 28V332`} />
        ))}
        {Array.from({ length: 5 }, (_, index) => (
          <path key={`h-${index}`} d={`M28 ${52 + index * 64}H732`} />
        ))}
      </g>

      <g aria-hidden="true">
        <path className="git-course-graph__track" d="M92 206H668" />
        <path className="git-course-graph__track git-course-graph__track--branch" d="M250 206C306 206 306 108 366 108H476C530 108 536 206 588 206" />
        <path className="git-course-graph__flow" d="M92 206H668" pathLength="1" />
        <path className="git-course-graph__flow git-course-graph__flow--branch" d="M250 206C306 206 306 108 366 108H476C530 108 536 206 588 206" pathLength="1" />
      </g>

      <g className="git-course-graph__nodes" aria-hidden="true">
        <circle cx="92" cy="206" r="19" />
        <circle cx="250" cy="206" r="19" />
        <circle cx="366" cy="108" r="19" className="git-course-graph__node--feature" />
        <circle cx="476" cy="108" r="19" className="git-course-graph__node--feature" />
        <circle cx="426" cy="206" r="19" />
        <circle cx="588" cy="206" r="23" className="git-course-graph__node--merge" />
        <circle cx="668" cy="206" r="19" />
      </g>

      <g className="git-course-graph__labels" aria-hidden="true">
        <text x="92" y="252">C1</text>
        <text x="250" y="252">C2</text>
        <text x="366" y="70">C3</text>
        <text x="476" y="70">C4</text>
        <text x="426" y="252">C5</text>
        <text x="588" y="252">M1</text>
        <text x="668" y="252">C6</text>
      </g>

      <g transform="translate(74 130)" aria-hidden="true">
        <g className="git-course-graph__head">
          <rect width="74" height="32" rx="4" />
          <text x="37" y="21">HEAD</text>
          <path d="M37 32V54" />
        </g>
      </g>

      <g className="git-course-graph__branch-labels" aria-hidden="true">
        <text x="92" y="304">main</text>
        <text x="366" y="36">feature</text>
      </g>
    </svg>
  )
}

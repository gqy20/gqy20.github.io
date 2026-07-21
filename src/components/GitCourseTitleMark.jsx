const G_GLYPH = 'M27.2 54.5Q27.2 66 32.4 72Q37.6 78 46.7 78Q50.9 78 54.15 76.8Q57.4 75.6 60.3 72.6V64.7H46.3V47.8H77.8V81.2Q66.2 95.4 46.7 95.4Q35.2 95.4 26.5 90.45Q17.8 85.5 13 76.3Q8.2 67.1 8.2 54.5Q8.2 41.9 13.1 32.7Q18 23.5 26.85 18.55Q35.7 13.6 47.3 13.6Q68.7 13.6 76.9 29.7L62.2 39.7Q60 35.7 56 33.35Q52 31 47.3 31Q38 31 32.6 37.05Q27.2 43.1 27.2 54.5Z'
const I_GLYPH = 'M98.7 33.5V94H80.7V33.5Z'
const T_GLYPH = 'M140.3 50.5H124.9V71.5Q124.9 74.5 126.7 76.15Q128.5 77.8 131.8 77.8Q135.4 77.8 139.1 76.7V93.7Q133.3 95.4 127.4 95.4Q117.5 95.4 112.2 89.95Q106.9 84.5 106.9 74.3V50.5H97.6V33.5H106.9V16.8H124.9V33.5H140.3Z'

function GitGlyphs() {
  return (
    <g>
      <path d={G_GLYPH} />
      <path d={I_GLYPH} />
      <path d={T_GLYPH} />
    </g>
  )
}

export default function GitCourseTitleMark() {
  return (
    <span className="git-course-title-mark">
      <span className="git-course-title-mark__accessible">Git</span>
      <svg viewBox="0 0 145 100" aria-hidden="true" focusable="false">
        <defs>
          <mask id="git-course-title-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="145" height="100">
            <g fill="#fff">
              <GitGlyphs />
            </g>
          </mask>
          <filter id="git-course-title-node-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="2.1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="git-course-title-mark__glyphs">
          <GitGlyphs />
        </g>

        <g mask="url(#git-course-title-mask)">
          <path
            className="git-course-title-mark__path git-course-title-mark__path--head"
            pathLength="1"
            d="M1 51C31 23 68 23 96 49C115 66 128 62 144 47"
          />
          <path
            className="git-course-title-mark__path git-course-title-mark__path--graph"
            pathLength="1"
            d="M7 71C40 50 77 54 137 76"
          />
        </g>

        <g transform="translate(89.6 17.1)">
          <g className="git-course-title-mark__node">
            <circle className="git-course-title-mark__node-pulse" r="7.4" />
            <circle className="git-course-title-mark__node-ring" r="6.1" />
            <circle className="git-course-title-mark__node-core" r="2.15" />
          </g>
        </g>
      </svg>
    </span>
  )
}

export const GIT_COURSE = {
  slug: 'git',
  title: '看得见的 Git',
  description: '把对象、暂存区、提交、分支、HEAD 与合并画成一条可以跟随的提交图。',
  totalDuration: '21:04',
  episodes: [
    {
      number: '01',
      title: 'Git 到底存了什么？先别急着背命令',
      description: '从 blob、tree 和 commit 三类对象出发，理解 Git 保存的是内容与关系，而不是一叠文件副本。',
      duration: '03:43',
      topic: 'Git objects',
      bvid: 'BV1T9Mj6SEfR',
      url: 'https://www.bilibili.com/video/BV1T9Mj6SEfR/',
      cover: '/courses/git/ep01.webp',
    },
    {
      number: '02',
      title: 'git add 到底做了什么？Git 的三层一次讲清',
      description: '沿着 Working Tree、Index、Repository 三层移动文件状态，看清 git add 真正改变了什么。',
      duration: '03:13',
      topic: 'Working Tree / Index',
      bvid: 'BV1bdNF6YEFT',
      url: 'https://www.bilibili.com/video/BV1bdNF6YEFT/',
      cover: '/courses/git/ep02.webp',
    },
    {
      number: '03',
      title: 'commit 不是保存按钮，它里面到底装了什么',
      description: '拆开一次提交，观察快照、父提交、作者与说明如何共同组成可追溯的 commit 对象。',
      duration: '02:43',
      topic: 'Commit snapshot',
      bvid: 'BV16VNG6DEyU',
      url: 'https://www.bilibili.com/video/BV16VNG6DEyU/',
      cover: '/courses/git/ep03.webp',
    },
    {
      number: '04',
      title: '创建 Git 分支为什么这么快？它根本没复制',
      description: '把 branch 还原成一个轻量指针，理解创建、移动和切换分支为什么几乎瞬间完成。',
      duration: '04:13',
      topic: 'Branch pointer',
      bvid: 'BV1C2NY6mENe',
      url: 'https://www.bilibili.com/video/BV1C2NY6mENe/',
      cover: '/courses/git/ep04.webp',
    },
    {
      number: '05',
      title: 'Git HEAD 到底指向谁？别再把它当成当前提交',
      description: '区分 HEAD、分支引用和提交对象，顺着一次 checkout 看懂指针之间的间接关系。',
      duration: '03:31',
      topic: 'HEAD',
      bvid: 'BV1GsKq6VEET',
      url: 'https://www.bilibili.com/video/BV1GsKq6VEET/',
      cover: '/courses/git/ep05.webp',
    },
    {
      number: '06',
      title: 'Git merge 到底做了什么？快进、三方合并和冲突',
      description: '先读提交图，再判断 fast-forward、三方合并与冲突，理解 merge 如何选择共同祖先。',
      duration: '03:41',
      topic: 'Merge',
      bvid: 'BV1GZKH6vETo',
      url: 'https://www.bilibili.com/video/BV1GZKH6vETo/',
      cover: '/courses/git/ep06.webp',
    },
  ],
}

export function getBilibiliPlayerUrl(bvid) {
  const params = new URLSearchParams({
    bvid,
    autoplay: '1',
    danmaku: '0',
    poster: '1',
    refer: '1',
  })

  return `https://player.bilibili.com/player.html?${params.toString()}`
}

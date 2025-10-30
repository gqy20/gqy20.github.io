/**
 * 项目相关工具函数
 * 集中管理所有项目处理的通用逻辑
 */

import { FaExternalLinkAlt } from 'react-icons/fa'

/**
 * 获取外部链接的图标类型
 * @param {string} url - 链接地址
 * @returns {string} - 图标类型标识符
 */
export const getExternalLinkIcon = (url) => {
  if (!url) return 'default'

  // 检测 PyPI 链接
  if (url.includes('pypi.org')) {
    return 'pypi'
  }

  // 默认图标
  return 'default'
}

/**
 * 规范化项目描述
 * @param {string} description - 原始描述
 * @param {string} name - 项目名称
 * @returns {string} - 规范化后的描述
 */
export const normalizeDescription = (description, name) => {
  if (!description || description.includes('暂无描述')) {
    return `${name} - 开源项目`
  }

  // 基本清理
  let cleaned = description
    .replace(/^- /, '') // 移除开头的 "- "
    .replace(/ - .*项目$/, '') // 移除结尾的 " - xxx项目"
    .trim()

  // 长度限制
  return cleaned.length > 60 ? cleaned.substring(0, 57) + '...' : cleaned
}

/**
 * 获取链接的显示文本
 * @param {string} url - 链接地址
 * @returns {string} - 显示文本
 */
export const getLinkText = (url) => {
  if (!url) return '查看链接'

  if (url.includes('pypi.org')) {
    return '安装使用'
  }

  return '查看演示'
}
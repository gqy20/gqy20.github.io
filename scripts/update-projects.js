import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// ES模块中获取__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub API配置
const GITHUB_USERNAME = 'gqy20';
const PROJECTS_FILE = path.join(__dirname, '../src/data/projects.json');

// 获取认证 headers
function getAuthHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    };
  }
  return {};
}

// 带认证的 fetch wrapper
async function fetchWithAuth(url, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  return response;
}

// 项目分类规则
const categorizeProject = (repo) => {
  const name = repo.name.toLowerCase();
  const description = repo.description?.toLowerCase() || '';
  const language = repo.language?.toLowerCase() || '';
  const topics = repo.topics || [];

  // MCP相关项目
  if (name.includes('mcp') || topics.includes('mcp')) {
    return {
      category: 'MCP工具',
      priority: 1,
      tags: ['MCP', 'AI工具']
    };
  }

  // AI/机器学习项目
  if (description.includes('ai') || description.includes('人工智能') ||
      description.includes('machine learning') || name.includes('ai')) {
    return {
      category: 'AI应用',
      priority: 2,
      tags: ['AI', '机器学习']
    };
  }

  // 科研工具项目
  if (description.includes('文献') || description.includes('科研') ||
      description.includes('学术') || name.includes('pub') || name.includes('sla')) {
    return {
      category: '科研工具',
      priority: 3,
      tags: ['科研', '学术']
    };
  }

  // Web开发项目
  if (language === 'javascript' || language === 'typescript' ||
      language === 'html' || name.includes('web') || name.includes('blog')) {
    return {
      category: 'Web开发',
      priority: 4,
      tags: ['Web', '前端']
    };
  }

  // 工具类项目
  if (description.includes('工具') || description.includes('tool') ||
      name.includes('tool') || name.includes('util')) {
    return {
      category: '开发工具',
      priority: 5,
      tags: ['工具', '开发']
    };
  }

  // 个人项目
  if (name.includes('gqy20') || name.includes('personal') ||
      description.includes('个人')) {
    return {
      category: '个人项目',
      priority: 6,
      tags: ['个人', '展示']
    };
  }

  // 默认分类
  return {
    category: '其他项目',
    priority: 7,
    tags: [language || '其他']
  };
};

// 获取GitHub用户数据
async function fetchGitHubUserData() {
  try {
    const response = await fetchWithAuth(`https://api.github.com/users/${GITHUB_USERNAME}`);
    if (!response.ok) {
      throw new Error(`获取用户数据失败: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取用户数据失败:', error.message);
    return { followers: 2 }; // 默认值
  }
}

// 获取单个项目的详细信息（包括releases和tags）
async function fetchProjectDetails(repo) {
  try {
    // 获取releases信息
    let releases = [];
    let latestRelease = null;

    try {
      const releasesResponse = await fetchWithAuth(`https://api.github.com/repos/${repo.full_name}/releases?per_page=5`);
      if (releasesResponse.ok) {
        releases = await releasesResponse.json();
        if (releases.length > 0) {
          latestRelease = {
            tagName: releases[0].tag_name,
            name: releases[0].name,
            publishedAt: releases[0].published_at,
            prerelease: releases[0].prerelease,
            draft: releases[0].draft
          };
        }
      }
    } catch (error) {
      console.log(`  ⚠️ 获取 ${repo.name} releases失败: ${error.message}`);
    }

    // 获取tags信息（作为releases的补充）
    let tags = [];
    let latestTag = null;

    try {
      const tagsResponse = await fetchWithAuth(`https://api.github.com/repos/${repo.full_name}/tags?per_page=5`);
      if (tagsResponse.ok) {
        tags = await tagsResponse.json();
        if (tags.length > 0 && !latestRelease) {
          latestTag = {
            name: tags[0].name,
            commit: tags[0].commit?.sha,
            zipball_url: tags[0].zipball_url,
            tarball_url: tags[0].tarball_url
          };
        }
      }
    } catch (error) {
      console.log(`  ⚠️ 获取 ${repo.name} tags失败: ${error.message}`);
    }

    return {
      releases: releases,
      latestRelease,
      latestTag,
      totalReleases: releases.length,
      totalTags: tags.length
    };
  } catch (error) {
    console.log(`  ❌ 获取 ${repo.name} 详细信息失败: ${error.message}`);
    return {
      releases: [],
      latestRelease: null,
      latestTag: null,
      totalReleases: 0,
      totalTags: 0
    };
  }
}

// 获取GitHub仓库数据
async function fetchGitHubProjects() {
  try {
    console.log('🚀 开始获取GitHub项目数据...');

    // 获取用户数据
    const userData = await fetchGitHubUserData();

    // 获取所有公开仓库
    const response = await fetchWithAuth(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&direction=desc`);

    if (!response.ok) {
      throw new Error(`GitHub API请求失败: ${response.status}`);
    }

    const repos = await response.json();
    console.log(`📊 获取到 ${repos.length} 个仓库`);

    // 过滤并处理项目数据
    const filteredRepos = repos.filter(repo => !repo.fork && !repo.private && repo.name !== 'gqy20.github.io');
    console.log(`🔍 筛选出 ${filteredRepos.length} 个有效仓库`);

    // 批量获取项目详细信息（包括homepage和releases）
    const projects = [];
    for (let i = 0; i < filteredRepos.length; i++) {
      const repo = filteredRepos[i];
      const categoryInfo = categorizeProject(repo);

      console.log(`  📦 获取 ${repo.name} 的详细信息... (${i + 1}/${filteredRepos.length})`);

      const details = await fetchProjectDetails(repo);

      const projectData = {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || `暂无描述 - ${repo.language || '未知语言'}项目`,
        url: repo.html_url,
        homepage: repo.homepage || null, // 新增：homepage字段
        language: repo.language || 'Unknown',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        issues: repo.open_issues_count,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        category: categoryInfo.category,
        priority: categoryInfo.priority,
        tags: categoryInfo.tags,
        topics: repo.topics || [],
        isArchived: repo.archived,
        size: repo.size,
        license: repo.license?.name || null,
        // 新增：版本和release信息
        latestRelease: details.latestRelease,
        latestTag: details.latestTag,
        totalReleases: details.totalReleases,
        totalTags: details.totalTags
      };

      projects.push(projectData);
    }

    // 按优先级和更新时间排序
    projects.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    // 按分类组织数据
    const categorizedProjects = {};
    projects.forEach(project => {
      if (!categorizedProjects[project.category]) {
        categorizedProjects[project.category] = [];
      }
      categorizedProjects[project.category].push(project);
    });

    const projectData = {
      lastUpdated: new Date().toISOString(),
      totalProjects: projects.length,
      totalStars: projects.reduce((sum, p) => sum + p.stars, 0),
      followers: userData.followers || 2,
      categories: Object.keys(categorizedProjects),
      projects: categorizedProjects,
      allProjects: projects
    };

    // 确保目录存在
    const dataDir = path.dirname(PROJECTS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projectData, null, 2), 'utf8');

    console.log('✅ 项目数据更新成功!');
    console.log(`📈 总计 ${projectData.totalProjects} 个项目`);
    console.log(`⭐ 总计 ${projectData.totalStars} 个星标`);
    console.log(`🏷️  ${projectData.categories.length} 个分类: ${projectData.categories.join(', ')}`);

    return projectData;

  } catch (error) {
    console.error('❌ 获取项目数据失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchGitHubProjects();
}

export { fetchGitHubProjects, categorizeProject };
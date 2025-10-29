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

// 获取GitHub仓库数据
async function fetchGitHubProjects() {
  try {
    console.log('🚀 开始获取GitHub项目数据...');

    // 获取所有公开仓库
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&direction=desc`);

    if (!response.ok) {
      throw new Error(`GitHub API请求失败: ${response.status}`);
    }

    const repos = await response.json();
    console.log(`📊 获取到 ${repos.length} 个仓库`);

    // 过滤并处理项目数据
    const projects = repos
      .filter(repo => !repo.fork && !repo.private && repo.name !== 'gqy20.github.io')
      .map(repo => {
        const categoryInfo = categorizeProject(repo);

        return {
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || `暂无描述 - ${repo.language || '未知语言'}项目`,
          url: repo.html_url,
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
          license: repo.license?.name || null
        };
      })
      .sort((a, b) => {
        // 按优先级和更新时间排序
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
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEBSITE_URL = process.env.WEBSITE_URL || 'https://home.gqy20.top';
const REPORTS_DIR = './performance-reports';
const HISTORY_FILE = path.join(REPORTS_DIR, 'performance-history.json');

// 确保报告目录存在
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// 读取历史数据
function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (error) {
      console.warn('无法读取历史数据:', error.message);
    }
  }
  return [];
}

// 保存历史数据
function saveHistory(history) {
  // 只保留最近30天的数据
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filteredHistory = history.filter(entry =>
    new Date(entry.timestamp) > thirtyDaysAgo
  );

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(filteredHistory, null, 2));
}

// 运行 Lighthouse 分析
async function runLighthouseAnalysis(formFactor = 'mobile') {
  console.log(`🚀 运行 Lighthouse 分析 (${formFactor})...`);

  const reportPath = path.join(REPORTS_DIR, `lighthouse-${formFactor}.json`);

  try {
    execSync(`lighthouse "${WEBSITE_URL}" --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" --form-factor=${formFactor} --output=json --output-path="${reportPath}"`, {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    return report;
  } catch (error) {
    console.error(`❌ Lighthouse 分析失败 (${formFactor}):`, error.message);
    throw error;
  }
}

// 提取关键指标
function extractKeyMetrics(report, formFactor) {
  const categories = report.categories;
  const audits = report.audits;

  return {
    formFactor,
    timestamp: new Date().toISOString(),
    url: report.finalDisplayedUrl,
    scores: {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100)
    },
    coreWebVitals: {
      firstContentfulPaint: audits['first-contentful-paint'].numericValue,
      largestContentfulPaint: audits['largest-contentful-paint'].numericValue,
      cumulativeLayoutShift: audits['cumulative-layout-shift'].numericValue,
      totalBlockingTime: audits['total-blocking-time'].numericValue,
      speedIndex: audits['speed-index'].numericValue
    },
    opportunities: getOpportunities(report),
    diagnostics: getDiagnostics(report)
  };
}

// 获取优化机会
function getOpportunities(report) {
  const opportunities = [];

  // 检查关键性能审计
  if (report.audits['largest-contentful-paint'].score < 0.9) {
    opportunities.push({
      title: '优化最大内容绘制时间',
      description: 'LCP 过慢，建议优化图片和关键资源加载',
      impact: 'high',
      auditId: 'largest-contentful-paint'
    });
  }

  if (report.audits['first-contentful-paint'].score < 0.9) {
    opportunities.push({
      title: '优化首次内容绘制',
      description: 'FCP 过慢，建议减少服务器响应时间',
      impact: 'high',
      auditId: 'first-contentful-paint'
    });
  }

  if (report.audits['cumulative-layout-shift'].score < 0.9) {
    opportunities.push({
      title: '减少布局偏移',
      description: 'CLS 过高，建议为图片和广告设置尺寸',
      impact: 'medium',
      auditId: 'cumulative-layout-shift'
    });
  }

  if (report.audits['total-blocking-time'].score < 0.9) {
    opportunities.push({
      title: '减少主线程阻塞',
      description: 'TBT 过长，建议优化 JavaScript 执行',
      impact: 'high',
      auditId: 'total-blocking-time'
    });
  }

  return opportunities;
}

// 获取诊断信息
function getDiagnostics(report) {
  const diagnostics = [];

  // DOM 大小
  const domSize = report.audits['dom-size'];
  if (domSize && domSize.score < 0.9) {
    diagnostics.push({
      type: 'dom-size',
      message: `DOM 节点过多: ${domSize.details.items[0].value} 个节点`,
      impact: 'medium'
    });
  }

  // 网络请求
  const networkRequests = report.audits['network-requests'];
  if (networkRequests && networkRequests.details) {
    const totalRequests = networkRequests.details.items.length;
    if (totalRequests > 50) {
      diagnostics.push({
        type: 'network-requests',
        message: `网络请求过多: ${totalRequests} 个请求`,
        impact: 'medium'
      });
    }
  }

  return diagnostics;
}

// 生成 Markdown 报告
function generateMarkdownReport(currentData, historyData) {
  const mobileData = currentData.find(d => d.formFactor === 'mobile');
  const desktopData = currentData.find(d => d.formFactor === 'desktop');

  if (!mobileData || !desktopData) {
    throw new Error('缺少必要的性能数据');
  }

  let report = `# 🚀 网站性能分析报告

**生成时间:** ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
**测试网站:** ${WEBSITE_URL}

## 📊 性能评分概览

| 设备 | 性能 | 可访问性 | 最佳实践 | SEO | 状态 |
|------|------|----------|----------|-----|------|
| 📱 移动端 | ${mobileData.scores.performance}/100 | ${mobileData.scores.accessibility}/100 | ${mobileData.scores.bestPractices}/100 | ${mobileData.scores.seo}/100 | ${getPerformanceStatus(mobileData.scores.performance)} |
| 🖥️ 桌面端 | ${desktopData.scores.performance}/100 | ${desktopData.scores.accessibility}/100 | ${desktopData.scores.bestPractices}/100 | ${desktopData.scores.seo}/100 | ${getPerformanceStatus(desktopData.scores.performance)} |

## 🎯 Core Web Vitals (移动端)

| 指标 | 数值 | 目标 | 状态 |
|------|------|------|------|
| 首次内容绘制 (FCP) | ${formatTime(mobileData.coreWebVitals.firstContentfulPaint)} | < 1.8秒 | ${getVitalStatus(mobileData.coreWebVitals.firstContentfulPaint, 1800)} |
| 最大内容绘制 (LCP) | ${formatTime(mobileData.coreWebVitals.largestContentfulPaint)} | < 2.5秒 | ${getVitalStatus(mobileData.coreWebVitals.largestContentfulPaint, 2500)} |
| 累积布局偏移 (CLS) | ${mobileData.coreWebVitals.cumulativeLayoutShift.toFixed(3)} | < 0.1 | ${getVitalStatus(mobileData.coreWebVitals.cumulativeLayoutShift, 0.1)} |
| 总阻塞时间 (TBT) | ${formatTime(mobileData.coreWebVitals.totalBlockingTime)} | < 200ms | ${getVitalStatus(mobileData.coreWebVitals.totalBlockingTime, 200)} |
| 速度指数 | ${formatTime(mobileData.coreWebVitals.speedIndex)} | < 3.4秒 | ${getVitalStatus(mobileData.coreWebVitals.speedIndex, 3400)} |
`;

  // 添加历史趋势
  if (historyData.length > 0) {
    report += generateTrendSection(mobileData, historyData);
  }

  // 添加优化建议
  if (mobileData.opportunities.length > 0) {
    report += `
## 💡 优化建议

`;
    mobileData.opportunities.forEach((opp, index) => {
      const impactIcon = opp.impact === 'high' ? '🔴' : opp.impact === 'medium' ? '🟡' : '🟢';
      report += `${index + 1}. ${impactIcon} **${opp.title}**
   - ${opp.description}
   - 影响: ${opp.impact === 'high' ? '高' : opp.impact === 'medium' ? '中' : '低'}

`;
    });
  }

  // 添加诊断信息
  if (mobileData.diagnostics.length > 0) {
    report += `
## 🔍 技术诊断

`;
    mobileData.diagnostics.forEach((diag, index) => {
      const impactIcon = diag.impact === 'high' ? '🔴' : diag.impact === 'medium' ? '🟡' : '🟢';
      report += `${index + 1}. ${impactIcon} ${diag.message}

`;
    });
  }

  report += `
---

*此报告由 GitHub Actions 自动生成*
`;

  return report;
}

// 获取性能状态
function getPerformanceStatus(score) {
  if (score >= 90) return '🟢 优秀';
  if (score >= 70) return '🟡 良好';
  if (score >= 50) return '🟠 需要改进';
  return '🔴 较差';
}

// 获取指标状态
function getVitalStatus(value, threshold) {
  if (value <= threshold) return '✅ 良好';
  return '⚠️ 需要改进';
}

// 格式化时间
function formatTime(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// 生成趋势分析
function generateTrendSection(currentMobileData, historyData) {
  const mobileHistory = historyData.filter(h => h.formFactor === 'mobile');

  if (mobileHistory.length < 2) {
    return `
## 📈 趋势分析

数据收集中，需要更多历史数据来分析趋势...

`;
  }

  const previousMobileData = mobileHistory[mobileHistory.length - 2];
  const currentScore = currentMobileData.scores.performance;
  const previousScore = previousMobileData.scores.performance;
  const change = currentScore - previousScore;
  const changePercent = ((change / previousScore) * 100).toFixed(1);

  const trendIcon = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
  const changeText = change > 0 ? `提升 ${changePercent}%` : change < 0 ? `下降 ${Math.abs(changePercent)}%` : '保持不变';

  return `
## 📈 趋势分析

### 性能变化趋势
${trendIcon} **移动端性能分数**: ${previousScore} → ${currentScore} (${changeText})

### 历史数据
| 日期 | 移动端性能 | 桌面端性能 |
|------|------------|------------|
${mobileHistory.slice(-5).map(h => {
  const desktopEntry = historyData.find(d => d.formFactor === 'desktop' && d.timestamp === h.timestamp);
  const desktopScore = desktopEntry ? desktopEntry.scores.performance : 'N/A';
  const date = new Date(h.timestamp).toLocaleDateString('zh-CN');
  return `| ${date} | ${h.scores.performance}/100 | ${desktopScore}/100 |`;
}).join('\n')}

`;
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始网站性能分析...');

    // 运行分析
    const mobileReport = await runLighthouseAnalysis('mobile');
    const desktopReport = await runLighthouseAnalysis('desktop');

    // 提取数据
    const currentData = [
      extractKeyMetrics(mobileReport, 'mobile'),
      extractKeyMetrics(desktopReport, 'desktop')
    ];

    // 读取历史数据
    const historyData = loadHistory();

    // 添加当前数据到历史
    historyData.push(...currentData);
    saveHistory(historyData);

    // 生成报告
    const markdownReport = generateMarkdownReport(currentData, historyData);

    // 保存报告
    const summaryPath = path.join(REPORTS_DIR, 'summary.md');
    fs.writeFileSync(summaryPath, markdownReport);

    // 输出关键指标
    const mobileScore = currentData.find(d => d.formFactor === 'mobile').scores.performance;
    const desktopScore = currentData.find(d => d.formFactor === 'desktop').scores.performance;

    console.log('\n📊 性能分析结果:');
    console.log(`📱 移动端: ${mobileScore}/100 ${getPerformanceStatus(mobileScore)}`);
    console.log(`🖥️ 桌面端: ${desktopScore}/100 ${getPerformanceStatus(desktopScore)}`);
    console.log(`\n📄 详细报告已保存到: ${summaryPath}`);

    // 设置退出码（用于 CI/CD 判断）
    if (mobileScore < 50 || desktopScore < 50) {
      console.log('\n❌ 性能分数过低，建议立即优化');
      process.exit(1);
    } else if (mobileScore < 70 || desktopScore < 70) {
      console.log('\n⚠️ 性能有待改进，建议优化');
      process.exit(2);
    } else {
      console.log('\n✅ 性能表现良好');
    }

  } catch (error) {
    console.error('❌ 分析失败:', error.message);
    process.exit(3);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, runLighthouseAnalysis, extractKeyMetrics, generateMarkdownReport };
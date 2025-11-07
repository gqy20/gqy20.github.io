import React from 'react'
import PrismCodeBlock from './components/PrismCodeBlock'

// 测试不同语言的代码高亮
const TestCodeHighlight = () => {
  const testCodes = [
    {
      language: 'css',
      code: `:root {
  --primary-color: #2563eb;
  --bg-color: #ffffff;
}`
    },
    {
      language: 'javascript',
      code: `const fetchGitHubProjects = async () => {
  const response = await fetch('https://api.github.com/users/gqy20/repos');
  return response.json();
};`
    },
    {
      language: 'jsx',
      code: `<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <h1>Hello World</h1>
</motion.div>`
    },
    {
      language: 'python',
      code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)`
    }
  ]

  return (
    <div style={{ padding: '20px' }}>
      <h1>代码高亮测试</h1>
      {testCodes.map((test, index) => (
        <div key={index} style={{ marginBottom: '20px' }}>
          <h3>{test.language.toUpperCase()} 代码:</h3>
          <PrismCodeBlock className={`language-${test.language}`}>
            {test.code}
          </PrismCodeBlock>
        </div>
      ))}
    </div>
  )
}

export default TestCodeHighlight
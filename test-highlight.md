# 代码高亮测试

这是一个测试文件，用于验证 Shiki 代码高亮功能。

## JavaScript 代码

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log('Fibonacci of 10:', result);
```

## Python 代码

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

result = fibonacci(10)
print(f"Fibonacci of 10: {result}")
```

## CSS 代码

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## JSON 代码

```json
{
  "name": "test-project",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

现在让我们测试这个代码高亮功能！
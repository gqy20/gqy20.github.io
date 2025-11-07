# 代码高亮测试

## CSS代码测试

```css
:root {
  --primary-color: #2563eb;
  --bg-color: #ffffff;
}
```

## JavaScript代码测试

```javascript
const fetchGitHubProjects = async () => {
  const response = await fetch('https://api.github.com/users/gqy20/repos');
  return response.json();
};
```

## JSX代码测试

```jsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <h1>Hello World</h1>
</motion.div>
```

## Python代码测试

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

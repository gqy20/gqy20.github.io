import React, { useState } from 'react'
import Badge from './Badge'
import Button from './Button'

const ComponentTest = () => {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleButtonClick = () => {
    setIsLoading(true)
    setTimeout(() => {
      setCount(prev => prev + 1)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div style={{
      padding: '2rem',
      background: 'var(--bg-light)',
      borderRadius: '12px',
      margin: '2rem',
      border: '1px solid var(--border-color)'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: 'var(--text-color)'
      }}>
        shadcn 组件集成测试
      </h2>

      {/* Badge 测试区域 */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--text-color)'
        }}>
          Badge 组件测试
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <Badge variant="default" className="badge-number">42</Badge>
          <Badge variant="success" className="badge-with-icon">
            ✓ 已完成
          </Badge>
          <Badge variant="warning" className="badge-with-icon">
            ⚠ 警告
          </Badge>
          <Badge variant="info" className="badge-with-icon">
            ℹ 信息
          </Badge>
        </div>
      </div>

      {/* Button 测试区域 */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--text-color)'
        }}>
          Button 组件测试
        </h3>
        <div className="button-group" style={{ marginBottom: '1rem' }}>
          <Button variant="default" onClick={handleButtonClick} disabled={isLoading}>
            {isLoading ? '加载中...' : `点击计数: ${count}`}
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="button-group" style={{ marginBottom: '1rem' }}>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="info">Info</Button>
          <Button variant="github">GitHub</Button>
          <Button variant="contact">Contact</Button>
        </div>
        <div className="button-group" style={{ marginBottom: '1rem' }}>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
          <Button size="icon">🚀</Button>
        </div>
        <div className="button-group">
          <Button variant="default" className="shine">Shine Effect</Button>
          <Button variant="success" className="pulse">Pulse Effect</Button>
          <Button variant="info" className="float">Float Effect</Button>
        </div>
      </div>

      {/* 组合测试 */}
      <div>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--text-color)'
        }}>
          组合组件测试
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <Button variant="default">
            <Badge variant="secondary" style={{ marginRight: '0.5rem' }}>3</Badge>
            通知
          </Button>
          <Button variant="success">
            <Badge variant="default" style={{ marginRight: '0.5rem' }}>新</Badge>
            发布
          </Button>
          <Button variant="outline">
            <Badge variant="warning" style={{ marginRight: '0.5rem' }}>!</Badge>
            警告
          </Button>
        </div>
      </div>

      {/* 状态信息 */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'var(--bg-color)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
          color: 'var(--text-color)'
        }}>
          测试状态
        </h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: 0 }}>
          点击计数: {count} | 加载状态: {isLoading ? '是' : '否'}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: '4px 0 0 0' }}>
          组件样式应与现有设计系统完全协调，支持深色模式切换
        </p>
      </div>
    </div>
  )
}

export default ComponentTest
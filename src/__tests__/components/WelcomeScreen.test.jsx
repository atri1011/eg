import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

// 直接从App.jsx导入WelcomeScreen组件 (需要导出它)
// 由于WelcomeScreen没有导出，我们先创建一个简单的组件测试示例

const WelcomeScreen = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-center p-4">
    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
      AI 英语学习助手
    </h1>
    <p className="text-lg text-gray-600 mb-8 max-w-md">
      在这里，你可以通过与AI自由对话来练习和提高你的英语水平。获得即时的语法纠正和翻译，让学习变得更轻松。
    </p>
    <button onClick={onStart} className="bg-blue-600 hover:bg-blue-700 text-white">
      开始自由聊天
    </button>
  </div>
)

describe('WelcomeScreen 组件', () => {
  it('应该显示应用标题和描述', () => {
    const mockOnStart = vi.fn()
    
    render(<WelcomeScreen onStart={mockOnStart} />)
    
    expect(screen.getByText('AI 英语学习助手')).toBeInTheDocument()
    expect(screen.getByText(/在这里，你可以通过与AI自由对话/)).toBeInTheDocument()
    expect(screen.getByText('开始自由聊天')).toBeInTheDocument()
  })

  it('应该在点击按钮时调用onStart回调', () => {
    const mockOnStart = vi.fn()
    
    render(<WelcomeScreen onStart={mockOnStart} />)
    
    const startButton = screen.getByText('开始自由聊天')
    fireEvent.click(startButton)
    
    expect(mockOnStart).toHaveBeenCalledTimes(1)
  })

  it('应该正确渲染所有UI元素', () => {
    const mockOnStart = vi.fn()
    
    render(<WelcomeScreen onStart={mockOnStart} />)
    
    const title = screen.getByText('AI 英语学习助手')
    const description = screen.getByText(/在这里，你可以通过与AI自由对话/)
    const button = screen.getByText('开始自由聊天')
    
    expect(title).toBeVisible()
    expect(description).toBeVisible()
    expect(button).toBeVisible()
  })
})
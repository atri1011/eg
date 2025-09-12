import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../App'

// Mock the AuthProvider and useAuth hook
const mockUseAuth = vi.fn()
vi.mock('../hooks/useAuth.jsx', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockUseAuth()
}))

// Mock the child components
vi.mock('../components/ChatPage', () => ({
  default: () => <div data-testid="chat-page">Chat Page</div>
}))

vi.mock('../components/AuthForm', () => ({
  default: () => <div data-testid="auth-form">Auth Form</div>
}))

describe('App 组件', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('应该在加载状态下显示加载指示器', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true
    })

    render(<App />)
    
    expect(screen.getByText('加载中...')).toBeInTheDocument()
    expect(screen.getByText('加载中...')).toBeVisible()
  })

  it('应该在未认证时显示登录表单', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    })

    render(<App />)
    
    expect(screen.getByTestId('auth-form')).toBeInTheDocument()
    expect(screen.getByText('Auth Form')).toBeVisible()
  })

  it('应该在已认证时显示聊天页面', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false
    })

    render(<App />)
    
    expect(screen.getByTestId('chat-page')).toBeInTheDocument()
    expect(screen.getByText('Chat Page')).toBeVisible()
  })

  it('应该正确渲染应用结构', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    })

    const { container } = render(<App />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, beforeEach, afterEach } from 'vitest'
import { AuthProvider, useAuth } from '../../hooks/useAuth'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock fetch
global.fetch = vi.fn()

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.fn()
console.error = mockConsoleError

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AuthProvider 初始化', () => {
    it('应该在没有token时正确初始化', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('应该在有token时验证token', async () => {
      const mockToken = 'test-token'
      mockLocalStorage.getItem.mockReturnValue(mockToken)
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: 1, username: 'testuser' }
        })
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      expect(result.current.token).toBe(mockToken)
      
      await waitFor(() => {
        expect(result.current.user).toEqual({ id: 1, username: 'testuser' })
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.isLoading).toBe(false)
      })

      expect(fetch).toHaveBeenCalledWith('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      })
    })

    it('应该在token验证失败时登出', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-token')
      
      fetch.mockResolvedValueOnce({
        ok: false
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.token).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken')
    })
  })

  describe('login 功能', () => {
    it('应该成功登录并设置用户信息', async () => {
      const mockUser = { id: 1, username: 'testuser' }
      const mockToken = 'new-token'

      fetch.mockResolvedValueOnce({
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({
          success: true,
          user: mockUser,
          token: mockToken
        })
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      let loginResult
      await act(async () => {
        loginResult = await result.current.login('testuser', 'password')
      })

      expect(loginResult).toEqual({ success: true })
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe(mockToken)
      expect(result.current.isAuthenticated).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', mockToken)
    })

    it('应该处理登录失败', async () => {
      fetch.mockResolvedValueOnce({
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({
          success: false,
          error: '用户名或密码错误'
        })
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      let loginResult
      await act(async () => {
        loginResult = await result.current.login('wronguser', 'wrongpass')
      })

      expect(loginResult).toEqual({
        success: false,
        error: '用户名或密码错误'
      })
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('应该处理服务器响应格式错误', async () => {
      fetch.mockResolvedValueOnce({
        headers: new Map([['content-type', 'text/html']]),
        status: 500,
        statusText: 'Internal Server Error'
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      let loginResult
      await act(async () => {
        loginResult = await result.current.login('user', 'pass')
      })

      expect(loginResult).toEqual({
        success: false,
        error: '服务器响应格式错误，请稍后重试'
      })
      expect(mockConsoleError).toHaveBeenCalledWith(
        '服务器返回非JSON响应:', 500, 'Internal Server Error'
      )
    })

    it('应该处理网络错误和JSON解析错误', async () => {
      fetch.mockRejectedValueOnce(new SyntaxError('Unexpected token in JSON'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      let loginResult
      await act(async () => {
        loginResult = await result.current.login('user', 'pass')
      })

      expect(loginResult).toEqual({
        success: false,
        error: '服务器响应格式错误，请检查网络连接'
      })
    })
  })

  describe('register 功能', () => {
    it('应该成功注册并设置用户信息', async () => {
      const mockUser = { id: 2, username: 'newuser', email: 'new@test.com' }
      const mockToken = 'register-token'

      fetch.mockResolvedValueOnce({
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({
          success: true,
          user: mockUser,
          token: mockToken
        })
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      let registerResult
      await act(async () => {
        registerResult = await result.current.register('newuser', 'new@test.com', 'password')
      })

      expect(registerResult).toEqual({ success: true })
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe(mockToken)
      expect(result.current.isAuthenticated).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', mockToken)
    })

    it('应该处理注册失败', async () => {
      fetch.mockResolvedValueOnce({
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({
          success: false,
          error: '用户名已存在'
        })
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      let registerResult
      await act(async () => {
        registerResult = await result.current.register('existinguser', 'test@test.com', 'password')
      })

      expect(registerResult).toEqual({
        success: false,
        error: '用户名已存在'
      })
      expect(result.current.user).toBeNull()
    })
  })

  describe('logout 功能', () => {
    it('应该正确登出用户', async () => {
      // 先设置一个已登录状态
      mockLocalStorage.getItem.mockReturnValue('test-token')
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: 1, username: 'testuser' }
        })
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      // 等待初始化完成
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // 执行登出
      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken')
    })
  })

  describe('updateProfile 功能', () => {
    it('应该成功更新用户资料', async () => {
      // 先设置已登录状态
      mockLocalStorage.getItem.mockReturnValue('test-token')
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: { id: 1, username: 'testuser' } })
        })
        .mockResolvedValueOnce({
          json: async () => ({
            success: true,
            user: { id: 1, username: 'testuser', email: 'updated@test.com' }
          })
        })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      let updateResult
      await act(async () => {
        updateResult = await result.current.updateProfile({ email: 'updated@test.com' })
      })

      expect(updateResult).toEqual({ success: true })
      expect(result.current.user.email).toBe('updated@test.com')
    })

    it('应该处理更新失败', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-token')
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: { id: 1, username: 'testuser' } })
        })
        .mockResolvedValueOnce({
          json: async () => ({
            success: false,
            error: '邮箱格式错误'
          })
        })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      let updateResult
      await act(async () => {
        updateResult = await result.current.updateProfile({ email: 'invalid-email' })
      })

      expect(updateResult).toEqual({
        success: false,
        error: '邮箱格式错误'
      })
    })
  })

  describe('getAuthHeaders 功能', () => {
    it('应该在有token时返回Authorization头', () => {
      mockLocalStorage.getItem.mockReturnValue('test-token')

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      const headers = result.current.getAuthHeaders()
      expect(headers).toEqual({
        'Authorization': 'Bearer test-token'
      })
    })

    it('应该在没有token时返回空对象', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      const headers = result.current.getAuthHeaders()
      expect(headers).toEqual({})
    })
  })

  describe('useAuth Hook 错误处理', () => {
    it('应该在Provider外使用时抛出错误', () => {
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
    })
  })

  describe('验证token网络错误处理', () => {
    it('应该处理verifyToken时的网络错误', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-token')
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.token).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockConsoleError).toHaveBeenCalledWith('令牌验证失败:', expect.any(Error))
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken')
    })
  })
})
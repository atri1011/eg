import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

const AuthForm = () => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 登录表单状态
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: ''
  });

  // 注册表单状态
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!loginData.identifier.trim() || !loginData.password) {
      setError('请填写完整的登录信息');
      setIsLoading(false);
      return;
    }

    const result = await login(loginData.identifier, loginData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 表单验证
    if (!registerData.username.trim() || !registerData.email.trim() || 
        !registerData.password || !registerData.confirmPassword) {
      setError('请填写完整的注册信息');
      setIsLoading(false);
      return;
    }

    if (registerData.username.length < 2 || registerData.username.length > 50) {
      setError('用户名长度需在2-50个字符之间');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(registerData.email)) {
      setError('邮箱格式不正确');
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 8) {
      setError('密码至少需要8个字符');
      setIsLoading(false);
      return;
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(registerData.password)) {
      setError('密码必须包含字母和数字');
      setIsLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('两次输入的密码不一致');
      setIsLoading(false);
      return;
    }

    const result = await register(
      registerData.username, 
      registerData.email, 
      registerData.password
    );

    if (!result.success) {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const updateLoginData = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const updateRegisterData = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">AI 英语学习助手</h1>
          <p className="text-gray-600 mt-2">登录或注册开始你的学习之旅</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">欢迎</CardTitle>
            <CardDescription className="text-center">
              选择登录或注册账户
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  登录
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center">
                  <UserPlus className="w-4 h-4 mr-2" />
                  注册
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mt-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">用户名或邮箱</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="identifier"
                        type="text"
                        placeholder="请输入用户名或邮箱"
                        value={loginData.identifier}
                        onChange={(e) => updateLoginData('identifier', e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="请输入密码"
                        value={loginData.password}
                        onChange={(e) => updateLoginData('password', e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? '登录中...' : '登录'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="请输入用户名（2-50个字符）"
                        value={registerData.username}
                        onChange={(e) => updateRegisterData('username', e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="请输入邮箱地址"
                        value={registerData.email}
                        onChange={(e) => updateRegisterData('email', e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="registerPassword"
                        type="password"
                        placeholder="至少8位字符，包含字母和数字"
                        value={registerData.password}
                        onChange={(e) => updateRegisterData('password', e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="请再次输入密码"
                        value={registerData.confirmPassword}
                        onChange={(e) => updateRegisterData('confirmPassword', e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? '注册中...' : '注册'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>通过注册，你同意遵守我们的使用条款</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
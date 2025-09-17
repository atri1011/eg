import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Settings, RefreshCw } from 'lucide-react';

const SettingsDialog = ({ config, setConfig, saveConfig, availableModels, isLoadingModels, fetchModels, setDefaultModels, hasServerDefaults, isConfigValid }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleApiBaseChange = (newApiBase) => {
    setConfig({ ...config, apiBase: newApiBase });
    // 当API Base URL变化时，自动更新默认模型列表
    if (setDefaultModels) {
      setDefaultModels(newApiBase);
    }
  };

  const handleSave = () => {
    saveConfig();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          设置
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>配置设置</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api">API配置</TabsTrigger>
            <TabsTrigger value="chat">对话设置</TabsTrigger>
          </TabsList>
          <TabsContent value="api" className="space-y-4">
            {hasServerDefaults && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✓ 服务器已配置默认AI设置，您可以直接使用，也可以自定义覆盖默认配置。
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="apiBase">API Base URL</Label>
              <Input
                id="apiBase"
                placeholder="https://api.openai.com/v1"
                value={config.apiBase}
                onChange={(e) => handleApiBaseChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="model">模型</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchModels}
                  disabled={isLoadingModels || !config.apiKey}
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isLoadingModels ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </div>
              <Select value={config.model} onValueChange={(value) => setConfig({ ...config, model: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customModel">自定义模型 (可选)</Label>
              <Input
                id="customModel"
                placeholder="输入自定义模型名称，如 claude-3-sonnet"
                value={config.customModel}
                onChange={(e) => setConfig({ ...config, customModel: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                如果填写，将优先使用自定义模型而不是上面选择的模型
              </p>
            </div>
          </TabsContent>
          <TabsContent value="chat" className="space-y-4">
            <div>
              <Label htmlFor="language">语言偏好</Label>
              <Select value={config.languagePreference} onValueChange={(value) => setConfig({ ...config, languagePreference: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bilingual">中英双语</SelectItem>
                  <SelectItem value="chinese">主要中文</SelectItem>
                  <SelectItem value="english">主要英文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
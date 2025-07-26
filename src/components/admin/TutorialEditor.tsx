import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  BookOpen, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Eye,
  EyeOff
} from "lucide-react";

// 教程步骤类型定义
interface TutorialStep {
  title: string;
  items: string[];
  type?: 'info' | 'warning' | 'success' | 'default';
}

// 教程内容类型定义
interface TutorialContent {
  title: string;
  steps: TutorialStep[];
}

interface TutorialEditorProps {
  value: TutorialContent;
  onChange: (content: TutorialContent) => void;
  className?: string;
}

export const TutorialEditor: React.FC<TutorialEditorProps> = ({
  value,
  onChange,
  className = ""
}) => {
  const [previewMode, setPreviewMode] = useState(false);

  // 添加新步骤
  const addStep = () => {
    const newStep: TutorialStep = {
      title: '新步骤',
      items: [''],
      type: 'default'
    };
    onChange({
      ...value,
      steps: [...value.steps, newStep]
    });
  };

  // 删除步骤
  const removeStep = (stepIndex: number) => {
    onChange({
      ...value,
      steps: value.steps.filter((_, index) => index !== stepIndex)
    });
  };

  // 更新步骤
  const updateStep = (stepIndex: number, updatedStep: TutorialStep) => {
    const newSteps = [...value.steps];
    newSteps[stepIndex] = updatedStep;
    onChange({
      ...value,
      steps: newSteps
    });
  };

  // 添加步骤项
  const addStepItem = (stepIndex: number) => {
    const step = value.steps[stepIndex];
    updateStep(stepIndex, {
      ...step,
      items: [...step.items, '']
    });
  };

  // 删除步骤项
  const removeStepItem = (stepIndex: number, itemIndex: number) => {
    const step = value.steps[stepIndex];
    updateStep(stepIndex, {
      ...step,
      items: step.items.filter((_, index) => index !== itemIndex)
    });
  };

  // 更新步骤项
  const updateStepItem = (stepIndex: number, itemIndex: number, itemValue: string) => {
    const step = value.steps[stepIndex];
    const newItems = [...step.items];
    newItems[itemIndex] = itemValue;
    updateStep(stepIndex, {
      ...step,
      items: newItems
    });
  };

  // 获取步骤图标
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  // 获取步骤颜色
  const getStepColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (previewMode) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            教程预览
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(false)}
          >
            <Eye className="h-4 w-4 mr-1" />
            编辑模式
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-900 text-center">
              {value.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {value.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="space-y-4">
                  <h3 className="font-medium flex items-center space-x-2">
                    {getStepIcon(step.type || 'default')}
                    <span>{step.title}</span>
                  </h3>
                  <div className="ml-6 space-y-2">
                    {step.items.map((item, itemIndex) => (
                      <p key={itemIndex} className="flex items-center space-x-2 text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        <span>{item}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 flex items-center">
          <BookOpen className="h-4 w-4 mr-2" />
          教程内容编辑
        </h4>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(true)}
          >
            <EyeOff className="h-4 w-4 mr-1" />
            预览效果
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addStep}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加步骤
          </Button>
        </div>
      </div>

      {/* 教程标题 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">教程标题</label>
        <Input
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="请输入教程标题"
        />
      </div>

      {/* 教程步骤 */}
      <div className="space-y-4">
        {value.steps.map((step, stepIndex) => (
          <Card key={stepIndex} className={`${getStepColor(step.type || 'default')}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  <span className="text-sm font-medium">步骤 {stepIndex + 1}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(stepIndex)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 步骤标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">步骤标题</label>
                <Input
                  value={step.title}
                  onChange={(e) => updateStep(stepIndex, { ...step, title: e.target.value })}
                  placeholder="请输入步骤标题"
                />
              </div>

              {/* 步骤类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">步骤类型</label>
                <select
                  value={step.type || 'default'}
                  onChange={(e) => updateStep(stepIndex, { ...step, type: e.target.value as 'info' | 'warning' | 'success' | 'default' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">默认</option>
                  <option value="info">信息提示</option>
                  <option value="warning">注意事项</option>
                  <option value="success">优惠信息</option>
                </select>
              </div>

              {/* 步骤内容 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">步骤内容</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addStepItem(stepIndex)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加项目
                  </Button>
                </div>
                <div className="space-y-2">
                  {step.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-2">
                      <Textarea
                        value={item}
                        onChange={(e) => updateStepItem(stepIndex, itemIndex, e.target.value)}
                        placeholder="请输入步骤内容"
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStepItem(stepIndex, itemIndex)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {value.steps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>暂无教程步骤，点击"添加步骤"开始创建</p>
        </div>
      )}
    </div>
  );
}; 
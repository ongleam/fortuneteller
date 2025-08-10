'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { submitReport } from '@/lib/interfaces/actions/report';
import { toast } from '@/components/toast';
import { sendSlackMessage } from '@/lib/interfaces/actions/slack';
import { NOTION_SELECT_OPTIONS, ReportType } from '@/lib/shared/types/notion';

// SelectItem들을 위한 데이터 배열 정의
const reportTypeOptions = [
  { value: 'contact', label: '☕️ Coffee Chat' },
  { value: 'feature', label: '💡 Feature Request' },
  { value: 'bug', label: '❗️ Bug Report' },
  { value: 'other', label: '💬 Other' },
];

interface ReportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chatId?: string;
}

interface ReportFormData {
  title: string;
  description: string;
  type: string;
  chatId?: string;
}

export function formatSlackMessage(report: ReportFormData) {
  return `
  *Title*: ${report.title}\n*Type*: ${NOTION_SELECT_OPTIONS.type[report.type as ReportType]}\n*Description*: ${report.description}\n<https://www.notion.so/ongleam/${process.env.NEXT_PUBLIC_NOTION_DATABASE_ID}|Go to Notion>
  `;
}

export function ReportModal({ isOpen, onOpenChange, chatId }: ReportModalProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    title: '',
    description: '',
    type: 'contact',
    chatId: chatId,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // chatId가 변경될 때 formData 업데이트
  useEffect(() => {
    if (chatId) {
      setFormData((prev) => ({
        ...prev,
        chatId,
      }));
    }
  }, [chatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      // 서버 액션을 사용하여 리포트 제출
      const result = await submitReport(formData as any);
      const slackMessage = formatSlackMessage(formData);
      await sendSlackMessage(slackMessage);
      if (result.success) {
        toast({
          type: 'success',
          description: 'Report submitted successfully.',
        });

        // 모달 닫기
        onOpenChange(false);

        // 폼 초기화
        setFormData({
          title: '',
          description: '',
          type: 'contact',
          chatId: chatId,
        });
      } else {
        toast({
          type: 'error',
          description: result.error || 'Failed to submit report.',
        });
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        type: 'error',
        description: 'An error occurred while submitting the report.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription>
              Please let me know anything
              <br />I will get back to you in real quick!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Type
              </label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full"
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

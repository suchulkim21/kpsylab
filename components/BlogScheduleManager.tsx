'use client';

import { useEffect, useState } from 'react';
import { Calendar, Plus, Edit, Trash2, CheckCircle, Clock, XCircle, FileText, AlertCircle, Download } from 'lucide-react';
import { showToast } from '@/lib/utils/errorHandler';

interface ContentSchedule {
  id: number;
  topic: string;
  category?: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'published' | 'cancelled';
  scheduled_date?: string;
  publish_date?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  published_post_id?: number;
}

interface BlogScheduleManagerProps {
  adminKey: string;
}

export default function BlogScheduleManager({ adminKey }: BlogScheduleManagerProps) {
  const [schedules, setSchedules] = useState<ContentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ContentSchedule | null>(null);
  const [filter, setFilter] = useState<{
    status?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const [formData, setFormData] = useState({
    topic: '',
    category: '',
    status: 'draft' as ContentSchedule['status'],
    scheduled_date: '',
    priority: 'medium' as ContentSchedule['priority'],
    notes: '',
    assigned_to: '',
  });

  useEffect(() => {
    fetchSchedules();
  }, [filter]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.category) params.append('category', filter.category);
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);

      const response = await fetch(`/api/admin/blog/schedule?${params.toString()}`, {
        headers: { 'x-admin-key': adminKey },
      });

      const data = await response.json();
      if (data.success) {
        setSchedules(data.schedule || []);
      } else {
        showToast('일정을 불러오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      showToast('일정을 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSchedule
        ? `/api/admin/blog/schedule/${editingSchedule.id}`
        : '/api/admin/blog/schedule';
      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        showToast(editingSchedule ? '일정이 수정되었습니다.' : '일정이 생성되었습니다.', 'success');
        setShowForm(false);
        setEditingSchedule(null);
        setFormData({
          topic: '',
          category: '',
          status: 'draft',
          scheduled_date: '',
          priority: 'medium',
          notes: '',
          assigned_to: '',
        });
        fetchSchedules();
      } else {
        showToast(data.error || '일정 저장에 실패했습니다.', 'error');
      }
    } catch (error) {
      showToast('일정 저장에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 이 일정을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/blog/schedule/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });

      const data = await response.json();
      if (data.success) {
        showToast('일정이 삭제되었습니다.', 'success');
        fetchSchedules();
      } else {
        showToast(data.error || '일정 삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      showToast('일정 삭제에 실패했습니다.', 'error');
    }
  };

  const handleEdit = (schedule: ContentSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      topic: schedule.topic,
      category: schedule.category || '',
      status: schedule.status,
      scheduled_date: schedule.scheduled_date || '',
      priority: schedule.priority,
      notes: schedule.notes || '',
      assigned_to: schedule.assigned_to || '',
    });
    setShowForm(true);
  };

  const getStatusIcon = (status: ContentSchedule['status']) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'scheduled':
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ContentSchedule['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityColor = (priority: ContentSchedule['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 필터 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            콘텐츠 일정 관리
          </h3>
          <p className="text-gray-400 text-sm mt-1">블로그 포스트 발행 일정을 관리합니다</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/blog/export?type=schedule', {
                  headers: { 'x-admin-key': adminKey },
                });
                if (response.ok) {
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `blog-schedule-${new Date().toISOString().split('T')[0]}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                  showToast('일정 데이터가 내보내졌습니다.', 'success');
                } else {
                  showToast('내보내기에 실패했습니다.', 'error');
                }
              } catch (error) {
                showToast('내보내기에 실패했습니다.', 'error');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV 내보내기
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingSchedule(null);
              setFormData({
                topic: '',
                category: '',
                status: 'draft',
                scheduled_date: '',
                priority: 'medium',
                notes: '',
                assigned_to: '',
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 일정 추가
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filter.status || ''}
            onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="">전체 상태</option>
            <option value="draft">초안</option>
            <option value="scheduled">예약됨</option>
            <option value="in_progress">진행 중</option>
            <option value="published">발행됨</option>
            <option value="cancelled">취소됨</option>
          </select>
          <input
            type="text"
            placeholder="카테고리"
            value={filter.category || ''}
            onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          />
          <input
            type="date"
            placeholder="시작일"
            value={filter.startDate || ''}
            onChange={(e) => setFilter({ ...filter, startDate: e.target.value || undefined })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          />
          <input
            type="date"
            placeholder="종료일"
            value={filter.endDate || ''}
            onChange={(e) => setFilter({ ...filter, endDate: e.target.value || undefined })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          />
        </div>
      </div>

      {/* 일정 목록 */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        {schedules.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>등록된 일정이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">주제</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">카테고리</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">예약일</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">우선순위</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{schedule.topic}</div>
                      {schedule.notes && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{schedule.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {schedule.category || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusColor(schedule.status)}`}>
                        {getStatusIcon(schedule.status)}
                        {schedule.status === 'draft' ? '초안' :
                         schedule.status === 'scheduled' ? '예약됨' :
                         schedule.status === 'in_progress' ? '진행 중' :
                         schedule.status === 'published' ? '발행됨' : '취소됨'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {schedule.scheduled_date
                        ? new Date(schedule.scheduled_date).toLocaleDateString('ko-KR')
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${getPriorityColor(schedule.priority)}`}>
                        {schedule.priority === 'high' ? '높음' :
                         schedule.priority === 'medium' ? '중간' : '낮음'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                          aria-label="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          aria-label="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 일정 추가/수정 폼 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-white">
                {editingSchedule ? '일정 수정' : '새 일정 추가'}
              </h4>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingSchedule(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  주제 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">카테고리</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">상태</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentSchedule['status'] })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="draft">초안</option>
                    <option value="scheduled">예약됨</option>
                    <option value="in_progress">진행 중</option>
                    <option value="published">발행됨</option>
                    <option value="cancelled">취소됨</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">예약일</label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">우선순위</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as ContentSchedule['priority'] })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">중간</option>
                    <option value="high">높음</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">담당자</label>
                <input
                  type="text"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">메모</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSchedule(null);
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                >
                  {editingSchedule ? '수정' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

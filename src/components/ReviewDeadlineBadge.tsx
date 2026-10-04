import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { ReviewerAssignment } from '../types/journal';

interface ReviewDeadlineBadgeProps {
  assignment?: ReviewerAssignment;
  compact?: boolean;
}

export const ReviewDeadlineBadge: React.FC<ReviewDeadlineBadgeProps> = ({
  assignment,
  compact = false,
}) => {
  if (!assignment || !assignment.name) {
    return null;
  }

  if (assignment.status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-3xs font-extrabold">
        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
        <span>تم التحكيم ({assignment.score ? `${assignment.score}%` : 'مكتمل'})</span>
      </span>
    );
  }

  if (assignment.status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 rounded-lg text-3xs font-extrabold">
        <AlertCircle className="w-3 h-3 text-rose-700" />
        <span>اعتذر عن التحكيم</span>
      </span>
    );
  }

  // Calculate 21-day timeline
  const assignedDate = assignment.assignedDate ? new Date(assignment.assignedDate) : new Date();
  const deadlineDate = assignment.deadline
    ? new Date(assignment.deadline)
    : new Date(assignedDate.getTime() + 21 * 24 * 60 * 60 * 1000);

  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Overdue
    const overdueDays = Math.abs(diffDays);
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-950 border border-rose-400 rounded-lg text-3xs font-extrabold animate-pulse">
        <AlertTriangle className="w-3 h-3 text-rose-700" />
        <span>متأخر بـ {overdueDays} يوم</span>
      </span>
    );
  }

  if (diffDays <= 5) {
    // Urgent
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-950 border border-amber-400 rounded-lg text-3xs font-extrabold">
        <Clock className="w-3 h-3 text-amber-700 animate-spin" />
        <span>عاجل: متبقي {diffDays} {diffDays === 1 ? 'يوم' : 'أيام'}</span>
      </span>
    );
  }

  // Normal remaining
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-3xs font-bold">
      <Clock className="w-3 h-3 text-blue-600" />
      <span>مهلة 21 يوماً (متبقي {diffDays} يوم)</span>
    </span>
  );
};

export type SubstitutionStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface ClassInfo {
  id: string;
  code: string;
  name: string;
  type: 'theory' | 'lab';
}

export interface TimeSlot {
  start: string;
  end: string;
  day: string;
  venue: string;
}

export type TimetableDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface Timetable {
  [key: string]: TimeSlot[];
}

export interface SubstitutionRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  classInfo: ClassInfo;
  date: string;
  reason: string;
  status: SubstitutionStatus;
  acceptorId?: string;
  acceptorName?: string;
  createdAt: any; // Firebase timestamp
  updatedAt?: any; // Firebase timestamp
}

export interface RequestFormProps {
  userId: string;
  userName: string;
  theoryClasses: ClassInfo[];
  labClasses: ClassInfo[];
  timetable: Timetable;
  onRequestCreated?: () => void;
}

export interface RequestListProps {
  userId: string;
  userName: string;
}

export interface RequestTabProps {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
} 
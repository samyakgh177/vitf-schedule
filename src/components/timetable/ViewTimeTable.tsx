import React, { useEffect, useState } from "react";

import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card } from "@/components/ui/card";

type TimeSlot = { start: string; end: string };
type ClassInfo = { code: string; room?: string; instructor?: string; color?: string };
type Timetable = {
  theorySlots: TimeSlot[];
  labSlots: TimeSlot[];
  days: Record<string, { theory: (ClassInfo | null)[]; lab: (ClassInfo | null)[] }>;
};

export const ViewTimetable: React.FC = () => {
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const docRef = doc(db, "faculty", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().timetable) {
          setTimetable(docSnap.data().timetable);
        } else {
          setError("No timetable data found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch timetable");
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!timetable) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-center">
          <p className="text-xl font-semibold">No Timetable</p>
          <p>Please set up your timetable first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Your Timetable</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theory Classes */}
        <Card className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold mb-6 text-blue-600">Theory Classes</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600 sticky left-0 bg-white border-r">
                    Time
                  </th>
                  {Object.keys(timetable.days).map((day) => (
                    <th key={day} className="p-3 text-sm font-semibold text-gray-600 text-center min-w-[120px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timetable.theorySlots.map((slot, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm text-gray-500 whitespace-nowrap sticky left-0 bg-white border-r">
                      {slot.start} - {slot.end}
                    </td>
                    {Object.keys(timetable.days).map((day) => {
                      const classInfo = timetable.days[day].theory[index];
                      return (
                        <td
                          key={`${day}-${index}`}
                          className="p-3 text-center text-sm relative group"
                          style={{
                            backgroundColor: classInfo?.color ? `${classInfo.color}20` : 'transparent'
                          }}
                        >
                          {classInfo ? (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">{classInfo.code}</div>
                              {classInfo.room && (
                                <div className="text-xs text-blue-600">{classInfo.room}</div>
                              )}
                              {classInfo.instructor && (
                                <div className="text-xs text-gray-500 italic">{classInfo.instructor}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Lab Classes */}
        <Card className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold mb-6 text-green-600">Lab Classes</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600 sticky left-0 bg-white border-r">
                    Time
                  </th>
                  {Object.keys(timetable.days).map((day) => (
                    <th key={day} className="p-3 text-sm font-semibold text-gray-600 text-center min-w-[120px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timetable.labSlots.map((slot, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm text-gray-500 whitespace-nowrap sticky left-0 bg-white border-r">
                      {slot.start} - {slot.end}
                    </td>
                    {Object.keys(timetable.days).map((day) => {
                      const classInfo = timetable.days[day].lab[index];
                      return (
                        <td
                          key={`${day}-${index}`}
                          className="p-3 text-center text-sm relative group"
                          style={{
                            backgroundColor: classInfo?.color ? `${classInfo.color}20` : 'transparent'
                          }}
                        >
                          {classInfo ? (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">{classInfo.code}</div>
                              {classInfo.room && (
                                <div className="text-xs text-green-600">{classInfo.room}</div>
                              )}
                              {classInfo.instructor && (
                                <div className="text-xs text-gray-500 italic">{classInfo.instructor}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ViewTimetable;
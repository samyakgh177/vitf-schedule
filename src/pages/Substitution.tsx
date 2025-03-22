import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import RequestForm from "@/components/substitution/RequestForm";
import RequestList from "@/components/substitution/RequestList";
import { ClassInfo } from "@/types/substitution";
import { Loader2 } from "lucide-react";

interface TimetableClassInfo {
  code: string;
  color?: string;
  instructor?: string;
  room?: string;
}

const Substitution: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [theoryClasses, setTheoryClasses] = useState<ClassInfo[]>([]);
  const [labClasses, setLabClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      
      setUserId(user.uid);
      setUserName(user.displayName || user.email || "User");
      
      try {
        // Fetch faculty data including classes and timetable
        const facultyDoc = await getDoc(doc(db, "faculty", user.uid));
        
        if (facultyDoc.exists()) {
          const data = facultyDoc.data();
          
          // Set timetable if it exists
          if (data.timetable) {
            // Timetable not needed
          }
          
          // Extract classes from timetable structure
          if (data.timetable && data.timetable.days) {
            const theory: ClassInfo[] = [];
            const lab: ClassInfo[] = [];
            
            // Days of the week
            const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
            
            days.forEach(day => {
              if (data.timetable.days[day]) {
                // Process theory classes
                if (data.timetable.days[day].theory) {
                  data.timetable.days[day].theory.forEach((classInfo: TimetableClassInfo | null, index: number) => {
                    if (classInfo && classInfo.code) {
                      const exists = theory.some(c => c.code === classInfo.code);
                      if (!exists) {
                        theory.push({
                          id: `theory-${day}-${index}`,
                          code: classInfo.code,
                          name: classInfo.code, // You might want to add a better name if available
                          type: 'theory'
                        });
                      }
                    }
                  });
                }
                
                // Process lab classes
                if (data.timetable.days[day].lab) {
                  data.timetable.days[day].lab.forEach((classInfo: TimetableClassInfo | null, index: number) => {
                    if (classInfo && classInfo.code) {
                      const exists = lab.some(c => c.code === classInfo.code);
                      if (!exists) {
                        lab.push({
                          id: `lab-${day}-${index}`,
                          code: classInfo.code,
                          name: classInfo.code, // You might want to add a better name if available
                          type: 'lab'
                        });
                      }
                    }
                  });
                }
              }
            });
            
            setTheoryClasses(theory);
            setLabClasses(lab);
          }
        }
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleRequestCreated = () => {
    // Optionally refresh the list or show a notification
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading substitution data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">VITF Schedule</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate("/dashboard")} variant="outline">
                Dashboard
              </Button>
              <Button onClick={() => navigate("/chat")} variant="outline">
                Chat
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Substitution Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Request substitutes for your classes or help your colleagues by accepting their requests
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <RequestForm 
              userId={userId}
              userName={userName}
              theoryClasses={theoryClasses}
              labClasses={labClasses}
              onRequestCreated={handleRequestCreated}
            />
          </div>
          <div>
            <RequestList
              userId={userId}
              userName={userName}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Substitution; 
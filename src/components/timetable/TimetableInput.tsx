import React, { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TimeSlot = { start: string; end: string };
type ClassInfo = { code: string; room?: string; instructor?: string; color?: string };
type Timetable = {
  theorySlots: TimeSlot[];
  labSlots: TimeSlot[];
  days: Record<string, { theory: (ClassInfo | null)[]; lab: (ClassInfo | null)[] }>;
};

// Create default timetable structure
const createDefaultTimetable = (): Timetable => {
  // Default time slots
  const defaultTheorySlots: TimeSlot[] = [
    { start: "08:00", end: "08:50" },
    { start: "09:00", end: "09:50" },
    { start: "10:00", end: "10:50" },
    { start: "11:00", end: "11:50" },
    { start: "12:00", end: "12:50" },
    { start: "14:00", end: "14:50" },
    { start: "15:00", end: "15:50" },
    { start: "16:00", end: "16:50" },
    { start: "17:00", end: "17:50" },
    { start: "18:00", end: "18:50" },
    { start: "19:00", end: "19:50" },
    { start: "20:00", end: "20:50" }
  ];
  
  const defaultLabSlots: TimeSlot[] = [
    { start: "08:00", end: "09:40" },
    { start: "09:50", end: "11:30" },
    { start: "11:40", end: "13:20" },
    { start: "14:00", end: "15:40" },
    { start: "15:50", end: "17:30" },
    { start: "17:40", end: "19:20" }
  ];
  
  // Default days with empty arrays for theory and lab
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const daysObj: Record<string, { theory: (ClassInfo | null)[]; lab: (ClassInfo | null)[] }> = {};
  
  days.forEach(day => {
    daysObj[day] = {
      theory: Array(14).fill(null),
      lab: Array(14).fill(null)
    };
  });
  
  return {
    theorySlots: defaultTheorySlots,
    labSlots: defaultLabSlots,
    days: daysObj
  };
};

// Get a consistent color based on the class code
const getHighlightColor = (code: string): string => {
  // Simple hash function to generate a consistent color based on the string
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use pastel colors for better readability
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 80%)`;
};

export const TimetableInput: React.FC = () => {
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<Timetable>(createDefaultTimetable());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeDay, setActiveDay] = useState("Monday");
  const [activeType, setActiveType] = useState<"theory" | "lab">("theory");
  const [profile, setProfile] = useState({
    name: "",
    department: "",
    employeeId: ""
  });

  // Class input form state
  const [classInput, setClassInput] = useState({
    slotIndex: "0",
    code: "",
    room: "",
    instructor: ""
  });

  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "faculty", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || "",
          department: data.department || "",
          employeeId: data.employeeId || ""
        });
        if (data.timetable) setTimetable(data.timetable);
      }
    };
    loadData();
  }, []);

  const validateProfile = () => {
    if (!profile.name.trim()) return "Full name is required";
    if (!profile.department.trim()) return "Department is required";
    if (!profile.employeeId.trim()) return "Employee ID is required";
    return null;
  };

  const handleAddClass = () => {
    const slotIndex = parseInt(classInput.slotIndex);
    if (isNaN(slotIndex) || !classInput.code.trim()) return;

    const newTimetable = { ...timetable };
    const classInfo: ClassInfo = {
      code: classInput.code.trim(),
      room: classInput.room.trim() || undefined,
      instructor: classInput.instructor.trim() || undefined,
      color: getHighlightColor(classInput.code.trim())
    };

    newTimetable.days[activeDay][activeType][slotIndex] = classInfo;
    setTimetable(newTimetable);
    
    // Reset input except for slotIndex to make it easier to add consecutive classes
    setClassInput({
      ...classInput,
      code: "",
      room: "",
      instructor: ""
    });
  };

  const handleRemoveClass = (slotIndex: number) => {
    const newTimetable = { ...timetable };
    newTimetable.days[activeDay][activeType][slotIndex] = null;
    setTimetable(newTimetable);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const profileError = validateProfile();
    if (profileError) return setError(profileError);

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      await setDoc(doc(db, "faculty", user.uid), {
        ...profile,
        timetable: timetable,
        signupCompleted: false
      }, { merge: true });

      setSaveSuccess(true);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    const profileError = validateProfile();
    if (profileError) return setError(profileError);

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      await setDoc(doc(db, "faculty", user.uid), {
        signupCompleted: true,
        completedAt: new Date()
      }, { merge: true });

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Completion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6">Faculty Profile Setup</h2>
        
        <div className="grid gap-4 mb-8">
          <div>
            <Label>Full Name *</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              placeholder="Dr. Jane Doe"
            />
          </div>
          <div>
            <Label>Department *</Label>
            <Input
              value={profile.department}
              onChange={(e) => setProfile({...profile, department: e.target.value})}
              placeholder="Computer Science"
            />
          </div>
          <div>
            <Label>Employee ID *</Label>
            <Input
              value={profile.employeeId}
              onChange={(e) => setProfile({...profile, employeeId: e.target.value})}
              placeholder="VITF-1234"
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Timetable Builder</h3>
          <p className="text-sm text-gray-500 mb-4">
            Build your timetable by selecting days and adding your classes for each time slot.
          </p>

          <Tabs defaultValue="Monday" value={activeDay} onValueChange={setActiveDay}>
            <TabsList className="mb-4">
              {Object.keys(timetable.days).map(day => (
                <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
              ))}
            </TabsList>
            
            {Object.keys(timetable.days).map(day => (
              <TabsContent key={day} value={day}>
                <Tabs defaultValue="theory" value={activeType} onValueChange={(val) => setActiveType(val as "theory" | "lab")}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="theory">Theory</TabsTrigger>
                    <TabsTrigger value="lab">Lab</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="theory">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Add Theory Class</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="w-32">
                          <Label>Slot</Label>
                          <Select 
                            value={classInput.slotIndex} 
                            onValueChange={(val) => setClassInput({...classInput, slotIndex: val})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select slot" />
                            </SelectTrigger>
                            <SelectContent>
                              {timetable.theorySlots.map((slot, idx) => (
                                <SelectItem key={idx} value={idx.toString()}>
                                  {slot.start}-{slot.end}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-32">
                          <Label>Code *</Label>
                          <Input 
                            value={classInput.code}
                            onChange={(e) => setClassInput({...classInput, code: e.target.value})}
                            placeholder="T1"
                          />
                        </div>
                        <div className="w-32">
                          <Label>Room</Label>
                          <Input 
                            value={classInput.room}
                            onChange={(e) => setClassInput({...classInput, room: e.target.value})}
                            placeholder="SJT301"
                          />
                        </div>
                        <div className="w-32">
                          <Label>Instructor</Label>
                          <Input 
                            value={classInput.instructor}
                            onChange={(e) => setClassInput({...classInput, instructor: e.target.value})}
                            placeholder="Optional"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                            onClick={handleAddClass}
                            disabled={!classInput.code.trim()}
                            size="sm"
                          >
                            Add
                          </Button>
                        </div>
                      </div>

                      <div className="border rounded-md mt-4">
                        <div className="grid grid-cols-4 gap-2 p-2 bg-gray-100 font-medium">
                          <div>Time Slot</div>
                          <div>Code</div>
                          <div>Room</div>
                          <div>Actions</div>
                        </div>
                        <div className="divide-y">
                          {timetable.theorySlots.map((slot, idx) => (
                            <div 
                              key={idx} 
                              className="grid grid-cols-4 gap-2 p-2 items-center"
                              style={{
                                backgroundColor: timetable.days[activeDay].theory[idx]?.color || 'transparent'
                              }}
                            >
                              <div>{slot.start}-{slot.end}</div>
                              <div>{timetable.days[activeDay].theory[idx]?.code || '-'}</div>
                              <div>{timetable.days[activeDay].theory[idx]?.room || '-'}</div>
                              <div>
                                {timetable.days[activeDay].theory[idx] && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleRemoveClass(idx)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="lab">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Add Lab Class</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="w-32">
                          <Label>Slot</Label>
                          <Select 
                            value={classInput.slotIndex} 
                            onValueChange={(val) => setClassInput({...classInput, slotIndex: val})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select slot" />
                            </SelectTrigger>
                            <SelectContent>
                              {timetable.labSlots.map((slot, idx) => (
                                <SelectItem key={idx} value={idx.toString()}>
                                  {slot.start}-{slot.end}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-32">
                          <Label>Code *</Label>
                          <Input 
                            value={classInput.code}
                            onChange={(e) => setClassInput({...classInput, code: e.target.value})}
                            placeholder="L1"
                          />
                        </div>
                        <div className="w-32">
                          <Label>Room</Label>
                          <Input 
                            value={classInput.room}
                            onChange={(e) => setClassInput({...classInput, room: e.target.value})}
                            placeholder="LAB101"
                          />
                        </div>
                        <div className="w-32">
                          <Label>Instructor</Label>
                          <Input 
                            value={classInput.instructor}
                            onChange={(e) => setClassInput({...classInput, instructor: e.target.value})}
                            placeholder="Optional"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                            onClick={handleAddClass}
                            disabled={!classInput.code.trim()}
                            size="sm"
                          >
                            Add
                          </Button>
                        </div>
                      </div>

                      <div className="border rounded-md mt-4">
                        <div className="grid grid-cols-4 gap-2 p-2 bg-gray-100 font-medium">
                          <div>Time Slot</div>
                          <div>Code</div>
                          <div>Room</div>
                          <div>Actions</div>
                        </div>
                        <div className="divide-y">
                          {timetable.labSlots.map((slot, idx) => (
                            <div 
                              key={idx} 
                              className="grid grid-cols-4 gap-2 p-2 items-center"
                              style={{
                                backgroundColor: timetable.days[activeDay].lab[idx]?.color || 'transparent'
                              }}
                            >
                              <div>{slot.start}-{slot.end}</div>
                              <div>{timetable.days[activeDay].lab[idx]?.code || '-'}</div>
                              <div>{timetable.days[activeDay].lab[idx]?.room || '-'}</div>
                              <div>
                                {timetable.days[activeDay].lab[idx] && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleRemoveClass(idx)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}
        {saveSuccess && <div className="text-green-600 mb-4">Data saved successfully!</div>}

        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save All Data"}
          </Button>
          
          <Button
            onClick={handleFinish}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 ml-auto"
          >
            Complete Setup → 
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TimetableInput;
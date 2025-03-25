import React, { useState, FormEvent, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TimeSlot = { start: string; end: string };
type ClassInfo = { code: string; room?: string; instructor?: string; color?: string };
type Timetable = {
  theorySlots: TimeSlot[];
  labSlots: TimeSlot[];
  days: Record<string, { theory: (ClassInfo | null)[]; lab: (ClassInfo | null)[] }>;
};

// Helper to detect delimiter in input
const detectDelimiter = (line: string): RegExp => {
  if (line.includes('\t')) return /\t/;
  if (line.includes('|')) return /\|/;
  if (line.includes(',')) return /,/;
  return /\s{2,}/; // Two or more spaces
};

// Get a consistent color based on the class code
const getHighlightColor = (cell: string): string => {
  // Simple hash function to generate a consistent color based on the string
  let hash = 0;
  for (let i = 0; i < cell.length; i++) {
    hash = cell.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use pastel colors for better readability
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 80%)`;
};

// Check if a class should be highlighted (in this case, if it's a complex code)
const shouldHighlight = (cell: string): boolean => {
  return cell.includes('-') && cell.length > 5;
};

// Parse a class info cell (e.g. "A1-BCSE305L-TH-SJT704-ALL")
const parseClassInfo = (cell: string): ClassInfo | null => {
  try {
    cell = cell.trim();
    if (!cell || cell === "-" || cell === "Lunch") return null;
    
    // For simple codes like "L1", "A2", etc.
    if (/^[A-Z][0-9]+$/.test(cell)) {
      return { code: cell };
    }
    
    // For complex codes with room numbers and instructors
    const parts = cell.split('-');
    if (parts.length >= 2) {
      return {
        code: parts[0],
        room: parts.length > 2 ? parts[2] : undefined,
        instructor: parts.length > 3 ? parts[3] : undefined,
        color: shouldHighlight(cell) ? getHighlightColor(cell) : undefined
      };
    }
    
    // Default fallback
    return { code: cell };
  } catch (error) {
    return { code: cell };
  }
};

// Function to parse complex timetable
const parseTimetable = (input: string): Timetable | null => {
  try {
    const lines = input.trim().split("\n");
    if (lines.length < 6) {
      throw new Error("Input data is too short to be a valid timetable");
    }
    
    const delimiter = detectDelimiter(lines[0]);
    
    const timetable: Timetable = {
      theorySlots: [],
      labSlots: [],
      days: {}
    };
    
    // Parse time slots first (first 4 rows)
    if (lines.length >= 4) {
      // Theory start times (row 1)
      const theoryStartRow = lines[0].split(delimiter);
      const theoryStartTimes = theoryStartRow.slice(2).map(t => t.trim());
      
      // Theory end times (row 2)
      const theoryEndRow = lines[1].split(delimiter);
      const theoryEndTimes = theoryEndRow.slice(2).map(t => t.trim());
      
      // Lab start times (row 3)
      const labStartRow = lines[2].split(delimiter);
      const labStartTimes = labStartRow.slice(2).map(t => t.trim());
      
      // Lab end times (row 4)
      const labEndRow = lines[3].split(delimiter);
      const labEndTimes = labEndRow.slice(2).map(t => t.trim());
      
      // Create time slots
      for (let i = 0; i < theoryStartTimes.length; i++) {
        if (i < theoryEndTimes.length && 
            theoryStartTimes[i] && theoryStartTimes[i] !== "-" && 
            theoryEndTimes[i] && theoryEndTimes[i] !== "-") {
          timetable.theorySlots.push({
            start: theoryStartTimes[i],
            end: theoryEndTimes[i]
          });
        }
      }
      
      for (let i = 0; i < labStartTimes.length; i++) {
        if (i < labEndTimes.length && 
            labStartTimes[i] && labStartTimes[i] !== "-" && 
            labEndTimes[i] && labEndTimes[i] !== "-") {
          timetable.labSlots.push({
            start: labStartTimes[i],
            end: labEndTimes[i]
          });
        }
      }
    }
    
    // Parse day schedules - each day has two rows (THEORY and LAB)
    for (let i = 4; i < lines.length; i += 2) {
      if (i + 1 >= lines.length) break; // Ensure we have both THEORY and LAB rows
      
      // Parse THEORY row
      const theoryRow = lines[i].split(delimiter);
      if (theoryRow.length < 3) continue; // Skip invalid rows
      
      const day = theoryRow[0].trim();
      if (!day) continue; // Skip if day is empty
      
      const theoryClasses = theoryRow.slice(2).map(parseClassInfo);
      
      // Parse LAB row
      const labRow = lines[i + 1].split(delimiter);
      const labClasses = labRow.slice(2).map(parseClassInfo);
      
      // Add to timetable
      timetable.days[day] = {
        theory: theoryClasses,
        lab: labClasses
      };
    }
    
    // Validate the timetable has at least one day
    if (Object.keys(timetable.days).length === 0) {
      throw new Error("No valid day data found in the timetable");
    }
    
    return timetable;
  } catch (error) {
    return null;
  }
};

export const TimetableInput: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeDay, setActiveDay] = useState("");
  
  const [profile, setProfile] = useState({
    name: "",
    department: "",
    employeeId: ""
  });

  // Parse timetable when input changes
  const parsedTimetable = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return parseTimetable(input);
    } catch (err) {
      return null;
    }
  }, [input]);

  // Set the active day when timetable changes
  useEffect(() => {
    if (parsedTimetable && Object.keys(parsedTimetable.days).length > 0) {
      setActiveDay(Object.keys(parsedTimetable.days)[0]);
    }
  }, [parsedTimetable]);

  useEffect(() => {
    const loadData = async () => {
      try {
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
          if (data.timetable) {
            setTimetable(data.timetable);
            if (Object.keys(data.timetable.days).length > 0) {
              setActiveDay(Object.keys(data.timetable.days)[0]);
            }
          }
        }
      } catch (err) {
        setError("Failed to load saved data");
      }
    };
    loadData();
  }, []);

  const validateProfile = useCallback(() => {
    if (!profile.name.trim()) return "Full name is required";
    if (!profile.department.trim()) return "Department is required";
    if (!profile.employeeId.trim()) return "Employee ID is required";
    return null;
  }, [profile]);

  const handlePreview = () => {
    if (!input.trim()) {
      setError("Please enter timetable data");
      return;
    }
    
    const parsed = parseTimetable(input);
    if (!parsed) {
      setError("Failed to parse timetable. Please check your input format.");
      return;
    }
    
    setTimetable(parsed);
    setShowPreview(true);
    setError("");
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const profileError = validateProfile();
    if (profileError) return setError(profileError);
    if (!input.trim()) return setError("Timetable data is required");

    try {
      setLoading(true);
      const parsed = parsedTimetable || parseTimetable(input);
      if (!parsed) {
        throw new Error("Failed to parse timetable data");
      }
      
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      await setDoc(doc(db, "faculty", user.uid), {
        ...profile,
        timetable: parsed,
        signupCompleted: false
      }, { merge: true });

      setTimetable(parsed);
      setSaveSuccess(true);
      setError("");
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    const profileError = validateProfile();
    if (profileError) return setError(profileError);
    if (!timetable) return setError("Timetable not saved");

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

  // Render timeSlot content
  const renderSlotContent = (day: string, type: 'theory' | 'lab', index: number): React.ReactNode => {
    if (!timetable || !timetable.days[day] || !timetable.days[day][type]) {
      return <div className="text-center">-</div>;
    }
    
    const classInfo = timetable.days[day][type][index];
    if (!classInfo) return <div className="text-center">-</div>;
    
    return (
      <div 
        className="p-1 text-xs rounded"
        style={{ backgroundColor: classInfo.color || "transparent" }}
      >
        <div className="font-bold">{classInfo.code}</div>
        {classInfo.room && <div>{classInfo.room}</div>}
      </div>
    );
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
          <Label>Timetable Data *</Label>
          <Textarea
            className="min-h-[200px] font-mono text-sm"
            placeholder="Paste timetable data here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">
            Paste your timetable in a tabular format with rows for theory and lab sessions.
          </p>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}
        {saveSuccess && <div className="text-green-600 mb-4">Data saved successfully!</div>}

        <div className="flex gap-4">
          <Button
            onClick={handlePreview}
            disabled={loading || !input.trim()}
            variant="outline"
          >
            Preview Timetable
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save All Data"}
          </Button>
          
          <Button
            onClick={handleFinish}
            disabled={!timetable || loading}
            className="bg-green-600 hover:bg-green-700 ml-auto"
          >
            Complete Setup → 
          </Button>
        </div>
      </Card>

      {showPreview && timetable && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Timetable Preview</h2>
          
          <Tabs value={activeDay} onValueChange={setActiveDay}>
            <TabsList className="mb-4">
              {Object.keys(timetable.days).map(day => (
                <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
              ))}
            </TabsList>
            
            {Object.keys(timetable.days).map(day => (
              <TabsContent key={day} value={day}>
                {/* Theory slots */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2">Theory</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border rounded">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border">Slot</th>
                          {timetable.theorySlots.map((slot, idx) => (
                            <th key={idx} className="p-2 border">
                              {slot.start}-{slot.end}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border font-medium">THEORY</td>
                          {Array.from({ length: timetable.theorySlots.length }, (_, i) => (
                            <td key={i} className="p-2 border">
                              {renderSlotContent(day, 'theory', i)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Lab slots */}
                <div>
                  <h3 className="font-bold text-lg mb-2">Lab</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border rounded">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border">Slot</th>
                          {timetable.labSlots.map((slot, idx) => (
                            <th key={idx} className="p-2 border">
                              {slot.start}-{slot.end}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border font-medium">LAB</td>
                          {Array.from({ length: timetable.labSlots.length }, (_, i) => (
                            <td key={i} className="p-2 border">
                              {renderSlotContent(day, 'lab', i)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default TimetableInput;
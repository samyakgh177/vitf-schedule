import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ClassInfo } from "@/types/substitution";

interface RequestFormProps {
  userId: string;
  userName: string;
  theoryClasses: ClassInfo[];
  labClasses: ClassInfo[];
  onRequestCreated?: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({
  userId,
  userName,
  theoryClasses,
  labClasses,
  onRequestCreated
}) => {
  const [selectedClassType, setSelectedClassType] = useState<"theory" | "lab">("theory");
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    classType?: string;
    class?: string;
    date?: string;
    reason?: string;
  }>({});
  
  const validateForm = (): boolean => {
    const newErrors: {
      classType?: string;
      class?: string;
      date?: string;
      reason?: string;
    } = {};
    
    if (!selectedClass) {
      newErrors.class = "Please select a class";
    }
    
    if (!selectedDate) {
      newErrors.date = "Please select a date";
    }
    
    if (!reason.trim()) {
      newErrors.reason = "Please provide a reason";
    } else if (reason.trim().length < 10) {
      newErrors.reason = "Reason should be at least 10 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast("Form validation failed", {
        description: "Please fill in all required fields correctly.",
        duration: 3000,
      });
      return;
    }
    
    if (!userId || !selectedClass || !selectedDate) {
      toast("Missing information", {
        description: "Required information is missing. Please try again.",
        duration: 3000,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      await addDoc(collection(db, "substitutionRequests"), {
        requesterId: userId,
        requesterName: userName,
        classInfo: selectedClass,
        date: formattedDate,
        reason: reason.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });
      
      // Clear form
      setSelectedClassType("theory");
      setSelectedClass(null);
      setSelectedDate(undefined);
      setReason("");
      setErrors({});
      
      toast("Request submitted", {
        description: "Your substitution request has been submitted successfully!",
        duration: 5000,
      });
      
      if (onRequestCreated) {
        onRequestCreated();
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast("Submission failed", {
        description: "There was an error submitting your request. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const classOptions = selectedClassType === "theory" ? theoryClasses : labClasses;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-6">Request Substitution</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Class Type</label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={selectedClassType === "theory" ? "default" : "outline"}
              onClick={() => {
                setSelectedClassType("theory");
                setSelectedClass(null);
              }}
              className={cn(
                selectedClassType === "theory" ? "bg-blue-600" : "",
                "flex-1"
              )}
            >
              Theory
            </Button>
            <Button
              type="button"
              variant={selectedClassType === "lab" ? "default" : "outline"}
              onClick={() => {
                setSelectedClassType("lab");
                setSelectedClass(null);
              }}
              className={cn(
                selectedClassType === "lab" ? "bg-blue-600" : "",
                "flex-1"
              )}
            >
              Lab
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Class</label>
          <Select
            value={selectedClass?.id}
            onValueChange={(value) => {
              const selected = classOptions.find(c => c.id === value) || null;
              setSelectedClass(selected);
              if (selected) {
                setErrors({...errors, class: undefined});
              }
            }}
          >
            <SelectTrigger className={cn(errors.class && "border-red-500")}>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classOptions.map((classInfo) => (
                <SelectItem key={classInfo.id} value={classInfo.id}>
                  {classInfo.code} - {classInfo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.class && <p className="text-sm text-red-500">{errors.class}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                  errors.date && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) {
                    setErrors({...errors, date: undefined});
                  }
                }}
                initialFocus
                disabled={(date) => {
                  // Disable past dates and weekends
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const day = date.getDay();
                  return date < today || day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Reason for Substitution</label>
          <Textarea
            placeholder="Please provide a detailed reason for your substitution request"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim().length >= 10) {
                setErrors({...errors, reason: undefined});
              }
            }}
            className={cn(errors.reason && "border-red-500")}
            rows={4}
          />
          {errors.reason ? (
            <p className="text-sm text-red-500">{errors.reason}</p>
          ) : (
            <p className="text-xs text-gray-500">
              Minimum 10 characters. Be specific about why you need a substitute.
            </p>
          )}
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Request"
          )}
        </Button>
      </form>
    </div>
  );
};

export default RequestForm; 
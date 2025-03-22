import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { collection, query, updateDoc, doc, orderBy, onSnapshot } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, CalendarIcon, AlertCircle, Clock, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { SubstitutionRequest, RequestListProps, RequestTabProps } from "@/types/substitution";

const RequestTab: React.FC<RequestTabProps> = ({ active, label, count, onClick }) => {
  return (
    <Button
      variant={active ? "default" : "outline"}
      className={`flex-1 ${active ? "bg-blue-600 hover:bg-blue-700" : ""}`}
      onClick={onClick}
    >
      {label}
      {count > 0 && (
        <Badge variant="secondary" className="ml-2 bg-white text-blue-800 border border-blue-200">
          {count}
        </Badge>
      )}
    </Button>
  );
};

const RequestList: React.FC<RequestListProps> = ({ userId, userName }) => {
  const [activeTab, setActiveTab] = useState<"pending" | "available" | "accepted">("pending");
  const [requests, setRequests] = useState<SubstitutionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const filteredRequests = requests.filter(request => {
    switch (activeTab) {
      case "pending":
        return request.requesterId === userId && request.status === "pending";
      case "available":
        return request.requesterId !== userId && request.status === "pending";
      case "accepted":
        return (request.requesterId === userId && request.status !== "pending") || 
               (request.acceptorId === userId);
      default:
        return false;
    }
  });
  
  useEffect(() => {
    if (!auth.currentUser) {
      setError("You must be logged in to view requests");
      setLoading(false);
      toast("Authentication required", {
        description: "Please log in to view substitution requests",
      });
      return;
    }
    
    setLoading(true);
    
    const requestsRef = collection(db, "substitutionRequests");
    const q = query(requestsRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const fetchedRequests: SubstitutionRequest[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedRequests.push({
            id: doc.id,
            requesterId: data.requesterId,
            requesterName: data.requesterName,
            classInfo: data.classInfo,
            date: data.date,
            reason: data.reason,
            status: data.status,
            acceptorId: data.acceptorId,
            acceptorName: data.acceptorName,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        
        setRequests(fetchedRequests);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests. Please try again.");
        setLoading(false);
        toast("Error", {
          description: "Failed to load substitution requests. Please try again.",
        });
      }
    );
    
    return () => unsubscribe();
  }, [userId]);
  
  const acceptRequest = async (requestId: string) => {
    if (!auth.currentUser) {
      toast("Authentication required", {
        description: "Please log in to accept requests",
      });
      return;
    }
    
    try {
      const requestRef = doc(db, "substitutionRequests", requestId);
      await updateDoc(requestRef, {
        status: "approved",
        acceptorId: userId,
        acceptorName: userName,
        updatedAt: new Date()
      });
      
      toast("Request accepted", {
        description: "You have successfully accepted this substitution request.",
      });
    } catch (error) {
      console.error("Error accepting request:", error);
      toast("Error", {
        description: "Failed to accept the request. Please try again.",
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50 flex items-center gap-1">
            <HelpCircle className="h-3 w-3" /> Unknown
          </Badge>
        );
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEEE, MMMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "pending":
        return {
          title: "No pending requests",
          description: "You haven't created any substitution requests yet."
        };
      case "available":
        return {
          title: "No available requests",
          description: "There are no pending substitution requests from other faculty members."
        };
      case "accepted":
        return {
          title: "No accepted requests",
          description: "You haven't accepted or had any of your requests accepted yet."
        };
      default:
        return {
          title: "No requests found",
          description: "No substitution requests match the current filter."
        };
    }
  };
  
  const pendingCount = requests.filter(r => r.requesterId === userId && r.status === "pending").length;
  const availableCount = requests.filter(r => r.requesterId !== userId && r.status === "pending").length;
  const acceptedCount = requests.filter(r => 
    (r.requesterId === userId && r.status !== "pending") || 
    (r.acceptorId === userId)
  ).length;
  
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <RequestTab 
          active={activeTab === "pending"} 
          label="My Requests" 
          count={pendingCount} 
          onClick={() => setActiveTab("pending")} 
        />
        <RequestTab 
          active={activeTab === "available"} 
          label="Available" 
          count={availableCount} 
          onClick={() => setActiveTab("available")} 
        />
        <RequestTab 
          active={activeTab === "accepted"} 
          label="Accepted" 
          count={acceptedCount} 
          onClick={() => setActiveTab("accepted")} 
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading requests...</span>
        </div>
      ) : error ? (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-amber-800 font-medium">{error}</p>
            <p className="text-amber-600 text-sm mt-1">Please try refreshing the page</p>
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="bg-gray-100 rounded-full p-3">
              <CalendarIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-3 text-gray-700 font-medium">{getEmptyStateMessage().title}</h3>
            <p className="text-gray-500 text-sm mt-1">{getEmptyStateMessage().description}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-medium">
                      {request.classInfo.code} - {request.classInfo.name}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1 text-gray-500" />
                      {formatDate(request.date)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="p-3 bg-gray-50 rounded-md text-gray-700 text-sm">
                  <p className="font-medium text-xs uppercase text-gray-500 mb-1">Reason</p>
                  <p>{request.reason}</p>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Requester:</span> {request.requesterName}
                  </p>
                  {request.acceptorId && (
                    <p className="mt-1">
                      <span className="font-medium">Accepted by:</span> {request.acceptorName}
                    </p>
                  )}
                </div>
              </CardContent>
              {activeTab === "available" && (
                <CardFooter className="border-t bg-gray-50 pt-3 pb-3">
                  <Button 
                    className="w-full" 
                    onClick={() => acceptRequest(request.id)}
                  >
                    Accept Request
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestList; 
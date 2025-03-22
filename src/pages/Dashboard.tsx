import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { Button } from "@/components/ui/button";
import ViewTimetable from "@/components/timetable/ViewTimeTable";
import { User } from "firebase/auth";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {user?.displayName?.[0] || user?.email?.[0] || "U"}
                  </span>
                </div>
                <div className="hidden sm:block">
                  {user && (
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-700">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Button
                onClick={() => navigate("/substitution")}
                variant="outline"
                className="mr-4"
              >
                Substitution
              </Button>
              <Button
                onClick={() => navigate("/chat")}
                variant="outline"
                className="mr-4"
              >
                Group Chat
              </Button>
              <Button
                onClick={() => navigate("/private-chat")}
                variant="outline"
                className="mr-4"
              >
                Private Chat
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Faculty Schedule Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your class schedule
          </p>
        </div>
        <ViewTimetable />
      </main>
    </div>
  );
};

export default Dashboard;
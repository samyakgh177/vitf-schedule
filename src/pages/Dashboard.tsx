import React, { useEffect, useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { Button } from "@/components/ui/button";
import ViewTimetable from "@/components/timetable/ViewTimeTable";
import { User } from "firebase/auth";

// Simple skeleton component for loading states
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

// Memoized navigation button component
const NavButton = memo(({ label, onClick, className = "" }: { 
  label: string; 
  onClick: () => void; 
  className?: string;
}) => (
  <Button
    onClick={onClick}
    variant="outline"
    className={className}
  >
    {label}
  </Button>
));
NavButton.displayName = "NavButton";

// User avatar component
const UserAvatar = memo(({ user }: { user: User | null }) => (
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
));
UserAvatar.displayName = "UserAvatar";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        setError("Authentication error: " + error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Use useCallback for event handlers
  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      await auth.signOut();
      navigate("/");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error during logout";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const navigateTo = useCallback((path: string) => () => {
    navigate(path);
  }, [navigate]);

  // Show loading state
  if (loading && !user) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // If not authenticated, redirect to login
  if (!user && !loading) {
    // Redirect to login happens in useEffect
    return <LoadingState message="Redirecting to login..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <UserAvatar user={user} />
            
            <div className="flex items-center space-x-2 overflow-x-auto py-2 sm:space-x-4">
              <NavButton 
                label="Substitution" 
                onClick={navigateTo("/substitution")} 
              />
              <NavButton 
                label="Group Chat" 
                onClick={navigateTo("/chat")} 
              />
              <NavButton 
                label="Private Chat" 
                onClick={navigateTo("/private-chat")} 
              />
              <NavButton 
                label="Logout" 
                onClick={handleLogout} 
                className="border-red-200 hover:bg-red-50"
              />
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

// Loading state component
const LoadingState = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="space-y-2 mb-4">
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  </div>
);

// Error state component
const ErrorState = ({ error }: { error: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
      <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-700 mb-6">{error}</p>
      <Button onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </div>
  </div>
);

export default Dashboard;
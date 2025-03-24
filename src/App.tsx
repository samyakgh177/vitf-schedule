import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

// Lazy load components
const Landing = lazy(() => import("./pages/Landing"));
const Signup = lazy(() => import("./pages/Auth/Signup"));
const Login = lazy(() => import("./pages/Auth/Login"));
const TimetableInput = lazy(() => import("./components/timetable/TimetableInput"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Chat = lazy(() => import("./pages/Chat"));
const PrivateChat = lazy(() => import("./pages/PrivateChat"));
const Substitution = lazy(() => import("./pages/Substitution"));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
    <p className="mt-2 text-gray-600">Loading...</p>
  </div>
);

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/timetableinput" element={<TimetableInput/>}/>
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/private-chat" element={<PrivateChat />} />
          <Route path="/substitution" element={<Substitution />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;

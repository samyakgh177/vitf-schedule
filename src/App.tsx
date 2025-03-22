import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import TimetableInput from "./components/timetable/TimetableInput";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import PrivateChat from "./pages/PrivateChat";
import Substitution from "./pages/Substitution";
import { Toaster } from "sonner";

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/timetableinput" element={<TimetableInput/>}/>
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/private-chat" element={<PrivateChat />} />
        <Route path="/substitution" element={<Substitution />} />
      </Routes>
    </>
  );
}

export default App;

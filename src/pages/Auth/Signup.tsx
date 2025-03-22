import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { auth, db, googleProvider } from "@/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "faculty", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        navigate("/timetableinput");
      } else {
        navigate("/timetableinput");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert("Google Sign-In failed. Please use your VIT institutional account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4"
    >
      <Card className="w-full max-w-md shadow-lg rounded-2xl border border-blue-100">
        <CardHeader className="space-y-1 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto flex items-center justify-center h-12 w-12 bg-blue-100 rounded-full"
          >
            <span className="text-2xl font-bold text-blue-600">VIT</span>
          </motion.div>
          <CardTitle className="text-2xl font-bold tracking-tight text-blue-900">
            Faculty Portal Access
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Secure timetable management system
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              variant="outline" 
              className="w-full bg-white hover:bg-blue-50 border-blue-200"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <div className="mr-2 flex items-center justify-center h-6 w-6 bg-blue-600 text-white rounded-sm">
                G
              </div>
              {loading ? "Signing In..." : "Continue with Google"}
              {loading && (
                <div className="ml-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </Button>
          </motion.div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-muted-foreground"
          >
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Signup;
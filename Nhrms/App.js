/**
 * App.js — FINAL MERGED
 *
 * FIX: Taskscreen no longer receives loggedInUser prop.
 * It reads empId from UserContext directly.
 * All other screens unchanged.
 */
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FirstScreen, SignUpFlow } from "./auth/Signup";
import SignIn from "./auth/Signin";
import ForgotPassword from "./auth/Forgotpassword";
import HomeScreen from "./userscreens/Home";
import ClockInScreen from "./userscreens/Attendance";
import ProfileScreen from "./userscreens/Profilescreen";
import PersonalDataScreen from "./userscreens/Personaldetails";
import EmployeeDashboard from "./userscreens/EmployeeDashboard";
import PayrollHistory from "./userscreens/PayrollHistory";
import SalaryBreakdown from "./userscreens/SalaryBreakdown";
import ViewPayslip from "./userscreens/ViewPayslip";
import Taskscreen from "./userscreens/Taskscreen";
import LeaveScreen from "./userscreens/LeaveScreen";
import AdminScreen from "./adminscreens/Admin";
import AdminAttendanceScreen from "./adminscreens/Adminattendance";
import AdminEmployeesScreen from "./adminscreens/Adminemployee";
import AdminLeaveScreen from "./adminscreens/Adminleave";
import AdminPayrollScreen from "./adminscreens/Adminpayroll";
import PerformanceScreen from "./adminscreens/Adminperformance";
import TasksScreen from "./adminscreens/Admintask";
import { UserProvider } from "./context/UserContext";
import AdminProfileScreen from "./adminscreens/AdminProfileScreen";
import AdminPersonalScreen from "./adminscreens/AdminPersonalScreen";
const TABS = [
  { icon: "🏠" },
  { icon: "📅" },
  { icon: "💰" },
  { icon: "📝" },
  { icon: "🗂️" },
];
function BottomTabBar({ activeTab, onTabPress }) {
  return (
    <View style={styles.bottomTab}>
      {TABS.map((tab, i) => (
        <TouchableOpacity
          key={i}
          style={styles.tabItem}
          onPress={() => onTabPress(i)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, { opacity: i === activeTab ? 1 : 0.4 }]}>
            {tab.icon}
          </Text>
          {i === activeTab && <View style={styles.tabDot} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}
function InnerApp() {
  const [screen, setScreen] = useState("landing");
  const [adminProfile, setAdminProfile] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const handleTabPress = (i) => { setActiveTab(i); setScreen("app"); };
  const buildNavigation = (goBackScreen) => ({
    navigate: (target) => {
      if (target === "ViewPayslip") setScreen("viewPayslip");
      else if (target === "SalaryBreakdown") setScreen("salaryBreakdown");
      else if (target === "PayrollHistory") setScreen("payrollHistory");
    },
    goBack: () => {
      if (goBackScreen === "app") setActiveTab(2);
      setScreen(goBackScreen);
    },
  });
  const doLogout = () => { setActiveTab(0); setScreen("landing"); };
  if (screen === "landing") {
    return (
      <FirstScreen
        onSignUp={() => setScreen("signup")}
        onSignIn={() => setScreen("signin")}
      />
    );
  }
  if (screen === "signup") {
    return (
      <SignUpFlow
        onBack={() => setScreen("landing")}
        goToSignIn={() => setScreen("signin")}
      />
    );
  }
  if (screen === "signin") {
    return (
      <SignIn
        onBack={() => setScreen("landing")}
        goToSignUp={() => setScreen("signup")}
        onLoginSuccess={() => { setActiveTab(0); setScreen("app"); }}
        onAdminSuccess={() => setScreen("admin")}
        onForgotPassword={() => setScreen("forgotPassword")}
      />
    );
  }
  if (screen === "forgotPassword") {
    return <ForgotPassword onBack={() => setScreen("signin")} />;
  }
  if (screen === "profile") {
    return (
      <ProfileScreen
        onBack={() => setScreen("app")}
        onNavigate={(target) => {
          if (target === "personalData") setScreen("personalData");
          if (target === "logout") doLogout();
        }}
      />
    );
  }
  if (screen === "personalData") {
    return (
      <PersonalDataScreen
        onBack={() => setScreen("profile")}
        onSave={() => setScreen("profile")}
      />
    );
  }
  if (screen === "viewPayslip") return <ViewPayslip navigation={buildNavigation("app")} />;
  if (screen === "salaryBreakdown") return <SalaryBreakdown navigation={buildNavigation("app")} />;
  if (screen === "payrollHistory") return <PayrollHistory navigation={buildNavigation("app")} />;
  if (screen === "admin") {
    return (
      <AdminScreen
        onNavigate={(key) => {
          if (key === "attendance") setScreen("adminAttendance");
          if (key === "employees") setScreen("adminEmployees");
          if (key === "leave") setScreen("adminLeave");
          if (key === "payroll") setScreen("adminPayroll");
          if (key === "tasks") setScreen("adminTask");
          if (key === "performance") setScreen("adminPerformance");
          if (key === "profile") setScreen("adminProfile");
        }}
        profile={adminProfile}
      />
    );
  }

  if (screen === "adminProfile") {
    return (
      <AdminProfileScreen
        onBack={() => setScreen("admin")}
        profile={adminProfile}
        onNavigate={(key) => {
          if (key === "personalData") setScreen("adminPersonalData");
          if (key === "logout") doLogout();
        }}
      />
    );
  }

  if (screen === "adminPersonalData") {
    return (
      <AdminPersonalScreen
        onBack={() => setScreen("adminProfile")}
        initialData={adminProfile}
        onSave={(data) => {
          setAdminProfile((prev) => ({ ...prev, ...data }));
          setScreen("adminProfile");
        }}
      />
    );
  }
  if (screen === "adminAttendance") return <AdminAttendanceScreen onBack={() => setScreen("admin")} />;
  if (screen === "adminEmployees") return <AdminEmployeesScreen onBack={() => setScreen("admin")} />;
  if (screen === "adminLeave") return <AdminLeaveScreen onBack={() => setScreen("admin")} />;
  if (screen === "adminPayroll") return <AdminPayrollScreen onBack={() => setScreen("admin")} />;
  if (screen === "adminTask") return <TasksScreen onBack={() => setScreen("admin")} />;
  if (screen === "adminPerformance") return <PerformanceScreen onBack={() => setScreen("admin")} />;
  // Main App (Tab Bar)
  if (screen === "app") {
    return (
      <View style={styles.root}>
        <View style={styles.content}>
          {activeTab === 0 && (
            <HomeScreen
              activeTab={activeTab}
              onTabPress={handleTabPress}
              onProfilePress={() => setScreen("profile")}
            />
          )}
          {activeTab === 1 && (
            <ClockInScreen activeTab={activeTab} onTabPress={handleTabPress} />
          )}
          {activeTab === 2 && (
            <EmployeeDashboard
              activeTab={activeTab}
              onTabPress={handleTabPress}
              navigation={buildNavigation("app")}
            />
          )}
          {activeTab === 3 && (
            // FIX: No loggedInUser prop — Taskscreen reads from UserContext
            <Taskscreen />
          )}
          {activeTab === 4 && (
            <LeaveScreen activeTab={activeTab} onTabPress={handleTabPress} />
          )}
        </View>
        <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    );
  }
  return null;
}
export default function App() {
  return (
    <UserProvider>
      <InnerApp />
    </UserProvider>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#112235" },
  content: { flex: 1 },
  bottomTab: {
    flexDirection: "row",
    backgroundColor: "#2F6E8E",
    paddingVertical: 12,
    marginBottom: 28,
    marginHorizontal: 16,
    borderRadius: 22,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: { alignItems: "center", paddingHorizontal: 14, paddingVertical: 2 },
  tabIcon: { fontSize: 22 },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#FFFFFF", marginTop: 4 },
});
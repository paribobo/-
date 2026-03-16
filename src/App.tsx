import React from "react";
import { AppProvider, useAppContext } from "./context/AppContext";
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import DataTable from "./components/DataTable";
import Dashboard from "./components/Dashboard";
import RecordModal from "./components/RecordModal";
import ExportTemplates from "./components/ExportTemplates";

const AppContent: React.FC = () => {
  const { isAdmin, view } = useAppContext();

  if (!isAdmin) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#111827] selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "dashboard" ? <Dashboard /> : <DataTable />}
      </main>

      <RecordModal />
      <ExportTemplates />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;

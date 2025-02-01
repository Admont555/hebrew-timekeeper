import { NavMenu } from "@/components/NavMenu";
import { Plus } from "lucide-react";

const TableCreation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavMenu />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Plus className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">יצירת טבלה חדשה</h1>
        </div>
        <p className="text-center text-muted-foreground mb-8">בקרוב...</p>
      </div>
    </div>
  );
};

export default TableCreation;
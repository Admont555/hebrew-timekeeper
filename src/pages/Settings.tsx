import { Card } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">הגדרות</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">הגדרות משתמש</h2>
          <p className="text-muted-foreground">יתווסף בקרוב...</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">העדפות מערכת</h2>
          <p className="text-muted-foreground">יתווסף בקרוב...</p>
        </Card>
      </div>
    </div>
  );
}
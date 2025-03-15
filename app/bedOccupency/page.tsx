"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Moon, Sun, Bed, Users, CalendarClock } from "lucide-react";
import { useTheme } from "next-themes";

// Mock data - replace with actual API calls
const departments = [
  { id: 1, name: "ICU", total: 50, occupied: 35 },
  { id: 2, name: "General Ward", total: 200, occupied: 140 },
  { id: 3, name: "Emergency", total: 30, occupied: 25 },
  { id: 4, name: "Pediatrics", total: 40, occupied: 20 },
];

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [departmentPredictions, setDepartmentPredictions] = useState<Array<{ id: number; available: number }>>([]);
  const [mounted, setMounted] = useState(false);

  const totalBeds = departments.reduce((acc, dept) => acc + dept.total, 0);
  const occupiedBeds = departments.reduce((acc, dept) => acc + dept.occupied, 0);
  const availableBeds = totalBeds - occupiedBeds;

  useEffect(() => {
    setMounted(true);
    setDepartmentPredictions(
      departments.map(dept => ({
        id: dept.id,
        available: Math.floor(Math.random() * 20) + 5,
      }))
    );
  }, []);

  const handleDateChange = async (newDate: Date | undefined) => {
    setDate(newDate);
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDepartmentPredictions(
      departments.map(dept => ({
        id: dept.id,
        available: Math.floor(Math.random() * 20) + 5,
      }))
    );
    setLoading(false);
  };

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Bed className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-xl font-semibold">Hospital Bed Management</h1>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-accent"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Total Beds</h2>
              <Bed className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mt-2">{totalBeds}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Occupied Beds</h2>
              <Users className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-3xl font-bold mt-2">{occupiedBeds}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Available Beds</h2>
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mt-2">{availableBeds}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Department Status</h2>
            <div className="space-y-6">
              {departments.map((dept) => (
                <div key={dept.id}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {dept.total - dept.occupied} available
                    </span>
                  </div>
                  <Progress
                    value={(dept.occupied / dept.total) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Check Future Availability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                className="rounded-md border"
              />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Predicted Availability for {date?.toLocaleDateString()}
                </h3>
                {loading ? (
                  <p>Loading predictions...</p>
                ) : (
                  <div className="space-y-2">
                    {departments.map((dept) => {
                      const prediction = departmentPredictions.find(p => p.id === dept.id);
                      return (
                        <div key={dept.id} className="flex justify-between">
                          <span>{dept.name}</span>
                          <span className="font-medium">
                            {prediction?.available || 0} beds available
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
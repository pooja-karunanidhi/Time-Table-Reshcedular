
"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { mockClassrooms, mockFaculty } from "@/lib/mock-data";


const facultyWorkloadData = mockFaculty.map(f => ({
  name: f.name.split(" ").slice(1).join(" "), // Using last name for brevity
  workload: f.workload,
}));

const classroomUtilizationData = mockClassrooms.map(c => ({
  name: c.name,
  utilization: Math.floor(Math.random() * (90 - 40 + 1)) + 40, // Random utilization for demo
}));


function ReportsContent() {
  return (
    <div className="flex flex-col space-y-4">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      <div className="flex items-center gap-2">
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export as PDF
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export as Excel
        </Button>
      </div>
    </div>
    <p className="text-muted-foreground">
      Generate and view reports for faculty workload, classroom utilization, and more.
    </p>
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Faculty Workload</CardTitle>
          <CardDescription>Distribution of teaching hours among faculty.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            workload: {
              label: "Workload",
              color: "hsl(180 50% 60%)",
            },
          }} className="h-64">
            <BarChart data={facultyWorkloadData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="workload" fill="var(--color-workload)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Classroom Utilization</CardTitle>
          <CardDescription>Percentage of time classrooms are in use.</CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={{
            utilization: {
              label: "Utilization",
              color: "hsl(40 80% 60%)",
            },
          }} className="h-64">
            <BarChart data={classroomUtilizationData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
               <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="utilization" fill="var(--color-utilization)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  </div>
  )
}

export default function ReportsPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? <ReportsContent /> : null;
}

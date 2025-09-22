
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generate } from "./actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2 } from "lucide-react";
import { mockClassrooms, mockConstraints, mockFaculty, mockStudentBatches, mockSubjects } from "@/lib/mock-data";
import { GenerateTimetableOptionsOutput } from "@/ai/flows/generate-timetable-options";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formSchema = z.object({
  facultyDetails: z.string().min(1, "Faculty details are required."),
  studentBatches: z.string().min(1, "Student batch details are required."),
  subjects: z.string().min(1, "Subject details are required."),
  classrooms: z.string().min(1, "Classroom details are required."),
  constraints: z.string().min(1, "Constraints are required."),
  numOptions: z.coerce.number().min(1).max(5),
});

type FormValues = z.infer<typeof formSchema>;

const TimetableTable = ({ data }: { data: any }) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  let parsedData = data;
  if (typeof data === 'string') {
    try {
      if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
        parsedData = JSON.parse(data);
      } else {
        return <pre><code>{data}</code></pre>;
      }
    } catch (error) {
      console.error("Failed to parse timetable data:", error);
      return <pre><code>{data}</code></pre>;
    }
  }

  if (typeof parsedData !== 'object' || parsedData === null) {
    return <pre><code>{String(data)}</code></pre>;
  }

  const isBatchStructured = Object.keys(parsedData).every(k => k.startsWith('B'));

  if (!isBatchStructured) {
     return <pre><code>{JSON.stringify(parsedData, null, 2)}</code></pre>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(parsedData).map(([batchId, schedule] : [string, any]) => (
        <div key={batchId}>
          <h3 className="font-bold mb-2">Batch {batchId}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                {days.map(day => <TableHead key={day}>{day}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {days.map(day => (
                  <TableCell key={day} className="align-top h-24">
                    <div className="flex flex-col gap-1">
                      {schedule[day]?.length > 0 ? (
                        schedule[day].map((slot: string, index: number) => (
                          <Badge key={index} variant="secondary" className="whitespace-nowrap">{slot}</Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs"></span>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};

function GeneratorContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateTimetableOptionsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facultyDetails: JSON.stringify(mockFaculty, null, 2),
      studentBatches: JSON.stringify(mockStudentBatches, null, 2),
      subjects: JSON.stringify(mockSubjects, null, 2),
      classrooms: JSON.stringify(mockClassrooms, null, 2),
      constraints: JSON.stringify(mockConstraints, null, 2),
      numOptions: 3,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);

    const response = await generate(values);

    if (response.success && response.data) {
      setResult(response.data);
      toast({ title: "Success", description: "Timetable options generated successfully." });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error || "Failed to generate timetable options.",
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Timetable Generator</h1>
      </div>
      <p className="text-muted-foreground">
        Use the AI-powered generator to create multiple timetable options based on your data and constraints.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Generation Parameters</CardTitle>
          <CardDescription>Provide the necessary data. Mock data has been pre-filled.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="facultyDetails" render={({ field }) => (
                  <FormItem><FormLabel>Faculty Details</FormLabel><FormControl><Textarea {...field} rows={6} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="studentBatches" render={({ field }) => (
                  <FormItem><FormLabel>Student Batches</FormLabel><FormControl><Textarea {...field} rows={6} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="subjects" render={({ field }) => (
                  <FormItem><FormLabel>Subjects</FormLabel><FormControl><Textarea {...field} rows={6} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="classrooms" render={({ field }) => (
                  <FormItem><FormLabel>Classrooms</FormLabel><FormControl><Textarea {...field} rows={6} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="constraints" render={({ field }) => (
                <FormItem><FormLabel>Constraints & Rules</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="numOptions" render={({ field }) => (
                <FormItem><FormLabel>Number of Options to Generate</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                Generate Timetables
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">AI is generating timetable options... this may take a moment.</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Timetable Options</CardTitle>
            <CardDescription>Here are the timetable options generated by the AI. Use the arrows to navigate.</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel className="w-full">
              <CarouselContent>
                {result.timetableOptions.map((option, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <h3 className="text-lg font-semibold mb-2">Option {index + 1}</h3>
                      <TimetableTable data={option} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


export default function GeneratorPage() {
    const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? <GeneratorContent /> : null;
}

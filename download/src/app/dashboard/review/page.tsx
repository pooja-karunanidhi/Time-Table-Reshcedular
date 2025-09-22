
"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { suggest } from "./actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Send } from "lucide-react";
import { mockConstraints } from "@/lib/mock-data";
import { SuggestTimetableChangesOutput } from "@/ai/flows/suggest-timetable-changes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const mockTimetableData = {
  "B001": {
    "Monday": ["09:00-10:00 - CS101 (F001) in C001", "11:00-12:00 - CS102 (F002) in C001"],
    "Tuesday": ["10:00-11:00 - CS101 (F001) in C001"],
    "Wednesday": [],
    "Thursday": [],
    "Friday": [],
  },
  "B002": {
    "Monday": [],
    "Tuesday": [],
    "Wednesday": ["14:00-15:30 - AI202 (F001) in C002"],
    "Thursday": ["10:00-11:30 - DS301 (F002) in C002"],
    "Friday": [],
  }
};

const formSchema = z.object({
  facultyPreferences: z.string().min(1, "Please enter the desired changes."),
  facultyId: z.string().min(1, "Faculty ID is required."),
});

type FormValues = z.infer<typeof formSchema>;

const TimetableTable = ({ data }: { data: Record<string, Record<string, string[]>> }) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  if (typeof data !== 'object' || data === null) {
    return <pre><code>{String(data)}</code></pre>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([batchId, schedule]) => (
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
                        schedule[day].map((slot, index) => (
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

function ReviewContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestTimetableChangesOutput | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'faculty';
  const facultyIdParam = searchParams.get('facultyId');
  const facultyPreferencesParam = searchParams.get('facultyPreferences');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facultyPreferences: "",
      facultyId: "",
    },
  });

  useEffect(() => {
    form.reset({
      facultyId: facultyIdParam || (role === 'admin' ? 'F001' : 'F001'), // Default or from params
      facultyPreferences: facultyPreferencesParam || (role === 'admin' ? "Faculty F001 would prefer to have my classes in the morning and no classes on Wednesdays." : "I would prefer to have my classes in the morning and no classes on Wednesdays."),
    })
  }, [facultyIdParam, facultyPreferencesParam, role, form]);
  
  async function handleGetSuggestion(values: FormValues) {
    setIsLoading(true);
    setSuggestion(null);

    const response = await suggest({
      timetableData: JSON.stringify(mockTimetableData),
      constraints: JSON.stringify(mockConstraints),
      ...values,
    });

    if (response.success && response.data) {
      setSuggestion(response.data);
      toast({ title: "Success", description: "AI has generated suggestions." });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error || "Failed to get suggestions.",
      });
    }
    setIsLoading(false);
  }


  function handleRequestChange(values: FormValues) {
    setIsLoading(true);
    // In a real app, you would send this to the backend
    console.log("Change request submitted:", values);
    setTimeout(() => {
      toast({
        title: 'Request Sent',
        description: 'Your change request has been sent to the admin for approval.',
      });
      setIsLoading(false);
      form.reset({
          facultyPreferences: "",
          facultyId: "F001",
      });
    }, 1000);
  }

  let parsedTimetableData;
  try {
    // Timetable data is now mock data, not from form
    parsedTimetableData = mockTimetableData;
  } catch (e) {
    console.error("Failed to parse timetableData", e);
    parsedTimetableData = {};
  }
  
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">{role === 'admin' ? 'AI Suggestions' : 'Request Schedule Change'}</h1>
      <p className="text-muted-foreground">
        {role === 'admin' 
          ? "Generate AI-powered suggestions for timetable changes based on faculty requests." 
          : "As a faculty member, you can review your schedule and request changes."
        }
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Timetable</CardTitle>
            <CardDescription>This is a simplified view of the current draft.</CardDescription>
          </CardHeader>
          <CardContent>
             <TimetableTable data={parsedTimetableData} />
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{role === 'admin' ? 'Get AI Suggestions' : 'Request Schedule Change'}</CardTitle>
              <CardDescription>
                {role === 'admin'
                  ? 'Enter the faculty member\'s request to generate timetable alternatives.'
                  : 'Describe your desired changes and send the request to an administrator for approval.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(role === 'admin' ? handleGetSuggestion : handleRequestChange)} className="space-y-4">
                  <FormField control={form.control} name="facultyPreferences" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{role === 'admin' ? "Faculty's Request" : "Your Request"}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder={role === 'admin' ? "e.g., F001 needs to have Wednesday afternoon free for a personal appointment." : "e.g., Can I swap my Tuesday morning class with a Thursday afternoon slot?"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {role === 'admin' && (
                     <FormField control={form.control} name="facultyId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faculty ID</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={1} placeholder="e.g., F001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  
                  {role === 'admin' ? (
                     <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Get AI Suggestion
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Request Change from Admin
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
           {suggestion && role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>AI Suggested Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Explanation</AlertTitle>
                  <AlertDescription>
                    {suggestion.explanation}
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">New Timetable Draft:</h4>
                   <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                    <code>{suggestion.suggestedChanges}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewPageComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewContent />
    </Suspense>
  )
}

export default function ReviewPage() {
    const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? <ReviewPageComponent /> : null;
}

    
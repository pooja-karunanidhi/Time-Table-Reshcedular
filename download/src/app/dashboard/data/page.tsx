
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const facultySchema = z.object({
  name: z.string().min(1, "Name is required."),
  subjects: z.string().min(1, "Subjects are required."),
  availability: z.string().min(1, "Availability is required."),
  workload: z.coerce.number().min(1, "Workload is required."),
});

const batchSchema = z.object({
  name: z.string().min(1, "Batch name is required."),
  department: z.string().min(1, "Department is required."),
});

const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required."),
  code: z.string().min(1, "Subject code is required."),
  credits: z.coerce.number().min(1, "Credits are required."),
});

const classroomSchema = z.object({
  name: z.string().min(1, "Classroom name is required."),
  capacity: z.coerce.number().min(1, "Capacity is required."),
  isAvailable: z.boolean().default(false),
});

function DataInputContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'faculty';

  const facultyForm = useForm({
    resolver: zodResolver(facultySchema),
    defaultValues: { name: "", subjects: "", availability: "", workload: 0 },
  });

  const batchForm = useForm({
    resolver: zodResolver(batchSchema),
    defaultValues: { name: "", department: "" },
  });
  
  const subjectForm = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: "", code: "", credits: 0 },
  });

  const classroomForm = useForm({
    resolver: zodResolver(classroomSchema),
    defaultValues: { name: "", capacity: 0, isAvailable: true },
  });

  const onSave = (formName: string) => (data: any) => {
    console.log(formName, data);
    toast({ title: "Success", description: `${formName} data saved.` });
  };


  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Data Input</h1>
      <p className="text-muted-foreground">
        Manage all the core data required for timetable generation.
      </p>

      <Tabs defaultValue="faculty" className="w-full">
        <TabsList className={`grid w-full ${role === 'admin' ? 'grid-cols-4' : 'grid-cols-1'}`}>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          {role === 'admin' && (
            <>
              <TabsTrigger value="batches">Student Batches</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value="faculty">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Details</CardTitle>
              <CardDescription>
                Add or edit faculty information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...facultyForm}>
                <form onSubmit={facultyForm.handleSubmit(onSave("Faculty"))} className="space-y-4">
                  <FormField control={facultyForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Dr. Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={facultyForm.control} name="subjects" render={({ field }) => (
                    <FormItem><FormLabel>Subjects</FormLabel><FormControl><Input placeholder="CS101, AI202" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={facultyForm.control} name="availability" render={({ field }) => (
                    <FormItem><FormLabel>Availability</FormLabel><FormControl><Input placeholder="Mon-Fri 9am-5pm" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={facultyForm.control} name="workload" render={({ field }) => (
                    <FormItem><FormLabel>Workload (hours)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit">Save Faculty</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        {role === 'admin' && (
          <>
            <TabsContent value="batches">
              <Card>
                <CardHeader>
                  <CardTitle>Student Batches</CardTitle>
                  <CardDescription>
                    Manage student batches and their details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...batchForm}>
                    <form onSubmit={batchForm.handleSubmit(onSave("Student Batch"))} className="space-y-4">
                      <FormField control={batchForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Batch Name</FormLabel><FormControl><Input placeholder="UG CS Sem 4" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={batchForm.control} name="department" render={({ field }) => (
                        <FormItem><FormLabel>Department</FormLabel><FormControl><Input placeholder="Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit">Save Batch</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="subjects">
              <Card>
                <CardHeader>
                  <CardTitle>Subjects</CardTitle>
                  <CardDescription>
                    Manage subjects and their details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...subjectForm}>
                    <form onSubmit={subjectForm.handleSubmit(onSave("Subject"))} className="space-y-4">
                      <FormField control={subjectForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Subject Name</FormLabel><FormControl><Input placeholder="Introduction to CS" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={subjectForm.control} name="code" render={({ field }) => (
                        <FormItem><FormLabel>Subject Code</FormLabel><FormControl><Input placeholder="CS101" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={subjectForm.control} name="credits" render={({ field }) => (
                        <FormItem><FormLabel>Credits</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit">Save Subject</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="classrooms">
              <Card>
                <CardHeader>
                  <CardTitle>Classrooms</CardTitle>
                  <CardDescription>
                    Manage classrooms and their details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...classroomForm}>
                    <form onSubmit={classroomForm.handleSubmit(onSave("Classroom"))} className="space-y-4">
                      <FormField control={classroomForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Classroom Name</FormLabel><FormControl><Input placeholder="Room 101" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={classroomForm.control} name="capacity" render={({ field }) => (
                        <FormItem><FormLabel>Capacity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={classroomForm.control} name="isAvailable" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Is Available</FormLabel>
                            </div>
                          </FormItem>
                        )} />
                      <Button type="submit">Save Classroom</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function DataInputPageComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataInputContent />
    </Suspense>
  )
}

export default function DataInputPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? <DataInputPageComponent /> : null;
}


"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { mockConstraints } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";


function ConstraintsContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'faculty';


  const form = useForm({
    resolver: zodResolver(z.object({
      description: z.string().min(1, "Description is required."),
      value: z.string().min(1, "Value is required."),
    })),
    defaultValues: { description: "", value: "" },
  });

  const onSave = (data: any) => {
    console.log("Constraint data saved:", data);
    toast({ title: "Success", description: "Constraint saved." });
    form.reset();
  };

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Constraints</h1>
      <p className="text-muted-foreground">
        Define the rules and constraints for timetable generation.
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={role === 'admin' ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card>
            <CardHeader>
              <CardTitle>Existing Constraints</CardTitle>
              <CardDescription>Review and manage the current set of rules.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Description</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockConstraints.map(constraint => (
                    <TableRow key={constraint.id}>
                      <TableCell className="font-medium">{constraint.description}</TableCell>
                      <TableCell>{constraint.value}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        {role === 'admin' && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add New Constraint</CardTitle>
                <CardDescription>Add a new rule for the generator to follow.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Input placeholder="e.g., Max lectures per day" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="value" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl><Input placeholder="e.g., 4 or '1pm-2pm'" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit">Save Constraint</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function ConstraintsPageComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConstraintsContent />
    </Suspense>
  )
}


export default function ConstraintsPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? <ConstraintsPageComponent /> : null;
}

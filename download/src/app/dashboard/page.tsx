
"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, UserCheck, UserX, ThumbsUp, ThumbsDown, Send, Calendar as CalendarIcon, Clock, ArrowRightLeft, BookOpen, Coffee, UserPlus, FileText, Building2, Users, Bell, X as XIcon, Edit, MessageSquare } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { mockFaculty, mockClassrooms } from '@/lib/mock-data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const mockInitialLeaveRequests = [
  { id: 2, facultyId: 'F002', facultyName: 'Dr. Ada Lovelace', subject: 'CS102, DS301', request: 'Requesting Wednesday off.', status: 'Pending' as const, date: '2024-07-31', time: 'All Day', purpose: 'Conference' },
];

const mockInitialChangeRequests = [
    { id: 1, facultyId: 'F001', facultyName: 'Dr. Alan Turing', request: 'Swap CS101 on Mon 9am with CS101 on Tue 10am.', status: 'Pending' as const, fromSlot: 'Monday 09:00-10:00 (CS101)', toSlot: 'Tuesday 10:00-11:00 (CS101)' },
];

const mockMasterWeeklySchedule = {
  "B001": {
    "Monday": [{ time: "09:00-10:30", subject: "CS101", room: "C001", faculty: "Dr. Turing" }],
    "Tuesday": [{ time: "10:30-12:00", subject: "CS101", room: "C001", faculty: "Dr. Turing" }],
    "Wednesday": [],
    "Thursday": [{ time: "11:00-12:30", subject: "CS102", room: "C001", faculty: "Dr. Lovelace" }],
    "Friday": [],
  },
  "B002": {
    "Monday": [],
    "Tuesday": [],
    "Wednesday": [{ time: "14:00-15:30", subject: "AI202", room: "C002", faculty: "Dr. Turing" }],
    "Thursday": [{ time: "10:00-11:30", subject: "DS301", room: "C002", faculty: "Dr. Lovelace" }],
    "Friday": [],
  }
};


const mockFacultyWeeklySchedule = {
  "Monday": [
    { time: "09:00-10:00", batch: "B001", subject: "CS101", room: "C001" },
  ],
  "Tuesday": [
    { time: "10:00-11:00", batch: "B001", subject: "CS101", room: "C001" }
  ],
  "Wednesday": [
    { time: "14:00-15:30", batch: "B002", subject: "AI202", room: "C002" }
  ],
  "Thursday": [],
  "Friday": [],
};

const timeSlots = ["09:00-10:30", "10:30-12:00", "12:00-13:00", "13:00-14:30", "14:30-16:00", "16:00-17:30"];
const masterTimeSlots = ["09:00-10:30", "10:30-12:00", "12:00-13:00", "13:00-14:30", "14:30-16:00", "16:00-17:30"];

type Notification = {
  id: number;
  message: string;
  type: 'Approved' | 'Rejected';
};

// We lift state into a shared object to simulate a backend.
const sharedState = {
    leaveRequests: mockInitialLeaveRequests,
    changeRequests: mockInitialChangeRequests,
    notifications: {} as Record<string, Notification[]>, // Keyed by facultyId
    listeners: {
        leaveRequests: [] as Function[],
        changeRequests: [] as Function[],
        notifications: {} as Record<string, Function[]>, // Keyed by facultyId
    },

    notifyListeners(type: 'leaveRequests' | 'changeRequests', data: any) {
        (this.listeners[type] as Function[]).forEach(l => l(data));
    },
    
    notifyNotificationListeners(facultyId: string, data: any) {
        this.listeners.notifications[facultyId]?.forEach(l => l(data));
    },

    addLeaveRequest(request: any) {
        this.leaveRequests = [...this.leaveRequests, request];
        this.notifyListeners('leaveRequests', this.leaveRequests);
    },
    updateLeaveRequest(requestId: number, newStatus: 'Approved' | 'Rejected') {
        const request = this.leaveRequests.find(r => r.id === requestId);
        if (!request) return;

        this.leaveRequests = this.leaveRequests.map(r => r.id === requestId ? { ...r, status: newStatus } : r);
        this.notifyListeners('leaveRequests', this.leaveRequests);
        
        const message = `Your leave request for ${request.date} has been ${newStatus.toLowerCase()}.`;
        this.addNotification(request.facultyId, message, newStatus);
    },
    updateChangeRequest(requestId: number, newStatus: 'Approved' | 'Rejected') {
        const request = this.changeRequests.find(r => r.id === requestId);
        if (!request) return;

        this.changeRequests = this.changeRequests.map(r => r.id === requestId ? { ...r, status: newStatus } : r);
        this.notifyListeners('changeRequests', this.changeRequests);

        const message = `Your change request for '${request.fromSlot}' has been ${newStatus.toLowerCase()}.`;
        this.addNotification(request.facultyId, message, newStatus);
    },
    addNotification(facultyId: string, message: string, type: 'Approved' | 'Rejected') {
        const newNotification: Notification = { id: Date.now(), message, type };
        if (!this.notifications[facultyId]) {
            this.notifications[facultyId] = [];
        }
        this.notifications[facultyId] = [newNotification, ...this.notifications[facultyId]];
        this.notifyNotificationListeners(facultyId, this.notifications[facultyId]);
    },
    removeNotification(facultyId: string, notificationId: number) {
        if (!this.notifications[facultyId]) return;
        this.notifications[facultyId] = this.notifications[facultyId].filter(n => n.id !== notificationId);
        this.notifyNotificationListeners(facultyId, this.notifications[facultyId]);
    },

    // Subscription methods
    subscribe(type: 'leaveRequests' | 'changeRequests', listener: Function) {
        const listeners = this.listeners[type] as Function[];
        listeners.push(listener);
        // Immediately call listener with current state
        listener(this[type]); 
        return () => {
            (this.listeners[type] as Function[]) = (this.listeners[type] as Function[]).filter(l => l !== listener);
        };
    },
    subscribeToNotifications(facultyId: string, listener: Function) {
        if (!this.listeners.notifications[facultyId]) {
            this.listeners.notifications[facultyId] = [];
        }
        this.listeners.notifications[facultyId].push(listener);
        // Immediately call listener with current state
        listener(this.notifications[facultyId] || []);
        return () => {
            if (this.listeners.notifications[facultyId]) {
                this.listeners.notifications[facultyId] = this.listeners.notifications[facultyId].filter(l => l !== listener);
            }
        };
    }
};


function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') || 'faculty';
  const facultyId = 'F001'; // Assuming this faculty is logged in
  
  const [leaveRequests, setLeaveRequests] = useState(sharedState.leaveRequests);
  const [changeRequests, setChangeRequests] = useState(sharedState.changeRequests);
  const [notifications, setNotifications] = useState<Notification[]>(sharedState.notifications[facultyId] || []);
  
  const { toast } = useToast();
  const [isLeaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const facultyPhoto = PlaceHolderImages.find(p => p.id === 'faculty-photo');
  const facultyDetails = mockFaculty.find(f => f.id === facultyId);

  useEffect(() => {
    const unsubscribeLeave = sharedState.subscribe('leaveRequests', setLeaveRequests);
    const unsubscribeChange = sharedState.subscribe('changeRequests', setChangeRequests);
    let unsubscribeNotifs: Function | null = null;
    
    if (role === 'faculty') {
        unsubscribeNotifs = sharedState.subscribeToNotifications(facultyId, setNotifications);
    }

    return () => {
        unsubscribeLeave();
        unsubscribeChange();
        if (unsubscribeNotifs) {
            unsubscribeNotifs();
        }
    };
  }, [role, facultyId]);


  const removeNotification = (id: number) => {
    sharedState.removeNotification(facultyId, id);
  };


  const handleLeaveRequest = (requestId: number, newStatus: 'Approved' | 'Rejected') => {
    sharedState.updateLeaveRequest(requestId, newStatus);
    toast({
      title: `Request ${newStatus}`,
      description: `The leave request has been ${newStatus.toLowerCase()}.`,
    });
  };

  const handleChangeRequest = (requestId: number, newStatus: 'Approved' | 'Rejected') => {
    const request = changeRequests.find(r => r.id === requestId);
    if (!request) return;

    if (newStatus === 'Approved' && role === 'admin') {
      const prompt = `Faculty ${request.facultyId} (${request.facultyName}) requested to change their schedule. Details: ${request.request}`;
      const params = new URLSearchParams({
        role: 'admin',
        facultyId: request.facultyId,
        facultyPreferences: prompt,
      });
      router.push(`/dashboard/review?${params.toString()}`);
    } else {
      sharedState.updateChangeRequest(requestId, newStatus);
      toast({
        title: `Request ${newStatus}`,
        description: `The change request has been ${newStatus.toLowerCase()}.`,
      });
    }
  };
  
  const handleLeaveRequestSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const newRequest = {
      id: Date.now(),
      facultyId: facultyId, 
      facultyName: facultyDetails?.name || 'Unknown Faculty',
      subject: facultyDetails?.subjects.join(', ') || '',
      request: `Leave request for ${data.date} at ${data.time}. Purpose: ${data.purpose}`,
      status: 'Pending' as const,
      date: String(data.date),
      time: String(data.time),
      purpose: String(data.purpose),
    };

    sharedState.addLeaveRequest(newRequest);
    
    toast({
      title: 'Request Sent',
      description: 'Your leave permission request has been sent to the admin for approval.',
    });
    setLeaveDialogOpen(false);
  };

  const getHref = (path: string) => {
    return `/dashboard/${path}?role=${role}`;
  }

  const getRoomCapacity = (roomId: string) => {
    const room = mockClassrooms.find(c => c.id === roomId);
    return room ? room.capacity : 'N/A';
  }

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="flex flex-col space-y-6">
      
      {role === 'admin' && (
        <>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Faculty</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">out of 45 total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent Faculty</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                 <p className="text-xs text-muted-foreground">2 on leave, 1 absent</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leaveRequests.filter(r => r.status === 'Pending').length}
                </div>
                <p className="text-xs text-muted-foreground">pending review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Change Requests</CardTitle>
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                   {changeRequests.filter(r => r.status === 'Pending').length}
                </div>
                 <p className="text-xs text-muted-foreground">awaiting approval</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Master Timetable</CardTitle>
                <CardDescription>A complete overview of the weekly schedule for all batches.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-8">
                  {Object.entries(mockMasterWeeklySchedule).map(([batchId, schedule]) => (
                    <div key={batchId}>
                      <h3 className="text-lg font-semibold mb-2">Batch {batchId}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">Time</TableHead>
                            {daysOfWeek.map(day => (
                              <TableHead key={day}>{day}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                         {masterTimeSlots.map(slot => {
                            const isLunch = slot === "12:00-13:00";
                            return (
                                <TableRow key={slot}>
                                <TableCell className="font-medium">{slot}</TableCell>
                                {daysOfWeek.map(day => {
                                    if(isLunch) {
                                      return <TableCell key={day} className="text-center font-semibold text-muted-foreground bg-muted/20">Lunch</TableCell>
                                    }
                                    const classInfo = (schedule as any)[day]?.find((c: any) => c.time === slot);
                                    return (
                                        <TableCell key={day} className="align-top">
                                            {classInfo ? (
                                                <Badge variant="secondary" className="whitespace-nowrap flex-col !items-start !p-2 h-auto w-full justify-start text-left space-y-1">
                                                    <p className="font-bold">{classInfo.subject}</p>
                                                    <p className="font-normal text-xs">{classInfo.faculty}</p>
                                                    <p className="font-normal text-xs flex items-center gap-1"><Building2 className="h-3 w-3" />{classInfo.room}</p>
                                                    <p className="font-normal text-xs flex items-center gap-1"><Users className="h-3 w-3" /> {getRoomCapacity(classInfo.room)}</p>
                                                </Badge>
                                            ) : (
                                                <div className="h-20 rounded-md bg-muted/30 w-full flex items-center justify-center">
                                                    <p className="text-xs text-muted-foreground">Free</p>
                                                </div>
                                            )}
                                        </TableCell>
                                    );
                                })}
                                </TableRow>
                            );
                         })}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Review and respond to faculty leave requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaveRequests.filter(r => r.status === 'Pending').length > 0 ? leaveRequests.filter(r => r.status === 'Pending').map(request => (
                    <div key={request.id} className="flex items-start justify-between p-3 rounded-lg border bg-card">
                      <div className="space-y-2">
                         <div className="flex items-center gap-2">
                           <User className="h-4 w-4 text-muted-foreground" />
                           <p className="text-sm font-medium">{request.facultyName} ({request.facultyId})</p>
                         </div>
                         <p className="text-sm text-muted-foreground pl-6 flex items-center gap-2"><CalendarIcon className="h-3 w-3" /> Date: <span className="font-semibold text-foreground">{request.date}</span></p>
                         <p className="text-sm text-muted-foreground pl-6 flex items-center gap-2"><Clock className="h-3 w-3" /> Time: <span className="font-semibold text-foreground">{request.time}</span></p>
                         <p className="text-sm text-muted-foreground pl-6 flex items-center gap-2"><MessageSquare className="h-3 w-3" /> Purpose: <span className="font-semibold text-foreground">{request.purpose}</span></p>
                      </div>
                      {request.status === 'Pending' ? (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 text-green-500 hover:text-green-600 border-green-500/50 hover:bg-green-500/10" onClick={() => handleLeaveRequest(request.id, 'Approved')}>
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                           <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 border-red-500/50 hover:bg-red-500/10" onClick={() => handleLeaveRequest(request.id, 'Rejected')}>
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Badge variant={request.status === 'Approved' ? 'secondary' : 'destructive'}>{request.status}</Badge>
                      )}
                    </div>
                  )) : <p className="text-sm text-muted-foreground text-center py-4">No pending leave requests.</p>}
                </div>
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                  <CardTitle>Timetable Change Requests</CardTitle>
                  <CardDescription>Review and respond to faculty timetable change requests.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {changeRequests.filter(r => r.status === 'Pending').length > 0 ? changeRequests.filter(r => r.status === 'Pending').map(request => (
                      <div key={request.id} className="flex items-start justify-between p-3 rounded-lg border bg-card">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2">
                             <User className="h-4 w-4 text-muted-foreground" />
                             <p className="text-sm font-medium">{request.facultyName} ({request.facultyId})</p>
                           </div>
                           <p className="text-sm text-muted-foreground pl-6">Request: <span className="font-semibold text-foreground">{request.request}</span></p>
                            <div className="flex items-center gap-2 pl-6 text-sm">
                                <Badge variant="outline">{request.fromSlot}</Badge>
                                <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                                <Badge variant="secondary">{request.toSlot}</Badge>
                            </div>
                        </div>
                        {request.status === 'Pending' ? (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 text-green-500 hover:text-green-600 border-green-500/50 hover:bg-green-500/10" onClick={() => handleChangeRequest(request.id, 'Approved')}>
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                             <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 border-red-500/50 hover:bg-red-500/10" onClick={() => handleChangeRequest(request.id, 'Rejected')}>
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Badge variant={request.status === 'Approved' ? 'secondary' : 'destructive'}>{request.status}</Badge>
                        )}
                      </div>
                    )) : <p className="text-sm text-muted-foreground text-center py-4">No pending change requests.</p>}
                  </div>
                </CardContent>
              </Card>
          </div>
        </>
      )}

      {role !== 'admin' && facultyDetails && (
         <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {facultyDetails.name}!</h1>
                    <p className="text-muted-foreground">Here's your schedule and actions for today.</p>
                </div>
                 <div className="flex items-center gap-4">
                    {facultyPhoto && (
                      <div className="relative h-16 w-16 rounded-full overflow-hidden">
                         <Image
                          src={facultyPhoto.imageUrl}
                          alt="Faculty photo"
                          fill
                          style={{ objectFit: 'cover' }}
                          data-ai-hint={facultyPhoto.imageHint}
                        />
                      </div>
                    )}
                    <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4"/>
                    </Button>
                </div>
            </div>

            {notifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {notifications.map(notification => (
                    <Alert key={notification.id} variant={notification.type === 'Approved' ? 'default' : 'destructive'} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {notification.type === 'Approved' ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
                        <AlertDescription>
                          {notification.message}
                        </AlertDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeNotification(notification.id)}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            )}

             <div className="grid gap-6 md:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Class</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">CS101</div>
                        <p className="text-xs text-muted-foreground">at 9:00 AM in Room C001</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Classes Today</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Across 2 different batches</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Free Slots Today</CardTitle>
                        <Coffee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">Available for swaps or prep</p>
                    </CardContent>
                </Card>
             </div>

             <div className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                    <CardTitle>My Weekly Timetable</CardTitle>
                    <CardDescription>Your scheduled classes for the week. Free periods are shown in gray.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Time</TableHead>
                            {Object.keys(mockFacultyWeeklySchedule).map(day => <TableHead key={day}>{day}</TableHead>)}
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {timeSlots.map(slot => (
                            <TableRow key={slot}>
                            <TableCell className="font-medium">{slot}</TableCell>
                            {Object.keys(mockFacultyWeeklySchedule).map(day => {
                                const classInfo = (mockFacultyWeeklySchedule as any)[day].find((c: any) => c.time.startsWith(slot.split('-')[0]));
                                const isLunch = slot === "12:00-13:00";
                                if(isLunch) {
                                return <TableCell key={day} className="text-center font-semibold text-muted-foreground bg-muted/20">Lunch</TableCell>
                                }
                                return (
                                <TableCell key={day}>
                                    {classInfo ? (
                                      <Badge variant="secondary" className="whitespace-nowrap w-full justify-center text-center flex-col items-start !p-2 h-auto">
                                          <p className="font-bold">{classInfo.subject} ({classInfo.batch})</p>
                                          <p className="font-normal text-xs">Venue: {classInfo.room}</p>
                                          <p className="font-normal text-xs flex items-center gap-1"><Users className="h-3 w-3" /> {getRoomCapacity(classInfo.room)}</p>
                                      </Badge>
                                    ) : (
                                    <div className="h-10 rounded-md bg-muted/30 w-full flex items-center justify-center">
                                        <p className="text-xs text-muted-foreground">Free</p>
                                    </div>
                                    )}
                                </TableCell>
                                );
                            })}
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Details</CardTitle>
                            <CardDescription>Your professional information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                           <div className="flex justify-center pb-4">
                              {facultyPhoto && (
                                <div className="relative h-24 w-24 rounded-full overflow-hidden">
                                  <Image
                                    src={facultyPhoto.imageUrl}
                                    alt="Faculty photo"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    data-ai-hint={facultyPhoto.imageHint}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{facultyDetails.name}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{facultyDetails.department}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <span className="font-semibold">Subjects</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {facultyDetails.subjects.map(subject => (
                                            <Badge key={subject} variant="outline">{subject}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave Permission</CardTitle>
                            <CardDescription>Request absence for appointments or other duties.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Dialog open={isLeaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
                            <DialogTrigger asChild>
                            <Button className="w-full">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Request Leave
                            </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Request Leave</DialogTitle>
                                <DialogDescription>
                                Fill out the form below to request leave. Your request will be sent to the administrator for approval.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleLeaveRequestSubmit}>
                                <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="date" className="text-right">Date</Label>
                                    <Input id="date" name="date" type="date" className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="time" className="text-right">Time</Label>
                                    <Input id="time" name="time" type="time" className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="purpose" className="text-right">Purpose</Label>
                                    <Textarea id="purpose" name="purpose" className="col-span-3" placeholder="e.g., Personal appointment" required />
                                </div>
                                </div>
                                <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                <Button type="submit">Send Request</Button>
                                </DialogFooter>
                            </form>
                            </DialogContent>
                        </Dialog>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Request Schedule Change</CardTitle>
                            <CardDescription>Swap classes or request other timetable adjustments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={getHref('review')} className="w-full">
                                <Button className="w-full" variant="outline">
                                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                                    Open Change Request Form
                                </Button>
                             </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function DashboardPageComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}


export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? <DashboardPageComponent /> : null;
}

    
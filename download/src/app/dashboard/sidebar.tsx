
"use client";

import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { BarChart3, Database, FileCheck2, LayoutGrid, Wand2, CircleAlert } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function DashboardSidebar() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'faculty';

  const getHref = (path: string) => {
    return `/dashboard/${path}?role=${role}`;
  }

  const isAdmin = role === 'admin';
  const isFaculty = role === 'faculty';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href={getHref('')}>
            <LayoutGrid />
            Dashboard
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {isAdmin && (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={getHref('data')}>
              <Database />
              Data Input
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href={getHref('constraints')}>
            <CircleAlert />
            Constraints
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isAdmin && (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={getHref('generator')}>
              <Wand2 />
              Generator
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}

      {isAdmin && (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={getHref('review')}>
              <FileCheck2 />
              AI Suggestions
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
      
      {isFaculty && (
         <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={getHref('review')}>
              <FileCheck2 />
              Request Form
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}

      {isAdmin && (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={getHref('reports')}>
              <BarChart3 />
              Reports
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}

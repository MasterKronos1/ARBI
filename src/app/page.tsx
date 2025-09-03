
"use client";
import { Chat } from "@/components/chat";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Briefcase, Edit, HeartPulse, Landmark, Settings } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type Role = "health advisor" | "finance expert" | "business consultant";

const roles: {
  value: Role;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  context: string;
}[] = [
  {
    value: "health advisor",
    label: "Health Advisor",
    icon: HeartPulse,
    context:
      "You are a health advisor providing guidance on health and wellness.",
  },
  {
    value: "finance expert",
    label: "Finance Expert",
    icon: Landmark,
    context:
      "You are a finance expert providing advice on financial matters.",
  },
  {
    value: "business consultant",
    label: "Business Consultant",
    icon: Briefcase,
    context:
      "You are a business consultant providing strategic business advice.",
  },
];

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<Role>(roles[0].value);
  const [messages, setMessages] = useState<any[]>([]);
  const { toast } = useToast();

  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "You can start a new conversation now.",
    });
  };

  const handleRoleChange = (value: Role) => {
    setSelectedRole(value);
    setMessages([]);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Button variant="outline" className="w-full" onClick={handleClearChat}>
            <Edit className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </SidebarHeader>
        <SidebarContent className="p-2">
           <SidebarGroup>
              <SidebarGroupLabel>Chat History</SidebarGroupLabel>
           </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex h-screen w-full flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex w-full items-center gap-4">
              <Select value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-[180px] sm:w-[220px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="h-4 w-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
          </header>
          <Chat
            selectedRole={selectedRole}
            roles={roles}
            messages={messages}
            setMessages={setMessages}
            onClearChat={handleClearChat}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


"use client";

import { generateResponse } from "@/ai/flows/response-generation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Trash2, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Role = "health advisor" | "finance expert" | "business consultant";

interface ChatProps {
  selectedRole: Role;
  roles: {
    value: Role;
    label: string;
    icon: React.ComponentType<{
      className?: string;
    }>;
    context: string;
  }[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onClearChat: () => void;
}

export function Chat({
  selectedRole,
  roles,
  messages,
  setMessages,
  onClearChat,
}: ChatProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const roleContext = roles.find((r) => r.value === selectedRole)?.context;
      if (!roleContext) {
        throw new Error("Invalid role selected");
      }

      const response = await generateResponse({
        userInput: input,
        roleContext,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.generatedResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.id === userMessage.id) {
        setMessages((prev) => prev.slice(0, prev.length - 1));
      }

      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem generating the response.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const RoleIcon = roles.find((r) => r.value === selectedRole)?.icon || Bot;

  return (
    <div className="flex h-full w-full flex-col">
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
            {messages.length === 0 && !isLoading && (
              <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center text-center">
                <RoleIcon className="mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">
                  {roles.find((r) => r.value === selectedRole)?.label}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Start a conversation by typing your message below.
                </p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-4 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-9 w-9 border bg-background">
                    <AvatarFallback className="bg-transparent">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xl rounded-lg px-4 py-3 shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-9 w-9 border bg-background">
                    <AvatarFallback className="bg-transparent">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar className="h-9 w-9 border bg-background">
                  <AvatarFallback className="bg-transparent">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-md rounded-lg bg-muted p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t bg-background p-4">
        <div className="mx-auto w-full max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center gap-4"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              placeholder={`Message ${
                roles.find((r) => r.value === selectedRole)?.label
              }...`}
              className="flex-1 resize-none"
              rows={1}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClearChat}>
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Clear Chat</span>
            </Button>
          </form>
        </div>
      </CardFooter>
    </div>
  );
}

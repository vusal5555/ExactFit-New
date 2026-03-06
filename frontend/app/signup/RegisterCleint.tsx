"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { email, z } from "zod";
import { browserClient } from "@/lib/browser-client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const formSchema = z.object({
  email: email(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const RegisterClient = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const supabase = browserClient();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const email = values.email;
    const password = values.password;
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (response.error) {
      setError(response.error.message);
      setSuccess(null);
    } else {
      setError(null);
      setSuccess("Check your email to confirm your account.");
    }
  }

  const onGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setSuccess(null);
    }
  };

  return (
    <div className="m-auto h-screen flex items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-96">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {error && (
                  <FormDescription className="text-red-500">
                    {error}
                  </FormDescription>
                )}
                {success && (
                  <FormDescription className="text-green-500">
                    {success}
                  </FormDescription>
                )}
              </FormItem>
            )}
          />
          <div className="flex items-center gap-1">
            <Button type="submit">Submit</Button>
            <Button type="button" onClick={onGoogleSignIn}>
              Sign in with Google
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterClient;

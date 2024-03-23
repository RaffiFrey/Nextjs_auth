"use client"

import React from 'react';
import * as z from "zod";
import {CardWrapper} from "@/components/auth/card-wrapper";
import {zodResolver} from "@hookform/resolvers/zod";
import {LoginSchema} from "@/schemas";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel, FormMessage,
} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import {FormSuccess} from "@/components/form-success";
import {login} from "@/actions/login";

export const LoginForm = () => {
    const [error, setError] = React.useState<string | undefined>("");
    const [success, setSuccess] = React.useState<string | undefined>("");
    const [isPending, startTransition] = React.useTransition();
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            login(values)
                .then((data) => {
                    setError(data.error);
                    setSuccess(data.success);
                })
        });
    }


    return (
        <CardWrapper
            headerLabel={"Welcome back!"}
            backButtonLabel={"Don't have an account?"}
            backButtonHref={"/auth/register"}
            showSocial
        >
            <Form {...form}>
                <form
                    className={"space-y-6"}
                    onSubmit={form.handleSubmit(onSubmit)}>
                    <div className={"space-y-4"}>
                        <FormField
                            control={form.control}
                            name={"email"}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                   <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder={"john.doe@example.com"}
                                            type={"email"}
                                        />
                                   </FormControl>
                                   <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={"password"}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder={"******"}
                                            type={"password"}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        disabled={isPending}
                        type={"submit"}
                        className={"w-full"}
                        variant={"primary"}
                    >
                        Login
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};
"use client"

import React from 'react';
import * as z from "zod";
import {CardWrapper} from "@/components/auth/card-wrapper";
import {zodResolver} from "@hookform/resolvers/zod";
import {RegisterSchema} from "@/schemas";

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
import {register} from "@/actions/register";

export const RegisterForm = () => {
    const [error, setError] = React.useState<string | undefined>("");
    const [success, setSuccess] = React.useState<string | undefined>("");
    const [isPending, startTransition] = React.useTransition();
    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            name: ""
        }
    });

    const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            register(values)
                .then((data) => {
                    setError(data.error);
                    setSuccess(data.success);
                })
        });
    }


    return (
        <CardWrapper
            headerLabel={"Create an account"}
            backButtonLabel={"Already have an account?"}
            backButtonHref={"/auth/login"}
            showSocial
        >
            <Form {...form}>
                <form
                    className={"space-y-6"}
                    onSubmit={form.handleSubmit(onSubmit)}>
                    <div className={"space-y-4"}>
                        <FormField
                            control={form.control}
                            name={"name"}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder={"John Doe"}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
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
                        Create an account
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};
"use client"

import React from 'react';
import * as z from "zod";
import {CardWrapper} from "@/components/auth/card-wrapper";
import {zodResolver} from "@hookform/resolvers/zod";
import {ResetSchema} from "@/schemas";

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
import {reset} from "@/actions/reset";

export const ResetForm = () => {
    const [error, setError] = React.useState<string | undefined>("");
    const [success, setSuccess] = React.useState<string | undefined>("");
    const [isPending, startTransition] = React.useTransition();
    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: "",
        }
    });

    const onSubmit = (values: z.infer<typeof ResetSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            reset(values)
                .then((data) => {
                    // @ts-ignore
                    setError(data?.error);
                    setSuccess(data?.success);
                })
        });
    }


    return (
        <CardWrapper
            headerLabel={"Forgot your password?"}
            backButtonLabel={"Back to login"}
            backButtonHref={"/auth/login"}
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
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        disabled={isPending}
                        type={"submit"}
                        className={"w-full"}
                        variant={"primary"}
                    >
                        Send reset email
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};
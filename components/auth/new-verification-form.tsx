"use client"

import {CardWrapper} from "@/components/auth/card-wrapper";
import {useSearchParams} from "next/navigation";

import React, {useCallback, useEffect, useState} from 'react';
import {BeatLoader} from "react-spinners";
import {newVerification} from "@/actions/new-verification";
import {FormError} from "@/components/form-error";
import {FormSuccess} from "@/components/form-success";

export const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [success , setSuccess] = useState<string | undefined>(undefined);
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if (!token) {
            setError("Missing token");
            return;
        }
        newVerification(token).then((data) => {
           setSuccess(data.success);
              setError(data.error);
        }).catch((error) => {
            setError("An error occurred");
        });
    }, [token]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <CardWrapper headerLabel={"Confirming your verification"} backButtonLabel={"Back to login"} backButtonHref={"/auth/login"}>
            <div className={"flex items-center w-full justify-center"}>
                {!success && !error && <BeatLoader />}
                <FormError message={error} />
                {!success && (
                    <FormSuccess message={success} />
                )}
            </div>
        </CardWrapper>
    );
};
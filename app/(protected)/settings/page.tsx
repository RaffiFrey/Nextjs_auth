"use client"

import React from 'react';
import {logout} from "@/actions/logout";
import {useCurrentUser} from "@/hooks/use-current-user";

const SettingsPage = () => {
    const user = useCurrentUser();
    const onClick = () => {
        logout();
    }
    return (
        <div>
            {JSON.stringify(user)}
            <button onClick={onClick} type={"submit"}>
                Sign out
            </button>
        </div>
    )
};

export default SettingsPage;
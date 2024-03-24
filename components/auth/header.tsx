import {Poppins} from "next/font/google";
import {cn} from "@/lib/utils";
import Image from "next/image";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"]
});

interface HeaderProps {
    name?: string;
    label: string;
    logo?: string;
}

export default function Header({label, name="Auth", logo}: HeaderProps) {
    return (
        <div className={"w-full flex flex-col gap-y-4 items-center"}>
            <div className={cn(
                "text-3xl text-semibold", font.className
            )}>
                {logo ? (
                    <div className={"flex gap-y-6 justify-between items-center"}>
                        <div className={"mr-2 h-16 w-16"}>
                            <Image src={logo} alt={"Logo"} height={360} width={360} />
                        </div>
                        {name}
                    </div>
                )
                    : <div>🔐 {name}</div>
                }
            </div>
            <p className={"text-muted-foreground text-sm"}>
                {label}
            </p>
        </div>
    )
}
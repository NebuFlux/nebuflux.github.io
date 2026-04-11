"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";


export const Header = () => {

    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative flex flex-row px-3 h-15 items-end">
            <Link className="transition-transform hover:-translate-y-1" href="/">
                <Image 
                src="https://github.com/NebuFlux.png"
                width={50}
                height={50}
                className={`object-left rounded-full object-cover  
                    ${pathname ==="/" ? "border-4 border-primary" : "border-4 border-secondary"}`}
                alt="GitHub Profile Pic"
                />
            </Link>
            <h3 className="text-base md:text-xl lg:text-2xl mb-0.5 mx-2 md:mx-5 text-primary">Joshua Shoemaker</h3>
            <a className="transition-transform hover:-translate-y-1" target="_blank" href="https://github.com/nebuflux">
                <SiGithub 
                className="fill-primary ml-2 mb-2"
                size={25}
                />
            </a>
            <div className="hidden md:flex flex-row items-end ml-auto gap-10 text-secondary">
                <Link className={`text-xl transition-transform hover:-translate-y-1 no-underline
                ${pathname ==="/artifact_1" ? "text-primary border-b-2 border-primary" : ""}`} href="/artifact_1">
                    Artifact 1
                </Link>
                <Link className={`text-xl transition-transform hover:-translate-y-1 no-underline
                ${pathname ==="/artifact_2" ? "text-primary border-b-2 border-primary" : ""}`} href="/artifact_2">
                    Artifact 2
                </Link>
                <Link className={`text-xl transition-transform hover:-translate-y-1 no-underline
                ${pathname ==="/artifact_3" ? "text-primary border-b-2 border-primary" : ""} mr-10`} href="/artifact_3">
                    Artifact 3
                </Link>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className={`md:hidden ml-auto mr-4`}>
                {isOpen ? <X size={24} /> : <Menu size={24}/>}
            </button>
            {isOpen &&
            <div className="absolute top-full right-15 p-2 rounded-2xl bg-surface flex flex-col gap-4">
                <Link onClick={() => setIsOpen(false)}
                className={`text-xl transition-transform hover:-translate-y-1 no-underline
                ${pathname ==="/artifact_1" ? "text-primary border-b-2 border-primary" : ""}`} href="/artifact_1">
                    Artifact 1
                </Link>
                <Link onClick={() => setIsOpen(false)}
                className={`text-xl transition-transform hover:-translate-y-1 no-underline
                ${pathname ==="/artifact_2" ? "text-primary border-b-2 border-primary" : ""}`} href="/artifact_2">
                    Artifact 2
                </Link>
                <Link onClick={() => setIsOpen(false)}
                className={`text-xl transition-transform hover:-translate-y-1 no-underline
                ${pathname ==="/artifact_3" ? "text-primary border-b-2 border-primary" : ""}`} href="/artifact_3">
                    Artifact 3
                </Link>
            </div>}
        </div>
    );
}
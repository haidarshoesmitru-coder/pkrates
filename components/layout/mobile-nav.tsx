"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface NavLink {
  href: string;
  label: string;
}

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="PKRates logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
            PKRates
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-2 py-4">
          {links.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
              >
                {link.label}
                <ChevronRight className="h-4 w-4 text-ink-400" />
              </Link>
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto px-6 py-5 border-t border-ink-200 dark:border-ink-800">
          <SheetClose asChild>
            <Button className="w-full" asChild>
              <Link href="/#newsletter">Get Rate Alerts</Link>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

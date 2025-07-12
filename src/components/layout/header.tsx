"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Bot } from "lucide-react";

const navLinks = [
  { href: "/", label: "Criar Job" },
  { href: "/jobs", label: "Fila de Jobs" },
  { href: "/analytics", label: "Análise Avançada" },
];

export default function Header() {
  const pathname = usePathname();

  const NavLinks = ({ className }: { className?: string }) => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === link.href ? "text-primary" : "text-muted-foreground",
            className
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">FiscalFlow</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <NavLinks />
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <Link
                  href="/"
                  className="mr-6 flex items-center space-x-2 mb-6"
                >
                  <Bot className="h-6 w-6 text-primary" />
                  <span className="font-bold">FiscalFlow</span>
                </Link>
                <nav className="grid gap-4">
                  <NavLinks className="text-lg" />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

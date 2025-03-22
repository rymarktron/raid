import Link from "next/link";

import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-slate-50">
      <Container>
        <div className="py-16">
          <Logo className="mx-auto h-10 w-auto" />
          <nav className="mt-10 text-sm" aria-label="quick links">
            <div className="-my-1 flex justify-center gap-x-6">
              <NavLink href="#chatbot">Chatbot</NavLink>
              <NavLink href="#commonquestions">Common Questions</NavLink>
              <NavLink href="#faq">FAQ</NavLink>
            </div>
          </nav>
        </div>
        <div className="flex flex-col items-center border-t border-slate-400/10 py-10 sm:flex-row-reverse sm:justify-between">
          <div className="flex gap-x-6">
            <Link
              href="https://uwaterloo.ca/human-resources/"
              className="group"
              aria-label="University of Waterloo"
            >
              <Image
                src="https://uwaterloo.ca/brand/sites/ca.brand/files/styles/body-500px-wide/public/uploads/images/university-of-waterloo-vertical-logo.png?itok=9KCQdLsy"
                alt="University of Waterloo Logo"
                width={120} // Adjust the width to fit your layout
                height={24} // Adjust the height to fit your layout
                className="group-hover:opacity-80"
              />
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500 sm:mt-0">
            Copyright &copy; {new Date().getFullYear()} Team RAID, Waterloo
            Capstone. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}

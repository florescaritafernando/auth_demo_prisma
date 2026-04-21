
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/* nav imports */
import * as React from "react"
import Link from "next/link"
import Autoplay from "embla-carousel-autoplay"


import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

/* carousel imports */
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"

const PRODUCTOS_DESTACADOS = [
  {
    nombre: "D-10-001",
    categoria: "Telas Industriales",
    imagen: "/images/D-10-001.PNG", // Tu imagen actual
  },
  {
    nombre: "D-10-005",
    categoria: "Telas",
    imagen: "/images/D-10-005.PNG"
  },
  {
    nombre: "D-10-020",
    categoria: "Telas",
    imagen: "/images/D-10-020.PNG"
  },
  {
    nombre: "D-27-310",
    categoria: "Telas",
    imagen: "/images/D-27-310.PNG"
  },
  {
    nombre: "D-27-315",
    categoria: "Telas",
    imagen: "/images/D-27-315.PNG"
  },
  {
    nombre: "D-27-500",
    categoria: "Telas",
    imagen: "/images/D-27-500.PNG"
  },
  {
    nombre: "D-27-505",
    categoria: "Telas",
    imagen: "/images/D-27-505.PNG"
  },
];

const ListItem = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href || "#"}
          ref={ref}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export default async function Home() {


  return (
    <div>
      <header>
        <div className="w-full flex justify-between pt-4 pb-4 pl-12 pr-12">
          <div className="text-3xl">Manchester Collection Peru</div>
          <div><input type="text" placeholder="Search" /></div>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <ListItem href="/docs" title="Introduction">
                      Re-usable components built with Tailwind CSS.
                    </ListItem>
                    <ListItem href="/docs/installation" title="Installation">
                      How to install dependencies.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/login" passHref legacyBehavior={false}>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Login
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/signup" passHref legacyBehavior={false}>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Register
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>

      <div className="w-full flex justify-center py-10 px-4 md:px-10">
        <Carousel className="w-full p-10" >
          <CarouselContent className="-ml-4">
            {PRODUCTOS_DESTACADOS.map((prod) => (
              <CarouselItem key={prod.imagen} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 p-4 transition-all hover:shadow-2xl hover:shadow-blue-500/10">

                  {/* Contenedor de Imagen Profesional */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-slate-50">
                    <Badge>{prod.nombre}</Badge>
                    <Image
                      src={prod.imagen}
                      alt={prod.nombre}
                      fill
                      className="object-contain p-8 transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-6 h-12 w-12 border-none shadow-lg" />
          <CarouselNext className="-right-6 h-12 w-12 border-none shadow-lg" />
        </Carousel>
      </div>
    </div>
  )
}
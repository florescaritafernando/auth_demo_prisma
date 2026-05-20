"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {}

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    SliderProps
>(({ className, ...props }, ref) => {
    const min = props.min ?? 0
    const max = props.max ?? 100
    const value = props.value?.[0] ?? max
    const percentage = ((value - min) / (max - min)) * 100

    return (
        <SliderPrimitive.Root
            ref={ref}
            className={cn(
                "relative flex w-full touch-none select-none items-center py-4",
                className
            )}
            {...props}
        >
            <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-gray-100">
                <div 
                    className="absolute h-full rounded-full bg-black transition-all duration-75 ease-out"
                    style={{
                        left: '0%',
                        right: 'auto',
                        width: `${percentage}%`
                    }}
                />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb 
                className="block h-6 w-6 rounded-full border-3 border-black bg-black shadow-md ring-offset-background transition-transform duration-75 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-105 cursor-grab active:cursor-grabbing"
            />
        </SliderPrimitive.Root>
    )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
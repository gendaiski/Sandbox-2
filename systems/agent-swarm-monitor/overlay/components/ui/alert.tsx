import * as React from 'react';
import { cn } from '@/lib/utils';
export function Alert({className,variant,...props}:React.HTMLAttributes<HTMLDivElement>&{variant?:string}){return <div role="alert" className={cn('relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7',variant==='destructive'?'border-red-300 text-red-700':'border-gray-200 text-gray-900',className)} {...props}/>}
export function AlertTitle({className,...props}:React.HTMLAttributes<HTMLHeadingElement>){return <h5 className={cn('mb-1 font-medium leading-none tracking-tight',className)} {...props}/>}
export function AlertDescription({className,...props}:React.HTMLAttributes<HTMLParagraphElement>){return <div className={cn('text-sm [&_p]:leading-relaxed',className)} {...props}/>}

import Root from './speech-bubble.svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { tv, type VariantProps } from 'tailwind-variants';

const speechBubbleVariants = tv({
    base: 'relative bg-white text-black p-4 text-center text-xl leading-none speech-bubble font-bold uppercase w-60 h-min rounded-2xl scale-y-90 border-[3px] border-black',
    variants: {
        arrowSide: {
            left: [
                // outer border triangle
                'before:content-[\'\'] before:absolute before:border-solid before:block',
                'before:border-y-[13px] before:border-r-[23px] before:border-l-0',
                'before:border-y-transparent before:border-r-black before:border-l-transparent',
                'before:top-1/2 before:-translate-y-1/2 before:left-[-23px]',
                
                // inner white triangle
                'after:content-[\'\'] after:absolute after:border-solid after:block',
                'after:border-y-[10px] after:border-r-[20px] after:border-l-0',
                'after:border-y-transparent after:border-r-white after:border-l-transparent',
                'after:top-1/2 after:-translate-y-1/2 after:left-[-17px]' 
            ],
            right: [
                // outer border triangle
                'before:content-[\'\'] before:absolute before:border-solid before:block',
                'before:border-y-[13px] before:border-l-[23px] before:border-r-0',
                'before:border-y-transparent before:border-l-black before:border-r-transparent',
                'before:top-1/2 before:-translate-y-1/2 before:right-[-23px]',
                
                // inner white triangle
                'after:content-[\'\'] after:absolute after:border-solid after:block',
                'after:border-y-[10px] after:border-l-[20px] after:border-r-0',
                'after:border-y-transparent after:border-l-white after:border-r-transparent',
                'after:top-1/2 after:-translate-y-1/2 after:right-[-17px]'
            ],
        },
    },
    defaultVariants: {
        arrowSide: 'right',
    }
});


type ArrowSide = VariantProps<typeof speechBubbleVariants>['arrowSide'];

type Props = HTMLAttributes<HTMLDivElement> & {
    arrowSide?: ArrowSide
};

export {
    Root,
    type Props,
    type ArrowSide,
    //
    speechBubbleVariants,
    Root as SpeechBubble
};
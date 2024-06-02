import { trigger, transition, style, animate } from '@angular/animations';

/**
 * I got tired of copy and pasting the same animations into every component that needed them.
 * Let's just call static functions so we can reuse the animations.
 */
export class YabaAnimations {
    static ANIMATE_MS = 400;

    static fadeSlideDown() {
        return trigger('fade-slide-down', [
            transition(
              ':enter', [
                style({ opacity: 0, height: 0 }),
                animate(YabaAnimations.ANIMATE_MS, style({opacity: 1, height: '*'}))
            ]),
            transition(
              '* => void', [
                style({ opacity: 1, height: '*' }),
                animate(YabaAnimations.ANIMATE_MS, style({ opacity: 0, height: 0 }))
            ]),
          ]);  
    }

    static fade() {
        return trigger('fade', [
            transition(
              ':enter', [
                style({ opacity: 0 }),
                animate(YabaAnimations.ANIMATE_MS, style({opacity: 1}))
            ]),
            transition(
              '* => void', [
              style({ opacity: 1 }),
              animate(YabaAnimations.ANIMATE_MS, style({ opacity: 0 }))
            ]),
          ]);
    }
}

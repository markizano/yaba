import { trigger, transition, style, animate } from '@angular/animations';

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
              ':leave',
              animate(400, style({ opacity: 0, height: 0 }))
            ),
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
              ':leave',
              animate(YabaAnimations.ANIMATE_MS, style({ opacity: 0 }))
            ),
          ]);
    }

}

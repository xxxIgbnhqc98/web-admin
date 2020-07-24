import { Pipe, PipeTransform } from '@angular/core';

@Pipe( { name: 'NumberPipe'})

export class NumberPipe implements PipeTransform{
    transform(value: any){
            value = value + '';
            value = value.split('.');
            var x1 = value[0];
            var x2 = value.length > 1 ? '.' + value[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1))
              x1 = x1.replace(rgx, '$1' + ',' + '$2');
            return x1 + x2;
          
    }
}
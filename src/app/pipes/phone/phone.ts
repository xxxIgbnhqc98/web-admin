import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone',
  pure: true
})
export class PhonePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: any) {
    try {
      if (typeof(value) === 'string') {
        if (value.split(')').length > 0){
          value = value.replace('(+84)', '0').replace('+(84)', '0');
        }
      }
      return value;
    } catch (err) {
      return 'NAN';
    }
  }
}

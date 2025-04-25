import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class QueryTransformPipe implements PipeTransform {
  transform(value: any) {
    if (value.page) value.page = parseInt(value.page, 10);
    if (value.limit) value.limit = parseInt(value.limit, 10);
    return value;
  }
}
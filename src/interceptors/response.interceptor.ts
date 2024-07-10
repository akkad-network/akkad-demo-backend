import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const isStaticFile = request.url.includes('/public/');

        if (isStaticFile) {
            return next.handle();
        }

        return next.handle().pipe(
            map((data) => ({
                code: 200,
                msg: 'Success',
                data,
            })),
        );
    }
}
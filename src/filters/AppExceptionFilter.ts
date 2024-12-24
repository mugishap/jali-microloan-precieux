import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import ServerResponse from 'src/utils/ServerResponse';

@Catch(HttpException)
export class AppExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        if (status === 400) {
            if (exception.getResponse() instanceof Object) {
                if (exception.getResponse()['message'][0].length === 1) {
                    return response.status(status).json(ServerResponse.error(exception.getResponse()['message'], null, status));
                }
                return response.status(status).json(ServerResponse.error(exception.getResponse()['message'][0], null, status));
            } else if (exception.getResponse() instanceof String) {
                return response.status(status).json(ServerResponse.error(exception.getResponse().toString(), null, status));
            }
            return response.status(status).json(
                ServerResponse.error(exception.getResponse().toString(), exception.getResponse(), status)
            )
        }
        else if (status === 401) {
            response.status(status).json(ServerResponse.error(exception.getResponse()['message'], exception.getResponse(), status));
        }
        else if (status === 404) {
            response.status(status).json(ServerResponse.error(exception.getResponse().toString(), exception.getResponse(), status));
        }
        else if (status === 403) {
            response.status(status).json(ServerResponse.error("Forbidden", exception.getResponse(), status));
        }
        else {
            response.status(status).json(ServerResponse.error("Error occured", exception, status));
        }
    }
}
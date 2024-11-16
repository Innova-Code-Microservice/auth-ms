import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";


@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {

    catch(exception: RpcException, host: ArgumentsHost) {
        
        const context = host.switchToHttp();
        const response = context.getResponse();

        const rpcError = exception.getError();

        if( typeof rpcError === 'object' && 'statusCode' in rpcError && 'message' in rpcError ){

            const statusCode = rpcError.statusCode;

            return response.status(statusCode).json({
                statusCode,
                message: rpcError.message,
            })
        }


        return response.status(500).json({
            message: "Internal Server Error"
        })


    }



}
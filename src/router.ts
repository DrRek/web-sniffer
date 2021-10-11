import http from 'http'
import https from 'https'
import ProxyError, { ErrorType } from './errors/proxy-error'
import { IRequest } from './models'

type RouterCallback = (response: http.IncomingMessage) => void

export default class Router {

  static forward(request: IRequest, callback: RouterCallback) {
    
    const requestOptions: http.RequestOptions = {
      host: request.hostname,
      port: request.port || (request.protocol === 'https:' ? 443 : 80),
      path: request.url,
      method: request.method,
      headers: request.headers
    }

    switch (request.protocol) {
      case 'http:': 
        const httpRequest = http.request(requestOptions, (response) => callback(response))
        request.body && httpRequest.write(request.body)
        return httpRequest
      case 'https:': 
        const httpsRequest = https.request({
            ...requestOptions,
            rejectUnauthorized: false,
            agent: false
        }, (response) => callback(response))
        request.body && httpsRequest.write(request.body)
        return httpsRequest
      default:  
      throw new ProxyError(
        `Unknown protocol ${request.protocol} received by the Router`,
        ErrorType.inconsistency
      )
    }
  }
}
import * as Sentry from '@sentry/node'
import Koa from 'koa'
import { ErrorHandlerTypeConfig } from './ErrorHandler'
import ErrorHandlingProvider from './ErrorHandlerProvider'

export interface SentryConfig extends ErrorHandlerTypeConfig {
    driver: 'sentry'
    dsn: string
}

export default class SentryProvider implements ErrorHandlingProvider {
    constructor(config: SentryConfig) {
        Sentry.init({ dsn: config.dsn })
    }

    attach(api: Koa) {
        api.on('error', (err, ctx) => {
            Sentry.withScope(scope => {
                scope.setSDKProcessingMetadata({ request: ctx.request })
                Sentry.captureException(err)
            })
        })
    }
}
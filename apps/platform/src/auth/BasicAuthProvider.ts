import { Context } from 'koa'
import { AuthTypeConfig } from './Auth'
import { getAdminByEmail } from './AdminRepository'
import AuthProvider from './AuthProvider'
import App from '../app'
import { combineURLs, firstQueryParam } from '../utilities'
import Admin from './Admin'
import { RequestError } from '../core/errors'
import AuthError from './AuthError'

export interface BasicAuthConfig extends AuthTypeConfig {
    driver: 'basic'
    email: string
    password: string
}

export default class BasicAuthProvider extends AuthProvider {

    private config: BasicAuthConfig
    constructor(config: BasicAuthConfig) {
        super()
        this.config = config
    }

    async start(ctx: Context) {

        const redirect = firstQueryParam(ctx.request.query.r)

        // Redirect to the login form
        ctx.redirect(combineURLs([App.main.env.baseUrl, '/login/basic']) + '?r=' + redirect)
    }

    async validate(ctx: Context) {

        console.log('BasicAuthProvider.ts: validate: ')

        const { email, password } = ctx.request.body

        // Check email and password are provided
        console.log('email: ' + email)
        console.log('password ' + password)

        if (!email || !password) throw new RequestError(AuthError.MissingCredentials)

        console.log('coming here...')

        // Check email and password match
        if (email !== this.config.email || password !== this.config.password) {
            throw new RequestError(AuthError.InvalidCredentials)
        }

        console.log('coming here... 2')

        // Find admin, otherwise first time, create
        let admin = await getAdminByEmail(email)

        // print the admin
        console.log('BasicAuthProvider.ts: validate: admin: ', admin)

        if (!admin) {
            admin = await Admin.insertAndFetch({ email, first_name: 'Admin' })
        }

        console.log('coming here... 3')

        // Process the login
        await this.login({ email, domain: 'local' }, ctx)
    }
}

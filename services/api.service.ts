import type { Context, ServiceSchema } from "moleculer"
import type { ApiSettingsSchema, IncomingRequest, Route } from "moleculer-web"
import ApiGateway from "moleculer-web"

interface Meta {
	userAgent?: string | null | undefined
	user?: object | null | undefined
}

const routeSettings = {
	whitelist: ["**"],
	mergeParams: true,
	authentication: false,
	authorization: false,
	autoAliases: true,
	logging: true,
}

const ApiService: ServiceSchema<ApiSettingsSchema> = {
	name: "api",
	mixins: [ApiGateway],
	settings: {
		port: process.env.PORT != null ? Number(process.env.PORT) : 3000,
		ip: "0.0.0.0",
		use: [],
		routes: [
			{
				...routeSettings,
				path: "/api",
				authentication: true,
				authorization: true,
				aliases: {
					"GET /users": "user.getUsers",
					"GET /user/:userId": "user.getUser",
					"POST /user": "user.createUser",
					"PATCH /user/:userId": "user.updateUser",
					"DELETE /user/:userId": "user.deleteUser",
					"GET /user/:userId/addresses": "user.getUserAddresses",
					"POST /user/:userId/address": "user.createUserAddress",
					"PATCH /user/:userId/address/:addressId": "user.updateUserAddress",
					"DELETE /user/:userId/address/:addressId": "user.deleteUserAddress",
				},
			},
			{
				...routeSettings,
				path: "/auth",
				aliases: {
					"POST /login": "user.login",
					"POST /register": "user.register",
				}
			}
		],
		log4XXResponses: false,
		logRequestParams: null,
		logResponseData: null,
		assets: {
			folder: "public",
			options: {},
		},
	},

	methods: {
		async authenticate(
			ctx: Context,
			route: Route,
			req: IncomingRequest,
		): Promise<Record<string, unknown> | null> {
			const auth = req.headers.authorization
			if (auth && auth.startsWith("Bearer")) {
				const token = auth.slice(7)
				const user: Record<string, unknown> = await ctx.call("user.validate", { token })

				if (user) return user

				throw new ApiGateway.Errors.UnAuthorizedError(
					ApiGateway.Errors.ERR_INVALID_TOKEN,
					null,
				)
			} else {
				return null
			}
		},
		authorize(ctx: Context<null, Meta>, route: Route, req: IncomingRequest) {
			const { user } = ctx.meta
			if (req.$action.auth === "required" && !user) {
				throw new ApiGateway.Errors.UnAuthorizedError("NO_RIGHTS", null)
			}
		},
	},
}

export default ApiService

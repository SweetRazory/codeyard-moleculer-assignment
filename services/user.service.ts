import jwt from "jsonwebtoken"
import type { ServiceSchema } from "moleculer"
import dbMixin from "../mixins/db.mixin"
import User from "../model/user"
import checkPassword from "../utils/checkPassword"
import hashPassword from '../utils/hashPassword'

const UsersService: ServiceSchema = {
	name: "user",
	mixins: [dbMixin("user")],
	model: User,
	dependencies: [],
	actions: {
		login: {
			params: {
				email: "string",
				password: "string",
			},
			async handler(this, ctx): Promise<object> {
				try {
					const user = await User.findOne({ email: ctx.params.email })

					if (!user) {
						/**
						 ** NOTE: Rendes szovegek helyett akar egy i18n kodot is lehetne hagyni,
						 ** amit a frontend elintez maganak, hogy melyik nyelven,
						 ** hogyan keruljon oda az adott uzenet, pl error.user.notfound
						 * */
						return this.response(400, {
							error: "User not found"
						}, null, ctx)
					}

					const isPassValid = await checkPassword(ctx.params.password, user.password)

					if (!isPassValid) {
						return this.response(401, {
							error: "Incorrect password"
						}, null, ctx)
					}

					const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET_KEY as string)

					user.tokens.push({ token })

					await user.save()

					return this.response(200, { token }, null, ctx)
				} catch (error) {
					this.logger.error(error)

					return this.response(500, {
						error: "Internal server error"
					}, null, ctx)
				}
			},
		},
		register: {
			params: {
				email: "string",
				password: "string",
				name: "string|optional"
			},
			async handler(this, ctx): Promise<object> {
				try {
					const { email, password, name } = ctx.params

					const existingUser = await User.findOne({ email })
					if (existingUser) {
						return this.response(401, {
							error: "User with this email already exists"
						}, null, ctx)
					}

					const hashedPass = await hashPassword(password)

					const user = await User.create({
						email,
						name,
						password: hashedPass
					})

					const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET_KEY as string)

					user.tokens.push({ token })

					await user.save()

					return this.response(200, { token }, null, ctx)
				} catch (error) {
					this.logger.error(error)

					return this.response(500, {
						error: "Internal server error"
					}, null, ctx)
				}
			},
		},
		validate: {
			params: {
				token: "string"
			},
			async handler(this, ctx): Promise<Optional<object>> {
				try {
					const user = await User.findOne({ "tokens.token": ctx.params.token })
					if (!user) return null

					const { _id: id } = jwt.verify(ctx.params.token, process.env.TOKEN_SECRET_KEY as string) as { _id: string }

					if (id && id !== user._id.toString()) return null

					return user
				} catch (error) {
					this.logger.error(error)

					return null
				}
			},
		},
		getUsers: {
			auth: "required",
			params: {
				showIds: {
					type: "boolean",
					optional: true,
					default: false
				},
				showPasswords: {
					type: "boolean",
					optional: true,
					default: false
				},
				showRawData: {
					type: "boolean",
					optional: true,
					default: false
				},
			},
			async handler(this, ctx): Promise<object> {
				try {
					const { showIds, showPasswords, showRawData } = ctx.params
					//	Ezeket a selecteket kb mindenhova odaraknam, ahol directbe kuldom vissza a user objectet
					const users = await User.find({})
						.select(!showRawData && "-tokens.ttl -__v -tokens.__v -address.__v")
						.select(!showPasswords && "-password")
						.select(!showIds && "-_id -tokens._id -address._id")
						.lean()
						.exec()

					return this.response(200, { users }, null, ctx)
				} catch (error) {
					this.logger.error(error)

					return this.response(500, {
						error: "Internal server error"
					}, null, ctx)
				}
			},
		},
		getUser: {
			params: {
				userId: { type: "string", optional: false }
			},
			async handler(this, ctx): Promise<object> {
				try {
					const user = await User.findById(ctx.params.userId)

					if (!user) {
						return this.response(400, {
							error: "User not found"
						}, null, ctx)
					}

					return this.response(200, { user }, null, ctx)
				} catch (error) {
					this.logger.error(error)

					return this.response(500, {
						error: "Internal server error"
					}, null, ctx)
				}
			},
		},
		createUser: {
			auth: "required",
			params: {
				email: "string",
				password: "string",
				name: "string|optional",
				address: "array|optional"
			},
			async handler(this, ctx): Promise<object> {
				try {
					const { email, password, name, address } = ctx.params

					const existingUser = await User.findOne({ email })
					if (existingUser) {
						return this.response(400, {
							error: "User not found"
						}, null, ctx)
					}

					const hashedPass = await hashPassword(password)

					await User.create({
						email,
						name,
						password: hashedPass,
						address
					})

					return this.response(401, {
						message: "Successfully created user"
					}, null, ctx)
				} catch (error) {
					this.logger.error(error)

					return this.response(500, {
						error: "Internal server error"
					}, null, ctx)
				}
			},
		},
		updateUser: {
			params: {
				data: "object",
				userId: "string"
			},
			async handler(this, ctx): Promise<object> {
				try {
					const { data, userId } = ctx.params

					const user = await User.findById(userId)
					if (!user) {
						return this.response(400, {
							error: "User not found"
						}, null, ctx)
					}

					Object.assign(user, data)

					await user.save()

					return this.response(200, {
						message: "Successfully updated user"
					}, null, ctx)
				} catch (error) {
					this.logger.error(error)

					return this.response(500, {
						error: "Internal server error"
					}, null, ctx)
				}
			},
		},
		deleteUser: {
			params: {
				userId: "string"
			},
			async handler(this, ctx): Promise<object> {
				try {
					await User.findOneAndDelete({ _id: ctx.params.userId })

					return this.response(200, {
						message: "Successfully deleted user"
					}, null, ctx)
				} catch (error) {
					this.logger.error(error)

					return this.response(500, {
						error: "Internal server error"
					}, null, ctx)
				}
			},
		},
		getUserAddresses: {
			params: {
				userId: "string"
			},
			async handler(this, ctx): Promise<object> {
				try {
					const { userId } = ctx.params

					const user = await User.findById(userId)
					if (!user) {
						return this.response(400, {
							error: "User not found"
						}, null, ctx)
					}

					return this.response(200, {
						addresses: user.addresses
					}, null, ctx)
				} catch (error) {
					this.logger.error(error)

					return this.response(500, {
						error: "Internal server error"
					}, null, ctx)
				}
			},
		},
		createUserAddress: {
			params: {
				data: "object",
				userId: "string"
			},
			async handler(this, ctx): Promise<object> {
				try {
					const { userId, data } = ctx.params
					const user = await User.findById(userId)

					if (!user) {
						return this.response(400, {
							error: "User not found"
						}, null, ctx)
					}
					user.addresses.push(data)

					await user.save()

					return this.response(200, {
						message: "Successfully created address"
					}, null, ctx)

				} catch (error) {
					this.logger.error(error)

					return this.response(500, {
						error: "Internal server error"
					}, null, ctx)
				}
			},
		},
		updateUserAddress: {
			params: {
				data: "object",
				addressId: "string",
				userId: "string"
			},
			async handler(this, ctx): Promise<object> {
				try {
					const { userId, data, addressId } = ctx.params
					const user = await User.findById(userId)
					if (!user) {
						return this.response(400, {
							error: "User not found"
						}, null, ctx)
					}

					const addressIndex = user?.addresses.findIndex(({ _id }) => _id.toString() === addressId)
					if (addressIndex === -1) {
						return this.response(400, {
							error: "Address not found"
						}, null, ctx)
					}

					user.addresses[addressIndex] = data

					await user.save()

					return this.response(200, {
						message: "Successfully updated address"
					}, null, ctx)
				} catch (error) {
					this.logger.error(error)

					return this.response(500, {
						error: "Internal server error"
					}, null, ctx)
				}
			},
		},
		deleteUserAddress: {
			params: {
				addressId: "string",
				userId: "string"
			},
			async handler(this, ctx): Promise<object> {
				try {
					const { userId, addressId } = ctx.params
					const user = await User.findById(userId)
					if (!user) {
						return this.response(400, {
							error: "User not found"
						}, null, ctx)
					}

					const addressIndex = user?.addresses.findIndex(({ _id }) => _id.toString() === addressId)
					if (addressIndex === -1) {
						return this.response(400, {
							error: "Address not found"
						}, null, ctx)
					}

					user.addresses.splice(addressIndex, 1)

					await user.save()

					return this.response(200, {
						error: "Successfully deleted address"
					}, null, ctx)
				} catch (error) {
					this.logger.error(error)

					return this.response(500, {
						error: "Internal server error"
					}, null, ctx)
				}
			},
		},
	},
}

export default UsersService

import jwt from "jsonwebtoken"
import type { ServiceSchema } from "moleculer"
import dbMixin from "../mixins/db.mixin"
import User from "../model/user"
import checkPassword from "../utils/checkPassword"
import hashPassword from '../utils/hashPassword'

type StandardResponse = string | object | null

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
			async handler(this, ctx): Promise<StandardResponse> {
				try {
					const user = await User.findOne({ email: ctx.params.email })

					if (!user) {
						ctx.meta.$statusCode = 401
						return {
							result: {
								/**
								 ** NOTE: Rendes szovegek helyett akar egy i18n kodot is lehetne hagyni,
								 ** amit a frontend elintez maganak, hogy melyik nyelven,
								 ** hogyan keruljon oda az adott uzenet, pl error.user.notfound
								 * */
								error: "User not found"
							}
						}
					}

					const isPassValid = await checkPassword(ctx.params.password, user.password)

					if (!isPassValid) {
						ctx.meta.$statusCode = 401
						return {
							result: {
								error: "Incorrect password"
							}
						}
					}

					const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET_KEY as string)

					user.tokens.push({ token })

					await user.save()

					return {
						result: {
							token
						}
					}
				} catch (error) {
					this.logger.error(error)

					ctx.meta.$statusCode = 500
					return {
						result: {
							error: "Internal server error"
						}
					}
				}
			},
		},
		register: {
			params: {
				email: "string",
				password: "string",
				name: "string|optional"
			},
			async handler(this, ctx): Promise<StandardResponse> {
				try {
					const { email, password, name } = ctx.params

					const existingUser = await User.findOne({ email })
					if (existingUser) {
						ctx.meta.$statusCode = 401
						return {
							result: {
								error: "User with this email already exists"
							}
						}
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

					return {
						result: {
							token
						}
					}
				} catch (error) {
					this.logger.error(error)

					ctx.meta.$statusCode = 500
					return {
						result: {
							error: "Internal server error"
						}
					}
				}
			},
		},
		validate: {
			params: {
				token: "string"
			},
			async handler(this, ctx): Promise<StandardResponse> {
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
			async handler(this, ctx): Promise<StandardResponse> {
				try {
					const { showIds, showPasswords, showRawData } = ctx.params
					//	Ezeket a selecteket kb mindenhova odaraknam, ahol directbe kuldom vissza a user objectet
					const users = await User.find({})
						.select(!showRawData && "-tokens.ttl -__v -tokens.__v -address.__v")
						.select(!showPasswords && "-password")
						.select(!showIds && "-_id -tokens._id -address._id")
						.lean()
						.exec()

					return {
						result: {
							users
						}
					}
				} catch (error) {
					this.logger.error(error)

					ctx.meta.$statusCode = 500
					return {
						result: {
							error: "Internal server error"
						}
					}
				}
			},
		},
		getUser: {
			params: {
				userId: { type: "string", optional: false }
			},
			async handler(this, ctx): Promise<StandardResponse> {
				try {
					const user = await User.findById(ctx.params.userId)

					if (!user) {
						ctx.meta.$statusCode = 400
						return {
							result: {
								error: "User not found"
							}
						}
					}

					return {
						result: {
							user
						}
					}
				} catch (error) {
					this.logger.error(error)

					ctx.meta.$statusCode = 500
					return {
						result: {
							error: "Internal server error"
						}
					}
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
			async handler(this, ctx): Promise<StandardResponse> {
				try {
					const { email, password, name, address } = ctx.params

					const existingUser = await User.findOne({ email })
					if (existingUser) {
						ctx.meta.$statusCode = 401
						return {
							result: {
								error: "User with this email already exists"
							}
						}
					}

					const hashedPass = await hashPassword(password)

					await User.create({
						email,
						name,
						password: hashedPass,
						address
					})

					return {
						result: {
							message: "Successfully created user"
						}
					}
				} catch (error) {
					this.logger.error(error)

					ctx.meta.$statusCode = 500
					return {
						result: {
							error: "Internal server error"
						}
					}
				}
			},
		},
		updateUser: {
			params: {
				data: "object",
				userId: "string"
			},
			async handler(this, ctx): Promise<StandardResponse> {
				try {
					const { data, userId } = ctx.params

					const user = await User.findById(userId)
					if (!user) {
						ctx.meta.$statusCode = 400
						return {
							result: {
								error: "User not found"
							}
						}
					}

					Object.assign(user, data)

					await user.save()

					return {
						result: {
							message: "Successfully updated user"
						}
					}
				} catch (error) {
					this.logger.error(error)

					ctx.meta.$statusCode = 500
					return {
						result: {
							error: "Internal server error"
						}
					}
				}
			},
		},
		deleteUser: {
			params: {
				userId: "string"
			},
			async handler(this, ctx): Promise<StandardResponse> {
				try {
					await User.findOneAndDelete({ _id: ctx.params.userId })

					return {
						result: {
							message: "Successfully deleted user"
						}
					}
				} catch (error) {
					this.logger.error(error)

					ctx.meta.$statusCode = 500
					return {
						result: {
							error: "Internal server error"
						}
					}
				}
			},
		},
		getUserAddresses: {
			params: {
				userId: "string"
			},
			async handler(this, ctx): Promise<StandardResponse> {
				try {
					const { userId } = ctx.params

					const user = await User.findById(userId)
					if (!user) {
						ctx.meta.$statusCode = 400
						return {
							result: {
								error: "User not found"
							}
						}
					}

					return {
						result: {
							addresses: user.addresses
						}
					}
				} catch (error) {
					this.logger.error(error)

					ctx.meta.$statusCode = 500
					return {
						result: {
							error: "Internal server error"
						}
					}
				}
			},
		},
		createUserAddress: {
			params: {
				data: "object",
				userId: "string"
			},
			async handler(this, ctx): Promise<StandardResponse> {
				try {
					const { userId, data } = ctx.params
					const user = await User.findById(userId)

					if (!user) {
						ctx.meta.$statusCode = 400
						return {
							result: {
								error: "User not found"
							}
						}
					}
					user.addresses.push(data)

					await user.save()

					return {
						result: {
							message: "Successfully created address"
						}
					}
				} catch (error) {
					this.logger.error(error)

					ctx.meta.$statusCode = 500
					return {
						result: {
							error: "Internal server error"
						}
					}
				}
			},
		},
		updateUserAddress: {
			params: {
				data: "object",
				addressId: "string",
				userId: "string"
			},
			async handler(this, ctx): Promise<StandardResponse> {
				try {
					const { userId, data, addressId } = ctx.params
					const user = await User.findById(userId)
					if (!user) {
						ctx.meta.$statusCode = 400
						return {
							result: {
								error: "User not found"
							}
						}
					}

					const addressIndex = user?.addresses.findIndex(({ _id }) => _id.toString() === addressId)
					if (addressIndex === -1) {
						ctx.meta.$statusCode = 400
						return {
							result: {
								error: "Address not found"
							}
						}
					}

					user.addresses[addressIndex] = data

					await user.save()

					return {
						result: {
							message: "Successfully updated address"
						}
					}
				} catch (error) {
					this.logger.error(error)

					ctx.meta.$statusCode = 500
					return {
						result: {
							error: "Internal server error"
						}
					}
				}
			},
		},
		deleteUserAddress: {
			params: {
				addressId: "string",
				userId: "string"
			},
			async handler(this, ctx): Promise<StandardResponse> {
				try {
					const { userId, addressId } = ctx.params
					const user = await User.findById(userId)
					if (!user) {
						ctx.meta.$statusCode = 400
						return {
							result: {
								error: "User not found"
							}
						}
					}

					const addressIndex = user?.addresses.findIndex(({ _id }) => _id.toString() === addressId)
					if (addressIndex === -1) {
						ctx.meta.$statusCode = 400
						return {
							result: {
								error: "Address not found"
							}
						}
					}

					user.addresses.splice(addressIndex, 1)

					await user.save()

					return {
						result: {
							message: `Successfully deleted address`
						}
					}
				} catch (error) {
					this.logger.error(error)

					ctx.meta.$statusCode = 500
					return {
						result: {
							error: "Internal server error"
						}
					}
				}
			},
		},
	},
}

export default UsersService

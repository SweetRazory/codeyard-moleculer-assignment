import fs from "fs"
import type { Context, ServiceSchema } from "moleculer"
import DbService from "moleculer-db"
import MongooseDbAdapter from "moleculer-db-adapter-mongoose"

export default function dbMixin(collection: string): Partial<ServiceSchema> {
	const cacheCleanEventName = `cache.clean.${collection}`

	const schema: Partial<ServiceSchema> = {
		mixins: [DbService],
		rest: false,
		actions: {
			find: false,
			count: false,
			list: false,
			create: false,
			insert: false,
			get: false,
			update: false,
			remove: false
		},
		settings: {
			rest: false,
		},
		gateway: {
			routes: false
		},
		events: {
			async [cacheCleanEventName](this) {
				if (this.broker.cacher) {
					await this.broker.cacher.clean(`${this.fullName}.*`)
				}
			},
		},

		methods: {
			async entityChanged(type: string, json: unknown, ctx: Context): Promise<void> {
				await ctx.broadcast(cacheCleanEventName)
			},
		},

		async started(this) {
			if (this.seedDB) {
				const count = await this.adapter.count()
				if (count === 0) {
					this.logger.info(
						`The '${collection}' collection is empty. Seeding the collection...`,
					)
					await this.seedDB()
					this.logger.info(
						"Seeding is done. Number of records:",
						await this.adapter.count(),
					)
				}
			}
		},
	}

	if (process.env.MONGO_URI) {
		// Mongo adapter
		schema.adapter = new MongooseDbAdapter(process.env.MONGO_URI)
		schema.collection = collection
	} else if (process.env.NODE_ENV === "test") {
		// NeDB memory adapter for testing
		schema.adapter = new DbService.MemoryAdapter()
	} else {
		// NeDB file DB adapter

		// Create data folder
		if (!fs.existsSync("./data")) {
			fs.mkdirSync("./data")
		}

		schema.adapter = new DbService.MemoryAdapter({ filename: `./data/${collection}.db` })
	}

	return schema
}

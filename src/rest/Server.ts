import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import {
	InsightError,
	InsightDataset,
	InsightDatasetKind,
	NotFoundError,
	ResultTooLargeError
} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";

export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;
	private static facade: InsightFacade = new InsightFacade();

	constructor(port: number) {
		console.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();
		this.registerMiddleware();
		this.registerRoutes();

		/** NOTE: you can serve static frontend files in from your express server
		 * by uncommenting the line below. This makes files in ./frontend/public
		 * accessible at http://localhost:<port>/
		 */
		this.express.use(express.static("./frontend/my-app/public"));
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.info("Server::start() - start");
			if (this.server !== undefined) {
				console.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express
					.listen(this.port, () => {
						console.info(`Server::start() - server listening on port: ${this.port}`);
						resolve();
					})
					.on("error", (err: Error) => {
						// catches errors in server start
						console.error(`Server::start() - server ERROR: ${err.message}`);
						reject(err);
					});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public stop(): Promise<void> {
		console.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				console.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware() {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}

	// Registers all request handlers to routes
	private registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.get("/echo/:msg", Server.echo);

		// TODO: your other endpoints should go here
		this.express.put("/dataset/:id/:kind", Server.putData);
		this.express.delete("/dataset/:id", Server.delData);
		this.express.post("/query", Server.query);
		this.express.get("/datasets", Server.getData);
	}

	/**
	 * The next two methods handle the echo service.
	 * These are almost certainly not the best place to put these, but are here for your reference.
	 * By updating the Server.echo function pointer above, these methods can be easily moved.
	 */
	private static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Server.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}

	private static putData(req: Request, res: Response) {
		try {
			if (req.params.id === undefined || req.params.id === null) {
				res.status(400).json({error: "invalid request id"});
			}
			if (req.params.kind === undefined || req.params.kind === null) {
				res.status(400).json({error: "invalid request kind"});
			}
			console.log(`Server::putData(..) - params: ${JSON.stringify(req.params)}`);
			let id: string = req.params.id;
			let kind = req.params.kind;
			let file = req.body.toString("base64");
			if (kind === "sections") {
				let k = InsightDatasetKind.Sections;
				Server.facade
					.addDataset(id, file, k)
					.then((respond: any) => {
						res.status(200).json({result: respond});
					})
					.catch((err: any) => {
						res.status(400).json({error: "failed adding sections"});
					});
			} else if (kind === "rooms") {
				let k = InsightDatasetKind.Rooms;
				Server.facade
					.addDataset(id, file, k)
					.then((respond: any) => {
						res.status(200).json({result: respond});
					})
					.catch((err: any) => {
						res.status(400).json({error: "failed adding rooms"});
					});
			} else {
				res.status(400).json({error: "invalid data kind"});
			}
		} catch (err) {
			res.status(400).json({error: "error with PUT"});
		}
	}

	private static delData(req: Request, res: Response) {
		try {
			if (req.params.id === undefined || req.params.id === null) {
				res.status(400).json({error: "invalid request params"});
			}
			console.log(`Server::delData(..) - params: ${JSON.stringify(req.params)}`);
			let id: string = req.params.id;
			Server.facade
				.removeDataset(id)
				.then((respond: any) => {
					res.status(200).json({result: respond});
				})
				.catch((err: any) => {
					if (err instanceof NotFoundError) {
						res.status(404).json({error: "id not found"});
					} else {
						res.status(400).json({error: "failed deleting"});
					}
				});
		} catch (err) {
			res.status(400).json({error: "error with DELETE"});
		}
	}

	private static getData(req: Request, res: Response) {
		try {
			console.log("Server::getData(..)");
			Server.facade.listDatasets().then((respond: any) => {
				res.status(200).json({result: respond});
			});
		} catch (err) {
			res.status(400).json({error: "error with GET"});
		}
	}

	private static query(req: Request, res: Response) {
		try {
			if (req.body === undefined || req.body === null) {
				res.status(400).json({error: "invalid request body"});
			}
			console.log(`Server::query(..) - params: ${JSON.stringify(req.body)}`);
			let query: any = req.body;
			Server.facade
				.performQuery(query)
				.then((respond: any) => {
					res.status(200).json({result: respond});
				})
				.catch((err: any) => {
					if (err instanceof ResultTooLargeError) {
						res.status(400).json({error: "result too large"});
					} else {
						res.status(400).json({error: "failed query"});
					}
				});
		} catch (err) {
			res.status(400).json({error: "error with POST"});
		}
	}
}


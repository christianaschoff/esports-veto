import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

export interface HttpTransportConfig {
  port: number;
  host: string;
  apiKey?: string;
  corsOrigins?: string[];
}

export class HttpTransport {
  private app: express.Application;
  private servers: Map<string, { server: Server; transport: SSEServerTransport }> = new Map();
  private config: HttpTransportConfig;

  constructor(config: HttpTransportConfig) {
    this.config = config;
    this.app = express();

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable CSP for SSE
    }));

    // CORS configuration
    this.app.use(cors({
      origin: this.config.corsOrigins || ['http://localhost:3000', 'http://localhost:4200'],
      credentials: true,
    }));

    // JSON parsing
    this.app.use(express.json());

    // API key authentication middleware
    if (this.config.apiKey) {
      this.app.use('/mcp', (req: Request, res: Response, next) => {
        const authHeader = req.headers.authorization || req.headers['x-api-key'] as string;
        const apiKey = authHeader?.replace('Bearer ', '');

        if (!apiKey || apiKey !== this.config.apiKey) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
      });
    }
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // SSE endpoint for establishing connections
    this.app.get('/mcp/sse', async (_req: Request, res: Response) => {
      try {
        const transport = new SSEServerTransport('/mcp/message', res);
        const server = new Server({
          name: "veto-mcp-server-http",
          version: "1.0.0",
        });

        // Apply handlers if they exist
        if (this.app.locals.listToolsHandler && this.app.locals.callToolHandler) {
          this.applyHandlersToServer(server);
        }

        // Store server instance with session ID
        this.servers.set(transport.sessionId, { server, transport });

        // Clean up on close
        server.onclose = () => {
          this.servers.delete(transport.sessionId);
        };

        // Connect the server to the transport
        await server.connect(transport);

        console.error(`HTTP MCP connection established with session ${transport.sessionId}`);
      } catch (error) {
        console.error('Error establishing SSE connection:', error);
        res.status(500).json({ error: 'Failed to establish connection' });
      }
    });

    // POST endpoint for receiving messages
    this.app.post('/mcp/message', async (req: Request, res: Response) => {
      try {
        const sessionId = req.query.sessionId as string;

        if (!sessionId) {
          return res.status(400).json({ error: 'Missing sessionId parameter' });
        }

        const serverEntry = this.servers.get(sessionId);
        if (!serverEntry) {
          return res.status(404).json({ error: 'Session not found' });
        }

        await serverEntry.transport.handlePostMessage(req, res);
      } catch (error) {
        console.error('Error handling message:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to handle message' });
        }
      }
    });
  }

  /**
   * Register MCP request handlers with all connected servers
   */
  public registerHandlers(
    listToolsHandler: () => Promise<any>,
    callToolHandler: (request: any) => Promise<any>
  ): void {
    // Store handlers for future connections
    this.app.locals.listToolsHandler = listToolsHandler;
    this.app.locals.callToolHandler = callToolHandler;

    // Apply handlers to existing servers
    for (const [, { server }] of this.servers) {
      this.applyHandlersToServer(server);
    }
  }

  private applyHandlersToServer(server: Server): void {
    server.setRequestHandler(ListToolsRequestSchema, this.app.locals.listToolsHandler);
    server.setRequestHandler(CallToolRequestSchema, this.app.locals.callToolHandler);
  }

  /**
   * Start the HTTP server
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.app.listen(this.config.port, this.config.host, () => {
          console.error(`HTTP MCP server listening on ${this.config.host}:${this.config.port}`);
          console.error(`SSE endpoint: http://${this.config.host}:${this.config.port}/mcp/sse`);
          console.error(`Message endpoint: http://${this.config.host}:${this.config.port}/mcp/message`);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the HTTP server
   */
  public async stop(): Promise<void> {
    // Close all server connections
    for (const [sessionId, { server }] of this.servers) {
      try {
        await server.close();
      } catch (error) {
        console.error(`Error closing server ${sessionId}:`, error);
      }
    }
    this.servers.clear();
  }

  /**
   * Get the Express app instance for additional customization
   */
  public getApp(): express.Application {
    return this.app;
  }
}
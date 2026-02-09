import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import type { AddressInfo } from 'net';
import { EncryptionHelper, type EncryptedPayload } from '../../../../shared/security/encryption.js';
import type { SecretHelper } from './secret-helper.js';

export class BridgeServer {
  private server?: ReturnType<typeof createServer>;
  private port?: number;

  constructor(
    private readonly secretHelper: SecretHelper,
    private readonly sessionKey: string,
    private readonly bridgeToken: string
  ) { }

  public async start(): Promise<number> {
    this.server = createServer((req, res) => this.handleRequest(req, res));

    return new Promise((resolve) => {
      this.server?.listen(0, '127.0.0.1', () => {
        const address = this.server?.address() as AddressInfo;
        this.port = address.port;
        console.log(`[BridgeServer] Listening on port ${this.port}`);
        resolve(this.port);
      });
    });
  }

  public stop(): void {
    this.server?.close();
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.method !== 'POST' || req.url !== '/secrets/query') {
      res.writeHead(404);
      res.end();
      return;
    }

    // Validar Bridge Token
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${this.bridgeToken}`) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Unauthorized bridge access' }));
      return;
    }

    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
      }
      const payload = JSON.parse(Buffer.concat(chunks).toString()) as EncryptedPayload;

      // Descifrar el ID del secreto solicitado
      const secretKeyId = EncryptionHelper.decrypt(payload, this.sessionKey);

      // Obtener el secreto real de VS Code
      const secret = await this.secretHelper.getSecret(secretKeyId);

      if (secret === undefined) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Secret not found' }));
        return;
      }

      // Cifrar la respuesta
      const responsePayload = EncryptionHelper.encrypt(secret, this.sessionKey);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(responsePayload));
    } catch (err) {
      console.error('[BridgeServer] Error handling request:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal bridge error' }));
    }
  }
}

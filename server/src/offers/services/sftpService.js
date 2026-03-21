const eventBus = require('../../events/eventBus');
const events = require('../../events/eventTypes');

let SftpClient;
try {
  SftpClient = require('ssh2-sftp-client');
} catch {
  SftpClient = null;
}

class SftpService {
  constructor() {
    this.connections = new Map();
  }

  async connect(configId, sftpConfig) {
    if (!SftpClient) {
      console.warn('[SFTP] ssh2-sftp-client not installed — running in mock mode');
      return { connected: false, mock: true };
    }

    const sftp = new SftpClient();
    await sftp.connect({
      host: sftpConfig.host,
      port: sftpConfig.port || 22,
      username: sftpConfig.username,
      password: sftpConfig.password,
      privateKey: sftpConfig.privateKey || undefined,
    });

    this.connections.set(configId, { sftp, config: sftpConfig });
    console.log(`[SFTP] Connected to ${sftpConfig.host} as ${configId}`);
    return { connected: true, configId };
  }

  async listFiles(configId, remotePath, pattern) {
    const conn = this.connections.get(configId);
    if (!conn) throw new Error(`No SFTP connection for ${configId}`);

    const files = await conn.sftp.list(remotePath);
    if (pattern) {
      const regex = new RegExp(pattern);
      return files.filter((f) => regex.test(f.name));
    }
    return files;
  }

  async downloadFile(configId, remotePath) {
    const conn = this.connections.get(configId);
    if (!conn) throw new Error(`No SFTP connection for ${configId}`);

    const buffer = await conn.sftp.get(remotePath);
    eventBus.publish(events.SFTP_FILE_RECEIVED, { configId, remotePath, size: buffer.length });
    return buffer;
  }

  async downloadAndParse(configId, remotePath, parser) {
    const buffer = await this.downloadFile(configId, remotePath);
    const records = parser.parse(buffer);
    eventBus.publish(events.SFTP_FILE_PARSED, { configId, remotePath, recordCount: records.length });
    return records;
  }

  async disconnect(configId) {
    const conn = this.connections.get(configId);
    if (conn) {
      await conn.sftp.end();
      this.connections.delete(configId);
      console.log(`[SFTP] Disconnected ${configId}`);
    }
  }

  async disconnectAll() {
    for (const [configId] of this.connections) {
      await this.disconnect(configId);
    }
  }

  getActiveConnections() {
    return [...this.connections.keys()];
  }
}

module.exports = new SftpService();

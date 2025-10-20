const { spawn } = require('child_process');

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

let serverOutput = '';
let serverError = '';

server.stdout.on('data', (data) => {
  serverOutput += data.toString();
});

server.stderr.on('data', (data) => {
  serverError += data.toString();
});

// Wait a bit for server to start
setTimeout(() => {
  // Test the create_veto tool with the specified parameters
  const testRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "create_veto",
      arguments: {
        mode: "M1V1",
        playerA: "omg",
        playerB: "megalo",
        title: "mcp works wonders"
      }
    }
  };

  console.log('Sending test request:', JSON.stringify(testRequest, null, 2));

  server.stdin.write(JSON.stringify(testRequest) + '\n');

  // Wait for response
  setTimeout(() => {
    console.log('\n=== SERVER OUTPUT ===');
    console.log(serverOutput);

    console.log('\n=== SERVER ERROR ===');
    console.log(serverError);

    server.kill();
    process.exit(0);
  }, 5000);

}, 2000);

// Handle server exit
server.on('exit', (code) => {
  console.log(`\nServer exited with code ${code}`);
});
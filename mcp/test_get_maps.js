const { spawn } = require('child_process');

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

let serverOutput = '';

server.stdout.on('data', (data) => {
  serverOutput += data.toString();
});

// Wait for server to start
setTimeout(() => {
  // Test the get_maps tool
  const testRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "get_maps",
      arguments: {
        mode: "M1V1"
      }
    }
  };

  console.log('Sending test request:', JSON.stringify(testRequest, null, 2));

  server.stdin.write(JSON.stringify(testRequest) + '\n');

  // Wait for response
  setTimeout(() => {
    console.log('\n=== SERVER OUTPUT ===');
    console.log(serverOutput);

    server.kill();
    process.exit(0);
  }, 3000);

}, 2000);

// Handle server exit
server.on('exit', (code) => {
  console.log(`\nServer exited with code ${code}`);
});
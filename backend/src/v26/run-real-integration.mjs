// Executes only when TESTCONTAINERS_ENABLED=true and dependencies are installed.
// It deliberately fails fast instead of silently falling back to mocks.
if(process.env.TESTCONTAINERS_ENABLED!=='true'){
  console.error('TESTCONTAINERS_ENABLED=true is required for real integration tests');
  process.exit(2);
}
console.log('Real Testcontainers runner enabled; install project dependencies to execute.');

import chai from 'chai';
import chaiHttp from 'chai-http';

chai.should();
chai.use(chaiHttp);

// Trap exceptions
process.on('unhandledRejection', (reason, p) => {
  // eslint-disable-next-line no-console
  console.log(`Possibly Unhandled Rejection at: Promise ${p} reason: ${reason}`);
});

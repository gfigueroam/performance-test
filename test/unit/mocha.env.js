import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

process.env.NODE_ENV = 'test';

chai.use(chaiAsPromised);

chai.should();

process.on('unhandledRejection', (reason, p) => {
  // eslint-disable-next-line no-console
  console.log(`Possibly Unhandled Rejection at: Promise ${p} reason: ${reason}`);
});

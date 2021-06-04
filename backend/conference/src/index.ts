import { Server } from './server';

const start = async () => {
  if (!process.env.WEB_RTC_PORT) {
    throw new Error('WEB RTC PORT must be defined');
  }

  const server = new Server();

  server.listen((port) => {
    console.log(`Server is listening on port ${port}!!`);
    // console.log(server);
  });
};

start();

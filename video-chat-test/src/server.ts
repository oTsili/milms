import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { corsOtions, errorHandler, NotFoundError } from '@otmilms/common';
import express, { Application } from 'express';
import socketIO, { Server as SocketIOServer } from 'socket.io';
import { createServer, Server as HTTPServer } from 'http';
import path from 'path';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export class Server {
  private readonly DEFAULT_PORT = 5000;

  private io!: SocketIOServer;
  private httpServer!: HTTPServer;
  private app!: Application;
  private activeSockets: string[] = [];

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: corsOtions,
      allowEIO3: true,
    });

    this.configureApp();
    // this.configureRoutes();
    this.handleSocketConnection();
  }

  private handleRoutes(): void {
    this.app.get('/', (req, res) => {
      res.send(`<h1>Hello World</h1>`);
    });
  }

  private configureApp(): void {
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  private handleSocketConnection(): void {
    this.io.on(
      'connection',
      (socket: socketIO.Socket<DefaultEventsMap, DefaultEventsMap>) => {
        const existingSocket = this.activeSockets.find(
          (existingSocket: string) => existingSocket === socket.id
        );

        if (!existingSocket) {
          this.activeSockets.push(socket.id);

          socket.emit('update-user-list', {
            users: this.activeSockets.filter(
              (existingSocket: string) => existingSocket !== socket.id
            ),
          });

          socket.broadcast.emit('update-user-list', {
            users: [socket.id],
          });
        }

        socket.on('call-user', (data: any) => {
          socket.to(data.to).emit('call-made', {
            offer: data.offer,
            socket: socket.id,
          });
        });

        socket.on('make-answer', (data: any) => {
          socket.to(data.to).emit('answer-made', {
            socket: socket.id,
            answer: data.answer,
          });
        });

        socket.on('reject-call', (data: any) => {
          socket.to(data.from).emit('call-rejected', {
            socket: socket.id,
          });
        });

        socket.on('disconnect', () => {
          this.activeSockets = this.activeSockets.filter(
            (existingSocket: string) => existingSocket !== socket.id
          );
          socket.broadcast.emit('remove-user', {
            socketId: socket.id,
          });
        });
      }
    );
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () =>
      callback(this.DEFAULT_PORT)
    );
  }
}

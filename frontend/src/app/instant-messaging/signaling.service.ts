import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { SignalData } from 'simple-peer';

@Injectable({
  providedIn: 'root',
})
export class SignalingService {
  private socket: Socket;
  hostname: string;

  get socketId() {
    return this.socket.id;
  }

  constructor(private window: Window) {
    this.hostname = this.window.location.hostname;
  }

  connect() {
    this.socket = io(`${this.hostname}`, {
      path: '/api/vtc/conference',
    });
  }

  private listen(channel: string, fn: (...args: any[]) => void) {
    this.socket.on(channel, fn);
  }

  private send(chanel: string, message: SignalMessage) {
    this.socket.emit(chanel, message);
  }

  onConnect(fn: () => void) {
    this.listen('connect', fn);
  }

  requestForJoiningRoom(msg: SignalMessage) {
    this.send('room_join_request', msg);
  }

  onRoomParticipants(fn: (participants: Array<string>) => void) {
    this.listen('room_users', fn);
  }

  sendOfferSignal(msg: SignalMessage) {
    this.send('offer_signal', msg);
  }

  onOffer(fn: (msg: SignalMessage) => void) {
    this.listen('offer', fn);
  }

  sendAnswerSignal(msg: SignalMessage) {
    this.send('answer_signal', msg);
  }

  onAnswer(fn: (msg: SignalMessage) => void) {
    this.listen('answer', fn);
  }

  onRoomLeft(fn: (socketId: string) => void) {
    this.listen('room_left', fn);
  }
}

export interface SignalMessage {
  callerId?: string;
  calleeId?: string;
  signalData?: SignalData;
  msg?: string;
  roomName?: string;
}

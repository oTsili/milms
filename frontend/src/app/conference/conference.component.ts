import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { io, Socket } from 'socket.io-client';

// const ICE_SERVERS: RTCIceServer[] = [
//   { urls: ['stun:stun.example.com', 'stun:stun-1.example.com'] },
//   { urls: 'stun:stun.l.google.com:19302' },
// ];

// const PEER_CONNECTION_CONFIG: RTCConfiguration = {
//   iceServers: ICE_SERVERS,
// };

@Component({
  selector: 'app-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.css'],
})
export class ConferenceComponent implements OnInit {
  // @ViewChild('dataChannelSend') dataChannelSend: ElementRef;
  isAlreadyCalling = false;
  getCalled = false;
  socket: Socket;
  // textareas: FormGroup;

  private peerConnection: RTCPeerConnection;
  // private signalingConnection: WebSocket;
  // private sendChannel: RTCDataChannel;
  // private uuid;
  hostname: string;
  constructor(
    // fb: FormBuilder
    private window: Window
  ) {
    this.hostname = this.window.location.hostname;
    //   this.textareas = fb.group({
    //     dataChannelSend: new FormControl({ value: '', disabled: true }),
    //     dataChannelReceive: [''],
    //   });
  }

  ngOnInit(): void {
    // this.dataChannelSend.nativeElement.placeholder =
    //   'Press Start, enter some text, then press Send...';
    // this.uuid = this.createUuid();
    this.socket = io(`${this.hostname}`, {
      path: '/api/vtc/conference',
    });

    this.socket.on('update-user-list', ({ users }) => {
      this.updateUserList(users);
    });

    this.socket.on('remove-user', ({ socketId }) => {
      const elToRemove = document.getElementById(socketId);

      if (elToRemove) {
        elToRemove.remove();
      }
    });

    this.socket.on('call-made', async (data) => {
      if (this.getCalled) {
        const confirmed = confirm(
          `User "Socket: ${data.socket}" wants to call you. Do accept this call?`
        );

        if (!confirmed) {
          this.socket.emit('reject-call', {
            from: data.socket,
          });

          return;
        }
      }

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(
        new RTCSessionDescription(answer)
      );

      this.socket.emit('make-answer', {
        answer,
        to: data.socket,
      });
      this.getCalled = true;
    });

    this.socket.on('answer-made', async (data) => {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );

      if (!this.isAlreadyCalling) {
        this.callUser(data.socket);
        this.isAlreadyCalling = true;
      }
    });

    this.socket.on('call-rejected', (data) => {
      alert(`User: "Socket: ${data.socket}" rejected your call.`);
      // this.unselectUsersFromList();
    });

    this.peerConnection.ontrack = function ({ streams: [stream] }) {
      const remoteVideo = document.getElementById(
        'remote-video'
      ) as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = stream;
      }
    };

    navigator.getUserMedia(
      { video: true, audio: true },
      (stream) => {
        const localVideo = document.getElementById(
          'local-video'
        ) as HTMLVideoElement;
        if (localVideo) {
          localVideo.srcObject = stream;
        }

        stream
          .getTracks()
          .forEach((track) => this.peerConnection.addTrack(track, stream));
      },
      (error) => {
        console.warn(error.message);
      }
    );
  }

  // start() {
  //   // this.setupSignalingServer();
  //   // this.setupPeerServer();

  //   this.peerConnection
  //     .createOffer()
  //     .then(this.setDescription())
  //     .catch(this.errorHandler);
  // }

  updateUserList(socketIds) {
    const activeUserContainer = document.getElementById(
      'active-user-container'
    );

    socketIds.forEach((socketId) => {
      const alreadyExistingUser = document.getElementById(socketId);
      if (!alreadyExistingUser) {
        const userContainerEl = this.createUserItemContainer(socketId);

        activeUserContainer.appendChild(userContainerEl);
      }
    });
  }

  async callUser(socketId) {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(
      new RTCSessionDescription(offer)
    );

    this.socket.emit('call-user', {
      offer,
      to: socketId,
    });
  }

  createUserItemContainer(socketId) {
    const userContainerEl = document.createElement('div');

    const usernameEl = document.createElement('p');

    userContainerEl.setAttribute('class', 'active-user');
    userContainerEl.setAttribute('id', socketId);
    usernameEl.setAttribute('class', 'username');
    usernameEl.innerHTML = `Socket: ${socketId}`;

    userContainerEl.appendChild(usernameEl);

    userContainerEl.addEventListener('click', () => {
      // unselectUsersFromList();
      userContainerEl.setAttribute(
        'class',
        'active-user active-user--selected'
      );
      const talkingWithInfo = document.getElementById('talking-with-info');
      talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
      this.callUser(socketId);
    });

    return userContainerEl;
  }
}

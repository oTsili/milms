import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { HeaderService } from 'src/app/header/header.service';
import { CoursesService } from 'src/app/courses/courses.service';
import { Course } from 'src/app/models/course.model';
import { MatBreadcrumbService } from 'mat-breadcrumb';
declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-jitsi-meet',
  templateUrl: './jitsi-meet.component.html',
  styleUrls: ['./jitsi-meet.component.css'],
})
export class JitsiMeetComponent implements OnInit, AfterViewInit {
  // domain: string = 'meet.jit.si';
  domain: string = 'jitsi.milms.tech';
  room: any;
  options: any;
  api: any;
  user: any;
  courseId: string;
  course: Course;

  // For Custom Controls
  isAudioMuted = false;
  isVideoMuted = false;

  constructor(
    private router: Router,
    private sharedService: SharedService,
    private headerService: HeaderService,
    private coursesService: CoursesService,
    private matBreadcrumbService: MatBreadcrumbService,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId')) {
        this.courseId = paraMap.get('courseId');
      } else {
        // throw new Error('no course id provided');
        console.log('no course id provided');
      }
    });
    // enable the page breadcrumb
    this.sharedService.enableBreadcrumb(true);
    this.updateMatBreadcrumb();

    // update the null values of the current user to be used in new assignments
    this.user = this.headerService.getUserData();

    // this.room = 'my-test-room-odysseas'; // set your room name

    // set the name displayed in the meeting
    this.user.name = this.user.userName;
  }

  ngAfterViewInit(): void {
    const randomText = this.makeRandomId(5);

    this.onGetCourse(this.courseId).subscribe((response) => {
      // get the course object
      this.course = response.course;
      // set your room name
      this.room = `${this.course.title}-${randomText}`;

      this.options = {
        roomName: this.room,
        width: '100%',
        height: '100%',
        configOverwrite: { prejoinPageEnabled: false },
        interfaceConfigOverwrite: {
          // overwrite interface properties
        },
        parentNode: document.querySelector('#jitsi-iframe'),
        userInfo: {
          displayName: this.user.name,
        },
      };

      this.api = new JitsiMeetExternalAPI(this.domain, this.options);

      this.api.addEventListeners({
        readyToClose: this.handleClose,
        participantLeft: this.handleParticipantLeft,
        participantJoined: this.handleParticipantJoined,
        videoConferenceJoined: this.handleVideoConferenceJoined,
        videoConferenceLeft: this.handleVideoConferenceLeft,
        audioMuteStatusChanged: this.handleMuteStatus,
        videoMuteStatusChanged: this.handleVideoStatus,
      });
    });
  }

  handleClose = () => {
    console.log('handleClose');
  };

  handleParticipantLeft = async (participant) => {
    console.log('handleParticipantLeft', participant); // { id: "2baa184e" }
    const data = await this.getParticipants();
  };

  handleParticipantJoined = async (participant) => {
    console.log('handleParticipantJoined', participant); // { id: "2baa184e", displayName: "Shanu Verma", formattedDisplayName: "Shanu Verma" }
    const data = await this.getParticipants();
  };

  handleVideoConferenceJoined = async (participant) => {
    console.log('handleVideoConferenceJoined', participant); // { roomName: "bwb-bfqi-vmh", id: "8c35a951", displayName: "Akash Verma", formattedDisplayName: "Akash Verma (me)"}
    const data = await this.getParticipants();
  };

  handleVideoConferenceLeft = () => {
    console.log('handleVideoConferenceLeft');
    this.router.navigate(['/courses']);
  };

  handleMuteStatus = (audio) => {
    console.log('handleMuteStatus', audio); // { muted: true }
  };

  handleVideoStatus = (video) => {
    console.log('handleVideoStatus', video); // { muted: true }
  };

  getParticipants() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.api.getParticipantsInfo()); // get all participants
      }, 500);
    });
  }

  // custom events
  executeCommand(command: string) {
    this.api.executeCommand(command);
    if (command == 'hangup') {
      this.router.navigate(['/courses']);
      return;
    }

    if (command == 'toggleAudio') {
      this.isAudioMuted = !this.isAudioMuted;
    }

    if (command == 'toggleVideo') {
      this.isVideoMuted = !this.isVideoMuted;
    }
  }

  // Custom functions

  onGetCourse(id: string) {
    return this.coursesService.getCourse(id);
  }

  updateMatBreadcrumb() {
    this.onGetCourse(this.courseId).subscribe((response) => {
      this.course = response.course;

      const breadcrumb = {
        customText: 'This is Custom Text',
        courseText: this.course.title,
      };
      this.matBreadcrumbService.updateBreadcrumbLabels(breadcrumb);
    });
    // get course NO COURSES and update the dynamic text with the course title
  }

  makeRandomId(length) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

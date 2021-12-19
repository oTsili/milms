FROM jitsi/web:stable-6726

RUN rm  /usr/share/jitsi-meet/css/all.css\
#  /usr/share/jitsi-meet/libs/app.bundle.min.js\
 /usr/share/jitsi-meet/images/welcome-background.png\
  /usr/share/jitsi-meet/images/favicon.ico\
  /usr/share/jitsi-meet/images/watermark.svg
COPY images/welcome-background.png /usr/share/jitsi-meet/images/
COPY images/favicon/favicon.ico /usr/share/jitsi-meet/images/
# COPY jitsi-meet-raw/libs/app.bundle.min.js /usr/share/jitsi-meet/libs/
COPY jitsi-meet-raw/images/watermark.svg /usr/share/jitsi-meet/images/
COPY jitsi-meet-raw/css/all.css /usr/share/jitsi-meet/css/

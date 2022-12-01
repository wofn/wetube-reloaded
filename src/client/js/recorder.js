import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

/*const mp4File = ffmpeg.FS("readFile", "output.mp4");
fffmpeg의 fs(파일 시스템)을 이용해서 mp4파일을 가져올거야 
기억 브라우저가 아니라 컴퓨터에서 작업하는 거랑 비슷한거다.
console.log(mp4File) 이 파일은 unit8array(array of 8-bit unsign integer)타입이다. 
unsign integer양의 정수를 의미한다.
unsigned는 양의 정수, 숫자들의 배열 signed는 음의 정수다.
=> 이게 js세계에서 파일을 표현하는 방법

blob은 js세계의 파일과 같은거다. 파일같은 객체를 만드는 방법을 말한다.
한마디로 binary 정보를 가지고 있는 파일

우리가 할 일은 이 배열을 blob으로 만들기
unit8array로 blob을 만들 수는 없지만 arrayBuffer로는 만들 수 있다.
 arrayBuffer은 
 이 배열의 raw data, 즉 binary data에 접근하려면 mp4file.buffer를 사용해야한다.
 buffer은 arrayBuffer을 반환
 arrayBuffer은 raw binary data를 나타내는 object
 한 마디로 우리 영상을 나타내는 bytes의 배열이다. 우리가 만든 영상.

 unit8array와 arrayBuffer에 무슨 의미? 이것은 너가 하고 싶은 대로 할 수 있는 파일
 하지만 raw data에 접근 하고 싶다면, 실제 파일에 접근하고 싶으면 buffer을 사용해야한다.

기억해야할 핵심은 binary data를 사용하고 싶다면 buffer을 사용해야한다.

blob은 배열안에 배열들을 받을 수 있다.
그리고 js에게 이건 video/mp4 type의 파일이라고 알려주기
*/
const handleDownload = async () => {
  const ffmpeg = createFFmpeg({
    corePath: "https://unpkg.com/@ffmpeg/core@0.8.5/dist/ffmpeg-core.js",
    log: true,
  });
  await ffmpeg.load();
  ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));
  await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");
  const mp4File = ffmpeg.FS("readFile", "output.mp4");
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const mp4Url = URL.createObjectURL(mp4Blob);

  const a = document.createElement("a");
  a.href = mp4Url;
  a.download = "MyRecording.mp4";
  document.body.appendChild(a);
  a.click();
};

const handleStop = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    console.log(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  video.srcObject = stream;
  video.play();
};

init();
startBtn.addEventListener("click", handleStart);

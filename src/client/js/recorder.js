import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

/* 1단계
log: true를 사용하는 이유는, 무슨 일이 벌이지고 있는지 콘솔에서 확인하고 싶어서
 ffmpeg.load()를 await를 하는이유는, 매우 중요! <사용자가 소프트웨어를 사용할 것이기 때문이다.>
 사용자가 js가 아닌 코드를 사용하는 거다. 무언가를 설치해서 말이다.
 우리 웹사이트에서 다른 소프트웨어를 사용하는거다.
 소프트웨어가 무거울 수 있으니 기다려주는거다.
 유저의 컴퓨터를 사용 처리하는 부분을 신경 ㄴㄴ */
/*2단계 
파일과 폴더가 있는 가상 컴퓨터가 있다고 생각하기 
webassembly를 사용하고 있기 때문에 더 이상 브라우저에 있는게 아니다.
이 말을 하는 이유는 ffmpeg세계에서 파일을 생성해야하기 때문이다.
2단계는 ffmpeg에 파일을 만들기
ffmpeg.FS("writeFile")은 ffmpeg의 가상의 세계에 파일을 생성해준다.
폴더와 파일이 컴퓨터 메모리에 저장
ffmpeg.FS("writeFile","recording.webm",await fetchFile(videoFile)))
함수에 binaryData function을 줘야한다.
ffmpeg의 세계에 파일을 만들려면 0과1의 정보를 전달해야함
video file은 blob이다.
---ffmpeg의 세계에 파일을 만든거다.

우리는 ffmpeg의 사용자의 브라우저에서 로딩하기 때문에
이 명령어를 사용자의 브라우저에서 실행되게 할 수 있다.

 await ffmpeg.run에 우리가 원하는 명령어 입력
-i는 input, 파일명은 recording.webm(input),  아웃풋으로 output.mp4(output)
recording.webm(input) -> output.mp4(output) 변환
recording.webm은 파일, videoRecorder에서 온 데이터를 가지고,
ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));
여기서 만들어진 파일
recording.webm input을 받아서  output.mp4로 변환해주는 명령어를 사용
-r,60은 영상을 초당 60프레임으로  인코딩 해주는 명령어다.
= 더 빠른 영상 인코딩을 가능하게 해준다.
*/

/*여기서는 브라우저가 아닌 컴퓨터에서 작업하는 것처럼 하고 있다.
recording.webm이라는 파일을 작성하고, 그 파일을 인풋으로 바앋 output.mp4를 만들었다.
 */
const handleDownload = async () => {
  const ffmpeg = createFFmpeg({
    corePath: "https://unpkg.com/@ffmpeg/core@0.8.5/dist/ffmpeg-core.js",
    log: true,
  });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));

  await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");

  const a = document.createElement("a");
  a.href = videoFile;
  a.download = "MyRecording.webm";
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

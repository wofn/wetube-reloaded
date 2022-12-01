import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

/* 1단계
log: true를 사용하는 이유는, 무슨 일이 벌이지고 있는지 콘솔에서 확인하고 싶어서
 ffmpeg.load()를 await를 하는이유는, 사용자가 소프트웨어를 사용할 것이기 때문이다.
 사용자가 js가 아닌 코드를 사용하는 거다. 무언가를 설치해서 말이다.
 우리 웹사이트에서 다른 소프트웨어를 사용하는거다.
 소프트웨어가 무거울 수 있으니 기다려주는거다.
 유저의 컴퓨터를 사용 처리하는 부분을 신경 ㄴㄴ */
/*2단계 
파일과 폴더가 있는 가상 컴퓨터가 있다고 생각하기 
webassembly를 사용하고 있기 때문에 더 이상 브라우저에 있는게 아니다.
이 말을 하는 이유는 ffmpeg세계에서 파일을 생성해야하기 때문이다.
ffmpeg에 파일을 만들기
ffmpeg.FS("writeFile")은 가상의 세계에 파일을 생성해준다.
 await ffmpeg.run에 우리가 원하는 명령어 입력
-i는 input, recording.webm(input),  output.mp4(output)
recording.webm(input) -> output.mp4(output) 변환
recording.webm은 파일, videoRecorder에서 온 데이터를 가지고,
ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));
여기서 만들어진 파일
recording.webm -> output.mp4로 변환해주는 명령어를 사용
-r,60은 영상을 초당 60프레임으로  인코딩 해주는 명령어다.
= 더 빠른 영상 인코딩을 가능하게 해준다.
*/

/*여기서는 브라우저가 아닌 컴퓨터에서 작업하는 것처럼 하고 있다.
recording.webm이라는 파일을 작성하고, 그 파일을 인풋으로 바앋 output.mp4를 만들었다.
 */
const handleDownload = async () => {
  /*14
  const ffmpeg = createFFmpeg({
    corePath: "https://unpkg.com/@ffmpeg/core@0.8.5/dist/ffmpeg-core.js",
    log: true,
  });

  ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));

  await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");*/

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
/*ondataavailable은  녹화가 멈추면 발생되는 event, event.data는 파일이다. 
브라우저에서만 파일을 사용할 수 있으니 공유하도록 만들었다.
createObjectURL은 브라우저가 생성하는 url을 우리에게 주는 역할을 수행 이 url은 벡엔드에 실제로 존재x
이 url은 메모리상에 있는 파일에 접근할 수 있도록 브라우저가 생성한 곳
video에 loop을 걸어 반복 재생 */
const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};
/*init으로 부터 시작, mediaDevices는 마이크, 카메라와 같은 미디어 장비들에게 접근하게 함
stream이라는 건 우리가 어딘가에 넣어둘 0과 1로 이루어진 데이터를 의미한다. 실시간으로 재생되는 무언가라는 의미도 한다.
왜냐하면 카메라가 stream으로 받아오고, 그걸 video 요소에 담아두기 때문이다.
 */
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

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Control, create, createSky, createWater } from "./utilities";
import Stats from "three/examples/jsm/libs/stats.module.js";
import {
  Clock,
  Scene,
  Vector3,
  AmbientLight,
  WebGLRenderer,
  DirectionalLight,
  PerspectiveCamera,
  PMREMGenerator,
  Raycaster,
} from "three";
import "./style.scss";
import { City, DeLorean } from "./entities";

let currentTrack = 0;
const tracks = ["soundtrack/chuck-berry-johnny-b-goode.mp3"];
audio.src = tracks[currentTrack];

let isGameOver = false;

const scene = new Scene();
const clock = new Clock();
const stats = new Stats();

const camera = new PerspectiveCamera(45, devicePixelRatio, 1, 10000000);
const cameraSpeed = 0.1;
const relativeCameraOffset = new Vector3(0, 30, 0);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setClearColor(0x121214, 1);
renderer.setSize(innerWidth, innerHeight);
container.append(renderer.domElement, stats.dom);

const water = createWater(!!scene.fog);

const sceneEnv = new Scene();
const pmremGenerator = new PMREMGenerator(renderer);
const renderTarget = pmremGenerator.fromScene(sceneEnv);
const sky = createSky(water, renderTarget);

sceneEnv.add(sky);

scene.environment = renderTarget.texture;

scene.add(water, sceneEnv);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1;
controls.maxDistance = 3;
controls.update(0);

const directional = new DirectionalLight(0xffffff, 0.6);
const ambient = new AmbientLight(0xffffff);
directional.position.set(0, 6, 0);

const control = new Control();
control.initialize();

control.onTouched = () => {
  audio.play();
  deLorean.initialized = true;
};

const deLorean = new DeLorean(control);
deLorean.rotation.set(0, Math.PI / 2, 0);
const deLoreanCamera = relativeCameraOffset.applyMatrix4(deLorean.matrixWorld);

const city = new City();

const raycast = new Raycaster(deLorean.position);

scene.add(camera, directional, ambient, city, deLorean);

const button = create(
  "button",
  {
    className: "primary",
    onclick: function (this) {
      dialog.open = false;
      deLorean.restart();
      isGameOver = false;
      deLorean.visible = true;
      control.resetTouched();
    },
  },
  (element) => {
    return element;
  },
  new Text("Restart")
);

const title = create(
  "h2",
  {},
  (element) => {
    return element;
  },
  new Text("Game over")
);

const dialog = create(
  "dialog",
  { open: false },
  (element) => {
    return element;
  },
  title,
  button
);

document.body.append(dialog);

function gameOver() {
  isGameOver = true;

  dialog.show();

  deLorean.visible = false;

  audio.pause();
  audio.currentTime = 0;
}

const animate = () => {
  requestAnimationFrame(animate);
  if (control.key.Space || isGameOver) return;

  const delta = clock.getDelta();

  water.material.uniforms["time"].value += 1.0 / 60.0;

  deLorean.update(delta);

  if (deLorean.initialized && raycast.intersectObjects(city.children).length) {
    console.log(raycast.intersectObjects(city.children));

    explosion.play();
    gameOver();
  }

  camera.position.lerp(deLoreanCamera, cameraSpeed);
  controls.target = deLorean.position.clone();

  controls.update();
  stats.update();

  renderer.render(scene, camera);
};
animate();

const resize = () => {
  camera.aspect = devicePixelRatio;
  renderer.setSize(innerWidth, innerHeight);
  camera.updateProjectionMatrix();
};
resize();
onresize = resize;

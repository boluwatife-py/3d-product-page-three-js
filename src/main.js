import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

const portal = document.getElementById('bg');
const port = document.getElementById('viewer-overlay');

if (WebGL.isWebGL2Available()) {
  const scene1 = new THREE.Scene();
  const scene2 = new THREE.Scene();

  const camera1 = new THREE.PerspectiveCamera(50, portal.clientWidth / portal.clientHeight, 0.1, 1000);
  camera1.position.set(1.5, 0, 2.2);
  camera1.lookAt(0, 0, 0);

  const renderer1 = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer1.setSize(portal.clientWidth, portal.clientHeight);
  renderer1.shadowMap.enabled = true;
  renderer1.shadowMap.type = THREE.PCFSoftShadowMap;

  const camera2 = new THREE.PerspectiveCamera(50, port.clientWidth / port.clientHeight, 0.1, 1000);
  camera2.position.set(1.5, 0, 2.2);
  camera2.lookAt(0, 0, 0);

  const renderer2 = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer2.setSize(port.clientWidth, port.clientHeight);
  renderer2.shadowMap.enabled = true;
  renderer2.shadowMap.type = THREE.PCFSoftShadowMap;

  window.onresize = function () {
    camera2.aspect = port.clientWidth / port.clientHeight;
    camera2.updateProjectionMatrix();
    renderer2.setSize(port.clientWidth, port.clientHeight);
  };

  const controls = new OrbitControls(camera2, renderer2.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 2;
  controls.maxDistance = 5;

  // Set cursor to "grab" when hovering over the viewer
  port.style.cursor = "grab";

  // When the user starts dragging, change cursor to "grabbing"
  controls.addEventListener('start', () => {
    port.style.cursor = "grabbing";
  });

  // When the user stops dragging, revert to "grab"
  controls.addEventListener('end', () => {
    port.style.cursor = "grab";
  });

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene1.add(ambientLight);
  scene2.add(ambientLight.clone());

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  scene1.add(directionalLight);
  scene2.add(directionalLight.clone());

  const spotLight = new THREE.SpotLight(0xffffff, 1.2);
  spotLight.position.set(2, 5, 3);
  spotLight.angle = Math.PI / 6;
  spotLight.penumbra = 0.3;
  spotLight.decay = 2;
  spotLight.distance = 10;
  spotLight.castShadow = true;
  scene1.add(spotLight);
  scene2.add(spotLight.clone());

  const pointLight = new THREE.PointLight(0xffffff, 1, 15);
  pointLight.position.set(-3, 4, 3);
  scene1.add(pointLight);
  scene2.add(pointLight.clone());

  // Loading indicator
  const loader = new GLTFLoader();
  const loadeeer = document.createElement('div');
  loadeeer.classList.add('loadeeer');

  loader.load(
    '/shoe.glb',
    (gltf) => {
      const shoe1 = gltf.scene.clone(); // Rotating shoe (bg)
      const shoe2 = gltf.scene.clone(); // Static shoe (viewer-overlay)

      shoe1.position.z = shoe2.position.z = 0;
      shoe1.rotation.y = shoe2.rotation.y = 2;

      shoe1.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      shoe2.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene1.add(shoe1); // Add rotating shoe to bg
      scene2.add(shoe2); // Add static shoe to viewer-overlay

      const renderBG = () => {
        requestAnimationFrame(renderBG);
        shoe1.rotation.y += 0.001; // Rotate only bg shoe
        renderer1.render(scene1, camera1);
      };

      const renderOverlay = () => {
        requestAnimationFrame(renderOverlay);
        controls.update();
        renderer2.render(scene2, camera2);
      };

      renderBG();
      renderOverlay();
    },
    (xhr) => {
      const percentLoaded = Math.floor((xhr.loaded / xhr.total) * 100);
      if (percentLoaded !== 100) {
        loadeeer.innerHTML = `Loading... ${percentLoaded}%`;
        if (!portal.contains(loadeeer)) {
          portal.appendChild(loadeeer);
        }
      } else {
        if (portal.contains(loadeeer)) {
          portal.removeChild(loadeeer);
        }
      }
      if (!portal.contains(renderer1.domElement)) portal.appendChild(renderer1.domElement);
      if (!port.contains(renderer2.domElement)) port.appendChild(renderer2.domElement);
    },
    (error) => {
      console.error("An error occurred", error);
    }
  );

  document.querySelector('.viewer-overlay .close').addEventListener('click', () => {
    document.querySelector('.viewer-overlay').classList.remove('opened');
  });

  // Open viewer overlay
  portal.addEventListener('click', () => {
    camera2.position.set(1.5, 0, 2.2);
    document.querySelector('.viewer-overlay').classList.add('opened');
  });


} else {
  const warning = WebGL.getWebGL2ErrorMessage();
  alert(warning);
}

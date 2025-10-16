import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ThreeJsWalt = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    camera.position.z = 100;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const sphere = new THREE.SphereGeometry(0.5, 16, 8);
    
    const light1 = new THREE.PointLight(0xff0040, 400);
    const sphere1 = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff0040 }));
    light1.add(sphere1);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x0040ff, 400);
    const sphere2 = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x0040ff }));
    light2.add(sphere2);
    scene.add(light2);

    scene.add(new THREE.AmbientLight(0xaaaaaa, 0.1));

    // Custom shader material with displacement
    const vertexShader = `
      uniform float time;
      uniform vec3 light1Pos;
      uniform vec3 light2Pos;
      
      attribute float seed;
      attribute vec3 displaceNormal;
      
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        
        float dist1 = distance(worldPos.xyz, light1Pos);
        float dist2 = distance(worldPos.xyz, light2Pos);
        
        float invDist1 = max(0.0, 20.0 - dist1) / 2.0;
        float invDist2 = max(0.0, 20.0 - dist2) / 2.0;
        
        float s = abs(sin(time * 2.0 + seed) * 0.5) + invDist1 + invDist2;
        
        vec3 newPosition = position + displaceNormal * s;
        
        vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
        vViewPosition = mvPosition.xyz;
        vNormal = normalize(normalMatrix * normal);
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform vec3 diffuse;
      uniform vec3 light1Color;
      uniform vec3 light2Color;
      uniform vec3 light1Pos;
      uniform vec3 light2Pos;
      uniform vec3 ambientLightColor;
      
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      
      void main() {
        vec3 normal = normalize(vNormal);
        
        // Light 1
        vec3 lightDir1 = light1Pos - vWorldPosition;
        float dist1 = length(lightDir1);
        lightDir1 = normalize(lightDir1);
        float diff1 = max(dot(normal, lightDir1), 0.0);
        float attenuation1 = 2000.0 / (dist1 * dist1 + 1.0);
        vec3 light1Contrib = light1Color * diff1 * attenuation1;
        
        // Light 2
        vec3 lightDir2 = light2Pos - vWorldPosition;
        float dist2 = length(lightDir2);
        lightDir2 = normalize(lightDir2);
        float diff2 = max(dot(normal, lightDir2), 0.0);
        float attenuation2 = 2000.0 / (dist2 * dist2 + 1.0);
        vec3 light2Contrib = light2Color * diff2 * attenuation2;
        
        vec3 ambient = ambientLightColor * 0.1;
        
        vec3 finalColor = diffuse * (ambient + light1Contrib + light2Contrib);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Load Model
    const loader = new OBJLoader();
    loader.load(
      'https://threejs.org/examples/models/obj/walt/WaltHead.obj',
      (obj) => {
        const originalMesh = obj.children[0] as THREE.Mesh;
        const geometry = originalMesh.geometry;
        
        // Create displaced geometry
        const positionAttr = geometry.getAttribute('position');
        const vertices: number[] = [];
        const seeds: number[] = [];
        const displaceNormals: number[] = [];
        
        const v0 = new THREE.Vector3();
        const v1 = new THREE.Vector3();
        const v2 = new THREE.Vector3();
        const v3 = new THREE.Vector3();
        const n = new THREE.Vector3();
        const plane = new THREE.Plane();
        
        for (let i = 0; i < positionAttr.count; i += 3) {
          v0.fromBufferAttribute(positionAttr, i);
          v1.fromBufferAttribute(positionAttr, i + 1);
          v2.fromBufferAttribute(positionAttr, i + 2);
          
          plane.setFromCoplanarPoints(v0, v1, v2);
          v3.copy(v0).add(v1).add(v2).divideScalar(3);
          v3.add(n.copy(plane.normal).multiplyScalar(-1));
          
          vertices.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
          vertices.push(v3.x, v3.y, v3.z, v1.x, v1.y, v1.z, v0.x, v0.y, v0.z);
          vertices.push(v3.x, v3.y, v3.z, v2.x, v2.y, v2.z, v1.x, v1.y, v1.z);
          vertices.push(v3.x, v3.y, v3.z, v0.x, v0.y, v0.z, v2.x, v2.y, v2.z);
          
          const s = Math.random();
          n.copy(plane.normal);
          
          for (let j = 0; j < 12; j++) {
            seeds.push(s);
            displaceNormals.push(n.x, n.y, n.z);
          }
        }
        
        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        newGeometry.setAttribute('seed', new THREE.Float32BufferAttribute(seeds, 1));
        newGeometry.setAttribute('displaceNormal', new THREE.Float32BufferAttribute(displaceNormals, 3));
        newGeometry.computeVertexNormals();
        
        const material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            diffuse: { value: new THREE.Color(0x888888) },
            light1Pos: { value: light1.position },
            light2Pos: { value: light2.position },
            light1Color: { value: new THREE.Color(0xff0040) },
            light2Color: { value: new THREE.Color(0x0040ff) },
            ambientLightColor: { value: new THREE.Color(0xaaaaaa) }
          },
          vertexShader,
          fragmentShader
        });
        
        const mesh = new THREE.Mesh(newGeometry, material);
        mesh.scale.multiplyScalar(0.8);
        mesh.position.y = -30;
        scene.add(mesh);
      }
    );

    // Animation
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      time += 0.01;
      controls.update();

      light1.position.x = Math.sin(time) * 20;
      light1.position.y = Math.cos(time * 0.75) * -30;
      light1.position.z = Math.cos(time * 0.5) * 20;

      light2.position.x = Math.cos(time * 0.5) * 20;
      light2.position.y = Math.sin(time * 0.75) * -30;
      light2.position.z = Math.sin(time) * 20;

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.material instanceof THREE.ShaderMaterial) {
          object.material.uniforms.time.value = time;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[500px]"
      style={{ background: 'transparent' }}
    />
  );
};

export default ThreeJsWalt;
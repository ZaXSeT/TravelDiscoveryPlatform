"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { DESTINATIONS } from "@/constants/destinations";
import { routes } from "@/constants/routes";
import { latLngToVector3 } from "@/features/globe/lib/geo";

const R = 1;

// Direction the (invisible) sunlight comes from — drives the day/night terminator.
const LIGHT_POS = new THREE.Vector3(7, 3, 2);
const LIGHT_DIR = LIGHT_POS.clone().normalize();

const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFragmentShader = /* glsl */ `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vec3 day = pow(texture2D(dayTexture, vUv).rgb, vec3(2.2));
    vec3 night = pow(texture2D(nightTexture, vUv).rgb, vec3(2.2));
    float cosAngle = dot(normalize(vWorldNormal), normalize(sunDirection));

    // Diffuse (Lambert) shading: the lit hemisphere brightens toward the sub-solar point
    // and fades toward the terminator — this is what makes the sphere read as a 3D planet
    // photo instead of a flat map.
    float diffuse = clamp(cosAngle, 0.0, 1.0);
    vec3 litDay = day * (0.10 + 1.05 * pow(diffuse, 0.8));

    // Warm city lights emerge only on the dark side.
    vec3 cityLights = night * vec3(1.3, 1.05, 0.7) * 2.2;

    float dayAmount = smoothstep(-0.08, 0.22, cosAngle);
    vec3 color = mix(cityLights, litDay, dayAmount);

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    float NdotV = max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
    // Fresnel effect: stronger at the edges
    float fresnel = pow(1.0 - NdotV, 5.0);
    // Fade out exactly at the edge to prevent hard circular boundaries
    float edgeFade = smoothstep(0.0, 0.1, NdotV);
    
    float intensity = fresnel * edgeFade;
    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.5;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function Markers() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      {DESTINATIONS.map((d) => {
        const pos = latLngToVector3(d.coordinates.lat, d.coordinates.lng, R * 1.02);
        const active = hovered === d.slug;
        return (
          <group key={d.slug} position={pos}>
            <mesh
              scale={active ? 1.7 : 1}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(d.slug);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                setHovered(null);
                document.body.style.cursor = "auto";
              }}
              onClick={(e) => {
                e.stopPropagation();
                router.push(routes.destination(d.slug));
              }}
            >
              <sphereGeometry args={[0.016, 16, 16]} />
              <meshBasicMaterial color={active ? "#ffe3b0" : "#ffc46b"} toneMapped={false} />
            </mesh>
            {active && (
              <Html center position={[0, 0.05, 0]} zIndexRange={[20, 0]}>
                <span
                  style={{ pointerEvents: "none" }}
                  className="-translate-y-1 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-medium text-[#111] shadow-sm"
                >
                  {d.name}
                </span>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}

function Earth() {
  const earth = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Mesh>(null);

  const tex = useTexture({
    day: "/textures/earth-day.jpg",
    night: "/textures/earth-night.jpg",
    clouds: "/textures/earth-clouds.png",
  });
  tex.clouds.colorSpace = THREE.SRGBColorSpace;
  // Sharper textures at grazing angles (crisper coastlines on the 4K map).
  tex.day.anisotropy = 8;
  tex.night.anisotropy = 8;
  tex.clouds.anisotropy = 8;

  const earthMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          dayTexture: { value: tex.day },
          nightTexture: { value: tex.night },
          sunDirection: { value: LIGHT_DIR },
        },
        vertexShader: earthVertexShader,
        fragmentShader: earthFragmentShader,
      }),
    [tex.day, tex.night],
  );

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_, delta) => {
    if (earth.current) earth.current.rotation.y += delta * 0.03;
    if (clouds.current) clouds.current.rotation.y += delta * 0.043;
  });

  return (
    <>
      <group ref={earth}>
        <mesh>
          <sphereGeometry args={[R, 96, 96]} />
          <primitive object={earthMaterial} attach="material" />
        </mesh>
        <Markers />
      </group>

      <mesh ref={clouds} scale={1.012}>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial
          map={tex.clouds}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.03}>
        <sphereGeometry args={[R, 64, 64]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>
    </>
  );
}

export default function GlobeCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 42 }} dpr={[1, 2]}>
      {/* Match the section's dark surface so the globe blends in (no visible panel) */}
      <color attach="background" args={["#17171a"]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={LIGHT_POS} intensity={1.5} color="#fff4e0" />
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.35}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.82}
      />
    </Canvas>
  );
}

"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { ALL_DESTINATIONS } from "@/constants/destinations";
import { routes } from "@/constants/routes";
import { latLngToVector3 } from "@/features/globe/lib/geo";
import { CldImage } from "@/components/media/cld-image";
import type { Destination } from "@/types";

const R = 1;

// Direction the (invisible) sunlight comes from - drives the day/night terminator.
const LIGHT_POS = new THREE.Vector3(7, 3, 2);
const LIGHT_DIR = LIGHT_POS.clone().normalize();

const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPosition = wp.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFragmentShader = /* glsl */ `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform sampler2D bumpTexture;
  uniform sampler2D specularTexture;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 sunDir = normalize(sunDirection);
    float cosAngle = dot(normal, sunDir);

    vec3 day = pow(texture2D(dayTexture, vUv).rgb, vec3(2.2));
    vec3 night = pow(texture2D(nightTexture, vUv).rgb, vec3(2.2));

    // Subtle terrain relief from the bump/height map (mountains read a touch brighter).
    float h = texture2D(bumpTexture, vUv).r;
    float relief = 0.90 + 0.20 * h;

    // Diffuse (Lambert) shading: the lit hemisphere brightens toward the sub-solar point
    // and fades toward the terminator - this is what makes the sphere read as a 3D planet
    // photo instead of a flat map.
    float diffuse = clamp(cosAngle, 0.0, 1.0);
    vec3 litDay = day * relief * (0.10 + 1.05 * pow(diffuse, 0.8));

    // Specular sun-glint on water only (specular map is bright over oceans).
    float water = texture2D(specularTexture, vUv).r;
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 reflectDir = reflect(-sunDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 20.0);
    vec3 specular = vec3(1.0, 0.96, 0.82) * spec * water * diffuse * 0.9;

    // Warm city lights emerge only on the dark side.
    vec3 cityLights = night * vec3(1.3, 1.05, 0.7) * 2.2;

    float dayAmount = smoothstep(-0.08, 0.22, cosAngle);
    vec3 color = mix(cityLights, litDay, dayAmount) + specular * dayAmount;

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

// A small photo thumbnail pinned at a destination (every dot is a photo). Rides the
// rotating globe, hides when it swings to the back hemisphere, and enlarges + shows its
// name on hover.
function PhotoMarker({
  dest,
  groupRef,
}: {
  dest: Destination;
  groupRef: React.RefObject<THREE.Group | null>;
}) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pos = useMemo(() => {
    const [x, y, z] = latLngToVector3(
      dest.coordinates.lat,
      dest.coordinates.lng,
      R * 1.02,
    );
    return new THREE.Vector3(x, y, z);
  }, [dest]);
  const world = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    const g = groupRef.current;
    const el = wrapRef.current;
    if (!g || !el) return;
    world.current.copy(pos).applyMatrix4(g.matrixWorld);
    const facing = world.current
      .clone()
      .normalize()
      .dot(camera.position.clone().normalize());
    const show = facing > 0.1;
    el.style.opacity = show ? "1" : "0";
    el.style.pointerEvents = show ? "auto" : "none";
  });

  return (
    <Html
      position={pos}
      center
      zIndexRange={hover ? [40, 0] : [10, 0]}
      style={{ pointerEvents: "none" }}
    >
      <div ref={wrapRef} className="relative transition-opacity duration-200">
        <button
          type="button"
          onMouseEnter={() => {
            setHover(true);
            document.body.style.cursor = "pointer";
          }}
          onMouseLeave={() => {
            setHover(false);
            document.body.style.cursor = "auto";
          }}
          onClick={() => router.push(routes.destination(dest.slug))}
          className="relative block overflow-hidden rounded-md shadow-md ring-1 ring-white/80 transition-all duration-200"
          style={{ width: hover ? 54 : 26, height: hover ? 54 : 26 }}
          aria-label={`${dest.name} — view destination`}
        >
          <CldImage
            publicId={dest.media.thumbnail}
            alt={dest.name}
            width={120}
            height={120}
            fill
            sizes="54px"
            className="object-cover"
          />
        </button>
        {hover && (
          <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-medium text-[#111] shadow-sm">
            {dest.name}
          </span>
        )}
      </div>
    </Html>
  );
}

function PhotoMarkers({
  groupRef,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
}) {
  return (
    <>
      {ALL_DESTINATIONS.map((d) => (
        <PhotoMarker key={d.slug} dest={d} groupRef={groupRef} />
      ))}
    </>
  );
}

function Earth() {
  const earth = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Mesh>(null);

  const tex = useTexture({
    day: "/earth/diffuse.jpg",
    night: "/earth/night.jpg",
    clouds: "/earth/clouds.png",
    bump: "/earth/bump.jpg",
    specular: "/earth/specular.jpg",
  });
  tex.clouds.colorSpace = THREE.SRGBColorSpace;
  // Sharper textures at grazing angles (crisper coastlines on the high-res map).
  tex.day.anisotropy = 8;
  tex.night.anisotropy = 8;
  tex.clouds.anisotropy = 8;
  tex.bump.anisotropy = 8;
  tex.specular.anisotropy = 8;

  const earthMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          dayTexture: { value: tex.day },
          nightTexture: { value: tex.night },
          bumpTexture: { value: tex.bump },
          specularTexture: { value: tex.specular },
          sunDirection: { value: LIGHT_DIR },
        },
        vertexShader: earthVertexShader,
        fragmentShader: earthFragmentShader,
      }),
    [tex.day, tex.night, tex.bump, tex.specular],
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
        <PhotoMarkers groupRef={earth} />
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

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  useFrame(({ clock }) => {
    scene.rotation.y = clock.getElapsedTime() * 0.1;
  });
  return <primitive object={scene} />;
};

const PropertyViewer = ({ modelUrl }) => {
  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Suspense fallback={null}>
          <Model url={modelUrl} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.5}
          rotateSpeed={0.4}
        />
      </Canvas>
    </div>
  );
};

export default PropertyViewer;
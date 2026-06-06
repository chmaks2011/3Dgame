import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Character from './Character.jsx';
import { useCharacterStore } from '../store/useCharacterStore.js';
import useKeyControl from '../hooks/useKeyControl.js';
import { OrbitControls } from '@react-three/drei';
import { GOAL_POSITION, GOAL_SIZE, GOAL_HEIGHT, GOAL_HALF_SIZE, GOAL_TOP_Y } from '../gameConstants.js';
import { texture } from 'three/tsl';
import Environment from './Environment.jsx';

function Goal() {
    const mesh = useRef();
    const setGoalReached = useCharacterStore((s) => s.setAction);
    const position = useCharacterStore((s) => s.position);
    const goalReached = useCharacterStore((s) => s.goalReached);

    useFrame(() => {
        if (!mesh.current) return;
        const [px, py, pz] = position;
        const dx = GOAL_POSITION[0] - px;
        const dz = GOAL_POSITION[2] - pz;
        const absDx = Math.abs(dx);
        const absDz = Math.abs(dz);
        const isBesideGoal = py < GOAL_TOP_Y - 0.25;
        const touchesGoalSide = absDx < GOAL_HALF_SIZE + 0.45 && absDz < GOAL_HALF_SIZE + 0.45;
        if (!goalReached && isBesideGoal && touchesGoalSide) {
            setGoalReached(true);
        }


        
    });

    return (
        <mesh ref={mesh} position={GOAL_POSITION} castShadow receiveShadow>
            <boxGeometry args={[GOAL_SIZE, GOAL_HEIGHT, GOAL_SIZE]} />
            <meshStandardMaterial color="gold" />
        </mesh>
    );
};


function Floor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[40, 40]} />
            {/* <meshStandardMaterial color="#2d5a27" /> */}
            <meshStandardMaterial map={"texture/"} />
        </mesh>
    );
}

function BoxRoom() {
    return(
        <mesh position={[0, 9.5, 0]}>
            <boxGeometry args={[40, 20, 40]} />
            <meshStandardMaterial
            // color="white"
            // map={"HDRIs/stadium.hdr"} 
            envMapIntensity={1}
            side={THREE.BackSide} 
            />
        </mesh>
    );
};

function FollowCamera() {
    const position = useCharacterStore((s) => s.position);
    const rotation = useCharacterStore((s) => s.rotation);
    const { camera } = useThree();

    useFrame(() => {
        const [x, y, z] = position;
        const dist = 10;
        const height = 7;
        camera.position.set(
            x + Math.sin(rotation) * dist,
            y + height,
            z + Math.cos(rotation) * dist
        );
        camera.lookAt(x, y + 1.5, z);
        camera.updateProjectionMatrix();
    });
    return null;
}

function OrbitCamera (){
    const { camera } = useThree();
    const controlRef = useRef();
    const initialized = useRef(false);

    useFrame(() => {
        if (!initialized.current && controlRef.current){
            const { position } = useCharacterStore.getState();
            const [x, y, z] = position;

            camera.position.set(x + 5, y + 5, z + 7);
            controlRef.current.target.set(x, y + 1, z);
            controlRef.current.update();
            initialized.current = true;
        }
    });

    return(
        <OrbitControls
            ref={controlRef}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={2}
            maxDistance={40}
            enableDamping
            dampingFactor={0.08}
        />
    );
};

function CameraSwitch () {
    const setCameraMode = useCharacterStore((s) => s.setCameraMode)
    const cameraMode = useCharacterStore((s) => s.cameraMode)

    useEffect(() => {
        const onKey = (e) => {
            if (e.code === 'KeyV') {
                setCameraMode(cameraMode === 'follow' ? 'orbit' : 'follow');
            }
        };
        window.addEventListener('keydown', onKey);
        return () => removeEventListener('keydown', onKey);
    }, [cameraMode, setCameraMode]);

    return null;
};


export default function ThreeScene() {
    useKeyControl();
    const cameraMode = useCharacterStore((s) => s.cameraMode);


    return (
        <Canvas
            style={{
                height: 600,
                background: "url(/Sky.jpg) center/cover"
            }}
            shadows
            camera={{ position: [0, 5, 8], fov: 50 }}
        >
            {/* <Environment files="HDRIs/stadium.hdr" background /> */}
            {/* <color attach="background" args={["#4682B4"]} /> */}
            <ambientLight intensity={0.6} />
            {/* <pointLight posotion={[10, 10, 10]} /> */}

            <directionalLight
                position={[5, 5, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[2048, 20]}
                shadow-camera-far={50}
                shadow-camera-left={20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-button={-20}

            />

            <CameraSwitch />
            {cameraMode === 'follow' ? <FollowCamera /> : <OrbitCamera />}

            {/* <BoxRoom /> */}
            {/* <Floor /> */}
            <Environment />

            <Goal />
            <Character />
            

            {/* <gridHelper args={[40, 40, '#444', '#333']} position={[0, 0.01, 0]} /> */}
            {/* <OrbitControls /> */}
        </Canvas>
    )

}

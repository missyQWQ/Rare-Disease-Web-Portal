import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { DnaModel } from "./DnaModel";
import { DnaModel2 } from "./DnaModel2";

const MIN_RADIUS = 7.5;
const MAX_RADIUS = 15;
const DEPTH = 2;
const LEFT_COLOR = "6366f1";
const RIGHT_COLOR = "8b5cf6";
const NUM_POINTS = 2500;

/**
 * --- Credit ---
 * https://stackoverflow.com/questions/16360533/calculate-color-hex-having-2-colors-and-percent-position
 */
const getGradientStop = (ratio) => {
    // For outer ring numbers potentially past max radius,
    // just clamp to 0
    ratio = ratio > 1 ? 1 : ratio < 0 ? 0 : ratio;

    const c0 = LEFT_COLOR.match(/.{1,2}/g).map(
        (oct) => parseInt(oct, 16) * (1 - ratio)
    );
    const c1 = RIGHT_COLOR.match(/.{1,2}/g).map(
        (oct) => parseInt(oct, 16) * ratio
    );
    const ci = [0, 1, 2].map((i) => Math.min(Math.round(c0[i] + c1[i]), 255));
    const color = ci
        .reduce((a, v) => (a << 8) + v, 0)
        .toString(16)
        .padStart(6, "0");

    return `#${color}`;
};

const calculateColor = (x) => {
    const maxDiff = MAX_RADIUS * 2;
    const distance = x + MAX_RADIUS;

    const ratio = distance / maxDiff;

    const stop = getGradientStop(ratio);
    return stop;
};

const randomFromInterval = (min, max) => {
    return Math.random() * (max - min) + min;
};

const pointsInner = Array.from({ length: NUM_POINTS }, (v, k) => k + 1).map(
    (num) => {
        const randomRadius = randomFromInterval(MIN_RADIUS, MAX_RADIUS);
        const randomAngle = Math.random() * Math.PI * 2;

        const x = Math.cos(randomAngle) * randomRadius;
        const y = Math.sin(randomAngle) * randomRadius;
        const z = randomFromInterval(-DEPTH, DEPTH);

        const color = calculateColor(x);

        return {
            idx: num,
            position: [x, y, z],
            color,
        };
    }
);

const pointsOuter = Array.from({ length: NUM_POINTS / 4 }, (v, k) => k + 1).map(
    (num) => {
        const randomRadius = randomFromInterval(MIN_RADIUS / 2, MAX_RADIUS * 2);
        const angle = Math.random() * Math.PI * 2;

        const x = Math.cos(angle) * randomRadius;
        const y = Math.sin(angle) * randomRadius;
        const z = randomFromInterval(-DEPTH * 10, DEPTH * 10);

        const color = calculateColor(x);

        return {
            idx: num,
            position: [x, y, z],
            color,
        };
    }
);

function BackgroundAnimation() {
    return (
        <div>
            <Canvas
                camera={{
                    position: [-6, -6, 20],
                    // position: [-6, -6, 10],
                }}
                style={{ height: "100vh" }}
                className="bg-slate-900"
            >
                <OrbitControls maxDistance={20} minDistance={10} />
                <directionalLight />
                <pointLight position={[-30, 0, -30]} power={10.0} />
                <PointCircle />
                <DnaModel scale={0.55} />
                {/* <DnaModel2 scale={0.02} /> */}
            </Canvas>
        </div>
    );
}

function PointCircle() {
    const ref = useRef(null);

    useFrame(({ clock }) => {
        if (ref.current?.rotation) {
            ref.current.rotation.z = clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <group ref={ref}>
            {pointsInner.map((point) => (
                <Point
                    key={point.idx}
                    position={point.position}
                    color={point.color}
                />
            ))}
            {pointsOuter.map((point) => (
                <Point
                    key={point.idx}
                    position={point.position}
                    color={point.color}
                />
            ))}
        </group>
    );
}

function Point({ position, color }) {
    return (
        <Sphere position={position} args={[0.1, 10, 10]}>
            <meshStandardMaterial
                emissive={color}
                emissiveIntensity={0.5}
                roughness={0.5}
                color={color}
            />
        </Sphere>
    );
}

export default BackgroundAnimation;

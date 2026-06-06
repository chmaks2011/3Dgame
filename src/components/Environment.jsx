import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STAIRS_CX, STAIRS_W, STAIRS_STEP_H, STAIRS_STEP_D, STAIRS_START_Z, STAIRS_COUNT, 
// ДОДАНО: Межі підлоги мезоніну та її висота — для getFloorY
MEZZANINE_X_MIN, MEZZANINE_X_MAX, MEZZANINE_Z_MIN, MEZZANINE_Z_MAX, MEZZANINE_FLOOR_Y, 
// ДОДАНО: Позиція дивана та параметри взаємодії — для обробника клавіші E
SOFA_WORLD_X, SOFA_WORLD_Z, SOFA_INTERACT_DIST, SOFA_SIT_X, SOFA_SIT_Z, SOFA_SIT_Y, SOFA_SIT_ROTATION, COLLECTIBLES, COLLECT_RADIUS
} from '../gameConstants';
import { useCharacterStore } from '../store/useCharacterStore';


function Box({ position, args, color, castShadow, receiveShadow }) {
    return (
        <mesh
            position={position}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
        >
            <boxGeometry args={args} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
};

function Floor() {
    return (
        <group>
            {[-12, -10.5, -9, -7.5, -6, -4.5, -3, -1.5, 0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12].map((z) => (
                <mesh
                    key={z}
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0.001, z]}
                    receiveShadow
                >
                    <planeGeometry args={[30, 0.05]} />
                    <meshStandardMaterial color="#7B5C38" />
                </mesh>
            ))}

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[30, 25]} />
                <meshStandardMaterial color="#A0784A" />
                {/* <meshStandardMaterial map={"texture/"} /> */}
            </mesh>
        </group>
    );
};

function Ceiling() {
    return (
        <group>
            <mesh position={[0, 10, 0]} receiveShadow>
                <boxGeometry args={[30, 0.3, 25]} />
                <meshStandardMaterial color="#3D1F0D" />
            </mesh>

            {[-10, -6, -2, 2, 6, 10].map((z) => (
                <mesh
                    key={z}
                    position={[0, 9.85, z]}
                    castShadow
                >
                    <boxGeometry args={[30, 0.25, 0.3]} />
                    <meshStandardMaterial color="#11E208" />
                </mesh>
            ))}


        </group>
    );
};

function Cabinet() {
    return (
        <group>
            {/* полиця 1  */}
            <mesh position={[14.5, 1.94, 0]} castShadow receiveShadow>
                <boxGeometry args={[1, 0.12, 6]} />
                <meshStandardMaterial color="#6B3A2A" />
            </mesh>

            {/* полиця 2 */}
            <mesh position={[14.5, 3.44, 0]} castShadow receiveShadow>
                <boxGeometry args={[1, 0.12, 6]} />
                <meshStandardMaterial color="#6B3A2A" />
            </mesh>

            {/* кронштейн */}
            {[-2.5, 0, 2.5].map((z) => (
                <React.Fragment key={z}>
                    <Box position={[14.8, 2.5, z]} args={[0.07, 5, 0.07]} color="#4A2C17" castShadow />
                    {/* <Box position={[8.5, 3, z]} args={[0.07, 2.1, 0.07]} color="#4A2C17" castShadow /> */}
                </React.Fragment>
            ))}

        </group>
    );
};

function Warddrobe({ position }) {
    return (
        <group position={position}>
            <mesh position={[0, 1.25, 0]} castShadow receiveShadow >
                <boxGeometry args={[3.5, 3.5, 2.5]} />
                <meshStandardMaterial color="#5A2E1A" />
            </mesh>

            <mesh position={[-0.85, 1.25, 1.25]} castShadow>
                <boxGeometry args={[1.65, 3.3, 0.05]} />
                <meshStandardMaterial color="#6B3A2A" />
            </mesh>

            <mesh position={[0.85, 1.25, 1.25]} castShadow>
                <boxGeometry args={[1.65, 3.3, 0.05]} />
                <meshStandardMaterial color="#6B3A2A" />
            </mesh>
        </group>
    );
};

function Mezzanine() {
    return (
        <group> {/* Загальна група всіх елементів мезоніну */}
            {/* Підлога мезоніну — горизонтальна платформа на висоті 5 одиниць */}
            <mesh position={[-6.0, 5, -5.5]} castShadow receiveShadow>
                <boxGeometry args={[8, 0.2, 5]} /> {/* Ширина 8 (x:-10 до -2), глибина 5 (z:-8 до -3) */}
                <meshStandardMaterial color="#8B6347" /> {/* Колір дощатої підлоги мезоніну */}
            </mesh>
            {/* Декоративні стики між дошками підлоги мезоніну */}
            {[-7.2, -5.8, -4.4, -3.0].map((z) => (
                <mesh key={z} position={[-6.0, 5.11, z]} castShadow> {/* Виступаюча рейка між дошками */}
                    <boxGeometry args={[8, 0.04, 0.06]} /> {/* Тонка декоративна рейка */}
                    <meshStandardMaterial color="#7B5C38" /> {/* Темніший відтінок для ліній між дошками */}
                </mesh>
            ))}
            {/* Верхній поручень тільки лівої частини огорожі — x:-10 до -4, щоб залишити вхід зі сходів (x:-4 до -2) */}
            <mesh position={[-7.0, 5.72, -3.1]} castShadow>
                <boxGeometry args={[6, 0.09, 0.09]} /> {/* Ширина 6, центр -7.0 (ліва половина) */}
                <meshStandardMaterial color="#4A2C17" />
            </mesh>
            {/* Нижня рейка огорожі — теж тільки ліва частина x:-10 до -4 */}
            <mesh position={[-7.0, 5.32, -3.1]} castShadow>
                <boxGeometry args={[6, 0.06, 0.06]} /> {/* Ширина 6, центр -7.0 */}
                <meshStandardMaterial color="#4A2C17" />
            </mesh>
            {/* Балюстради тільки там де є огорожа (x < -4); -3.8 та -2.8 прибрані — вони були в зоні входу */}
            {[-9.8, -8.8, -7.8, -6.8, -5.8, -4.8].map((x) => (
                <mesh key={x} position={[x, 5.36, -3.1]} castShadow>
                    <boxGeometry args={[0.07, 0.72, 0.07]} />
                    <meshStandardMaterial color="#4A2C17" />
                </mesh>
            ))}
            {/* Стовпчик входу на мезонін — правий край огорожі, позначає початок вільного проходу */}
            <mesh position={[-4.0, 5.36, -3.1]} castShadow>
                <boxGeometry args={[0.12, 0.85, 0.12]} /> {/* Трохи товщий ніж балюстрада — маркер входу */}
                <meshStandardMaterial color="#3D1F0D" />
            </mesh>
            {/* Стовпчик входу на мезонін — лівий край огорожі (що з права), позначає кінець вільного проходу */}
            <mesh position={[-2.1, 5.36, -3.1]} castShadow>
                <boxGeometry args={[0.12, 0.85, 0.12]} /> {/* Трохи товщий ніж балюстрада — маркер входу */}
                <meshStandardMaterial color="#3D1F0D" />
            </mesh>
            {/* Верхній поручень бокової (правої) огорожі мезоніну вздовж z */}
            <mesh position={[-2.1, 5.72, -5.5]} castShadow>
                <boxGeometry args={[0.09, 0.09, 4.9]} /> {/* Бічний поручень вздовж осі z */}
                <meshStandardMaterial color="#4A2C17" />
            </mesh>
            {/* Вертикальні балюстради бокової огорожі */}
            {[-3.5, -5.0, -6.5].map((z) => (
                <mesh key={z} position={[-2.1, 5.36, z]} castShadow> {/* Бокова балюстрада */}
                    <boxGeometry args={[0.07, 0.72, 0.07]} />
                    <meshStandardMaterial color="#4A2C17" />
                </mesh>
            ))}
            {/* Ліва несуча колона мезоніну (від підлоги до платформи) */}
            <mesh position={[-9, 2.5, -3.1]} castShadow receiveShadow>
                <boxGeometry args={[0.22, 5, 0.22]} /> {/* Висота 5 — від y=0 до y=5 */}
                <meshStandardMaterial color="#3D1F0D" />
            </mesh>
            {/* Права несуча колона мезоніну (від підлоги до платформи) */}
            <mesh position={[-2.1, 2.5, -3.1]} castShadow receiveShadow>
                <boxGeometry args={[0.22, 5, 0.22]} /> {/* Симетрична права колона */}
                <meshStandardMaterial color="#3D1F0D" />
            </mesh>
        </group>
    );
}

function StairsToMezzanine() {
    const stepCount = STAIRS_COUNT; // Кількість сходинок (10 × 0.5м = 5 одиниць висоти до рівня мезоніну)
    const stepH = STAIRS_STEP_H;    // Висота кожної сходинки
    const stepD = STAIRS_STEP_D;    // Глибина кожної сходинки (крок по z)
    const stepW = STAIRS_W;    // Ширина сходів
    const startZ = STAIRS_START_Z;   // Z-координата нижньої сходинки (від'ємний напрям — до мезоніну)
    const cx = STAIRS_CX;      // X-центр сходів (між двома несучими колонами мезоніну)

    return (
        <group> {/* Загальна група сходів */}
            {/* Генерація 10 сходинок — кожна наступна вище (y) та далі до мезоніну (-z) */}
            {Array.from({ length: stepCount }).map((_, i) => (
                <mesh
                    key={i}
                    position={[cx, i * stepH + stepH / 2, startZ - i * stepD]} // i=0 → y=0.25,z=1.5; i=9 → y=4.75,z=-3.0
                    castShadow
                    receiveShadow
                >
                    <boxGeometry args={[stepW, stepH, stepD]} /> {/* Розміри однієї сходинки */}
                    <meshStandardMaterial color="#8B6347" /> {/* Колір дощатих сходинок */}
                </mesh>
            ))}
            {/* Ліве поручень сходів — нахилений під 45° вздовж підйому */}
            <mesh
                position={[cx - stepW / 2 - 0.06, 2.9, -0.75]} // Центр поручня по діагоналі сходів
                rotation={[Math.PI / 4, 0, 0]} // Поворот 45° навколо x — відповідає куту підйому сходинок
                castShadow
            >
                <boxGeometry args={[0.07, 0.07, 6.8]} /> {/* Довжина поручня по гіпотенузі підйому */}
                <meshStandardMaterial color="#3D1F0D" />
            </mesh>
            {/* Праве поручень сходів — дзеркальне до лівого */}
            <mesh
                position={[cx + stepW / 2 + 0.06, 2.9, -0.75]} // Симетрично справа
                rotation={[Math.PI / 4, 0, 0]} // Такий самий кут нахилу 45°
                castShadow
            >
                <boxGeometry args={[0.07, 0.07, 6.8]} /> {/* Симетричний правий поручень */}
                <meshStandardMaterial color="#3D1F0D" />
            </mesh>
        </group>
    );
}

function MezzanineSofa({ position }) {
    return (
        <group position={position}> {/* Група дивана, позиція задається через prop */}
            {/* Сидіння дивана */}
            <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.0, 0.5, 1.5]} /> {/* Широке і неглибоке сидіння */}
                <meshStandardMaterial color="#4A3728" /> {/* Темно-коричнева оббивка */}
            </mesh>
            {/* Спинка дивана (з боку задньої стіни, -z) */}
            <mesh position={[0, 0.68, -0.65]} castShadow receiveShadow>
                <boxGeometry args={[3.0, 1.5, 0.2]} /> {/* Висока спинка */}
                <meshStandardMaterial color="#4A3728" />
            </mesh>
            {/* Ліве підлокітник дивана */}
            <mesh position={[-1.41, 0.69, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.18, 0.44, 1.5]} /> {/* Вузький вертикальний підлокітник */}
                <meshStandardMaterial color="#3D2B1F" /> {/* Трохи темніший тон для підлокітників */}
            </mesh>
            {/* Праве підлокітник дивана */}
            <mesh position={[1.41, 0.69, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.18, 0.44, 1.5]} /> {/* Симетричний правий підлокітник */}
                <meshStandardMaterial color="#3D2B1F" />
            </mesh>
            {/* М'яка подушка на сидінні */}
            <mesh position={[0, 0.44, 0.1]} castShadow>
                <boxGeometry args={[2.7, 0.15, 1.25]} /> {/* Плоска подушка поверх сидіння */}
                <meshStandardMaterial color="#6B4C3B" /> {/* Середньо-коричневий тон подушки */}
            </mesh>
            {/* Декоративна подушка, притулена до спинки */}
            <mesh position={[0.5, 0.7, -0.5]} castShadow>
                <boxGeometry args={[0.8, 0.84, 0.16]} /> {/* Маленька акцентна подушечка */}
                <meshStandardMaterial color="#8B2500" /> {/* Теракотовий/цегляний колір */}
            </mesh>
        </group>
    );
}

function MezzanineLamp({ position }) {
    const [on, setOn] = useState(false);


    return (
        <group position={position}> {/* Група торшера */}
            {/* Основа торшера */}
            <mesh position={[0, 0.06, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.26, 0.12, 16]} /> {/* Важка кругла основа */}
                <meshStandardMaterial color="#1C1C1C" metalness={0.7} roughness={0.3} /> {/* Металева основа */}
            </mesh>
            {/* Вертикальна стійка (штанга) торшера */}
            <mesh position={[0, 0.87, 0]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 1.5, 10]} /> {/* Тонка вертикальна труба */}
                <meshStandardMaterial color="#1C1C1C" metalness={0.85} roughness={0.15} />
            </mesh>
            {/* Абажур (конус) — клік вмикає/вимикає лампу */}
            <mesh
                position={[0, 1.73, 0]}

                onClick={() => setOn(prev => !prev)}

                castShadow
            >
                <coneGeometry args={[0.36, 0.46, 16, 1, true]} /> {/* Відкритий знизу конус-абажур */}

                <meshStandardMaterial
                    color={on ? "#E8C87A" : "#9B7E4A"}
                    emissive={on ? "#C07818" : "#000000"}
                    emissiveIntensity={on ? 0.65 : 0}
                    side={THREE.DoubleSide}
                />

            </mesh>
            {/* Лампочка всередині абажура — світиться коли увімкнено */}
            <mesh position={[0, 1.57, 0]}>
                <sphereGeometry args={[0.07, 10, 10]} /> {/* Маленька сфера-лампочка */}

                <meshStandardMaterial
                    color={on ? "#FFFDE7" : "#AAAAAA"}
                    emissive={on ? "#FFFDE7" : "#000000"}
                    emissiveIntensity={on ? 4 : 0}
                />

            </mesh>

            {on && (
                <group>
                    <pointLight
                        position={[0, 1.5, 0]}
                        intensity={3.5}
                        distance={7}
                        color="#FFD070"
                        castShadow
                    />
                    <directionalLight
                        position={[0, 5, 0]}
                        intensity={0.5}
                        color="#FFD070"
                        castShadow
                    />
                </group>
            )};

        </group>
    );
}

//Компонент InteractiveWardrobe — шафа з дверцятами що плавно відкриваються по кліку та предметами всередині (відкриття поки не реалізовано)
function InteractiveWardrobe({ position }) {

    const [leftOpen, setLeftOpen] = useState(false);
    const [rightOpen, setRightOpen] = useState(false);
    const leftDoorRef = useRef();
    const rightDoorRef = useRef();


    const W = 2.4; // Ширина шафи (x)
    const H = 3.2; // Висота шафи (y)
    const D = 1.2; // Глибина шафи (z)

    useFrame(() => {
        if (leftDoorRef.current) {
            leftDoorRef.current.rotation.y = THREE.MathUtils.lerp(
                leftDoorRef.current.rotation.y,
                leftOpen ? -Math.PI / 2 : 0,
                0.1
            );
        };
    });

    useFrame(() => {
        if (rightDoorRef.current) {
            rightDoorRef.current.rotation.y = THREE.MathUtils.lerp(
                rightDoorRef.current.rotation.y,
                rightOpen ? Math.PI / 2 : 0,
                0.1
            );
        };
    });

    return (
        <group position={position}>
            <mesh position={[0, H / 2, -D / 2 + 0.04]} castShadow receiveShadow>
                <boxGeometry args={[W - 0.1, H, 0.06]} />
                <meshStandardMaterial color="#3D1F0D" />
            </mesh>

            {/* Ліва бічна стінка корпусу шафи */}
            <mesh position={[-W / 2 + 0.04, H / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.06, H, D]} />
                <meshStandardMaterial color="#5A2E1A" />
            </mesh>

            {/* Права бічна стінка корпусу шафи */}
            <mesh position={[W / 2 - 0.04, H / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.06, H, D]} />
                <meshStandardMaterial color="#5A2E1A" />
            </mesh>

            {/* Верхня кришка шафи */}
            <mesh position={[0, H - 0.03, 0]} castShadow receiveShadow>
                <boxGeometry args={[W, 0.06, D]} />
                <meshStandardMaterial color="#5A2E1A" />
            </mesh>

            {/* Дно шафи */}
            <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
                <boxGeometry args={[W, 0.06, D]} />
                <meshStandardMaterial color="#5A2E1A" />
            </mesh>

            {/* Середня полиця всередині шафи — розділяє простір на дві секції */}
            <mesh position={[0, H * 0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[W - 0.13, 0.05, D - 0.1]} />
                <meshStandardMaterial color="#4A2C17" />
            </mesh>

            {/* Предмет у нижній секції — дерев'яна скринька */}
            <mesh position={[-0.55, 0.28, 0]} castShadow>
                <boxGeometry args={[0.5, 0.42, 0.5]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Предмет у нижній секції — капелюх (циліндрична форма) */}
            <mesh position={[0.48, 0.36, 0.08]} castShadow>
                <cylinderGeometry args={[0.22, 0.27, 0.38, 16]} />
                <meshStandardMaterial color="#1A0A00" />
            </mesh>

            {/* Предмет у верхній секції — червона книга */}
            <mesh position={[0.22, H * 0.5 + 0.2, 0.08]} castShadow>
                <boxGeometry args={[0.24, 0.34, 0.38]} />
                <meshStandardMaterial color="#8B0000" />
            </mesh>

            {/* Предмет у верхній секції — зелена книга поруч */}
            <mesh position={[-0.14, H * 0.5 + 0.2, 0.05]} castShadow>
                <boxGeometry args={[0.2, 0.36, 0.36]} />
                <meshStandardMaterial color="#004d00" />
            </mesh>



            {/* Ліві дверцята — обертаються навколо лівого переднього ребра шафи */}
            <group
                ref={leftDoorRef}
                position={[-W / 2 + 0.04, 0, D / 2 - 0.04]}
            >
                {/* Полотно лівих дверцят */}
                <mesh
                    position={[W / 4 - 0.03, H / 2, 0.04]}

                    onClick={() => setLeftOpen(prev => !prev)}

                    castShadow
                >
                    <boxGeometry args={[W / 2 - 0.06, H - 0.1, 0.05]} />
                    <meshStandardMaterial color="#6B3A2A" />
                </mesh>

                {/* Кругла золотиста ручка лівих дверцят */}
                <mesh position={[W / 2 - 0.2, H / 2, 0.07]} castShadow>
                    <sphereGeometry args={[0.046, 12, 12]} /> {/* Сфера-ручка */}
                    <meshStandardMaterial color="#C8A060" metalness={0.8} roughness={0.2} />
                </mesh>
            </group>

            {/* Праві дверцята — обертаються навколо правого переднього ребра шафи */}
            <group
                ref={rightDoorRef}
                position={[W / 2 - 0.04, 0, D / 2 - 0.04]}
            >
                {/* Полотно правих дверцят */}
                <mesh
                    position={[-(W / 4 - 0.03), H / 2, 0.04]}

                    onClick={() => setRightOpen(prev => !prev)}

                    castShadow
                >
                    <boxGeometry args={[W / 2 - 0.06, H - 0.1, 0.05]} />
                    <meshStandardMaterial color="#6B3A2A" />
                </mesh>

                {/* Кругла золотиста ручка правих дверцят */}
                <mesh position={[-(W / 2 - 0.2), H / 2, 0.07]} castShadow>
                    <sphereGeometry args={[0.046, 12, 12]} /> {/* Сфера-ручка */}
                    <meshStandardMaterial color="#C8A060" metalness={0.8} roughness={0.2} />
                </mesh>
            </group>
        </group>
    );
}

function CollectibleItem({ id, position }) {
    const collectedItems = useCharacterStore((s) => s.collectedItems);
  
    const meshRef = useRef();
  
    const isCollected = collectedItems.includes(id);
  
    useFrame(({ clock }) => {
      if (!meshRef.current || isCollected) return;
  
      meshRef.current.rotation.y += 0.028;
      meshRef.current.rotation.x += 0.012;
  
      meshRef.current.position.y = Math.sin(clock.elapsedTime * 2.5) * 0.09;
    });

    if (isCollected) return null

    return (
        <group position={position}>
          <mesh ref={meshRef} castShadow>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FF8C00"
              emissiveIntensity={0.55}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
      
          <pointLight
            position={[0, 0.25, 0]}
            intensity={0.9}
            distance={2.0}
            color="#FFD060"
          />
        </group>
    );
}

function Collectibles() {
    return (
      <>
        {COLLECTIBLES.map((item) => (
          <CollectibleItem
            key={item.id}
            id={item.id}
            position={item.pos}
          />
        ))}
      </>
    );
  }

  function MezzanineSofa2({ position }) {
    return (
        <group position={position}>
            {/* Сидіння — широка пласка подушка; центр y=0.22 (висота 0.38, тобто від 0.03 до 0.41) */}
            <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.0, 0.38, 0.85]} />
                <meshStandardMaterial color="#4A3728" />
            </mesh>
            {/* Спинка — розміщена впритул до заднього краю сидіння: z = −0.37 */}
            <mesh position={[0, 0.68, -0.37]} castShadow receiveShadow>
                <boxGeometry args={[2.0, 0.72, 0.2]} />
                <meshStandardMaterial color="#4A3728" />
            </mesh>
            {/* Лівий підлокітник — x = −0.95 (рівно на краю ширини сидіння 2.0/2 = 1.0 − 0.09) */}
            <mesh position={[-0.95, 0.42, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.18, 0.44, 0.85]} />
                <meshStandardMaterial color="#3D2B1F" />
            </mesh>
            {/* Правий підлокітник — симетричний лівому */}
            <mesh position={[0.95, 0.42, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.18, 0.44, 0.85]} />
                <meshStandardMaterial color="#3D2B1F" />
            </mesh>
            {/* М'яка подушка поверх сидіння — тонка (h=0.1), трохи менша за сидіння */}
            <mesh position={[0, 0.44, 0.1]} castShadow>
                <boxGeometry args={[1.7, 0.1, 0.65]} />
                <meshStandardMaterial color="#6B4C3B" />
            </mesh>
            {/* Декоративна акцентна подушечка — притулена до спинки */}
            <mesh position={[0.5, 0.7, -0.2]} castShadow>
                <boxGeometry args={[0.4, 0.42, 0.08]} />
                <meshStandardMaterial color="#8B2500" />
            </mesh>
        </group>
    );
}


export default function Environment() {
    return (
        <group>
            <Floor />
            <Box position={[-15, 5, 0]} args={[0.3, 10, 25]} color={"#2d5a27"} receiveShadow />{/*ліва*/}
            <Box position={[15, 5, 0]} args={[0.3, 10, 25]} color={"#2d5a27"} receiveShadow /> {/*права*/}
            <Box position={[0, 5, -12.5]} args={[30, 10, 0.3]} color={"#2d5a27"} receiveShadow /> {/*задня */}
            <Box position={[-6, 5, 12.5]} args={[18, 10, 0.3]} color={"#2d5a27"} receiveShadow />  {/*передня-ліва частина*/}
            <Box position={[11.2, 5, 12.5]} args={[7.5, 10, 0.3]} color={"#2d5a27"} receiveShadow />  {/*передня-права частина*/}

            <Ceiling />

            {/* <Warddrobe position={[6, 0.5, -11.7]} /> */}

            {/* <Cabinet/> */}

            <Mezzanine />

            <MezzanineSofa position={[SOFA_WORLD_X, 0, SOFA_WORLD_Z]} />
            {/* <MezzanineSofa2 position={[SOFA_SIT_X, 0, SOFA_SIT_Z]}/> */}

            <StairsToMezzanine />

            <MezzanineLamp position={[-4.5, 5.1, -6.8]} />

            <InteractiveWardrobe position={[5, 0, -7]} />
            <Collectibles />
        </group>
    );
};


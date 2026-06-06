import { useCharacterStore } from "../store/useCharacterStore.js";
import { useEffect, useRef } from "react";
import { CHARACTER_RADIUS, GOAL_POSITION, GOAL_HALF_SIZE, GOAL_TOP_Y, MOVE_STEP, ROTATE_STEP, GRAVITY, JUMP_SPEED, FLOOR_Y, 
STAIRS_CX, STAIRS_W, STAIRS_STEP_H, STAIRS_STEP_D, STAIRS_START_Z, STAIRS_COUNT,
// ДОДАНО: Межі підлоги мезоніну та її висота — для getFloorY
MEZZANINE_X_MIN, MEZZANINE_X_MAX, MEZZANINE_Z_MIN, MEZZANINE_Z_MAX, MEZZANINE_FLOOR_Y, 
// ДОДАНО: Позиція дивана та параметри взаємодії — для обробника клавіші E 
SOFA_WORLD_X, SOFA_WORLD_Z, SOFA_INTERACT_DIST, SOFA_SIT_X, SOFA_SIT_Z, SOFA_SIT_Y, SOFA_SIT_ROTATION, 
COLLECTIBLES, COLLECT_RADIUS, 
LADDER_COLL_X_MIN, LADDER_COLL_Z_MIN, LADDER_COLL_Z_MAX, LADDER_COLL_Y_MAX,
} from '../gameConstants';


function getFloorY(x, y, z) {
    const onStairsX =
      x >= STAIRS_CX - STAIRS_W / 2 - CHARACTER_RADIUS &&
      x <= STAIRS_CX + STAIRS_W / 2 + CHARACTER_RADIUS; // ДОДАНО: перевірка X-смуги сходів
  
    if (onStairsX) {
      const i = Math.floor((STAIRS_START_Z + STAIRS_STEP_D / 2 - z) / STAIRS_STEP_D);
      if (i >= 0 && i < STAIRS_COUNT) {
        const stairFloor = (i + 1) * STAIRS_STEP_H;
        // Поріг: поверхня попередньої сходинки − 0.2 (допуск на гравітаційне занурення між тіками)
        const threshold = stairFloor - STAIRS_STEP_H - 0.2;
        if (y >= threshold) {
          return stairFloor;
        }
      }
    };
  
    const onMezzanine =
      x >= MEZZANINE_X_MIN &&
      x <= MEZZANINE_X_MAX &&
      z >= MEZZANINE_Z_MIN &&
      z <= MEZZANINE_Z_MAX; // ДОДАНО: перевірка Z-смуги мезоніну
  
      if (onMezzanine) {
        // Запас 1.5 — щоб «зловити» персонажа що заходить з верхньої сходинки (y ≈ 4.75).
        // Якщо y < 3.6 — персонаж іде під мезоніном на підлозі, поверхню 5.1 ігноруємо.
        if (y >= MEZZANINE_FLOOR_Y - 1.5) {
          return MEZZANINE_FLOOR_Y;
        }
      }
  
    return FLOOR_Y;
};

export default function useKeyControl() {
    const setAction = useCharacterStore((s) => s.setAction);
    const setPosition = useCharacterStore((s) => s.setPosition);
    const setRotation = useCharacterStore((s) => s.setRotation);
    const rotation = useCharacterStore((s) => s.rotation);

    const keysRef = useRef(new Set());

    const verticalVelocityRef = useRef(0);
    const isGroundedRef = useRef(true);

    useEffect(() => {
        function onKeyDown(event) {
            if (event.repeat) return;

            keysRef.current.add(event.key.toLowerCase());
        }

        function onKeyUp(event) {
            keysRef.current.delete(event.key.toLowerCase());
        }

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        return() => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
}, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const keys = keysRef.current;
            // ЗМІНЕНО: додано isSitting — щоб перевіряти стан сидіння кожен тік без застарілих замикань
            const { position, rotation, setPosition, setRotation, setAction, isSitting, collectItem, collectedItems } = useCharacterStore.getState();
            let [x, y, z] = position;
      
            if (isSitting) {
              setAction('sit'); 
              return;            
            };

            let moved = false;
            let newRotation = rotation;

            if (keys.has('a')) {
                newRotation += ROTATE_STEP;
                moved = true;
            };

            if (keys.has('d')) {
                newRotation -= ROTATE_STEP;
                moved = true;
            };

            setRotation(newRotation);

            // const dx = Math.sin(newRotation) * MOVE_STEP;
            // const dz = Math.cos(newRotation) * MOVE_STEP;

            

            // if (keys.has('w')) {
            //     setPosition(([x, y, z]) => [x - dx, y, z - dz]);
            //     setAction('Walk');
            //     moved = true;
            // }

            // if (keys.has('s')) {
            //     setPosition(([x, y, z]) => [x + dx, y, z + dz]);
            //     setAction('Walk');
            //     moved = true;
            // }

            if (keys.has(' ') && isGroundedRef.current) {
                verticalVelocityRef.current = JUMP_SPEED;
                isGroundedRef.current = false;
            };
            
            const moveDirection = (keys.has('s') ? 1 : 0) - (keys.has('w') ? 1 : 0);

            const dx = Math.sin(newRotation) * MOVE_STEP * moveDirection;
            const dz = Math.cos(newRotation) * MOVE_STEP * moveDirection;

            let nextX = x + dx;
            let nextZ = z + dz;

            const goalOffsetX = Math.abs((GOAL_POSITION[0]) - (nextX));
            const goalOffsetZ = Math.abs((GOAL_POSITION[2]) - (nextZ));

            const overlapsGoal = goalOffsetX < GOAL_HALF_SIZE + CHARACTER_RADIUS && goalOffsetZ < GOAL_HALF_SIZE + CHARACTER_RADIUS;

            const canStepOverGoal = y >= GOAL_TOP_Y - 0.05;

            if (moveDirection !== 0) {
                if (overlapsGoal && !canStepOverGoal) {
                    nextX = x;
                    nextZ = z;
                }
                moved = true;
            };
            
            verticalVelocityRef.current -= GRAVITY;
            let nextY = y + verticalVelocityRef.current;

            const goalDistanceX = Math.abs((GOAL_POSITION[0]) - (nextX)); 
            const goalDistanceZ = Math.abs((GOAL_POSITION[2]) - (nextZ)); 

            const onGoalTop = goalDistanceX < GOAL_HALF_SIZE + CHARACTER_RADIUS * 0.35 && goalDistanceZ < GOAL_HALF_SIZE + CHARACTER_RADIUS * 0.35;


            const dynamicFloorY = getFloorY(nextX, y, nextZ);

            if (onGoalTop && verticalVelocityRef.current <= 0 && y >= GOAL_TOP_Y - 0.05 && nextY <= GOAL_TOP_Y) {
                nextY = GOAL_TOP_Y;
                verticalVelocityRef.current = 0;
                isGroundedRef.current = true;
            } else if (nextY <= dynamicFloorY){
                nextY = dynamicFloorY;
                verticalVelocityRef.current = 0;
                isGroundedRef.current = true;
            } else {
                isGroundedRef.current = false;
            }

            const charInLadderXZone = nextX > LADDER_COLL_X_MIN;
                const charEntersLadderZ = nextZ > LADDER_COLL_Z_MIN && nextZ < LADDER_COLL_Z_MAX;
                const charBelowLadderTop = nextY < LADDER_COLL_Y_MAX; 
                
                if (charInLadderXZone && charEntersLadderZ && charBelowLadderTop) {
                    // Де БУЛИ по Z до цього руху?
                    const prevInLadderZ = z > LADDER_COLL_Z_MIN && z < LADDER_COLL_Z_MAX;
                    // Де БУЛИ по X до цього руху?
                    const prevInLadderX = x > LADDER_COLL_X_MIN;
                    
                    if (!prevInLadderZ) {
                        // Персонаж щойно ввійшов у Z-зону (прийшов спереду або ззаду):
                        // блокуємо Z-рух — не даємо перейти крізь драбину
                        nextZ = z;
                    }
                    
                    if (!prevInLadderX) {
                        // Персонаж щойно ввійшов у X-зону (прийшов з лівого боку):
                        // блокуємо X-рух — не даємо «врізатись» в бічні рейки
                        nextX = x;
                    }
                }


            setPosition([nextX, nextY, nextZ]);

            COLLECTIBLES.forEach((item) => {
                if (collectedItems.includes(item.id)) return; // вже зібраний — пропускаємо
              
                const [ix, iy, iz] = item.pos;
                const dist = Math.sqrt(
                    (nextX - ix) ** 2 + // відстань по X
                    (nextY - iy) ** 2 + // відстань по Y
                    (nextZ - iz) ** 2   // відстань по Z
                );
              
                if (dist <= COLLECT_RADIUS) {
                    collectItem(item.id); // записуємо в стор → UI одразу оновлює лічильник
                }
            });

            if (!isGroundedRef.current) {
                setAction('jump')
            } else if (moved) {
                setAction('walk');
            } else{
                setAction('idle');
            }

        }, 1000 / 60)

        return () => clearInterval(interval);
        
    }, [rotation, setPosition, setRotation, setAction]);
     // ─── Ефект 3: взаємодія з диваном через клавішу E ─────────────────────────
  //
  // Перше натискання E поряд з диваном → персонаж сідає (isSitting = true),
  //   позиція і поворот фіксуються; ефект 2 ігнорує фізику поки isSitting.
  // Повторне натискання E → персонаж встає (isSitting = false), фізика відновлюється.
  //
  // useCharacterStore.getState() всередині хендлера — читаємо завжди свіжий стан,
  // не покладаючись на замикання. Тому масив залежностей порожній [].
  useEffect(() => {
    function onKeyE(e) {
      if (e.code !== 'KeyE' || e.repeat) return; // ігноруємо утримання клавіші

      const state = useCharacterStore.getState();

      // Якщо вже сидимо — встаємо і виходимо
      if (state.isSitting) {
        state.setIsSitting(false);
        // Після вставання фізика відновиться у наступному тіку ефекту 2.
        // verticalVelocityRef = 0 і isGroundedRef = true були встановлені при сідінні,
        // тому персонаж одразу стоятиме на підлозі без «падіння».
        return;
      }

      // Перевіряємо відстань від персонажа до центру дивана у площині XZ (Y ігноруємо)
      const [px, , pz] = state.position;
      const dist = Math.sqrt(
        (px - SOFA_WORLD_X) ** 2 + (pz - SOFA_WORLD_Z) ** 2
      );

      if (dist <= SOFA_INTERACT_DIST) {
        state.setIsSitting(true);

        // Переміщуємо персонажа точно на місце сидіння (центр дивана, рівень підлоги мезоніну)
        state.setPosition([SOFA_SIT_X, SOFA_SIT_Y, SOFA_SIT_Z]);

        // Повертаємо обличчям від спинки (до кімнати): SOFA_SIT_ROTATION = Math.PI
        state.setRotation(SOFA_SIT_ROTATION);

        // Обнуляємо фізику — щоб після вставання персонаж не «вистрелив» вгору
        verticalVelocityRef.current = 0;
        isGroundedRef.current = true;
      }
    }

    window.addEventListener('keydown', onKeyE);
    return () => window.removeEventListener('keydown', onKeyE);
  }, []); // порожній масив — ефект живе весь час, хендлер читає getState() напряму

};
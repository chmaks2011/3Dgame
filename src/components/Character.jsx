import React, { useRef, useEffect, useMemo } from 'react';
import { useCharacterStore } from '../store/useCharacterStore';
import { useFBX, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { MODEL_FACING_OFFSET } from '../gameConstants';

const ACTION_MAP = {
  idle: 'Idle',
  walk: 'Walk',
  jump: 'Jump',
  sit: 'Sit',
  // lye: 'lye',
};


export default function Character() {
  const group = useRef();

  const Character = useFBX('/models/Character.fbx');

  const IdleFBX = useFBX('/models/Idle.fbx');
  const JumpingFBX = useFBX('/models/Jumping.fbx');
  // const LyingFBX = useFBX('/models/Lying.fbx');
  const SittingFBX = useFBX('/models/Sitting.fbx');
  const WalkingFBX = useFBX('/models/Walking.fbx');

  const animationsClips = useMemo(() => {
    const clips = [
      { clip: IdleFBX.animations[0], name: 'Idle' },
      { clip: WalkingFBX.animations[0], name: 'Walk' },
      { clip: JumpingFBX.animations[0], name: 'Jump' },
      { clip: SittingFBX.animations[0], name: 'Sit' },
      // { clip: LyingFBX.animations[0], name: 'lye' },

    ];

    return clips.flatMap(({ clip, name }) => {
      if (!clip) return [];
      const clonedClip = clip.clone();
      clonedClip.name = name;
      return clonedClip;
    })
  }, [IdleFBX, WalkingFBX, JumpingFBX, SittingFBX]);


  // IdleFBX.animations[0].name = 'Idle';
  // WalkingFBX.animations[0].name = 'Walk';
  // JumpingFBX.animations[0].name = 'Jump';
  // SittingFBX.animations[0].name = 'Sit';
  // LyingFBX.animations[0].name = 'lye';


  const { actions } = useAnimations(
    animationsClips, group
  );


  // const { actions } = useAnimations(
  //   [IdleFBX.animations[0], WalkingFBX.animations[0], JumpingFBX.animations[0], SittingFBX.animations[0], LyingFBX.animations[0]], group
  // );


  const currentAction = useCharacterStore((s) => s.currentAction);
  const position = useCharacterStore((s) => s.position);
  const rotation = useCharacterStore((s) => s.rotation);


  useEffect(() => {
    Object.values(actions).forEach((action) => action.fadeOut(0.2));
    // Object.values(actions).forEach((action) => action.stop());

    const nextAction = actions[ACTION_MAP[currentAction]];
    if (nextAction) {
      nextAction.reset().fadeIn(0.2).play();
    }

    // const name = currentAction.charAt(0).toUpperCase() + currentAction.slice(1);
    // if (actions[name]) {
    //   actions[name].reset().fadeIn(0.2).play();
    // }

    return () => {
      if (nextAction) nextAction.fadeOut(0.2);
    };

  }, [currentAction, actions]);

  const clonedCharacter = useMemo(() => {
    const clone = cloneSkeleton(Character);
    clone.scale.set(0.01, 0.01, 0.01);
    return clone;
  }, [Character]);
  //console.log(Character.scale)


  useEffect(() => {
    if (clonedCharacter) {
      clonedCharacter.scale.set(0.02, 0.02, 0.02);
    }
  }, [clonedCharacter]);

  useFrame(() => {
    if (!group.current) return;
    group.current.position.set(position[0], position[1], position[2]);
    group.current.rotation.y = rotation + MODEL_FACING_OFFSET;
  });



  return (
    <group ref={group}>
      <primitive object={clonedCharacter} />
    </group>
  );
};
import { create } from 'zustand';

export const useCharacterStore = create((set) => ({
    currentAction: 'idle',
    setAction: (actionName) => set(() => ({ currentAction: actionName })),

    speed: 1.5,
    setSpeed: (value) => set(() => ({ speed: value })),

    position: [0, 0, 0],
    rotation: 0,

    setPosition: (pos) => set((state) => ({
        position: typeof pos === 'function' ? pos(state.position) : pos,
    })),
    setRotation: (angle) => set(() => ({ rotation: angle })),

    goalReached: false,
    setGoalReached: (value) => set(() => ({ goalReached: value })),

    //follow
    //orbit
    cameraMode: 'follow',
    setCameraMode: (mode) => set(() => ({ cameraMode: mode })),

    isSitting: false,
    setIsSitting: (value) => set(() => ({ isSitting: value})),


    collectedItems: [],

    // Додає id предмета до масиву; якщо вже є — не дублює (idempotent)
    collectItem: (id) =>
        set((state) => ({
            collectedItems: state.collectedItems.includes(id)
            ? state.collectedItems           // вже зібраний — нічого не змінюємо
            : [...state.collectedItems, id], // додаємо новий id в кінець масиву
    })),


}));
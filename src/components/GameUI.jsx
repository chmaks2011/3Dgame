//інтерфейс поверх нашої сцени (HUD)
import React from "react";
import { useCharacterStore } from "../store/useCharacterStore";


const panelStyle = {
    background: 'rgba(20, 10, 0, 0.72)',
    border: '2px solid #8b6914',
    borderRadius: '10px',
    padding: '12px 18px',
    backdropFilter: 'blur(4px)'
};

export default function GameUI() {
    const cameraMode = useCharacterStore((s) => s.cameraMode);

    return(
        <div>
            {/* підказка */}
            <div
                style={{
                    ...panelStyle,
                    position: 'absolute',
                    bottom: 16,
                    left: '16',
                    fontSize: 12,
                    color: '#c1ebfc',
                    lineHeight: 1.7
                }}
            >
                <span>V</span> - пеоеключити камеру (зараз: <b>{cameraMode}</b>)
                <br />
            </div>
        </div>
    );
};
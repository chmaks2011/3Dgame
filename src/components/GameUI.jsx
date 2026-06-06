//інтерфейс поверх нашої сцени (HUD)
import React from "react";
import { useCharacterStore } from "../store/useCharacterStore";
import { COLLECTIBLES } from '../gameConstants.js'; // потрібен для total (кількість предметів)

const panelStyle = {
    background: 'rgba(20, 10, 0, 0.72)',
    border: '2px solid #8b6914',
    borderRadius: '10px',
    padding: '12px 18px',
    backdropFilter: 'blur(4px)'
};

export default function GameUI() {
    const cameraMode    = useCharacterStore((s) => s.cameraMode);
    const collectedItems = useCharacterStore((s) => s.collectedItems); // масив зібраних id

    const total      = COLLECTIBLES.length;          // 10 — загальна кількість предметів
    const count      = collectedItems.length;        // скільки вже зібрано
    const allDone    = count === total;              // true → показуємо екран перемоги
    const pct        = (count / total) * 100;        // відсоток для ширини прогрес-бару

    return (
        <div>

            {/* ── Лічильник предметів — завжди видно вгорі по центру ── */}
            <div
                style={{
                    ...panelStyle,
                    position: 'absolute',
                    top: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: 230,
                    textAlign: 'center',
                    color: '#FFD700',
                    userSelect: 'none',
                }}
            >
                {/* Заголовок секції */}
                <div style={{ fontSize: 12, color: '#c1ebfc', marginBottom: 6, letterSpacing: 1 }}>
                    ЗІБРАНО ПРЕДМЕТІВ
                </div>

                {/* Прогрес-бар: ширина = pct% від батька */}
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    height: 12,
                    overflow: 'hidden',
                    marginBottom: 7,
                    border: '1px solid rgba(139,105,20,0.4)',
                }}>
                    <div style={{
                        background: 'linear-gradient(90deg, #8b5e14, #FFD700)',
                        height: '100%',
                        width: `${pct}%`,                     // реактивно оновлюється при зборі
                        borderRadius: 6,
                        transition: 'width 0.35s ease',       // плавна анімація росту смуги
                        boxShadow: '0 0 8px #FFD700aa',       // легкий золотий ореол
                    }} />
                </div>

                {/* Числовий лічильник */}
                <div style={{ fontSize: 20, fontWeight: 'bold', letterSpacing: 2 }}>
                    {count}
                    <span style={{ fontSize: 13, color: '#c1a030', fontWeight: 'normal' }}>
                        {' '}/ {total}
                    </span>
                </div>
            </div>

            {/* ── Підказки керування — лівий нижній кут ── */}
            <div
                style={{
                    ...panelStyle,
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    fontSize: 12,
                    color: '#c1ebfc',
                    lineHeight: 1.85,
                    userSelect: 'none',
                }}
            >
                <b style={{ color: '#FFD700' }}>W / S</b> — вперед / назад<br />
                <b style={{ color: '#FFD700' }}>A / D</b> — поворот<br />
                <b style={{ color: '#FFD700' }}>Пробіл</b> — стрибок<br />
                <b style={{ color: '#FFD700' }}>E</b> — сісти / встати з дивана<br />
                <b style={{ color: '#FFD700' }}>V</b> — камера: <b>{cameraMode}</b>
            </div>

            {/* ── Екран перемоги — з'являється коли count === total ── */}
            {allDone && (
                <div style={{
                    position: 'absolute',
                    inset: 0,                              // розтягується на весь екран
                    background: 'rgba(8, 4, 0, 0.88)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFD700',
                    animation: 'fadeIn 0.6s ease',        // CSS-анімація появи (визначена нижче)
                }}>
                    {/* Трофей */}
                    <div style={{ fontSize: 72, marginBottom: 10, lineHeight: 1 }}>🏆</div>

                    {/* Заголовок */}
                    <div style={{
                        fontSize: 42,
                        fontWeight: 'bold',
                        letterSpacing: 3,
                        marginBottom: 10,
                        textShadow: '0 0 24px #FFD700',
                    }}>
                        ПЕРЕМОГА!
                    </div>

                    {/* Підзаголовок */}
                    <div style={{ fontSize: 17, color: '#c1ebfc', marginBottom: 28 }}>
                        Всі&nbsp;<b style={{ color: '#FFD700' }}>{total}</b>&nbsp;предмети зібрано!
                    </div>

                    {/* Панель підсумку */}
                    <div style={{
                        ...panelStyle,
                        fontSize: 14,
                        color: '#c1ebfc',
                        textAlign: 'center',
                        lineHeight: 2,
                    }}>
                        🌟 Ти дослідив кожен куточок кімнати<br />
                        🏺 Зібрано предметів: <b style={{ color: '#FFD700' }}>{count}</b><br />
                        🔑 Усі секрети розкриті!
                    </div>

                    {/* CSS-анімація fadeIn визначена inline через style-тег */}
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: scale(0.94); }
                            to   { opacity: 1; transform: scale(1); }
                        }
                    `}</style>
                </div>
            )}

        </div>
    );
};
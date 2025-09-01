//** Make the canvas react to show the user that the gate has been applied */
export function flashCanvas(canvasContainer: HTMLDivElement) {
    let newClasses = 'animate-gate-applied';
    canvasContainer.classList.add(newClasses);
    setTimeout(() => {
        canvasContainer.classList.remove(newClasses);
    }, 300);
}
export function registerPointerTracking(
  isMouseDownRef: React.MutableRefObject<boolean>
) {
  const handlePointerDown = () => {
    isMouseDownRef.current = true;
  };
  const handlePointerUp = () => {
    isMouseDownRef.current = false;
  };

  window.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointerup", handlePointerUp);

  return () => {
    window.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointerup", handlePointerUp);
  };
}

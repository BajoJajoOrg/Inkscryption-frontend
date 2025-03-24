import { FC } from "react";
import BrushIcon from "../../assets/svg/icons/pen.svg";
import EraserIcon from "../../assets/svg/icons/eraser.svg";
import TextIcon from "../../assets/svg/icons/text.svg";
import MoveIcon from "../../assets/svg/icons/pointer.svg";
import UndoIcon from "../../assets/svg/icons/undo.svg";
import RedoIcon from "../../assets/svg/icons/redo.svg";
import SaveIcon from "../../assets/svg/icons/save.svg";
import AIIcon from "../../assets/svg/icons/ai.svg";

import "./CanvasToolbar.css";

interface ToolbarProps {
  isDrawing: boolean;
  isErasing: boolean;
  onToggleDrawing: () => void;
  onToggleErase: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExtractText: () => void;
  onSetTextMode: () => void;
}

export const Toolbar: FC<ToolbarProps> = ({
  isDrawing,
  isErasing,
  onToggleDrawing,
  onToggleErase,
  onUndo,
  onRedo,
  onSave,
  onExtractText,
  onSetTextMode,
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar__content">
        <button
          className="toolbar__button"
          onClick={onToggleDrawing}
          title="Toggle Drawing Mode"
        >
          {isDrawing ? (
            <img className="toolbar__icon" src={BrushIcon} />
          ) : (
            <img className="toolbar__icon" src={MoveIcon} />
          )}
        </button>
        <button
          className="toolbar__button"
          onClick={onToggleErase}
          title="Toggle Erase Mode"
        >
          {isErasing ? (
            <img className="toolbar__icon" src={EraserIcon} />
          ) : (
            <img className="toolbar__icon" src={BrushIcon} />
          )}
        </button>
        <button className="toolbar__button" onClick={onUndo} title="Undo">
          <img className="toolbar__icon" src={UndoIcon} />
        </button>
        <button className="toolbar__button" onClick={onRedo} title="Redo">
          <img className="toolbar__icon" src={RedoIcon} />
        </button>
        <button className="toolbar__button" onClick={onSave} title="Save">
          <img className="toolbar__icon" src={SaveIcon} />
        </button>
        <button
          className="toolbar__button"
          onClick={onExtractText}
          title="Extract Text"
        >
          <img className="toolbar__icon" src={AIIcon} />
        </button>
        <button
          className="toolbar__button"
          onClick={onSetTextMode}
          title="Text Mode"
        >
          <img className="toolbar__icon" src={TextIcon} />
        </button>
      </div>
    </div>
  );
};

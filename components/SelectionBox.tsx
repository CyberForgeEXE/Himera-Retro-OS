import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const SelectionBox: React.FC = () => {
  const { state } = useAppContext();
  const { selectionBox } = state;

  if (!selectionBox.isVisible) {
    return null;
  }

  const x1 = selectionBox.x;
  const y1 = selectionBox.y;
  const x2 = selectionBox.x + selectionBox.width;
  const y2 = selectionBox.y + selectionBox.height;

  const style: React.CSSProperties = {
    position: 'absolute',
    border: '1px dotted var(--accent-color)',
    backgroundColor: 'rgba(0, 88, 225, 0.3)',
    zIndex: 9000,
    left: `${Math.min(x1, x2)}px`,
    top: `${Math.min(y1, y2)}px`,
    width: `${Math.abs(selectionBox.width)}px`,
    height: `${Math.abs(selectionBox.height)}px`,
  };

  return <div style={style} />;
};

export default SelectionBox;
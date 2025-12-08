import React from "react";
import { themeStore } from "../../..";

export const ModalV2: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ isOpen, onClose, children, style }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: themeStore.theme.fon,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={() => onClose()}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={Object.assign(
          {
            backgroundColor: "white",
            border: `1px solid ${themeStore.theme.greenWhite}`,
            padding: 20,
            borderRadius: 5,
            // width: 400,
            position: "relative",
          },
          style
        )}
      >
        {children}
      </div>
    </div>
  );
};

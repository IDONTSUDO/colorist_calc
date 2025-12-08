import * as React from "react";
import { TextV2 } from "../text/text";

export enum CoreInputType {
  small = "small",
  default = "default",
  big = "big",
}


export const InputV3 = (props: {
  style?: React.CSSProperties;
  label: string;
  value?: string;
  subLabel?: React.ReactNode;
  onChange?: (value: string) => void;
  validation?: (value: string) => boolean;
  error?: string;
  type?: CoreInputType;
  trim?: boolean;
  styleContentEditable?: React.CSSProperties;
  isFormBuilder?: boolean;
}) => {
  const [value, setValue] = React.useState<string>(() => props.value ?? "");
  const ref = React.useRef<HTMLDivElement>(null);
  const [isAppendInnerText, setAppendInnerText] = React.useState(true);
  React.useEffect(() => {
    if (ref.current && isAppendInnerText) {
      ref.current.innerText = value;
      setAppendInnerText(false);
    }
  }, [ref, value, isAppendInnerText, setAppendInnerText, props]);

  const isSmall =
    props.type !== undefined && props.type.isEqual(CoreInputType.small);
  return (
    <div
      style={Object.assign(
        {
          backgroundColor: "rgba(230, 224, 233, 1)",
          height: isSmall ? 40 : 58,
          borderRadius: "4px 4px 0px 0px",
          borderBottom: "solid 1px black",
          padding: "10px 10px 10px 10px",
        },
        props.style
      )}
    >
      <TextV2
        style={isSmall ? { fontSize: 8, position: "relative", top: -8 } : {}}
        text={props.label}
      />

      <div
        ref={ref}
        contentEditable={true}
        style={Object.assign(
          {
            backgroundColor: "#00008000",
            border: 1,
            fontSize: isSmall ? 12 : 16,
            fontFamily: "Roboto",
            color: "#1D1B20",
            height: 24,
            width: "100%",
            userSelect: "none",
            outline: "none",
            position: isSmall ? "relative" : undefined,
            top: isSmall ? -8 : undefined,
          },
          props.styleContentEditable
        )}
        onInput={(e) => {
          let val = e.currentTarget.innerText;

          setValue(val);
          if (val) {
            if (props.trim) {
              val = val.trim().replaceAll("\n", "");
            }
            if (
              props.validation !== undefined &&
              props.validation(val) &&
              props.onChange
            ) {
              props.onChange(val);
              return;
            }

            if (props.onChange && props.validation === undefined) {
              props.onChange(val);
              return;
            }
          }
        }}
      />
      {value ? (
        props.validation ? (
          props.validation(value) ? null : (
            <div style={{ color: "#ff1d0c" }}>
              {props.error ? props.error : "error"}
            </div>
          )
        ) : null
      ) : null}
    </div>
  );
};

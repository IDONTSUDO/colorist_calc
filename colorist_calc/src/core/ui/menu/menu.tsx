import { useNavigate } from "react-router-dom";
import { Icon, IconType } from "../icon/icon";
import { OrdersPath } from "../../../features/orders/orders";

export const Menu: React.FC<{ child: React.ReactNode }> = ({ child }) => {
  const n = useNavigate();
  return (
    <div>
      <div
        style={{
          backgroundColor: "#000000",
          height: 50,
          alignContent: "center",
          paddingLeft: 10,
        }}
      >
        <div style={{ cursor: "pointer" }} onClick={() => n(OrdersPath)}>
          <Icon type={IconType.back} />
        </div>
      </div>
      {child}
    </div>
  );
};

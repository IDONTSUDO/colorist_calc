import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { OrderStore } from "./order_store";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "../../core/ui/loader/loader";
import { TextV2 } from "../../core/ui/text/text";
import { InputV2 } from "../../core/ui/input/input_v2";
import { Button } from "../../core/ui/button/Button";
import { Card } from "antd";
import { Tabs } from "../../core/ui/tabs/tabs";
import { TextPointer } from "../../core/ui/text/text_pointer";
import { Menu } from "../../core/ui/menu/menu";
import { Select } from "../../core/ui/select/select";
import { Icon, IconType } from "../../core/ui/icon/icon";
import { ModalV2 } from "../../core/ui/modal/modal";
import { CalculateOrder } from "./ui/calculate_order";
import { InputV3 } from "../../core/ui/input/input_v3";

export const OrderPath = "/order";

export const Order = observer(() => {
  const store = useStore(OrderStore);
  const { id } = useParams();

  useEffect(() => {
    store.initParams(id as string);
  }, []);
  return (
    <>
      <ModalV2
        isOpen={store.isOpenComponentsModal}
        onClose={() => store.closeComponentsModal()}
        children={
          <>
            <div style={{ display: "flex", width: 500 }}>
              <InputV2
                style={{ width: "100%" }}
                label="поиск компонента по номеру в картотеке"
                onChange={(text) => store.updateComponentsField(text)}
              />

              <Button
                text="поиск"
                style={{ width: 100 }}
                onClick={() => store.findComponents()}
              />
            </div>
            <div>
              {store.components.map((el, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>номер: {el.privateNumber}</div>
                  <div style={{ display: "flex" }}>
                    <InputV3
                      label="вес в рецепте"
                      value={el.weight?.toString()}
                    />
                    <Button
                      onClick={() => store.addComponentsToRecept(i)}
                      text="добавить"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        }
      />
      <ModalV2
        isOpen={store.consumablesModalIsOpen}
        onClose={() => store.consumablesModalClose()}
        children={
          <>
            <div style={{ display: "flex" }}>
              <InputV2
                label="Поиск расходников"
                style={{ width: 500 }}
                onChange={(text) => store.consumablesFindField(text)}
              />
              <Button
                text="поиск"
                style={{ width: 100 }}
                onClick={() => store.findConsumables()}
              />
            </div>
            {store.consumables.map((el, i) => (
              <div
                key={i}
                style={{
                  margin: 10,
                  backgroundColor: "rgb(239 244 252)",
                  width: "100%",
                  display: "flex",
                  justifyItems: "center",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid rgb(213 214 215)",
                  padding: 10,
                }}
              >
                <div>{el.description}</div>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => store.addConsumablesToOrder(i)}
                >
                  <Icon type={IconType.plus} />
                </div>
              </div>
            ))}
          </>
        }
      />
      {store.isLoading ? (
        <Loader />
      ) : (
        <>
          <Menu
            child={
              <>
                {store.viewModel.orderCharacteristics === null ? (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <TextV2
                      style={{ textDecoration: "underline" }}
                      text="По рецепту"
                      onClick={() => store.selectOrderProcessType("IN_RECEPT")}
                    />
                    <div style={{ width: "20%" }} />
                    <TextV2
                      style={{ textDecoration: "underline" }}
                      text="Создание нового рецепта"
                      onClick={() => store.selectOrderProcessType("NEW_RECEPT")}
                    />
                  </div>
                ) : (
                  <></>
                )}
                {store.viewModel.orderCharacteristics === "NEW_RECEPT" ? (
                  <>
                    <Button
                      text="компоненты"
                      style={{ width: 120 }}
                      onClick={() => store.openComponentsModal()}
                    />
                  </>
                ) : (
                  <></>
                )}
                {store.viewModel.orderCharacteristics === "IN_RECEPT" ? (
                  <>
                    <div style={{ display: "flex" }}>
                      <InputV2
                        style={{ width: "100%" }}
                        label="поиск рецепта по номеру в картотеке"
                        onChange={(text) => store.updateReceptField(text)}
                      />

                      <Button
                        text="поиск"
                        style={{ width: 100 }}
                        onClick={() => store.findRecipes()}
                      />
                    </div>
                    <div>
                      {store.recipes.isEmpty() ? (
                        <></>
                      ) : (
                        store.recipes.map((el, i) => (
                          <div
                            key={i}
                            style={{
                              backgroundColor: "#d4d4d58f",
                              margin: 10,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: 10,
                            }}
                          >
                            <div>{el.cardIndexNumber}</div>
                            <Button
                              text="Выбрать"
                              style={{ width: 100 }}
                              onClick={() => store.selectRecept(i)}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <></>
                )}
                {store.viewModel.orderCharacteristics === "Recipe_Selected" ? (
                  <div style={{ display: "flex" }}>
                    <Tabs
                      tabs={[
                        {
                          name: "Слив по рецепту",
                          jsx: (
                            <>
                              {store.receptToOrderMapper().map((el, i) => {
                                return (
                                  <Card
                                    key={i}
                                    title={`ШАГ ${i + 1}`}
                                    style={{ width: 300 }}
                                  >
                                    <div>
                                      <div style={{ display: "flex" }}>
                                        <TextV2 text={"номер компонента:"} />
                                        <div style={{ width: 5 }} />
                                        <TextV2 text={el.privateNumber} />
                                      </div>
                                      <div style={{ display: "flex" }}>
                                        <TextV2 text={"вес:"} />
                                        <div style={{ width: 5 }} />
                                        <TextV2
                                          text={el.weight?.toString() ?? ""}
                                        />
                                      </div>
                                    </div>
                                  </Card>
                                );
                              })}
                            </>
                          ),
                        },
                        {
                          name: "Расходники",
                          jsx: (
                            <div
                              style={{
                                display: "flex",
                                width: "100%",
                                justifyContent: "space-between",
                              }}
                            >
                              <div>
                                {store.viewModel.consumables?.isNotEmpty() ? (
                                  <>
                                    {store.viewModel.consumables?.map((el) => (
                                      <div
                                        style={{
                                          width: "100%",
                                          margin: 10,
                                          padding: 10,
                                          backgroundColor: "#3c51e0",

                                          color: "white",
                                          border: "4px solid #6474de",
                                          borderRadius: 10,
                                        }}
                                      >
                                        <div>количество: {el.count}</div>
                                        <div>
                                          описание: {el.consumables.description}
                                        </div>
                                      </div>
                                    ))}
                                  </>
                                ) : (
                                  <>У заказа нету расходников</>
                                )}
                              </div>
                              <Button
                                style={{ width: 200 }}
                                text="Добавить расходники"
                                onClick={() => store.consumablesModalOpen()}
                              />
                            </div>
                          ),
                        },
                        {
                          name: "Заказ",
                          jsx: (
                            <>
                              <TextPointer
                                rightText={"авто"}
                                leftText={store.viewModel.auto}
                              />
                              <TextPointer
                                rightText={"цвет"}
                                leftText={store.viewModel.color}
                              />
                              <TextPointer
                                rightText={"код краски"}
                                leftText={store.viewModel.codePaint}
                              />
                              <TextPointer
                                rightText={"Обьем краски для клиента"}
                                leftText={store.viewModel.theVolumeOfPainTheCustomerWant?.toString()}
                              />
                            </>
                          ),
                        },
                        { name: "Клиент", jsx: <>3</> },
                        {
                          name: "Производство заказа",
                          jsx: (
                            <>
                              <Select
                                options={["Начат", "Готов", "На паузе"].map(
                                  (el) => {
                                    return {
                                      value: el,
                                      label: el,
                                    };
                                  }
                                )}
                                value={store.viewModel.statusOrder}
                                onChange={(text) => {
                                  store.updateForm({ statusOrder: text });
                                  store.updateOrder();
                                }}
                              />
                            </>
                          ),
                          width: 200,
                        },
                        {
                          name: "Финансовый учет",
                          jsx: (
                            <>
                              <div style={{ fontSize: 20 }}>
                                Управление статусом финансов
                              </div>
                              <Select
                                options={[
                                  "Ожидает расчета",
                                  "Расчет произошел",
                                ].map((el) => {
                                  return {
                                    value: el,
                                    label: el,
                                  };
                                })}
                                value={store.viewModel.financeStatus}
                                onChange={(text) => {
                                  store.updateForm({ financeStatus: text });
                                  store.updateOrder();
                                }}
                              />
                              <CalculateOrder store={store} />
                            </>
                          ),
                          width: 170,
                        },
                      ]}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </>
            }
          />
        </>
      )}
    </>
  );
});

import { TextV2 } from "../text/text";

export const CoreTable: React.FC<{
  columns: string[];
  source: object[];
  missingKey?: string[];
  replacedJSXColumns?: { name: string; jsx: (el: any) => React.ReactNode }[];
  addingColumns?: { name: string; jsx: (el: any) => React.ReactNode }[];
  replacedColumns?: { name: string; replace: string }[];
  onClick?: (index: number) => void;
  mappedColumns:
    | {
        name: string;
        mapper: (date: any) => React.ReactNode;
      }[]
    | undefined;
}> = ({
  columns,
  source,
  onClick,
  replacedColumns,
  mappedColumns,
  missingKey,
  addingColumns,
}) => {
  const indexed = columns.map((el, i) => {
    return {
      name: el,
      index: i,
    };
  });

  return (
    <table style={{ width: "100%" }}>
      <tr>
        {columns
          .map((el, i) =>
            replacedColumns === undefined ? (
              <th style={{ textAlign: "justify" }}>{el}</th>
            ) : (
              <>
                {replacedColumns
                  .rFind<{
                    name: string;
                    replace: string;
                  }>((element) => element.name === el)
                  .fold(
                    (v) => (
                      <th
                        style={{
                          fontSize: 20,
                          backgroundColor: " #dbdbdb",
                          textAlign: "justify",
                          paddingLeft: 10,
                          borderRadius:
                            i === 0 ? "10px 0px 0px 0px" : undefined,
                        }}
                      >
                        <TextV2 text={v.replace} />
                      </th>
                    ),
                    () => (
                      <th
                        style={{
                          fontSize: 20,
                          backgroundColor: " #dbdbdb",
                          textAlign: "justify",
                          padding: 5,
                        }}
                      >
                        <TextV2 text={el} />
                      </th>
                    )
                  )}
              </>
            )
          )
          .add(
            // #dbdbdb
            <>
              {addingColumns?.map((el) => (
                <th
                  style={{
                    width: "min-content",
                    fontSize: 20,
                    // border: "1px solid",
                    padding: 5,
                    backgroundColor: " #dbdbdb",
                    textAlign: "justify",
                  }}
                >
                  {/* {el.name} */}
                  <TextV2 text={el.name} />
                </th>
              ))}
            </>
          )}
      </tr>
      {source.map((el, i) => {
        return (
          <tr style={{ border: "1px solid", height: 50 }}>
            {Object.entries(el)
              .map(([k, v], index) => {
                // console.log(JSON.stringify(el));

                const hasMissKey = missingKey?.hasIncludeElement(k) ?? false;

                const item =
                  // @ts-ignore

                  el[k];

                if (hasMissKey) {
                  return <></>;
                }

                return (
                  <td
                    style={{ fontSize: 20, border: "1px solid" }}
                    onClick={() => onClick?.(i)}
                  >
                    {/* {item} */}
                    {mappedColumns
                      ?.rFind<{
                        name: string;
                        mapper: (date: any) => string;
                      }>((element) => element.name === k)
                      .fold(
                        (s) => {
                          // @ts-ignore
                          return <>{s.mapper(el[k])}</>;
                        },
                        (e) => <>{item}</>
                      ) ?? <>{v}</>}
                  </td>
                );
              })
              .add(
                <>
                  {addingColumns?.map((element) => (
                    <td
                      style={{
                        fontSize: 20,
                        border: "1px solid",
                        textAlign: "justify",
                      }}
                    >
                      {element.jsx(el)}
                    </td>
                  ))}
                </>
              )}
          </tr>
        );
      })}
    </table>
  );
};

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, getTablePageCount } from "../data-table/data-table";

describe("getTablePageCount", () => {
  it("returns at least one page", () => {
    expect(getTablePageCount(0, 10)).toBe(1);
  });

  it("ceils by page size", () => {
    expect(getTablePageCount(21, 10)).toBe(3);
  });
});

describe("DataTable", () => {
  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "status", label: "Status" },
  ];

  const data = [
    { name: "Alpha", status: "Open" },
    { name: "Beta", status: "Closed" },
  ];

  it("renders rows and empty label", () => {
    const { rerender } = render(
      <DataTable columns={columns} data={data} />
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();

    rerender(
      <DataTable columns={columns} data={[]} emptyLabel="Nothing here" />
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("hides the View column toggle when showColumnToggle is false", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        showColumnToggle={false}
        showToolbar
      />
    );

    expect(screen.queryByText("View")).not.toBeInTheDocument();
  });

  it("hides the rows-per-page selector when showPageSizeSelector is false", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        showPageSizeSelector={false}
      />
    );

    expect(screen.queryByText("Rows per page")).not.toBeInTheDocument();
  });

  it("filters rows when searchKey is set", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search names"
      />
    );

    await user.type(screen.getByLabelText("Search names"), "alp");
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });
});

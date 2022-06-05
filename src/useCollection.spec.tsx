/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { cleanup, render, screen, renderHook } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "@testing-library/user-event";
import useCollection from "./useCollection";

afterEach(cleanup);

function setup(jsx: any) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

const OPTIONS = [
  { id: "1", label: "0%", value: "0" },
  { id: "2", label: "25%", value: "25" },
  { id: "3", label: "50%", value: "50" },
  { id: "4", label: "75%", value: "75" },
  { id: "5", label: "100%", value: "100" },
];

const Component = () => {
  const [selection, { updateSelection }] = useCollection(
    OPTIONS.map(x => x.id),
    "1",
    (i: any) => console.log(`Selected button ID ${i}`),
    true,
    true
  );

  return (
    <React.Fragment>
      {OPTIONS.map(item => (
        <button
          key={item.id}
          {...(selection.includes(item.id) && { className: "active" })}
          onClick={() => updateSelection(item.id)}
          data-test-id={`option-${item.value}`}
        >
          {item.label}
        </button>
      ))}
    </React.Fragment>
  );
};

describe("user story: choose from toolbar", () => {
  it(`Component should render ${OPTIONS.length} items, first item selected. OnClick second option both should be selected`, async () => {
    const { user } = setup(<Component />);
    const elements = screen.getAllByRole("button");

    // First element is selected
    const firstElement = elements[0];
    expect(firstElement).toBeInTheDocument();
    expect(firstElement).toHaveTextContent(OPTIONS[0].label);
    expect(firstElement).toHaveClass("active");

    // Clicking second element makes it selected
    const newlySelectedElement = elements[1];
    await user.click(newlySelectedElement);
    expect(newlySelectedElement).toHaveClass("active");

    // Clicking second element one last time toggles to un-selected
    await user.click(newlySelectedElement);
    expect(newlySelectedElement).not.toHaveClass();

    screen.debug();
  });

  it("Hook starts with initial selection ", async () => {
    const initialSelection = "1";

    const { result } = renderHook(() =>
      useCollection(
        OPTIONS.map(x => x.id),
        initialSelection,
        (i: any) => console.log(`Selected button ID ${i}`),
        true,
        true
      )
    );
    const selection = result.current[0];
    expect(selection).toEqual([initialSelection]);
  });
});

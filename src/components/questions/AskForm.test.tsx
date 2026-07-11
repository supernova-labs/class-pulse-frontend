import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AskForm } from "./AskForm";

describe("AskForm", () => {
  it("disables submit for empty or whitespace input", async () => {
    render(<AskForm onSubmit={jest.fn()} />);
    const button = screen.getByRole("button", { name: "Enviar" });
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Escreva sua pergunta"), "   ");
    expect(button).toBeDisabled();
  });

  it("submits trimmed text once and clears the input", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<AskForm onSubmit={onSubmit} />);
    const input = screen.getByLabelText("Escreva sua pergunta");
    await userEvent.type(input, "  Minha pergunta?  ");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("Minha pergunta?");
    expect(input).toHaveValue("");
  });

  it("keeps the text and shows an error when submit fails", async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error("boom"));
    render(<AskForm onSubmit={onSubmit} />);
    const input = screen.getByLabelText("Escreva sua pergunta");
    await userEvent.type(input, "Pergunta");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(input).toHaveValue("Pergunta");
    expect(screen.getByText(/Não foi possível enviar/)).toBeInTheDocument();
  });
});

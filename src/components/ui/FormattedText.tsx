import { formatText } from "../../lib/formatText";

interface FormattedTextProps {
  children: string;
  className?: string;
}

// Renders a question body with inline formatting (bold / italic / auto-linked URLs).
export function FormattedText({ children, className }: FormattedTextProps) {
  return <p className={className} dangerouslySetInnerHTML={{ __html: formatText(children) }} />;
}
